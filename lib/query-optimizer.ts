export interface QueryMetrics {
  queryName: string
  executionTime: number
  recordCount: number
  timestamp: Date
}

const queryMetrics: QueryMetrics[] = []
const MAX_QUERY_METRICS = 500

export function measureQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  return queryFn().then(result => {
    const executionTime = Date.now() - startTime
    
    queryMetrics.push({
      queryName,
      executionTime,
      recordCount: Array.isArray(result) ? result.length : 1,
      timestamp: new Date()
    })
    if (queryMetrics.length > MAX_QUERY_METRICS) {
      queryMetrics.splice(0, queryMetrics.length - MAX_QUERY_METRICS)
    }
    
    if (executionTime > 1000) {
      console.warn(`[Slow Query] ${queryName} took ${executionTime}ms`)
    }
    
    return result
  })
}

export function getQueryMetrics(): QueryMetrics[] {
  return [...queryMetrics]
}

export function clearQueryMetrics(): void {
  queryMetrics.length = 0
}

export async function executeOptimizedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  cacheKey?: string,
  cacheTtl?: number
): Promise<T> {
  if (cacheKey) {
    const cached = await getCachedResult<T>(cacheKey)
    if (cached) {
      return cached
    }
  }
  
  const result = await measureQueryPerformance(queryName, queryFn)
  
  if (cacheKey && cacheTtl) {
    await setCachedResult(cacheKey, result, cacheTtl)
  }
  
  return result
}

const queryCache = new Map<string, { data: any; expiresAt: number }>()
const MAX_IN_MEMORY_CACHE_ENTRIES = 500
const CACHE_SWEEP_INTERVAL_MS = 60_000

const localRedisUrl = process.env.REDIS_URL
const localRedisEnabled = Boolean(localRedisUrl)

const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const upstashRedisEnabled = Boolean(upstashRedisUrl && upstashRedisToken)

async function getCachedResult<T>(key: string): Promise<T | null> {
  if (localRedisEnabled) {
    const fromLocalRedis = await getLocalRedisCachedResult<T>(key)
    if (fromLocalRedis !== null) return fromLocalRedis
  }

  if (upstashRedisEnabled) {
    const fromUpstashRedis = await getUpstashRedisCachedResult<T>(key)
    if (fromUpstashRedis !== null) return fromUpstashRedis
  }

  const cached = queryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    // Promote hot keys and keep insertion order roughly LRU-like.
    queryCache.delete(key)
    queryCache.set(key, cached)
    return cached.data as T
  }
  if (cached) {
    queryCache.delete(key)
  }
  return null
}

async function setCachedResult<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  if (localRedisEnabled) {
    await setLocalRedisCachedResult(key, data, ttlSeconds)
  } else if (upstashRedisEnabled) {
    await setUpstashRedisCachedResult(key, data, ttlSeconds)
  }

  queryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000
  })
  enforceLocalCacheBounds()
}

function enforceLocalCacheBounds(): void {
  const now = Date.now()

  for (const [key, value] of queryCache.entries()) {
    if (value.expiresAt <= now) {
      queryCache.delete(key)
    }
  }

  while (queryCache.size > MAX_IN_MEMORY_CACHE_ENTRIES) {
    const oldestKey = queryCache.keys().next().value as string | undefined
    if (!oldestKey) break
    queryCache.delete(oldestKey)
  }
}

const cacheSweepTimer = setInterval(() => {
  enforceLocalCacheBounds()
}, CACHE_SWEEP_INTERVAL_MS)

cacheSweepTimer.unref?.()

async function getLocalRedisCachedResult<T>(key: string): Promise<T | null> {
  try {
    const raw = await runLocalRedisCommand(['GET', key])
    if (typeof raw !== 'string') return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[Cache] Local Redis GET failed, falling back to other caches', { key, error })
    return null
  }
}

async function setLocalRedisCachedResult<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    await runLocalRedisCommand(['SETEX', key, String(ttlSeconds), JSON.stringify(data)])
  } catch (error) {
    console.warn('[Cache] Local Redis SETEX failed, falling back to other caches', { key, error })
  }
}

async function getUpstashRedisCachedResult<T>(key: string): Promise<T | null> {
  try {
    const raw = await runUpstashRedisCommand(['GET', key])
    if (typeof raw !== 'string') return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[Cache] Upstash Redis GET failed, falling back to in-memory cache', { key, error })
    return null
  }
}

async function setUpstashRedisCachedResult<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    await runUpstashRedisCommand(['SETEX', key, String(ttlSeconds), JSON.stringify(data)])
  } catch (error) {
    console.warn('[Cache] Upstash Redis SETEX failed, falling back to in-memory cache', { key, error })
  }
}

async function runUpstashRedisCommand(command: string[]): Promise<any> {
  if (!upstashRedisUrl || !upstashRedisToken) return null

  const response = await fetch(upstashRedisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${upstashRedisToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  })

  if (!response.ok) {
    throw new Error(`Redis request failed with status ${response.status}`)
  }

  const payload = await response.json()

  if (payload.error) {
    throw new Error(payload.error)
  }

  return payload.result
}

async function runLocalRedisCommand(command: string[]): Promise<string | number | null> {
  if (!localRedisUrl) return null

  const { createConnection } = await import('node:net')
  const parsedUrl = new URL(localRedisUrl)
  const host = parsedUrl.hostname || '127.0.0.1'
  const port = Number(parsedUrl.port || 6379)
  const username = decodeURIComponent(parsedUrl.username || '')
  const password = decodeURIComponent(parsedUrl.password || '')
  const db = parsedUrl.pathname ? Number(parsedUrl.pathname.replace('/', '') || '0') : 0

  const startupCommands: string[][] = []
  if (password) {
    startupCommands.push(username ? ['AUTH', username, password] : ['AUTH', password])
  }
  if (!Number.isNaN(db) && db > 0) {
    startupCommands.push(['SELECT', String(db)])
  }

  const commands = [...startupCommands, command]
  const payload = commands.map(encodeRedisCommand).join('')

  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port })
    let settled = false
    let buffer = Buffer.alloc(0)
    const replies: Array<string | number | null> = []

    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      socket.removeAllListeners()
      socket.end()
      fn()
    }

    socket.setTimeout(2000)

    socket.on('connect', () => {
      socket.write(payload)
    })

    socket.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk])
      let offset = 0

      while (offset < buffer.length) {
        const parsed = parseRedisResponse(buffer, offset)
        if (!parsed) break
        replies.push(parsed.value)
        offset = parsed.next
      }

      if (offset > 0) {
        buffer = buffer.subarray(offset)
      }

      if (replies.length >= commands.length) {
        finish(() => resolve(replies[replies.length - 1]))
      }
    })

    socket.on('timeout', () => {
      finish(() => reject(new Error('Local Redis command timed out')))
    })

    socket.on('error', (error) => {
      finish(() => reject(error))
    })

    socket.on('end', () => {
      if (!settled && replies.length < commands.length) {
        finish(() => reject(new Error('Local Redis connection closed before full response')))
      }
    })
  })
}

function encodeRedisCommand(parts: string[]): string {
  let output = `*${parts.length}\r\n`
  for (const part of parts) {
    const length = Buffer.byteLength(part)
    output += `$${length}\r\n${part}\r\n`
  }
  return output
}

function parseRedisResponse(
  buffer: Buffer,
  offset: number
): { value: string | number | null; next: number } | null {
  if (offset >= buffer.length) return null

  const type = String.fromCharCode(buffer[offset])
  const lineEnd = buffer.indexOf('\r\n', offset + 1)
  if (lineEnd === -1) return null

  const line = buffer.toString('utf8', offset + 1, lineEnd)

  if (type === '+') {
    return { value: line, next: lineEnd + 2 }
  }

  if (type === ':') {
    return { value: Number(line), next: lineEnd + 2 }
  }

  if (type === '-') {
    throw new Error(`Redis error: ${line}`)
  }

  if (type === '$') {
    const size = Number(line)
    if (size === -1) {
      return { value: null, next: lineEnd + 2 }
    }

    const valueStart = lineEnd + 2
    const valueEnd = valueStart + size
    if (valueEnd + 2 > buffer.length) return null

    const value = buffer.toString('utf8', valueStart, valueEnd)
    return { value, next: valueEnd + 2 }
  }

  throw new Error(`Unsupported Redis response type: ${type}`)
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (value.expiresAt <= now) {
      queryCache.delete(key)
    }
  }
}, 60000)

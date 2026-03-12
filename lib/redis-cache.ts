import 'server-only'

const KEY_PREFIX = 'qunt:v1'
const VERSION_CACHE_TTL_MS = 30_000

type CacheEntry = {
  value: string
  expiresAt: number
}

const inMemoryCache = new Map<string, CacheEntry>()
const inMemoryNamespaceVersions = new Map<string, number>()
const versionCache = new Map<string, { version: number; expiresAt: number }>()

const localRedisUrl = process.env.REDIS_URL
const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const localRedisEnabled = Boolean(localRedisUrl)
const upstashRedisEnabled = Boolean(upstashRedisUrl && upstashRedisToken)

export function isRedisConfigured(): boolean {
  return localRedisEnabled || upstashRedisEnabled
}

function namespacedVersionKey(namespace: string): string {
  return `${KEY_PREFIX}:nsver:${namespace}`
}

function cacheKey(namespace: string, version: number, key: string): string {
  return `${KEY_PREFIX}:${namespace}:v${version}:${key}`
}

function getInMemoryNow(): number {
  return Date.now()
}

function getInMemoryValue(key: string): string | null {
  const entry = inMemoryCache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= getInMemoryNow()) {
    inMemoryCache.delete(key)
    return null
  }
  return entry.value
}

function setInMemoryValue(key: string, value: string, ttlSeconds: number): void {
  inMemoryCache.set(key, {
    value,
    expiresAt: getInMemoryNow() + ttlSeconds * 1000,
  })
}

function getCachedNamespaceVersion(namespace: string): number | null {
  const cached = versionCache.get(namespace)
  if (!cached) return null
  if (cached.expiresAt <= getInMemoryNow()) {
    versionCache.delete(namespace)
    return null
  }
  return cached.version
}

function setCachedNamespaceVersion(namespace: string, version: number): void {
  versionCache.set(namespace, {
    version,
    expiresAt: getInMemoryNow() + VERSION_CACHE_TTL_MS,
  })
}

async function getNamespaceVersion(namespace: string): Promise<number> {
  const cached = getCachedNamespaceVersion(namespace)
  if (cached !== null) return cached

  if (!isRedisConfigured()) {
    const current = inMemoryNamespaceVersions.get(namespace) ?? 1
    setCachedNamespaceVersion(namespace, current)
    return current
  }

  const versionKey = namespacedVersionKey(namespace)
  const raw = await runRedisCommand(['GET', versionKey])
  const parsed = Number(raw)
  const version = Number.isFinite(parsed) && parsed > 0 ? parsed : 1

  if (!Number.isFinite(parsed) || parsed <= 0) {
    await runRedisCommand(['SET', versionKey, '1']).catch(() => undefined)
  }

  setCachedNamespaceVersion(namespace, version)
  return version
}

export async function invalidateCacheNamespace(namespace: string): Promise<void> {
  const nextInMemory = (inMemoryNamespaceVersions.get(namespace) ?? 1) + 1
  inMemoryNamespaceVersions.set(namespace, nextInMemory)

  if (isRedisConfigured()) {
    const versionKey = namespacedVersionKey(namespace)
    const raw = await runRedisCommand(['INCR', versionKey]).catch(() => null)
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) {
      setCachedNamespaceVersion(namespace, parsed)
      return
    }
  }

  setCachedNamespaceVersion(namespace, nextInMemory)
}

export async function getRedisJson<T>(namespace: string, key: string): Promise<T | null> {
  const version = await getNamespaceVersion(namespace)
  const scopedKey = cacheKey(namespace, version, key)

  if (isRedisConfigured()) {
    const raw = await runRedisCommand(['GET', scopedKey]).catch(() => null)
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    }
  }

  const local = getInMemoryValue(scopedKey)
  if (!local) return null

  try {
    return JSON.parse(local) as T
  } catch {
    return null
  }
}

export async function setRedisJson<T>(
  namespace: string,
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const version = await getNamespaceVersion(namespace)
  const scopedKey = cacheKey(namespace, version, key)
  const payload = JSON.stringify(value)

  if (isRedisConfigured()) {
    await runRedisCommand(['SETEX', scopedKey, String(ttlSeconds), payload]).catch(() => undefined)
  }

  setInMemoryValue(scopedKey, payload, ttlSeconds)
}

async function runRedisCommand(command: string[]): Promise<string | number | null> {
  if (localRedisEnabled) {
    try {
      return await runLocalRedisCommand(command)
    } catch {
      // Try upstash fallback.
    }
  }

  if (upstashRedisEnabled) {
    try {
      return await runUpstashRedisCommand(command)
    } catch {
      return null
    }
  }

  return null
}

async function runUpstashRedisCommand(command: string[]): Promise<string | number | null> {
  if (!upstashRedisUrl || !upstashRedisToken) return null

  const response = await fetch(upstashRedisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${upstashRedisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })

  if (!response.ok) {
    throw new Error(`Upstash Redis request failed: ${response.status}`)
  }

  const payload = await response.json()
  if (payload.error) {
    throw new Error(String(payload.error))
  }

  return payload.result ?? null
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

const inMemorySweep = setInterval(() => {
  const now = getInMemoryNow()
  for (const [key, entry] of inMemoryCache.entries()) {
    if (entry.expiresAt <= now) {
      inMemoryCache.delete(key)
    }
  }
}, 60_000)

inMemorySweep.unref?.()

// Export runRedisCommand for use in other modules
export { runRedisCommand }

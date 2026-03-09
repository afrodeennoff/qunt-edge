import { NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

interface IncrementResult {
  count: number
  resetTime: number
  source: 'upstash' | 'memory'
}

const memoryStore = new Map<string, RateLimitStore>()
const MAX_TRACKED_KEYS = 10_000
const CLEANUP_INTERVAL_MS = 60_000

function normalizeHeaderIp(value: string | null): string | null {
  if (!value) return null
  const first = value.split(',')[0]?.trim()
  return first || null
}

export function getTrustedClientIp(req: HeaderCarrier): string {
  return (
    normalizeHeaderIp(req.headers.get('x-vercel-forwarded-for')) ||
    normalizeHeaderIp(req.headers.get('cf-connecting-ip')) ||
    normalizeHeaderIp(req.headers.get('x-forwarded-for')) ||
    normalizeHeaderIp(req.headers.get('x-real-ip')) ||
    'unknown'
  )
}

function cleanupExpiredEntries(now = Date.now()): void {
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key)
    }
  }
}

function incrementMemory(key: string, window: number): IncrementResult {
  const now = Date.now()
  if (memoryStore.size >= MAX_TRACKED_KEYS && !memoryStore.has(key)) {
    cleanupExpiredEntries(now)
    if (memoryStore.size >= MAX_TRACKED_KEYS) {
      const oldestKey = memoryStore.keys().next().value as string | undefined
      if (oldestKey) {
        memoryStore.delete(oldestKey)
      }
    }
  }

  const record = memoryStore.get(key)
  if (!record || now > record.resetTime) {
    const resetTime = now + window
    memoryStore.set(key, { count: 1, resetTime })
    return { count: 1, resetTime, source: 'memory' }
  }

  record.count += 1
  return { count: record.count, resetTime: record.resetTime, source: 'memory' }
}

async function incrementUpstash(key: string, window: number): Promise<IncrementResult | null> {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!restUrl || !restToken) return null

  const response = await fetch(`${restUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${restToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['PTTL', key],
      ['PEXPIRE', key, `${window}`, 'NX'],
    ]),
  })

  if (!response.ok) {
    throw new Error(`Upstash rate limit request failed: ${response.status}`)
  }

  const payload = (await response.json()) as Array<{ result?: number | string | null }>
  const increment = Number(payload?.[0]?.result ?? 0)
  const ttlMs = Number(payload?.[1]?.result ?? -1)

  if (!Number.isFinite(increment) || increment <= 0) {
    throw new Error('Upstash returned invalid increment result')
  }

  const resetTime = Date.now() + (ttlMs > 0 ? ttlMs : window)
  return { count: increment, resetTime, source: 'upstash' }
}

const DISTRIBUTED_LIMITER_UNAVAILABLE = 'DISTRIBUTED_LIMITER_UNAVAILABLE'

type IncrementOptions = {
  requireDistributedInProduction?: boolean
}

async function incrementCounter(key: string, window: number, options: IncrementOptions): Promise<IncrementResult> {
  const requireDistributedInProduction = options.requireDistributedInProduction === true
  const requiresDistributed = process.env.NODE_ENV === 'production' && requireDistributedInProduction

  if (process.env.NODE_ENV === 'production') {
    try {
      const upstash = await incrementUpstash(key, window)
      if (upstash) return upstash
      if (requiresDistributed) {
        throw new Error(DISTRIBUTED_LIMITER_UNAVAILABLE)
      }
    } catch {
      if (requiresDistributed) {
        throw new Error(DISTRIBUTED_LIMITER_UNAVAILABLE)
      }
      // Fall through to in-memory limiter so rate limiting still works if the
      // distributed backend is temporarily unavailable.
    }
  }

  return incrementMemory(key, window)
}

export function rateLimit({
  limit = 100,
  window = 60000,
  identifier = '',
  requireDistributedInProduction = false,
}: {
  limit?: number
  window?: number
  identifier?: string
  requireDistributedInProduction?: boolean
} = {}) {
  return async (req: HeaderCarrier): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number; degraded?: boolean; reason?: string }> => {
    const ip = getTrustedClientIp(req)
    const key = `${identifier}:${ip}`
    let result: IncrementResult

    try {
      result = await incrementCounter(key, window, { requireDistributedInProduction })
    } catch (error) {
      if (error instanceof Error && error.message === DISTRIBUTED_LIMITER_UNAVAILABLE) {
        return {
          success: false,
          limit,
          remaining: 0,
          resetTime: Date.now() + window,
          degraded: true,
          reason: 'limiter_unavailable',
        }
      }
      throw error
    }

    if (result.count > limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        resetTime: result.resetTime,
        degraded: result.source !== 'upstash' && process.env.NODE_ENV === 'production',
      }
    }

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - result.count),
      resetTime: result.resetTime,
      degraded: result.source !== 'upstash' && process.env.NODE_ENV === 'production',
    }
  }
}

export async function createRateLimitResponse({
  limit,
  remaining,
  resetTime,
  code = 'RATE_LIMITED',
  message = 'Too many requests. Please try again later.',
}: {
  limit: number
  remaining: number
  resetTime: number
  code?: string
  message?: string
}) {
  const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000))
  return NextResponse.json(
    { error: { code, message } },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  )
}

const rateLimitCleanupTimer = setInterval(() => {
  cleanupExpiredEntries()
}, CLEANUP_INTERVAL_MS)

rateLimitCleanupTimer.unref?.()

type HeaderCarrier = {
  headers: Pick<Headers, 'get'>
}

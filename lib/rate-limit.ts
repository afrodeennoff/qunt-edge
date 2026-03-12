import { NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

interface IncrementResult {
  count: number
  resetTime: number
}

const memoryStore = new Map<string, RateLimitStore>()
const MAX_TRACKED_KEYS = 10_000
const CLEANUP_INTERVAL_MS = 60_000

function normalizeHeaderIp(value: string | null): string | null {
  if (!value) return null
  const first = value.split(',')[0]?.trim()
  return first || null
}

// getTrustedClientIp returns the client IP for rate limiting.
// Priority: Cloudflare (cf-connecting-ip) > Vercel (x-vercel-forwarded-for) > Standard headers
// Note: x-forwarded-for can be spoofed by clients - only trust it from known proxies
export function getTrustedClientIp(req: HeaderCarrier): string {
  // Cloudflare is the most trusted - it sets cf-connecting-ip from actual client connection
  const cfIp = normalizeHeaderIp(req.headers.get('cf-connecting-ip'))
  if (cfIp && cfIp !== 'undefined' && cfIp !== 'null') {
    return cfIp
  }

  // Vercel sets x-vercel-forwarded-for with real client IP for requests from Vercel network
  const vercelIp = normalizeHeaderIp(req.headers.get('x-vercel-forwarded-for'))
  if (vercelIp && vercelIp !== 'undefined' && vercelIp !== 'null') {
    return vercelIp
  }

  if (process.env.NODE_ENV !== 'production') {
    // Local dev/test fallback headers (less trusted, but useful outside managed proxies)
    const realIp = normalizeHeaderIp(req.headers.get('x-real-ip'))
    if (realIp && realIp !== 'undefined' && realIp !== 'null') {
      return realIp
    }

    const rawForwardedFor = req.headers.get('x-forwarded-for')
    if (rawForwardedFor) {
      const parts = rawForwardedFor.split(',').map(p => p.trim()).filter(Boolean)
      if (parts.length > 1 && parts[0] !== 'undefined' && parts[0] !== 'null') {
        return parts[0]
      }
    }
  }

  return 'unknown'
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
    return { count: 1, resetTime }
  }

  record.count += 1
  return { count: record.count, resetTime: record.resetTime }
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
  return { count: increment, resetTime }
}

async function incrementCounter(key: string, window: number): Promise<IncrementResult> {
  // In production, NEVER fall back to in-memory limiter - this creates a bypass vector
  // where attackers can circumvent rate limits by overwhelming the distributed backend.
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Rate limiting requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production')
    }
    try {
      const upstash = await incrementUpstash(key, window)
      if (upstash) return upstash
    } catch (error) {
      // In production, fail closed - don't allow requests through if rate limiting is broken
      console.error('[rate-limit] Upstash error in production:', error)
      throw new Error('Rate limiting temporarily unavailable')
    }
  }

  return incrementMemory(key, window)
}

export function rateLimit({
  limit = 100,
  window = 60000,
  identifier = '',
}: {
  limit?: number
  window?: number
  identifier?: string
} = {}) {
  return async (
    req: HeaderCarrier,
    opts?: { subject?: string },
  ): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> => {
    const ip = getTrustedClientIp(req)
    const key = opts?.subject
      ? `${identifier}:${opts.subject}:${ip}`
      : `${identifier}:${ip}`
    const result = await incrementCounter(key, window)

    if (result.count > limit) {
      return { success: false, limit, remaining: 0, resetTime: result.resetTime }
    }

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - result.count),
      resetTime: result.resetTime,
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

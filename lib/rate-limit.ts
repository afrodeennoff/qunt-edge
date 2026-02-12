import { NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitStore>()
const MAX_TRACKED_KEYS = 10_000
const CLEANUP_INTERVAL_MS = 60_000

export function rateLimit({
  limit = 100,
  window = 60000,
  identifier = '',
}: {
  limit?: number
  window?: number
  identifier?: string
} = {}) {
  return async (req: HeaderCarrier): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> => {
    const ip = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown'
    
    const key = `${identifier}:${ip}`
    const now = Date.now()

    if (store.size >= MAX_TRACKED_KEYS && !store.has(key)) {
      cleanupExpiredEntries(now)
      if (store.size >= MAX_TRACKED_KEYS) {
        const oldestKey = store.keys().next().value as string | undefined
        if (oldestKey) {
          store.delete(oldestKey)
        }
      }
    }
    
    const record = store.get(key)
    
    if (!record || now > record.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + window,
      })

      return { success: true, limit, remaining: limit - 1, resetTime: now + window }
    }
    
    if (record.count >= limit) {
      return { success: false, limit, remaining: 0, resetTime: record.resetTime }
    }
    
    record.count++
    return { success: true, limit, remaining: limit - record.count, resetTime: record.resetTime }
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

function cleanupExpiredEntries(now = Date.now()): void {
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}

const rateLimitCleanupTimer = setInterval(() => {
  cleanupExpiredEntries()
}, CLEANUP_INTERVAL_MS)

rateLimitCleanupTimer.unref?.()
type HeaderCarrier = {
  headers: Pick<Headers, 'get'>
}

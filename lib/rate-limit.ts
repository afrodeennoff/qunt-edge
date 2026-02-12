import { NextRequest, NextResponse } from 'next/server'

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
  return async (req: NextRequest): Promise<{ success: boolean; remaining?: number }> => {
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
      
      return { success: true, remaining: limit - 1 }
    }
    
    if (record.count >= limit) {
      return { success: false }
    }
    
    record.count++
    return { success: true, remaining: limit - record.count }
  }
}

export async function createRateLimitResponse(limit: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'Retry-After': '60',
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

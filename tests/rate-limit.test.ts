import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  it('blocks requests after the configured limit and exposes reset metadata', async () => {
    const limiter = rateLimit({ limit: 2, window: 60_000, identifier: 'test-limit' })
    const request = new NextRequest('https://example.com', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })

    const first = await limiter(request)
    const second = await limiter(request)
    const third = await limiter(request)

    expect(first.success).toBe(true)
    expect(second.success).toBe(true)
    expect(third.success).toBe(false)
    expect(third.limit).toBe(2)
    expect(third.remaining).toBe(0)
    expect(typeof third.resetTime).toBe('number')
  })
})

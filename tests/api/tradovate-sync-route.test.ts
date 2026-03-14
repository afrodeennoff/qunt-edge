import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getUserMock,
  getTradovateTokenMock,
  getTradovateTradesMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  getTradovateTokenMock: vi.fn(),
  getTradovateTradesMock: vi.fn(),
}))

vi.mock('@/lib/supabase/route-client', () => ({
  createRouteClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}))

vi.mock('@/app/[locale]/dashboard/components/import/tradovate/actions', () => ({
  getTradovateToken: getTradovateTokenMock,
  getTradovateTrades: getTradovateTradesMock,
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => vi.fn(async () => ({ success: true, limit: 20, remaining: 19, resetTime: 0 }))),
  createRateLimitResponse: vi.fn(),
}))

describe('POST /api/tradovate/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('returns apiError envelope for unauthorized caller', async () => {
    const { POST } = await import('@/app/api/tradovate/sync/route')
    const response = await POST(
      new Request('http://localhost/api/tradovate/sync', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ accountId: 'ACC-1' }),
      }) as never
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: 'UNAUTHORIZED',
      },
    })
    expect(getTradovateTokenMock).not.toHaveBeenCalled()
    expect(getTradovateTradesMock).not.toHaveBeenCalled()
  })
})

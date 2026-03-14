import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getUserMock,
  removeTradovateTokenMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  removeTradovateTokenMock: vi.fn(),
}))

vi.mock('@/lib/supabase/route-client', () => ({
  createRouteClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}))

vi.mock('@/app/[locale]/dashboard/components/import/tradovate/actions', () => ({
  getTradovateSynchronizations: vi.fn(),
  removeTradovateToken: removeTradovateTokenMock,
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => vi.fn(async () => ({ success: true, limit: 20, remaining: 19, resetTime: 0 }))),
  createRateLimitResponse: vi.fn(),
}))

describe('DELETE /api/tradovate/synchronizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: { id: 'auth-user-1' } }, error: null })
  })

  it('removes the owned synchronization', async () => {
    removeTradovateTokenMock.mockResolvedValue({ deletedCount: 1 })
    const { DELETE } = await import('@/app/api/tradovate/synchronizations/route')
    const response = await DELETE(
      new Request('http://localhost/api/tradovate/synchronizations', {
        method: 'DELETE',
        headers: {
          authorization: 'Bearer token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ accountId: 'ACC-1' }),
      }) as never
    )

    expect(response.status).toBe(200)
    expect(removeTradovateTokenMock).toHaveBeenCalledWith('ACC-1')
  })

  it('returns 404 when the token is not owned', async () => {
    removeTradovateTokenMock.mockResolvedValue({ deletedCount: 0 })
    const { DELETE } = await import('@/app/api/tradovate/synchronizations/route')
    const response = await DELETE(
      new Request('http://localhost/api/tradovate/synchronizations', {
        method: 'DELETE',
        headers: {
          authorization: 'Bearer token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ accountId: 'ACC-1' }),
      }) as never
    )

    expect(response.status).toBe(404)
    expect(removeTradovateTokenMock).toHaveBeenCalledWith('ACC-1')
  })

  it('rejects unauthenticated requests', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null })
    const { DELETE } = await import('@/app/api/tradovate/synchronizations/route')
    const response = await DELETE(
      new Request('http://localhost/api/tradovate/synchronizations', {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ accountId: 'ACC-1' }),
      }) as never
    )

    expect(response.status).toBe(401)
    expect(removeTradovateTokenMock).not.toHaveBeenCalled()
  })
})

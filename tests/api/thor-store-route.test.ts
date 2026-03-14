import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { verifySecureToken } = vi.hoisted(() => ({
  verifySecureToken: vi.fn(),
}))

vi.mock('@/lib/api-auth', () => ({
  verifySecureToken,
}))

const deleteManyMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    trade: {
      deleteMany: deleteManyMock,
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => vi.fn(async () => ({ success: true, limit: 30, remaining: 29, resetTime: 0 }))),
  createRateLimitResponse: vi.fn(),
}))

describe('DELETE /api/thor/store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifySecureToken.mockResolvedValue({ id: 'thor-user' })
    deleteManyMock.mockResolvedValue({ count: 1 })
  })

  it('scopes deletions to the authenticated user and account', async () => {
    const { DELETE } = await import('@/app/api/thor/store/route')
    const request = {
      method: 'DELETE',
      nextUrl: new URL('http://localhost/api/thor/store?accountNumber=ACC-1'),
      headers: new Headers({ authorization: 'Bearer token' }),
    } as unknown as NextRequest
    const response = await DELETE(
      request
    )

    expect(response.status).toBe(200)
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        userId: 'thor-user',
        accountNumber: 'ACC-1',
      },
    })
  })

  it('returns 401 when authentication fails', async () => {
    verifySecureToken.mockResolvedValue(null)
    const { DELETE } = await import('@/app/api/thor/store/route')
    const request = {
      method: 'DELETE',
      nextUrl: new URL('http://localhost/api/thor/store?accountNumber=ACC-1'),
      headers: new Headers({ authorization: 'Bearer token' }),
    } as unknown as NextRequest
    const response = await DELETE(
      request
    )

    expect(response.status).toBe(401)
    const payload = await response.json()
    expect(payload).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      },
    })
    expect(deleteManyMock).not.toHaveBeenCalled()
  })
})

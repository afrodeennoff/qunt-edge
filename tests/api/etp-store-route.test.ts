import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { upsert, verifySecureToken } = vi.hoisted(() => ({
  upsert: vi.fn(),
  verifySecureToken: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      upsert,
      findMany: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/api-auth', () => ({
  verifySecureToken,
}))

import { POST } from '@/app/api/etp/v1/store/route'

describe('/api/etp/v1/store POST', () => {
  beforeEach(() => {
    upsert.mockReset()
    verifySecureToken.mockReset()
    verifySecureToken.mockResolvedValue({ id: 'user_1' })
    upsert.mockResolvedValue({ id: 'order_1' })
  })

  it('uses user-scoped upsert key to prevent cross-tenant overwrites', async () => {
    const request = new NextRequest('http://localhost/api/etp/v1/store', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        orders: [
          {
            AccountId: 'A1',
            OrderId: 'O-123',
            OrderAction: 'BUY',
            Quantity: 1,
            AverageFilledPrice: 5000,
            IsOpeningOrder: true,
            Time: '2026-02-24T10:00:00.000Z',
            Instrument: {
              Symbol: 'ESM6',
              Type: 'FUT',
            },
          },
        ],
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(upsert).toHaveBeenCalledTimes(1)

    const firstCallArg = upsert.mock.calls[0]?.[0]
    expect(firstCallArg.where).toEqual({
      userId_orderId: {
        userId: 'user_1',
        orderId: 'O-123',
      },
    })
  })

  it('rejects oversized payloads', async () => {
    const request = new NextRequest('http://localhost/api/etp/v1/store', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-length': String(3 * 1024 * 1024),
      },
      body: '{}',
    })

    const response = await POST(request)
    expect(response.status).toBe(413)
  })
})

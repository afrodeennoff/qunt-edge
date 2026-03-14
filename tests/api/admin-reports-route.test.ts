import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { assertAdminAccessMock } = vi.hoisted(() => ({
  assertAdminAccessMock: vi.fn(),
}))

vi.mock('@/server/authz', () => ({
  assertAdminAccess: assertAdminAccessMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {},
}))

describe('GET /api/admin/reports', () => {
  it('returns apiError envelope for invalid startDate', async () => {
    assertAdminAccessMock.mockResolvedValue({ userId: 'admin', email: 'admin@acme.com' })

    const { GET } = await import('@/app/api/admin/reports/route')
    const response = await GET(
      new NextRequest('http://localhost/api/admin/reports?startDate=not-a-date') as never
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: 'BAD_REQUEST',
      },
    })
  })
})

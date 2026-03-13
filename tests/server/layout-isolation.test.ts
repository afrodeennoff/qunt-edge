import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getUserIdMock, findUniqueMock } = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  findUniqueMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  getUserId: getUserIdMock,
  getDatabaseUserId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dashboardLayout: {
      findUnique: findUniqueMock,
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@/server/shared', () => ({
  getShared: vi.fn(),
}))

vi.mock('@/locales/server', () => ({
  getCurrentLocale: vi.fn(async () => 'en'),
}))

vi.mock('@/lib/cache/query-cache', () => ({
  cacheQuery: (fn: unknown) => fn,
}))

vi.mock('@/lib/feature-flags', () => ({
  FEATURE_FLAGS: {
    ENABLE_QUERY_CACHING: false,
  },
}))

import { getDashboardLayout } from '@/server/user-data'

describe('getDashboardLayout isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserIdMock.mockResolvedValue('auth-user-a')
    findUniqueMock.mockResolvedValue({
      id: 'layout-a',
      userId: 'auth-user-a',
      desktop: [],
      mobile: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  it('rejects cross-user dashboard layout reads', async () => {
    await expect(getDashboardLayout('auth-user-b')).rejects.toThrow('Forbidden')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getDatabaseUserIdMock,
  createSecureSlugMock,
  updateTagMock,
  sharedCreateMock,
} = vi.hoisted(() => ({
  getDatabaseUserIdMock: vi.fn(),
  createSecureSlugMock: vi.fn(),
  updateTagMock: vi.fn(),
  sharedCreateMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock('@/lib/security/slug', () => ({
  createSecureSlug: createSecureSlugMock,
}))

vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    shared: {
      create: sharedCreateMock,
    },
  },
}))

import { createShared } from '@/server/shared'

describe('createShared', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
  })

  it('rejects payloads with missing date range start', async () => {
    await expect(
      createShared({
        isPublic: true,
        accountNumbers: ['ACC-1'],
        dateRange: {} as never,
      }),
    ).rejects.toThrow('Failed to share trades: Start date is required')

    expect(createSecureSlugMock).not.toHaveBeenCalled()
    expect(sharedCreateMock).not.toHaveBeenCalled()
    expect(updateTagMock).not.toHaveBeenCalled()
  })

  it('retries slug generation on unique constraint failures and updates cache tag', async () => {
    createSecureSlugMock
      .mockReturnValueOnce('slug-alpha')
      .mockReturnValueOnce('slug-beta')

    const uniqueError = new Error('duplicate') as Error & { code?: string }
    uniqueError.code = 'P2002'

    sharedCreateMock
      .mockRejectedValueOnce(uniqueError)
      .mockResolvedValueOnce({ id: 'shared-1' })

    const slug = await createShared({
      isPublic: true,
      accountNumbers: ['ACC-1', 'ACC-2'],
      dateRange: { from: new Date('2026-03-01T00:00:00.000Z') },
    })

    expect(slug).toBe('slug-beta')
    expect(createSecureSlugMock).toHaveBeenCalledTimes(2)
    expect(sharedCreateMock).toHaveBeenCalledTimes(2)
    expect(updateTagMock).toHaveBeenCalledWith('shared-view-slug-beta')

    const payload = sharedCreateMock.mock.calls[1]?.[0]?.data
    expect(payload.slug).toBe('slug-beta')
    expect(payload.userId).toBe('db-user-1')
    expect(payload.accountNumbers).toEqual(['ACC-1', 'ACC-2'])
  })
})

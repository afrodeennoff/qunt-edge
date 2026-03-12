import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  prismaMock,
  getUserIdMock,
  headersMock,
  updateTagMock,
} = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  getUserIdMock: vi.fn(),
  headersMock: vi.fn(),
  updateTagMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/server/auth', () => ({
  getUserId: getUserIdMock,
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { email: 'fallback@example.com' } } })),
    },
  })),
}))

vi.mock('next/headers', () => ({
  headers: headersMock,
}))

vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
  revalidatePath: vi.fn(),
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { saveTradesAction } from '@/server/trades'

const baseTrade = {
  accountNumber: 'ACC-1',
  instrument: 'NQ',
  side: 'long',
  quantity: 1,
  entryPrice: 100,
  closePrice: 110,
  pnl: 10,
  commission: 1,
  entryDate: '2025-01-01T00:00:00.000Z',
  closeDate: '2025-01-01T01:00:00.000Z',
}

describe('saveTradesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserIdMock.mockResolvedValue('auth-user-1')
    headersMock.mockResolvedValue(new Headers({ 'x-user-email': 'user@example.com' }))

    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'db-user-1' })
    prismaMock.user.upsert.mockResolvedValue({ id: 'db-user-1' })
  })

  it('saves valid trades and creates missing accounts in bulk', async () => {
    const findMany = vi.fn().mockResolvedValue([])
    const createManyAccounts = vi.fn().mockResolvedValue({ count: 1 })
    const createManyTrades = vi.fn().mockResolvedValue({ count: 1 })
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        account: { findMany, createMany: createManyAccounts },
        trade: { createMany: createManyTrades },
      }),
    )

    const result = await saveTradesAction([baseTrade])

    expect(result).toEqual({ error: false, numberOfTradesAdded: 1 })
    expect(createManyAccounts).toHaveBeenCalledTimes(1)
    expect(createManyTrades).toHaveBeenCalledTimes(1)
    expect(updateTagMock).toHaveBeenCalledWith('trades-db-user-1')
  })

  it('accepts partial valid batches and persists only valid trades', async () => {
    const findMany = vi.fn().mockResolvedValue([])
    const createManyAccounts = vi.fn().mockResolvedValue({ count: 1 })
    const createManyTrades = vi.fn().mockResolvedValue({ count: 1 })
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        account: { findMany, createMany: createManyAccounts },
        trade: { createMany: createManyTrades },
      }),
    )

    const invalidTrade = { ...baseTrade, accountNumber: '' }
    const result = await saveTradesAction([baseTrade, invalidTrade])

    expect(result).toEqual({ error: false, numberOfTradesAdded: 1 })
    expect(createManyTrades).toHaveBeenCalledTimes(1)
  })

  it('returns DUPLICATE_TRADES when createMany inserts nothing', async () => {
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        account: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn().mockResolvedValue({ count: 1 }) },
        trade: { createMany: vi.fn().mockResolvedValue({ count: 0 }) },
      }),
    )

    const result = await saveTradesAction([baseTrade])

    expect(result.error).toBe('DUPLICATE_TRADES')
    expect(result.numberOfTradesAdded).toBe(0)
  })

  it('allows same trade payload for different users by generating user-scoped IDs', async () => {
    getUserIdMock.mockResolvedValue('auth-user-a')
    prismaMock.user.findUnique.mockImplementation(async ({ where }: { where: Record<string, string> }) => {
      if (where.id === 'auth-user-a') return null
      if (where.id === 'auth-user-b') return null
      if (where.auth_user_id === 'auth-user-a') return { id: 'db-user-a' }
      if (where.auth_user_id === 'auth-user-b') return { id: 'db-user-b' }
      return null
    })

    const createManyTrades = vi.fn().mockResolvedValue({ count: 1 })
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        account: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn().mockResolvedValue({ count: 1 }) },
        trade: { createMany: createManyTrades },
      }),
    )

    await saveTradesAction([baseTrade], { userId: 'auth-user-a' })
    await saveTradesAction([baseTrade], { userId: 'auth-user-b' })

    const firstPayload = createManyTrades.mock.calls[0]?.[0]?.data?.[0]
    const secondPayload = createManyTrades.mock.calls[1]?.[0]?.data?.[0]

    expect(firstPayload.userId).toBe('db-user-a')
    expect(secondPayload.userId).toBe('db-user-b')
    expect(firstPayload.id).not.toBe(secondPayload.id)
  })
})

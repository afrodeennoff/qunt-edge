import { beforeEach, describe, expect, it, vi } from 'vitest'

const { updateManyMock, updateMock, transactionMock } = vi.hoisted(() => ({
  updateManyMock: vi.fn(),
  updateMock: vi.fn(),
  transactionMock: vi.fn(async (operations: unknown[]) => operations),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    trade: {
      updateMany: updateManyMock,
      update: updateMock,
    },
    $transaction: transactionMock,
    $queryRaw: vi.fn(),
    account: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/query-optimizer', () => ({
  executeOptimizedQuery: vi.fn(async (_name: string, queryFn: () => unknown) => queryFn()),
}))

import { batchUpdateTradesOptimized } from '@/server/optimized-trades'

describe('batchUpdateTradesOptimized isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateManyMock.mockResolvedValue({ count: 1 })
    updateMock.mockResolvedValue({ id: 'trade-1' })
  })

  it('scopes every update to actor userId', async () => {
    await batchUpdateTradesOptimized('db-user-1', [
      { id: 'trade-1', data: { comment: 'a' } },
      { id: 'trade-2', data: { comment: 'b' } },
    ])

    expect(updateManyMock).toHaveBeenCalledTimes(2)
    expect(updateManyMock).toHaveBeenNthCalledWith(1, {
      where: { id: 'trade-1', userId: 'db-user-1' },
      data: { comment: 'a' },
    })
    expect(updateManyMock).toHaveBeenNthCalledWith(2, {
      where: { id: 'trade-2', userId: 'db-user-1' },
      data: { comment: 'b' },
    })
    expect(updateMock).not.toHaveBeenCalled()
  })
})

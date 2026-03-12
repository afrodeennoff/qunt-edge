import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUserId,
  findManyTrades,
  updateManyTrades,
  transaction,
  findUser,
  invalidateCacheNamespace,
} = vi.hoisted(() => ({
  getUserId: vi.fn(),
  findManyTrades: vi.fn(),
  updateManyTrades: vi.fn(),
  transaction: vi.fn(),
  findUser: vi.fn(),
  invalidateCacheNamespace: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  getUserId,
  getDatabaseUserId: vi.fn(),
}))

vi.mock("@/lib/redis-cache", () => ({
  invalidateCacheNamespace,
}))

vi.mock("@/lib/date-utils", () => ({
  formatTimestamp: vi.fn((value: string) => value),
  isChronologicalRange: vi.fn(() => true),
  normalizeToUtcTimestamp: vi.fn((value: string) => value),
}))

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
  unstable_cache: vi.fn((fn: unknown) => fn),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUser,
    },
    trade: {
      findMany: findManyTrades,
      update: vi.fn(() => ({})),
      updateMany: updateManyTrades,
    },
    $transaction: transaction,
  },
}))

import { updateTradesAction } from "@/server/trades"

describe("updateTradesAction batching", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserId.mockResolvedValue("auth-user-1")
    findUser.mockResolvedValue({ id: "db-user-1" })
    updateManyTrades.mockResolvedValue({ count: 0 })
    transaction.mockResolvedValue([])
  })

  it("chunks transformed trade updates into bounded transactions", async () => {
    const trades = Array.from({ length: 250 }, (_, index) => ({
      id: `trade-${index}`,
      entryDate: "2024-01-01T00:00:00.000Z",
      closeDate: "2024-01-01T01:00:00.000Z",
      instrument: "NQ",
    }))
    findManyTrades.mockResolvedValue(trades)

    await updateTradesAction(
      trades.map((trade) => trade.id),
      { entryDateOffset: 1 },
    )

    expect(transaction).toHaveBeenCalledTimes(3)
    expect(transaction.mock.calls[0]?.[0]).toHaveLength(100)
    expect(transaction.mock.calls[1]?.[0]).toHaveLength(100)
    expect(transaction.mock.calls[2]?.[0]).toHaveLength(50)
  })

  it("rejects updates when any trade id is not owned by the authenticated user", async () => {
    findManyTrades.mockResolvedValue([{ id: "trade-1" }])

    await expect(
      updateTradesAction(["trade-1", "trade-2"], { pnl: 42 }),
    ).rejects.toThrow("Forbidden")

    expect(updateManyTrades).not.toHaveBeenCalled()
  })
})

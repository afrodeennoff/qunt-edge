import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getDatabaseUserIdMock,
  updateTagMock,
  invalidateAllUserCachesMock,
  tradeDeleteManyMock,
} = vi.hoisted(() => ({
  getDatabaseUserIdMock: vi.fn(),
  updateTagMock: vi.fn(),
  invalidateAllUserCachesMock: vi.fn(),
  tradeDeleteManyMock: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock("next/cache", () => ({
  updateTag: updateTagMock,
}))

vi.mock("@/lib/cache/cache-invalidation", () => ({
  invalidateAllUserCaches: invalidateAllUserCachesMock,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    trade: {
      deleteMany: tradeDeleteManyMock,
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    account: {
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    payout: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    group: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import {
  deleteInstrumentGroupAction,
  deleteTradesByIdsAction,
} from "@/server/accounts"

describe("accounts multi-user isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("requires authentication for instrument-group deletes", async () => {
    getDatabaseUserIdMock.mockResolvedValue(null)

    await expect(
      deleteInstrumentGroupAction("ACC-1", "NQ"),
    ).rejects.toThrow("Unauthorized")

    expect(tradeDeleteManyMock).not.toHaveBeenCalled()
  })

  it("rejects deleting trades not fully owned by current user", async () => {
    getDatabaseUserIdMock.mockResolvedValue("db-user-1")
    tradeDeleteManyMock.mockResolvedValue({ count: 1 })

    await expect(
      deleteTradesByIdsAction(["trade-a", "trade-b"]),
    ).rejects.toThrow("Forbidden")
  })

  it("scopes deletion to authenticated user id", async () => {
    getDatabaseUserIdMock.mockResolvedValue("db-user-1")
    tradeDeleteManyMock.mockResolvedValue({ count: 2 })

    await deleteTradesByIdsAction(["trade-a", "trade-b"])

    expect(tradeDeleteManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["trade-a", "trade-b"] },
        userId: "db-user-1",
      },
    })
  })
})

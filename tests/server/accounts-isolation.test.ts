import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getDatabaseUserIdMock,
  updateTagMock,
  invalidateAllUserCachesMock,
  tradeDeleteManyMock,
  tradeCountMock,
  transactionMock,
  accountCreateMock,
} = vi.hoisted(() => ({
  getDatabaseUserIdMock: vi.fn(),
  updateTagMock: vi.fn(),
  invalidateAllUserCachesMock: vi.fn(),
  tradeDeleteManyMock: vi.fn(),
  tradeCountMock: vi.fn(),
  transactionMock: vi.fn(),
  accountCreateMock: vi.fn(),
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
      count: tradeCountMock,
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    account: {
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: accountCreateMock,
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
    $transaction: transactionMock,
  },
}))

import {
  createAccountAction,
  deleteInstrumentGroupAction,
  deleteTradesByIdsAction,
} from "@/server/accounts"

describe("accounts multi-user isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    transactionMock.mockImplementation(async (callback: (tx: any) => Promise<unknown>) =>
      callback({
        trade: {
          count: tradeCountMock,
          deleteMany: tradeDeleteManyMock,
        },
      })
    )
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
    tradeCountMock.mockResolvedValue(1)

    await expect(
      deleteTradesByIdsAction(["trade-a", "trade-b"]),
    ).rejects.toThrow("Forbidden")

    expect(tradeDeleteManyMock).not.toHaveBeenCalled()
  })

  it("scopes deletion to authenticated user id", async () => {
    getDatabaseUserIdMock.mockResolvedValue("db-user-1")
    tradeCountMock.mockResolvedValue(2)
    tradeDeleteManyMock.mockResolvedValue({ count: 2 })

    await deleteTradesByIdsAction(["trade-a", "trade-b"])

    expect(tradeCountMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["trade-a", "trade-b"] },
        userId: "db-user-1",
      },
    })
    expect(tradeDeleteManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["trade-a", "trade-b"] },
        userId: "db-user-1",
      },
    })
  })

  it("invalidates user caches after account creation", async () => {
    getDatabaseUserIdMock.mockResolvedValue("db-user-1")
    accountCreateMock.mockResolvedValue({ id: "acc-1", number: "ACC-1" })

    await createAccountAction("ACC-1")

    expect(updateTagMock).toHaveBeenCalledWith("user-data-db-user-1")
    expect(updateTagMock).toHaveBeenCalledWith("trades-db-user-1")
    expect(invalidateAllUserCachesMock).toHaveBeenCalledWith("db-user-1")
  })
})

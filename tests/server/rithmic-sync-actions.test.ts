import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUserIdMock,
  getDatabaseUserIdMock,
  findManyMock,
  upsertMock,
  deleteManyMock,
} = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  getDatabaseUserIdMock: vi.fn(),
  findManyMock: vi.fn(),
  upsertMock: vi.fn(),
  deleteManyMock: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  getUserId: getUserIdMock,
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    synchronization: {
      findMany: findManyMock,
      upsert: upsertMock,
      deleteMany: deleteManyMock,
    },
  },
}))

vi.mock("@/lib/prisma-guard", () => ({
  withPrismaSchemaMismatchFallback: vi.fn(async (_key: string, run: () => unknown) => run()),
}))

import {
  getRithmicSynchronizations,
  removeRithmicSynchronization,
  setRithmicSynchronization,
} from "@/app/[locale]/dashboard/components/import/rithmic/sync/actions"

describe("rithmic sync actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserIdMock.mockResolvedValue("auth-user-1")
    getDatabaseUserIdMock.mockResolvedValue("db-user-1")
  })

  it("lists synchronizations using resolved database user id", async () => {
    findManyMock.mockResolvedValue([])

    await getRithmicSynchronizations()

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        userId: "db-user-1",
        service: "rithmic",
      },
    })
  })

  it("deletes synchronization using resolved database user id", async () => {
    deleteManyMock.mockResolvedValue({ count: 1 })

    await removeRithmicSynchronization("ACC-1")

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        userId: "db-user-1",
        service: "rithmic",
        accountId: "ACC-1",
      },
    })
  })

  it("upserts synchronization with database user id ownership", async () => {
    upsertMock.mockResolvedValue({})

    await setRithmicSynchronization({
      service: "rithmic",
      accountId: "ACC-1",
      token: "token",
    })

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_service_accountId: {
            userId: "db-user-1",
            service: "rithmic",
            accountId: "ACC-1",
          },
        },
        update: expect.objectContaining({
          userId: "db-user-1",
        }),
        create: expect.objectContaining({
          userId: "db-user-1",
        }),
      })
    )
  })
})

import { beforeEach, describe, expect, it, vi } from "vitest"

const { createClientMock, getUserMock, findUniqueMock, teamFindFirstMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
  findUniqueMock: vi.fn(),
  teamFindFirstMock: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  createClient: createClientMock,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
    account: {
      findMany: vi.fn(),
    },
    trade: {
      findMany: vi.fn(),
    },
    team: {
      findFirst: teamFindFirstMock,
    },
  },
}))

import { getTraderById, getTraderVarSummary } from "@/app/[locale]/teams/actions/user"
import { prisma } from "@/lib/prisma"

const accountFindManyMock = vi.mocked(prisma.account.findMany)
const tradeFindManyMock = vi.mocked(prisma.trade.findMany)

describe("getTraderVarSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: { id: "auth-1" } } })
    createClientMock.mockResolvedValue({
      auth: {
        getUser: getUserMock,
      },
    })
  })

  it("returns all 4 VaR values for a trader with sufficient data", async () => {
    const trades = Array.from({ length: 40 }, (_, idx) => ({
      pnl: idx % 3 === 0 ? -200 : 300,
      commission: 20,
      entryDate: new Date(Date.UTC(2026, 0, idx + 1)),
      closeDate: new Date(Date.UTC(2026, 0, idx + 1)),
      createdAt: new Date(Date.UTC(2026, 0, idx + 1)),
    }))

    findUniqueMock
      .mockResolvedValueOnce({ id: "trader-1" })
      .mockResolvedValueOnce({ id: "trader-1" })
    accountFindManyMock.mockResolvedValue([{ id: "a1", startingBalance: 50000 }] as never)
    tradeFindManyMock.mockResolvedValue(trades as never)

    const result = await getTraderVarSummary("trader-1")

    expect(result.success).toBe(true)
    expect(result.summary).toBeDefined()
    expect(result.summary?.hist99.amount ?? 0).toBeGreaterThanOrEqual(result.summary?.hist95.amount ?? 0)
    expect(result.summary?.param99.amount ?? 0).toBeGreaterThanOrEqual(result.summary?.param95.amount ?? 0)
    expect(result.sampleSize).toBe(40)
  })

  it("returns insufficientData when sample is too small", async () => {
    const trades = Array.from({ length: 12 }, (_, idx) => ({
      pnl: 100,
      commission: 10,
      entryDate: new Date(Date.UTC(2026, 0, idx + 1)),
      closeDate: new Date(Date.UTC(2026, 0, idx + 1)),
      createdAt: new Date(Date.UTC(2026, 0, idx + 1)),
    }))

    findUniqueMock
      .mockResolvedValueOnce({ id: "trader-2" })
      .mockResolvedValueOnce({ id: "trader-2" })
    accountFindManyMock.mockResolvedValue([{ id: "a1", startingBalance: 50000 }] as never)
    tradeFindManyMock.mockResolvedValue(trades as never)

    const result = await getTraderVarSummary("trader-2")

    expect(result.success).toBe(true)
    expect(result.summary).toBeUndefined()
    expect(result.error).toBe("insufficientData")
    expect(result.sampleSize).toBe(12)
  })

  it("falls back to inferred portfolio value when balances are missing", async () => {
    const trades = Array.from({ length: 35 }, (_, idx) => ({
      pnl: idx % 2 === 0 ? 250 : -180,
      commission: 10,
      entryDate: new Date(Date.UTC(2026, 0, idx + 1)),
      closeDate: new Date(Date.UTC(2026, 0, idx + 1)),
      createdAt: new Date(Date.UTC(2026, 0, idx + 1)),
    }))

    findUniqueMock
      .mockResolvedValueOnce({ id: "trader-3" })
      .mockResolvedValueOnce({ id: "trader-3" })
    accountFindManyMock.mockResolvedValue([{ id: "a1", startingBalance: 0 }] as never)
    tradeFindManyMock.mockResolvedValue(trades as never)

    const result = await getTraderVarSummary("trader-3")

    expect(result.success).toBe(true)
    expect(result.summary).toBeDefined()
    expect((result.methodMeta?.portfolioValue ?? 0)).toBeGreaterThan(0)
  })

  it("returns unauthorized when there is no authenticated session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })

    const result = await getTraderVarSummary("trader-1")

    expect(result).toEqual({ success: false, error: "Unauthorized" })
    expect(accountFindManyMock).not.toHaveBeenCalled()
    expect(tradeFindManyMock).not.toHaveBeenCalled()
  })

  it("returns unauthorized when requester cannot access trader", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "requester-1" })
    teamFindFirstMock.mockResolvedValue(null)

    const result = await getTraderVarSummary("trader-1")

    expect(result).toEqual({ success: false, error: "Unauthorized" })
    expect(teamFindFirstMock).toHaveBeenCalledTimes(1)
    expect(accountFindManyMock).not.toHaveBeenCalled()
    expect(tradeFindManyMock).not.toHaveBeenCalled()
  })
})

describe("getTraderById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: { id: "auth-1" } } })
    createClientMock.mockResolvedValue({
      auth: {
        getUser: getUserMock,
      },
    })
  })

  it("returns null when requester is not authorized", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "requester-1" })
    teamFindFirstMock.mockResolvedValue(null)

    const trader = await getTraderById("trader-1")

    expect(trader).toBeNull()
  })
})

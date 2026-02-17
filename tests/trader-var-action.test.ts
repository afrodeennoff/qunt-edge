import { beforeEach, describe, expect, it, vi } from "vitest"

// Mocks must be hoisted to be used in vi.mock
const { findUniqueMock, getDatabaseUserIdMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  getDatabaseUserIdMock: vi.fn(),
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
      findFirst: vi.fn(),
    }
  },
}))

// Mock auth module
vi.mock("@/server/auth", () => ({
  getDatabaseUserId: getDatabaseUserIdMock,
}))

import { getTraderVarSummary } from "@/app/[locale]/teams/actions/user"
import { prisma } from "@/lib/prisma"

const accountFindManyMock = vi.mocked(prisma.account.findMany)
const tradeFindManyMock = vi.mocked(prisma.trade.findMany)
const teamFindFirstMock = vi.mocked(prisma.team.findFirst)

describe("getTraderVarSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock authenticated user as the trader itself to bypass permission check
    getDatabaseUserIdMock.mockResolvedValue("trader-1")
  })

  it("returns all 4 VaR values for a trader with sufficient data", async () => {
    const trades = Array.from({ length: 40 }, (_, idx) => ({
      pnl: idx % 3 === 0 ? -200 : 300,
      commission: 20,
      entryDate: new Date(Date.UTC(2026, 0, idx + 1)),
      closeDate: new Date(Date.UTC(2026, 0, idx + 1)),
      createdAt: new Date(Date.UTC(2026, 0, idx + 1)),
    }))

    // Setup mocks
    getDatabaseUserIdMock.mockResolvedValue("trader-1")
    findUniqueMock.mockResolvedValue({
      id: "trader-1",
    })
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

    getDatabaseUserIdMock.mockResolvedValue("trader-2")
    findUniqueMock.mockResolvedValue({
      id: "trader-2",
    })
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

    getDatabaseUserIdMock.mockResolvedValue("trader-3")
    findUniqueMock.mockResolvedValue({
      id: "trader-3",
    })
    accountFindManyMock.mockResolvedValue([{ id: "a1", startingBalance: 0 }] as never)
    tradeFindManyMock.mockResolvedValue(trades as never)

    const result = await getTraderVarSummary("trader-3")

    expect(result.success).toBe(true)
    expect(result.summary).toBeDefined()
    expect((result.methodMeta?.portfolioValue ?? 0)).toBeGreaterThan(0)
  })
})

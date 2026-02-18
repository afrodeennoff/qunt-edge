import { describe, expect, it, vi } from "vitest"

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
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
    $queryRaw: vi.fn(),
  },
}))

import { getTraderVarSummary } from "@/app/[locale]/teams/actions/user"
import { prisma } from "@/lib/prisma"

const accountFindManyMock = vi.mocked(prisma.account.findMany)
const queryRawMock = vi.mocked(prisma.$queryRaw)

describe("getTraderVarSummary Performance", () => {
  it("measures execution time with aggregated data", async () => {
    // Simulate 100,000 trades aggregated into ~300 daily summaries
    const NUM_AGGREGATED = 300;
    const aggregated = Array.from({ length: NUM_AGGREGATED }, (_, idx) => ({
      pnl: idx % 3 === 0 ? -20000 : 30000, // Scaled up values representing sum of many trades
      commission: 2000,
      date: new Date(Date.UTC(2026, 0, idx + 1)),
    }))

    findUniqueMock.mockResolvedValue({
      id: "trader-perf",
    })
    accountFindManyMock.mockResolvedValue([{ id: "a1", startingBalance: 50000 }] as never)
    queryRawMock.mockResolvedValue(aggregated as never)

    const start = performance.now()
    const result = await getTraderVarSummary("trader-perf")
    const end = performance.now()

    console.log(`[Optimized] Execution time for ${NUM_AGGREGATED} aggregated rows (representing 100k trades): ${(end - start).toFixed(2)}ms`)

    expect(result.success).toBe(true)
    // sampleSize is capped at LOOKBACK_DAYS (252) in var.ts
    expect(result.sampleSize).toBe(Math.min(NUM_AGGREGATED, 252))
  })
})

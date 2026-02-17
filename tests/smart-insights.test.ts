import { beforeEach, describe, expect, it, vi } from "vitest"
import { getSmartInsights } from "@/app/[locale]/dashboard/actions/get-smart-insights"
import { prisma } from "@/lib/prisma"

// Mock the prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    trade: {
      findMany: vi.fn(),
    },
    tradeAnalytics: {
      findMany: vi.fn(),
    },
  },
}))

const tradeFindManyMock = vi.mocked(prisma.trade.findMany)
const tradeAnalyticsFindManyMock = vi.mocked(prisma.tradeAnalytics.findMany)

describe("getSmartInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return basic insights but NO advanced insights when no analytics data exists", async () => {
    // Mock trades
    const mockTrades = [
        { id: "t1", pnl: 100, instrument: "NQ", entryDate: new Date(), side: "LONG" },
        { id: "t2", pnl: -50, instrument: "NQ", entryDate: new Date(), side: "SHORT" }
    ]
    tradeFindManyMock.mockResolvedValue(mockTrades as any)
    tradeAnalyticsFindManyMock.mockResolvedValue([])

    const insights = await getSmartInsights("user-1")

    // Expect NO "Volatility Window" (mock removed)
    expect(insights.find(i => i.id === 'ai-opportunity')).toBeUndefined()

    // Expect NO efficiency/RR insights (no data)
    expect(insights.find(i => i.id === 'high-efficiency')).toBeUndefined()
    expect(insights.find(i => i.id === 'good-rr')).toBeUndefined()

    // Expect Instrument Preference (NQ)
    const instInsight = insights.find(i => i.id === 'fav-instrument')
    expect(instInsight).toBeDefined()
    expect(instInsight?.metric).toBe("NQ")
  })

  it("should return High Efficiency insight when analytics show high efficiency", async () => {
    // Mock 5 trades (min required for insight)
    const mockTrades = Array(5).fill(null).map((_, i) => ({
        id: `t${i}`, pnl: 100, instrument: "NQ", entryDate: new Date(), side: "LONG"
    }))
    tradeFindManyMock.mockResolvedValue(mockTrades as any)

    // Mock analytics with high efficiency (>70)
    const mockAnalytics = mockTrades.map(t => ({
        tradeId: t.id,
        efficiency: 80, // High
        riskRewardRatio: 1.5, // moderate
        mae: 10,
        mfe: 100
    }))
    tradeAnalyticsFindManyMock.mockResolvedValue(mockAnalytics as any)

    const insights = await getSmartInsights("user-1")

    const effInsight = insights.find(i => i.id === 'high-efficiency')
    expect(effInsight).toBeDefined()
    expect(effInsight?.title).toBe('High Execution Efficiency')
  })

  it("should return Low Efficiency insight when analytics show low efficiency", async () => {
    const mockTrades = Array(5).fill(null).map((_, i) => ({
        id: `t${i}`, pnl: 100, instrument: "NQ", entryDate: new Date(), side: "LONG"
    }))
    tradeFindManyMock.mockResolvedValue(mockTrades as any)

    // Mock analytics with low efficiency (<30)
    const mockAnalytics = mockTrades.map(t => ({
        tradeId: t.id,
        efficiency: 20, // Low
        riskRewardRatio: 1.5,
        mae: 10,
        mfe: 100
    }))
    tradeAnalyticsFindManyMock.mockResolvedValue(mockAnalytics as any)

    const insights = await getSmartInsights("user-1")

    const effInsight = insights.find(i => i.id === 'low-efficiency')
    expect(effInsight).toBeDefined()
    expect(effInsight?.title).toBe('Efficiency Opportunity')
  })

  it("should return Excellent Risk/Reward insight when analytics show high RR", async () => {
    const mockTrades = Array(5).fill(null).map((_, i) => ({
        id: `t${i}`, pnl: 100, instrument: "NQ", entryDate: new Date(), side: "LONG"
    }))
    tradeFindManyMock.mockResolvedValue(mockTrades as any)

    // Mock analytics with high RR (>2)
    const mockAnalytics = mockTrades.map(t => ({
        tradeId: t.id,
        efficiency: 50, // moderate
        riskRewardRatio: 3.5, // High
        mae: 10,
        mfe: 100
    }))
    tradeAnalyticsFindManyMock.mockResolvedValue(mockAnalytics as any)

    const insights = await getSmartInsights("user-1")

    const rrInsight = insights.find(i => i.id === 'good-rr')
    expect(rrInsight).toBeDefined()
    expect(rrInsight?.title).toBe('Excellent Risk/Reward')
  })
})

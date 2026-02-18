'use server'

import { computeVarSummary, type TraderVarSummary, type VarTradeLike } from "@/lib/analytics/var";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma";

export async function getTraderById(slug: string) {
  try {
    const trader = await prisma.user.findUnique({
      where: { id: slug },
      select: {
        id: true,
        email: true,
      },
    })
    return trader;
  } catch (error) {
    console.error('Error fetching trader:', error);
    return null;
  }
}

export type TraderVarSummaryResponse = {
  success: boolean
  summary?: TraderVarSummary
  sampleSize?: number
  methodMeta?: {
    horizonDays: number
    confidenceLevels: [0.95, 0.99]
    lookbackDays: number
    minSampleSize: number
    portfolioValue: number
  }
  error?: string
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (
    value !== null &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return ((value as { toNumber: () => number }).toNumber() ?? 0)
  }
  return 0
}

// Fetch aggregated daily pnl and commission for the last ~2 years
// to avoid fetching unlimited rows for VaR calculation
async function fetchAggregatedVaRData(traderId: string): Promise<VarTradeLike[]> {
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  // We use queryRaw to aggregate in DB
  const aggregated = await prisma.$queryRaw<Array<{ date: Date | string, pnl: unknown, commission: unknown }>>`
    SELECT
      "entryDate"::date as date,
      SUM("pnl") as pnl,
      SUM("commission") as commission
    FROM "Trade"
    WHERE "userId" = ${traderId}
      AND "entryDate" > ${twoYearsAgo}
    GROUP BY "entryDate"::date
    ORDER BY date DESC
    LIMIT 1000
  `

  return aggregated.map(row => ({
    entryDate: row.date,
    pnl: row.pnl,
    commission: row.commission
  })) as VarTradeLike[]
}

// Efficiently find min running pnl over entire history
async function fetchMinRunningPnl(traderId: string): Promise<number> {
  const result = await prisma.$queryRaw<Array<{ min_pnl: unknown }>>`
    SELECT MIN(running_pnl) as min_pnl
    FROM (
      SELECT SUM("pnl" - "commission") OVER (
        ORDER BY "entryDate", "id"
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) as running_pnl
      FROM "Trade"
      WHERE "userId" = ${traderId}
    ) t
  `
  return toNumber(result[0]?.min_pnl)
}

export async function getTraderVarSummary(traderId: string): Promise<TraderVarSummaryResponse> {
  try {
    const trader = await prisma.user.findUnique({
      where: { id: traderId },
      select: {
        id: true,
      },
    })

    if (!trader) {
      return { success: false, error: "Trader not found" }
    }

    const accounts = await prisma.account.findMany({
      where: { userId: traderId },
      select: {
        id: true,
        startingBalance: true,
      },
    })

    const accountPortfolioValue = accounts.reduce((sum, account) => {
      const value = toNumber(account.startingBalance)
      return value > 0 ? sum + value : sum
    }, 0)

    let portfolioValue = 0
    let varTrades: VarTradeLike[] = []

    if (accountPortfolioValue > 0) {
      portfolioValue = accountPortfolioValue
      varTrades = await fetchAggregatedVaRData(traderId)
    } else {
      const [aggregated, minPnl] = await Promise.all([
        fetchAggregatedVaRData(traderId),
        fetchMinRunningPnl(traderId)
      ])
      varTrades = aggregated
      portfolioValue = Math.max(1, Math.abs(minPnl) + 1)
    }

    const computed = computeVarSummary(varTrades, portfolioValue)

    if (computed.insufficientData || !computed.summary) {
      return {
        success: true,
        sampleSize: computed.sampleSize,
        methodMeta: {
          horizonDays: 1,
          confidenceLevels: [0.95, 0.99],
          lookbackDays: computed.lookbackDays,
          minSampleSize: computed.minSampleSize,
          portfolioValue,
        },
        error: "insufficientData",
      }
    }

    return {
      success: true,
      summary: computed.summary,
      sampleSize: computed.sampleSize,
      methodMeta: {
        horizonDays: 1,
        confidenceLevels: [0.95, 0.99],
        lookbackDays: computed.lookbackDays,
        minSampleSize: computed.minSampleSize,
        portfolioValue,
      },
    }
  } catch (error) {
    console.error("Error computing trader VaR:", error)
    return {
      success: false,
      error: "Failed to compute trader VaR",
    }
  }
}

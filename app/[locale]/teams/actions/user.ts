'use server'

import { computeVarSummary, type TraderVarSummary } from "@/lib/analytics/var";
import { prisma } from "@/lib/prisma";

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

function inferPortfolioValueFromTrades(trades: Array<{ pnl: unknown; commission: unknown }>): number {
  let runningPnl = 0
  let minimumPnl = 0

  for (const trade of trades) {
    runningPnl += toNumber(trade.pnl) - toNumber(trade.commission)
    if (runningPnl < minimumPnl) minimumPnl = runningPnl
  }

  return Math.max(1, Math.abs(minimumPnl) + 1)
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

    const [accounts, trades] = await Promise.all([
      prisma.account.findMany({
        where: { userId: traderId },
        select: {
          id: true,
          startingBalance: true,
        },
      }),
      prisma.trade.findMany({
        where: { userId: traderId },
        select: {
          pnl: true,
          commission: true,
          entryDate: true,
          closeDate: true,
          createdAt: true,
        },
      }),
    ])

    const accountPortfolioValue = accounts.reduce((sum, account) => {
      const value = toNumber(account.startingBalance)
      return value > 0 ? sum + value : sum
    }, 0)

    const portfolioValue = accountPortfolioValue > 0
      ? accountPortfolioValue
      : inferPortfolioValueFromTrades(trades)

    const computed = computeVarSummary(trades, portfolioValue)

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

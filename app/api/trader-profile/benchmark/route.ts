import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDatabaseUserId } from "@/server/auth"

interface UserAccumulator {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  grossWin: number
  grossLossAbs: number
  cumulativePnl: number
  runningPnL: number
  peakPnL: number
  maxDrawdown: number
}

interface UserMetrics {
  riskReward: number
  drawdown: number
  winRate: number
  avgReturn: number
}

function buildUserMetrics(acc: UserAccumulator): UserMetrics {
  const winRateBase = acc.winningTrades + acc.losingTrades
  const averageWin = acc.winningTrades > 0 ? acc.grossWin / acc.winningTrades : 0
  const averageLossAbs = acc.losingTrades > 0 ? acc.grossLossAbs / acc.losingTrades : 0

  return {
    riskReward: averageLossAbs > 0 ? averageWin / averageLossAbs : 0,
    drawdown: acc.maxDrawdown,
    winRate: winRateBase > 0 ? (acc.winningTrades / winRateBase) * 100 : 0,
    avgReturn: acc.totalTrades > 0 ? acc.cumulativePnl / acc.totalTrades : 0,
  }
}

export async function GET() {
  try {
    const currentUserId = await getDatabaseUserId()
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trades = await prisma.trade.findMany({
      select: {
        userId: true,
        pnl: true,
        commission: true,
        entryDate: true,
      },
      orderBy: [{ userId: "asc" }, { entryDate: "asc" }],
    })

    const users = new Map<string, UserAccumulator>()
    for (const trade of trades) {
      const pnl = Number(trade.pnl ?? 0)
      const commission = Number(trade.commission ?? 0)
      const netPnl = pnl - commission

      const acc = users.get(trade.userId) ?? {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        grossWin: 0,
        grossLossAbs: 0,
        cumulativePnl: 0,
        runningPnL: 0,
        peakPnL: 0,
        maxDrawdown: 0,
      }

      acc.totalTrades += 1
      acc.cumulativePnl += pnl
      acc.runningPnL += netPnl

      if (pnl > 0) {
        acc.winningTrades += 1
        acc.grossWin += pnl
      } else if (pnl < 0) {
        acc.losingTrades += 1
        acc.grossLossAbs += Math.abs(pnl)
      }

      if (acc.runningPnL > acc.peakPnL) {
        acc.peakPnL = acc.runningPnL
      }
      const drawdown = acc.peakPnL - acc.runningPnL
      if (drawdown > acc.maxDrawdown) {
        acc.maxDrawdown = drawdown
      }

      users.set(trade.userId, acc)
    }

    const perUserMetrics = Array.from(users.values())
      .filter((acc) => acc.totalTrades > 0)
      .map(buildUserMetrics)

    if (perUserMetrics.length === 0) {
      return NextResponse.json({
        benchmark: {
          riskReward: 0,
          drawdown: 0,
          winRate: 0,
          avgReturn: 0,
          sampleSize: 0,
        },
      })
    }

    const totals = perUserMetrics.reduce(
      (sum, user) => ({
        riskReward: sum.riskReward + user.riskReward,
        drawdown: sum.drawdown + user.drawdown,
        winRate: sum.winRate + user.winRate,
        avgReturn: sum.avgReturn + user.avgReturn,
      }),
      { riskReward: 0, drawdown: 0, winRate: 0, avgReturn: 0 },
    )

    const sampleSize = perUserMetrics.length

    return NextResponse.json({
      benchmark: {
        riskReward: Number((totals.riskReward / sampleSize).toFixed(2)),
        drawdown: Number((totals.drawdown / sampleSize).toFixed(2)),
        winRate: Number((totals.winRate / sampleSize).toFixed(2)),
        avgReturn: Number((totals.avgReturn / sampleSize).toFixed(2)),
        sampleSize,
      },
    })
  } catch (error) {
    console.error("[Trader Benchmark API] failed", error)
    return NextResponse.json({ error: "Failed to build benchmark" }, { status: 500 })
  }
}

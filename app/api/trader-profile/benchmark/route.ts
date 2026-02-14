import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDatabaseUserId } from "@/server/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface UserAggregate {
  totalTrades: number
  wins: number
  losses: number
  grossWin: number
  grossLossAbs: number
  cumulativePnl: number
  runningNet: number
  peakNet: number
  maxDrawdown: number
}

interface BenchmarkMetrics {
  riskReward: number
  drawdown: number
  winRate: number
  avgReturn: number
}

function toUserMetrics(value: UserAggregate): BenchmarkMetrics {
  const avgWin = value.wins > 0 ? value.grossWin / value.wins : 0
  const avgLossAbs = value.losses > 0 ? value.grossLossAbs / value.losses : 0
  const decisiveTrades = value.wins + value.losses

  return {
    riskReward: avgLossAbs > 0 ? avgWin / avgLossAbs : 0,
    drawdown: value.maxDrawdown,
    winRate: decisiveTrades > 0 ? (value.wins / decisiveTrades) * 100 : 0,
    avgReturn: value.totalTrades > 0 ? value.cumulativePnl / value.totalTrades : 0,
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

    const users = new Map<string, UserAggregate>()
    for (const trade of trades) {
      const pnl = Number(trade.pnl ?? 0)
      const commission = Number(trade.commission ?? 0)
      const net = pnl - commission

      const entry = users.get(trade.userId) ?? {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        grossWin: 0,
        grossLossAbs: 0,
        cumulativePnl: 0,
        runningNet: 0,
        peakNet: 0,
        maxDrawdown: 0,
      }

      entry.totalTrades += 1
      entry.cumulativePnl += pnl
      entry.runningNet += net

      if (pnl > 0) {
        entry.wins += 1
        entry.grossWin += pnl
      } else if (pnl < 0) {
        entry.losses += 1
        entry.grossLossAbs += Math.abs(pnl)
      }

      if (entry.runningNet > entry.peakNet) {
        entry.peakNet = entry.runningNet
      }
      const drawdown = entry.peakNet - entry.runningNet
      if (drawdown > entry.maxDrawdown) {
        entry.maxDrawdown = drawdown
      }

      users.set(trade.userId, entry)
    }

    const metrics = Array.from(users.values())
      .filter((user) => user.totalTrades > 0)
      .map(toUserMetrics)

    if (metrics.length === 0) {
      return NextResponse.json({
        benchmark: {
          riskReward: 0,
          drawdown: 0,
          winRate: 0,
          avgReturn: 0,
          sampleSize: 0,
        },
      }, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      })
    }

    const totals = metrics.reduce(
      (acc, metric) => ({
        riskReward: acc.riskReward + metric.riskReward,
        drawdown: acc.drawdown + metric.drawdown,
        winRate: acc.winRate + metric.winRate,
        avgReturn: acc.avgReturn + metric.avgReturn,
      }),
      { riskReward: 0, drawdown: 0, winRate: 0, avgReturn: 0 },
    )

    const sampleSize = metrics.length

    return NextResponse.json({
      benchmark: {
        riskReward: Number((totals.riskReward / sampleSize).toFixed(2)),
        drawdown: Number((totals.drawdown / sampleSize).toFixed(2)),
        winRate: Number((totals.winRate / sampleSize).toFixed(2)),
        avgReturn: Number((totals.avgReturn / sampleSize).toFixed(2)),
        sampleSize,
      },
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("[TraderBenchmarkAPI] failed", error)
    return NextResponse.json({ error: "Failed to build benchmark" }, { status: 500 })
  }
}

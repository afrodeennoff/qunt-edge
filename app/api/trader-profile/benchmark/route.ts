import { NextResponse } from "next/server"
import { Prisma } from "@/prisma/generated/prisma"
import { prisma } from "@/lib/prisma"
import { getDatabaseUserId } from "@/server/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const currentUserId = await getDatabaseUserId()
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const benchmarkRows = await prisma.$queryRaw<Array<{
      risk_reward: number | Prisma.Decimal | null
      drawdown: number | Prisma.Decimal | null
      win_rate: number | Prisma.Decimal | null
      avg_return: number | Prisma.Decimal | null
      sample_size: bigint | number
    }>>`
      WITH ordered_trades AS (
        SELECT
          "userId",
          "id",
          "entryDate",
          COALESCE("pnl", 0)::double precision AS pnl,
          COALESCE("commission", 0)::double precision AS commission
        FROM "Trade"
        WHERE "entryDate" >= NOW() - INTERVAL '365 days'
      ),
      running AS (
        SELECT
          "userId",
          "id",
          "entryDate",
          pnl,
          (pnl - commission) AS net,
          SUM(pnl - commission) OVER (
            PARTITION BY "userId"
            ORDER BY "entryDate", "id"
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) AS running_net
        FROM ordered_trades
      ),
      drawdown_points AS (
        SELECT
          "userId",
          pnl,
          running_net,
          MAX(running_net) OVER (
            PARTITION BY "userId"
            ORDER BY "entryDate", "id"
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) AS peak_net
        FROM running
      ),
      per_user AS (
        SELECT
          "userId",
          COUNT(*)::double precision AS total_trades,
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END)::double precision AS wins,
          SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END)::double precision AS losses,
          SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END)::double precision AS gross_win,
          SUM(CASE WHEN pnl < 0 THEN ABS(pnl) ELSE 0 END)::double precision AS gross_loss_abs,
          SUM(pnl)::double precision AS cumulative_pnl,
          MAX(peak_net - running_net)::double precision AS max_drawdown
        FROM drawdown_points
        GROUP BY "userId"
      ),
      per_user_metrics AS (
        SELECT
          CASE
            WHEN losses > 0 AND wins > 0 AND gross_loss_abs > 0
              THEN (gross_win / wins) / (gross_loss_abs / losses)
            ELSE 0
          END AS risk_reward,
          max_drawdown AS drawdown,
          CASE
            WHEN (wins + losses) > 0 THEN (wins / (wins + losses)) * 100
            ELSE 0
          END AS win_rate,
          CASE
            WHEN total_trades > 0 THEN cumulative_pnl / total_trades
            ELSE 0
          END AS avg_return
        FROM per_user
        WHERE total_trades > 0
      )
      SELECT
        COALESCE(AVG(risk_reward), 0)::double precision AS risk_reward,
        COALESCE(AVG(drawdown), 0)::double precision AS drawdown,
        COALESCE(AVG(win_rate), 0)::double precision AS win_rate,
        COALESCE(AVG(avg_return), 0)::double precision AS avg_return,
        COUNT(*)::bigint AS sample_size
      FROM per_user_metrics
    `

    const summary = benchmarkRows[0]
    const sampleSize = Number(summary?.sample_size ?? 0)

    if (sampleSize === 0) {
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

    return NextResponse.json({
      benchmark: {
        riskReward: Number(Number(summary?.risk_reward ?? 0).toFixed(2)),
        drawdown: Number(Number(summary?.drawdown ?? 0).toFixed(2)),
        winRate: Number(Number(summary?.win_rate ?? 0).toFixed(2)),
        avgReturn: Number(Number(summary?.avg_return ?? 0).toFixed(2)),
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

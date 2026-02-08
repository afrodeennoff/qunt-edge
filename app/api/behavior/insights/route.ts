import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDatabaseUserId } from "@/server/auth"
import { computeBehaviorInsights } from "@/lib/behavior-insights"

function sanitizePeriodDays(value: string | null): number {
  if (!value) return 30
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 30
  return Math.min(180, Math.max(7, Math.floor(parsed)))
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getDatabaseUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const periodDays = sanitizePeriodDays(request.nextUrl.searchParams.get("periodDays"))
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - periodDays)

    const [trades, moods] = await Promise.all([
      prisma.trade.findMany({
        where: {
          userId,
          entryDate: {
            gte: fromDate.toISOString(),
          },
        },
        orderBy: {
          entryDate: "asc",
        },
      }),
      prisma.mood.findMany({
        where: {
          userId,
          day: {
            gte: fromDate,
          },
        },
        orderBy: {
          day: "asc",
        },
      }),
    ])

    const insights = computeBehaviorInsights(trades, moods, periodDays)
    return NextResponse.json(insights)
  } catch (error) {
    console.error("[Behavior Insights API] Failed to build insights", error)
    return NextResponse.json(
      { error: "Failed to build behavior insights" },
      { status: 500 },
    )
  }
}

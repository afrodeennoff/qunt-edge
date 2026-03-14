import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-response"
import { getDatabaseUserId } from "@/server/auth"
import { computeBehaviorInsights } from "@/lib/behavior-insights"
import { getRedisJson, setRedisJson } from "@/lib/redis-cache"

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
      return apiError("UNAUTHORIZED", "Unauthorized", 401)
    }

    const periodDays = sanitizePeriodDays(request.nextUrl.searchParams.get("periodDays"))
    const cacheKey = `user:${userId}:period:${periodDays}`
    const cached = await getRedisJson<ReturnType<typeof computeBehaviorInsights>>("behavior-insights", cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

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
        select: {
          entryDate: true,
          pnl: true,
          commission: true,
          quantity: true,
          comment: true,
          tags: true,
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
        select: {
          day: true,
          emotionValue: true,
        },
      }),
    ])

    const insights = computeBehaviorInsights(trades, moods, periodDays)
    await setRedisJson("behavior-insights", cacheKey, insights, 60)
    return NextResponse.json(insights)
  } catch (error) {
    console.error("[Behavior Insights API] Failed to build insights", error)
    return apiError("INTERNAL_ERROR", "Failed to build behavior insights", 500)
  }
}

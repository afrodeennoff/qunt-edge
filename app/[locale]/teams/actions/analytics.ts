'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/server/auth'

type TeamTrade = {
  userId: string
  pnl: number
  commission: number
  entryDate: Date
  createdAt: Date
}

const toDateKey = (date: Date) => date.toISOString().slice(0, 10)

export async function getTeamAnalyticsDataAction(teamId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      throw new Error('Unauthorized')
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        userId: true,
        traderIds: true,
        managers: {
          select: { managerId: true },
        },
        analytics: {
          where: { period: 'monthly' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!team) {
      throw new Error('Team not found')
    }

    const hasAccess =
      team.userId === user.id ||
      team.traderIds.includes(user.id) ||
      team.managers.some((manager) => manager.managerId === user.id)

    if (!hasAccess) {
      throw new Error('Unauthorized')
    }

    if (team.traderIds.length === 0) {
      return {
        success: true,
        data: {
          analytics: { winRate: 0, totalTrades: 0, profitFactor: 0, totalPnl: 0 },
          membersPerformance: [],
          chartData: [],
        },
      }
    }

    const [users, trades] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: team.traderIds } },
        select: { id: true, email: true },
      }),
      prisma.trade.findMany({
        where: { userId: { in: team.traderIds } },
        select: {
          userId: true,
          pnl: true,
          commission: true,
          entryDate: true,
          createdAt: true,
        },
      }),
    ])

    const userEmailMap = new Map(users.map((u) => [u.id, u.email || 'Unknown']))
    const groupedByUser = new Map<string, TeamTrade[]>()

    for (const trade of trades) {
      const normalized: TeamTrade = {
        userId: trade.userId,
        pnl: Number(trade.pnl) - Number(trade.commission ?? 0),
        commission: Number(trade.commission ?? 0),
        entryDate: trade.entryDate,
        createdAt: trade.createdAt,
      }
      const existing = groupedByUser.get(trade.userId) ?? []
      existing.push(normalized)
      groupedByUser.set(trade.userId, existing)
    }

    let grossProfit = 0
    let grossLoss = 0
    let totalWins = 0
    let totalTrades = 0

    const dailyPnLMap: Record<string, number> = {}

    for (const trade of trades) {
      const pnl = Number(trade.pnl) - Number(trade.commission ?? 0)
      totalTrades += 1
      if (pnl > 0) {
        grossProfit += pnl
        totalWins += 1
      } else if (pnl < 0) {
        grossLoss += Math.abs(pnl)
      }

      const key = toDateKey(trade.entryDate ?? trade.createdAt)
      dailyPnLMap[key] = (dailyPnLMap[key] ?? 0) + pnl
    }

    const membersPerformance = team.traderIds.map((userId) => {
      const userTrades = groupedByUser.get(userId) ?? []
      const userWins = userTrades.filter((trade) => trade.pnl > 0).length
      const userTotalPnL = userTrades.reduce((sum, trade) => sum + trade.pnl, 0)
      const userTotalTrades = userTrades.length
      const userWinRate = userTotalTrades > 0 ? (userWins / userTotalTrades) * 100 : 0

      return {
        userId,
        email: userEmailMap.get(userId) || 'Unknown',
        totalPnL: userTotalPnL,
        totalTrades: userTotalTrades,
        winRate: userWinRate,
      }
    }).sort((a, b) => b.totalPnL - a.totalPnL)

    const dates = Object.keys(dailyPnLMap).sort()
    let cumulativePnL = 0
    const chartData = dates.map((date) => {
      cumulativePnL += dailyPnLMap[date]
      return {
        date,
        dailyPnL: dailyPnLMap[date],
        cumulativePnL,
      }
    })

    const persistedAnalytics = team.analytics[0]
    const calculatedTotalPnL = membersPerformance.reduce((sum, member) => sum + member.totalPnL, 0)
    const calculatedWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0
    const calculatedProfitFactor = grossLoss === 0 ? (grossProfit > 0 ? grossProfit : 0) : grossProfit / grossLoss

    return {
      success: true,
      data: {
        analytics: {
          ...persistedAnalytics,
          totalTrades: totalTrades || Number(persistedAnalytics?.totalTrades ?? 0),
          winRate: totalTrades > 0 ? calculatedWinRate : Number(persistedAnalytics?.winRate ?? 0),
          totalPnl: calculatedTotalPnL,
          profitFactor: calculatedProfitFactor,
        },
        membersPerformance,
        chartData,
      },
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return { success: false, error: 'Failed to fetch analytics' }
  }
}

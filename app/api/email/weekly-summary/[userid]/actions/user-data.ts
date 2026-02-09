'use server'

import { prisma } from "@/lib/prisma"
import { addMoney, netPnl, toMoneyNumber } from "@/lib/financial-math"

interface UserData {
  user: {
    id: string
    email: string
    language: string
  }
  newsletter: {
    email: string
    firstName: string | null
    isActive: boolean
  }
  trades: {
    id: string
    pnl: number
    commission: number
    entryDate: string
  }[]
}

interface ComputedStats {
  winLossStats: {
    wins: number
    losses: number
  }
  dailyPnL: {
    date: Date
    pnl: number
    weekday: number
  }[]
  thisWeekPnL: number
  profitableDays: number
  totalDays: number
}

export async function getUserData(userId: string): Promise<UserData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const newsletter = await prisma.newsletter.findUnique({
    where: { email: user.email },
  })

  if (!newsletter || !newsletter.isActive) {
    throw new Error(`Newsletter subscription not found or inactive for email: ${user.email}`)
  }

  const trades = await prisma.trade.findMany({
    where: {
      userId: user.id,
    },
  })

  // Keep the last 14 days of trades to ensure we have two full weeks
  const last14DaysTrades = trades.filter((trade) => {
    const tradeDate = new Date(trade.entryDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - tradeDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 14
  })
  
  return {
    user: {
      id: user.id,
      email: user.email,
      language: user.language
    },
    newsletter: {
      email: newsletter.email,
      firstName: newsletter.firstName,
      isActive: newsletter.isActive
    },
    trades: last14DaysTrades
  }
}

export async function computeTradingStats(
  trades: UserData['trades'],
  language: string
): Promise<ComputedStats> {
  if (trades.length === 0) {
    return {
      winLossStats: { wins: 0, losses: 0 },
      dailyPnL: [],
      thisWeekPnL: 0,
      profitableDays: 0,
      totalDays: 0
    }
  }

  const winLossStats = trades.reduce((acc, trade) => {
    if (netPnl(trade.pnl, trade.commission).gt(0)) {
      acc.wins++
    } else {
      acc.losses++
    }
    return acc
  }, { wins: 0, losses: 0 })

  const dailyPnLMap = trades.reduce((acc, trade) => {
    const tradeDate = new Date(trade.entryDate)
    const dateKey = tradeDate.toISOString().slice(0, 10)
    const weekdayRaw = tradeDate.getUTCDay()
    const weekday = weekdayRaw === 0 ? 6 : weekdayRaw - 1
    const current = acc.get(dateKey) || 0
    const updated = addMoney(current, netPnl(trade.pnl, trade.commission))
    acc.set(dateKey, toMoneyNumber(updated))
    return acc
  }, new Map<string, number>())

  const dailyPnL = Array.from(dailyPnLMap.entries()).map(([dateKey, pnl]) => {
    const date = new Date(`${dateKey}T00:00:00.000Z`)
    const weekdayRaw = date.getUTCDay()
    return {
      date,
      pnl: toMoneyNumber(pnl),
      weekday: weekdayRaw === 0 ? 6 : weekdayRaw - 1,
    }
  })

  // Sort by date
  dailyPnL.sort((a, b) => a.date.getTime() - b.date.getTime())

  const thisWeekPnL = dailyPnL.reduce((sum, day) => sum + day.pnl, 0)
  const profitableDays = dailyPnL.filter(day => day.pnl > 0).length
  const totalDays = dailyPnL.length

  
  return {
    winLossStats,
    dailyPnL,
    thisWeekPnL,
    profitableDays,
    totalDays
  }
} 

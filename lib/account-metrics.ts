// Shared, environment-agnostic account metrics utilities
// These functions can be used on both server and client for consistent results.
import { Prisma } from '@/prisma/generated/prisma'
import type { Account, Trade } from '@/lib/data-types'
import Decimal from 'decimal.js'

export type AccountMetrics = {
  // Balance and progress
  currentBalance: number
  remainingToTarget: number
  progress: number
  isConfigured: boolean

  // Drawdown metrics
  drawdownProgress: number
  remainingLoss: number
  highestBalance: number
  drawdownLevel: number

  // Consistency metrics
  totalProfit: number
  maxAllowedDailyProfit: number | null
  highestProfitDay: number
  isConsistent: boolean
  hasProfitableData: boolean
  dailyPnL: { [date: string]: number }
  totalProfitableDays: number

  // Trading days metrics
  totalTradingDays: number
  validTradingDays: number
}

export type DailyMetric = {
  date: Date
  pnl: number
  totalBalance: number
  percentageOfTarget: number
  isConsistent: boolean
  payout?: {
    id?: string
    amount: number
    date: Date
    status: string
  }
}

function toDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null
  const dt = d instanceof Date ? d : new Date(d)
  return isNaN(dt.getTime()) ? null : dt
}

export function computeAccountMetrics(
  account: Account,
  allTrades: Trade[]
): { balanceToDate: number; metrics: NonNullable<Account['metrics']>; dailyMetrics: NonNullable<Account['dailyMetrics']>; trades: Trade[]; aboveBuffer: number } {
  const resetDate = toDate(account.resetDate)
  const relevantTrades = allTrades.filter(t => {
    if (t.accountNumber !== account.number) return false
    const entryDate = toDate(t.entryDate)
    if (!entryDate) return false
    return !resetDate || entryDate >= resetDate
  })

  const sortedTrades = [...relevantTrades].sort((a, b) => {
    return (toDate(a.entryDate)!.getTime()) - (toDate(b.entryDate)!.getTime())
  })

  // Apply buffer filtering if enabled (default to true)
  const considerBuffer = account.considerBuffer ?? true
  let filteredTrades = sortedTrades
  let aboveBuffer = 0
  if (considerBuffer && (account.buffer ?? 0) > 0) {
    // Build time-ordered event stream of trades and payouts (paid/validated)
    const validPayouts = (account.payouts || [])
      .filter(p => ['PAID', 'VALIDATED'].includes(p.status))
      .map(p => ({ date: toDate(p.date)!, amount: p.amount }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    type Event =
      | { kind: 'trade'; date: Date; pnl: number; trade: Trade }
      | { kind: 'payout'; date: Date; amount: number }

    const tradeEvents: Event[] = sortedTrades.map(tr => ({
      kind: 'trade',
      date: (tr.entryDate as Date),
      pnl: new Prisma.Decimal(tr.pnl).minus(new Prisma.Decimal(tr.commission || 0)).toNumber(),
      trade: tr,
    }))
    const payoutEvents: Event[] = validPayouts.map(p => ({
      kind: 'payout',
      date: p.date,
      amount: new Prisma.Decimal(p.amount).toNumber(),
    }))
    const events: Event[] = [...tradeEvents, ...payoutEvents].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )

    const out: Trade[] = []
    let accProfit = new Prisma.Decimal(0) // accumulated profit since last baseline
    const threshold = new Prisma.Decimal(account.buffer || 0)

    for (const ev of events) {
      if (ev.kind === 'payout') {
        accProfit = accProfit.minus(ev.amount)
        continue
      }

      const next = accProfit.plus(ev.pnl)
      const wasAbove = accProfit.gte(threshold)
      const crossesNow = accProfit.lt(threshold) && next.gte(threshold)
      if (wasAbove || crossesNow) {
        out.push(ev.trade)
      }
      accProfit = next
    }

    filteredTrades = out
    aboveBuffer = Decimal.max(0, accProfit.minus(threshold)).toNumber()
  }

  const dailyPnL: { [date: string]: number } = {}
  let totalProfit = new Prisma.Decimal(0)
  for (const trade of filteredTrades) {
    const d = (trade.entryDate as Date)
    const key = d.toISOString().split('T')[0]
    const pnl = new Prisma.Decimal(trade.pnl).minus(new Prisma.Decimal(trade.commission || 0))
    dailyPnL[key] = new Prisma.Decimal(dailyPnL[key] || 0).plus(pnl).toNumber()
    totalProfit = totalProfit.plus(pnl)
  }

  const hasProfitableData = totalProfit.gt(0)
  const isConfigured = (account.profitTarget ?? 0) > 0 || (account.drawdownThreshold ?? 0) > 0
  const highestProfitDay = Object.values(dailyPnL).length > 0 ? Math.max(...Object.values(dailyPnL)) : 0

  let maxAllowedDailyProfit: number | null = null
  let isConsistent = false
  if (hasProfitableData && isConfigured && (account.consistencyPercentage ?? 0) > 0) {
    const target = new Prisma.Decimal(account.profitTarget ?? 0)
    const baseAmount = totalProfit.lte(target) ? target : totalProfit
    maxAllowedDailyProfit = baseAmount.times(new Prisma.Decimal(account.consistencyPercentage ?? 0).div(100)).toNumber()
    isConsistent = highestProfitDay <= (maxAllowedDailyProfit || 0)
  }

  const validPayouts = (account.payouts || []).filter(p => ['PAID', 'VALIDATED'].includes(p.status))
  let runningBalance = new Prisma.Decimal(account.startingBalance || 0)
  let highestBalance = new Prisma.Decimal(account.startingBalance || 0)

  for (const trade of filteredTrades) {
    const pnl = new Prisma.Decimal(trade.pnl).minus(new Prisma.Decimal(trade.commission || 0))
    runningBalance = runningBalance.plus(pnl)
    if (runningBalance.gt(highestBalance)) highestBalance = runningBalance
  }
  const totalPayouts = validPayouts.reduce((s, p) => s.plus(new Prisma.Decimal(p.amount)), new Prisma.Decimal(0))
  const currentBalance = runningBalance.minus(totalPayouts)

  let drawdownLevel: Prisma.Decimal
  if (account.trailingDrawdown) {
    const profitMade = Decimal.max(0, highestBalance.minus(account.startingBalance || 0))
    if (account.trailingStopProfit && profitMade.gte(new Prisma.Decimal(account.trailingStopProfit))) {
      drawdownLevel = new Prisma.Decimal(account.startingBalance || 0).plus(account.trailingStopProfit).minus(account.drawdownThreshold || 0)
    } else {
      drawdownLevel = highestBalance.minus(account.drawdownThreshold || 0)
    }
  } else {
    drawdownLevel = new Prisma.Decimal(account.startingBalance || 0).minus(account.drawdownThreshold || 0)
  }
  const remainingLoss = Decimal.max(0, currentBalance.minus(drawdownLevel))
  const dd = new Prisma.Decimal(account.drawdownThreshold || 0)
  const drawdownProgress = dd.gt(0) ? dd.minus(remainingLoss).div(dd).times(100).toNumber() : 0

  const currentProfit = currentBalance.minus(account.startingBalance || 0)
  const pt = new Prisma.Decimal(account.profitTarget || 0)
  const progress = pt.gt(0) ? currentProfit.div(pt).times(100).toNumber() : 0
  const remainingToTarget = pt.gt(0) ? Decimal.max(0, pt.minus(currentProfit)).toNumber() : 0

  // Trading days metrics
  const dailyTrades: { [date: string]: Trade[] } = {}
  for (const trade of filteredTrades) {
    const key = toDate(trade.entryDate)!.toISOString().split('T')[0]
    if (!dailyTrades[key]) dailyTrades[key] = []
    dailyTrades[key].push(trade)
  }
  const totalTradingDays = Object.keys(dailyTrades).length
  const validTradingDays = Object.entries(dailyTrades).filter(([_, dayTrades]) => {
    const dayPnL = dayTrades.reduce((sum, t) => sum.plus(new Prisma.Decimal(t.pnl).minus(new Prisma.Decimal(t.commission || 0))), new Prisma.Decimal(0))
    return dayPnL.gte(new Prisma.Decimal(account.minPnlToCountAsDay || 0))
  }).length

  // Daily metrics (merge trade and payout dates)
  const allDates = new Set<string>()
  filteredTrades.forEach(t => allDates.add(toDate(t.entryDate)!.toISOString().split('T')[0]))
    ; (account.payouts || []).forEach(p => allDates.add(toDate(p.date)!.toISOString().split('T')[0]))

  let dailyRunningBalance = new Prisma.Decimal(account.startingBalance || 0)
  const dailyMetrics: NonNullable<Account['dailyMetrics']> = Array.from(allDates)
    .sort()
    .map(date => {
      const dailyTradesPnL = new Prisma.Decimal(dailyPnL[date] || 0)
      dailyRunningBalance = dailyRunningBalance.plus(dailyTradesPnL)

      const dayConsistent = totalProfit.lte(0)
        ? true
        : dailyTradesPnL.lte(totalProfit.times(new Prisma.Decimal(account.consistencyPercentage || 30).div(100)))

      const payout = (account.payouts || []).find(p => toDate(p.date)!.toISOString().split('T')[0] === date)
      if (payout?.status === 'PAID') {
        dailyRunningBalance = dailyRunningBalance.minus(new Prisma.Decimal(payout.amount))
      }

      return {
        date: new Date(date),
        pnl: dailyTradesPnL.toNumber(),
        totalBalance: dailyRunningBalance.toNumber(),
        percentageOfTarget: pt.gt(0) ? totalProfit.div(pt).times(100).toNumber() : 0,
        isConsistent: dayConsistent,
        payout: payout ? {
          id: payout.id,
          amount: new Prisma.Decimal(payout.amount).toNumber(),
          date: toDate(payout.date)!,
          status: payout.status
        } : undefined
      }
    }) as NonNullable<Account['dailyMetrics']>

  return {
    balanceToDate: currentBalance.toNumber(),
    metrics: {
      currentBalance: currentBalance.toNumber(),
      remainingToTarget,
      progress,
      isConfigured,
      drawdownProgress,
      remainingLoss: remainingLoss.toNumber(),
      highestBalance: highestBalance.toNumber(),
      drawdownLevel: drawdownLevel.toNumber(),
      totalProfit: totalProfit.toNumber(),
      maxAllowedDailyProfit,
      highestProfitDay,
      isConsistent,
      hasProfitableData,
      dailyPnL,
      totalProfitableDays: Object.values(dailyPnL).filter(pnl => pnl > 0).length,
      totalTradingDays,
      validTradingDays,
    } as NonNullable<Account['metrics']>,
    dailyMetrics,
    trades: filteredTrades,
    aboveBuffer
  }
}

export function computeMetricsForAccounts(
  accounts: Account[],
  trades: Trade[]
): Account[] {
  return accounts.map(acc => {
    const computed = computeAccountMetrics(acc, trades)
    return {
      ...acc,
      balanceToDate: computed.balanceToDate,
      metrics: computed.metrics,
      dailyMetrics: computed.dailyMetrics,
      trades: computed.trades,
      aboveBuffer: computed.aboveBuffer,
    }
  })
}

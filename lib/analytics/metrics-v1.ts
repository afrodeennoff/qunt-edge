import { differenceInDays, startOfDay } from 'date-fns'
import { addMoney, netPnl, toDecimal, toMoneyNumber, type DecimalLike } from '@/lib/financial-math'
import { ANALYTICS_METRIC_VERSION } from '@/lib/analytics/metric-definitions'
import { safeDivide } from '@/lib/utils'

export interface RiskMetricsV1 {
  metricVersion: typeof ANALYTICS_METRIC_VERSION
  winRate: number
  expectancy: number
  kellyFull: number
  kellyHalf: number
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  maxDrawdown: number
  maxDrawdownPercent: number
  realizedPnl: number
  unrealizedPnl: number
  winningStreak: number
  losingStreak: number
}

export type RiskTradeLike = {
  entryDate: Date | string
  pnl?: DecimalLike
  commission?: DecimalLike
}

function streaksFromTrades(sortedTrades: RiskTradeLike[]): { winningStreak: number; losingStreak: number } {
  let currentWin = 0
  let currentLoss = 0
  let maxWin = 0
  let maxLoss = 0

  for (const trade of sortedTrades) {
    const net = netPnl(trade.pnl ?? 0, trade.commission ?? 0).toNumber()
    if (net > 0) {
      currentWin += 1
      currentLoss = 0
      maxWin = Math.max(maxWin, currentWin)
      continue
    }
    if (net < 0) {
      currentLoss += 1
      currentWin = 0
      maxLoss = Math.max(maxLoss, currentLoss)
      continue
    }
    currentWin = 0
    currentLoss = 0
  }

  return { winningStreak: maxWin, losingStreak: maxLoss }
}

export function calculateRiskMetricsV1(trades: RiskTradeLike[]): RiskMetricsV1 {
  if (!trades || trades.length === 0) {
    return {
      metricVersion: ANALYTICS_METRIC_VERSION,
      winRate: 0,
      expectancy: 0,
      kellyFull: 0,
      kellyHalf: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      realizedPnl: 0,
      unrealizedPnl: 0,
      winningStreak: 0,
      losingStreak: 0,
    }
  }

  const netTrades = trades.map((t) => netPnl(t.pnl ?? 0, t.commission ?? 0))
  const wins = netTrades.filter((v) => v.gt(0))
  const losses = netTrades.filter((v) => v.lte(0))
  const winRate = safeDivide(wins.length, trades.length)
  const lossRate = safeDivide(losses.length, trades.length)

  const grossWin = wins.reduce((acc, v) => addMoney(acc, v), toDecimal(0))
  const grossLoss = losses.reduce((acc, v) => addMoney(acc, v.abs()), toDecimal(0))
  const avgWin = safeDivide(grossWin.toNumber(), wins.length)
  const avgLoss = safeDivide(grossLoss.toNumber(), losses.length)
  const expectancy = (avgWin * winRate) - (avgLoss * lossRate)

  const b = avgLoss > 0 ? avgWin / avgLoss : 0
  const kellyFull = b > 0 ? winRate - ((1 - winRate) / b) : 0
  const kellyHalf = kellyFull * 0.5

  const dailyPnLs = new Map<string, number>()
  for (const trade of trades) {
    const dateKey = startOfDay(new Date(trade.entryDate)).toISOString()
    const prev = dailyPnLs.get(dateKey) || 0
    dailyPnLs.set(dateKey, toMoneyNumber(addMoney(prev, netPnl(trade.pnl ?? 0, trade.commission ?? 0)), 8))
  }

  const dailyReturns = Array.from(dailyPnLs.values())
  const meanDailyReturn = safeDivide(dailyReturns.reduce((sum, val) => sum + val, 0), dailyReturns.length)
  const variance = safeDivide(
    dailyReturns.reduce((sum, val) => sum + Math.pow(val - meanDailyReturn, 2), 0),
    dailyReturns.length
  )
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? (meanDailyReturn / stdDev) * Math.sqrt(252) : 0

  const downsideReturns = dailyReturns.filter((r) => r < 0)
  const downsideVariance = safeDivide(
    downsideReturns.reduce((sum, val) => sum + Math.pow(val, 2), 0),
    dailyReturns.length
  )
  const downsideDev = Math.sqrt(downsideVariance)
  const sortinoRatio = downsideDev > 0 ? (meanDailyReturn / downsideDev) * Math.sqrt(252) : 0

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  let peak = toDecimal(0)
  let maxDrawdown = toDecimal(0)
  let runningPnl = toDecimal(0)

  for (const trade of sortedTrades) {
    runningPnl = addMoney(runningPnl, netPnl(trade.pnl ?? 0, trade.commission ?? 0))
    if (runningPnl.gt(peak)) peak = runningPnl
    const drawdown = peak.minus(runningPnl)
    if (drawdown.gt(maxDrawdown)) maxDrawdown = drawdown
  }

  const totalReturn = runningPnl.toNumber()
  const durationInDays = differenceInDays(
    new Date(sortedTrades[sortedTrades.length - 1].entryDate),
    new Date(sortedTrades[0].entryDate)
  ) + 1
  const years = durationInDays / 365.25
  const annualizedReturn = years > 0 ? totalReturn / years : totalReturn
  const maxDrawdownNumber = maxDrawdown.toNumber()
  const calmarRatio = maxDrawdownNumber > 0 ? annualizedReturn / maxDrawdownNumber : 0

  const realizedPnl = toMoneyNumber(
    netTrades.reduce((acc, v) => addMoney(acc, v), toDecimal(0)),
    8
  )
  const unrealizedPnl = 0
  const { winningStreak, losingStreak } = streaksFromTrades(sortedTrades)

  return {
    metricVersion: ANALYTICS_METRIC_VERSION,
    winRate,
    expectancy,
    kellyFull,
    kellyHalf,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    maxDrawdown: maxDrawdownNumber,
    maxDrawdownPercent: 0,
    realizedPnl,
    unrealizedPnl,
    winningStreak,
    losingStreak,
  }
}

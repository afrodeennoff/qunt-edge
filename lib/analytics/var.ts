type NumericLike = number | string | null | undefined | { toNumber?: () => number }

export type VarConfidence = 0.95 | 0.99
export type VarMethod = "historical" | "parametric"

export type VarPoint = {
  amount: number
  percent: number
}

export type TraderVarSummary = {
  hist95: VarPoint
  hist99: VarPoint
  param95: VarPoint
  param99: VarPoint
}

export type VarTradeLike = {
  entryDate?: Date | string | null
  closeDate?: Date | string | null
  createdAt?: Date | string | null
  pnl?: NumericLike
  commission?: NumericLike
}

export type BuildDailyReturnsResult = {
  dailyReturns: number[]
  portfolioValue: number
}

export type ComputeVarSummaryResult = {
  summary: TraderVarSummary | null
  insufficientData: boolean
  sampleSize: number
  lookbackDays: number
  minSampleSize: number
}

const LOOKBACK_DAYS = 252
const MIN_SAMPLE_SIZE = 30
const Z_SCORES: Record<VarConfidence, number> = {
  0.95: 1.6448536269514722,
  0.99: 2.3263478740408408,
}

function toNumber(value: NumericLike): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (value && typeof value === "object" && typeof value.toNumber === "function") {
    const parsed = value.toNumber()
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function toDateKey(trade: VarTradeLike): string | null {
  const dateCandidate = trade.entryDate ?? trade.closeDate ?? trade.createdAt
  if (!dateCandidate) return null
  const date = new Date(dateCandidate)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function inferPortfolioValueFromTrades(trades: VarTradeLike[]): number {
  let running = 0
  let minRunning = 0
  for (const trade of trades) {
    running += toNumber(trade.pnl) - toNumber(trade.commission)
    if (running < minRunning) minRunning = running
  }

  return Math.max(1, Math.abs(minRunning) + 1)
}

function round(value: number, precision: number = 8): number {
  return Number(value.toFixed(precision))
}

export function computeHistoricalVar(dailyReturns: number[], confidence: VarConfidence): number {
  if (dailyReturns.length === 0) return 0
  const sorted = [...dailyReturns].sort((a, b) => a - b)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((1 - confidence) * sorted.length))
  )
  return Math.max(0, -sorted[index])
}

export function computeParametricVar(dailyReturns: number[], confidence: VarConfidence): number {
  if (dailyReturns.length === 0) return 0
  const mean = dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / dailyReturns.length
  const stdDev = Math.sqrt(variance)
  const z = Z_SCORES[confidence]
  return Math.max(0, (z * stdDev) - mean)
}

export function buildDailyReturnsFromTrades(
  trades: VarTradeLike[],
  explicitPortfolioValue?: number
): BuildDailyReturnsResult {
  const dailyPnl = new Map<string, number>()

  for (const trade of trades) {
    const key = toDateKey(trade)
    if (!key) continue
    const net = toNumber(trade.pnl) - toNumber(trade.commission)
    dailyPnl.set(key, (dailyPnl.get(key) ?? 0) + net)
  }

  const orderedDailyNet = Array.from(dailyPnl.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-LOOKBACK_DAYS)
    .map(([, net]) => net)

  const portfolioValue = explicitPortfolioValue && explicitPortfolioValue > 0
    ? explicitPortfolioValue
    : inferPortfolioValueFromTrades(trades)

  const safePortfolio = Math.max(1, portfolioValue)
  const dailyReturns = orderedDailyNet.map((net) => round(net / safePortfolio))

  return {
    dailyReturns,
    portfolioValue: round(safePortfolio, 2),
  }
}

export function computeVarSummary(
  trades: VarTradeLike[],
  portfolioValue?: number
): ComputeVarSummaryResult {
  const { dailyReturns, portfolioValue: resolvedPortfolioValue } = buildDailyReturnsFromTrades(
    trades,
    portfolioValue
  )

  if (dailyReturns.length < MIN_SAMPLE_SIZE) {
    return {
      summary: null,
      insufficientData: true,
      sampleSize: dailyReturns.length,
      lookbackDays: LOOKBACK_DAYS,
      minSampleSize: MIN_SAMPLE_SIZE,
    }
  }

  const hist95 = computeHistoricalVar(dailyReturns, 0.95)
  const hist99 = computeHistoricalVar(dailyReturns, 0.99)
  const param95 = computeParametricVar(dailyReturns, 0.95)
  const param99 = computeParametricVar(dailyReturns, 0.99)

  const toVarPoint = (percent: number): VarPoint => ({
    percent: round(percent, 6),
    amount: round(percent * resolvedPortfolioValue, 2),
  })

  return {
    summary: {
      hist95: toVarPoint(hist95),
      hist99: toVarPoint(hist99),
      param95: toVarPoint(param95),
      param99: toVarPoint(param99),
    },
    insufficientData: false,
    sampleSize: dailyReturns.length,
    lookbackDays: LOOKBACK_DAYS,
    minSampleSize: MIN_SAMPLE_SIZE,
  }
}


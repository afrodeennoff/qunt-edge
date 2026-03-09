import { Mood, Trade } from "@/prisma/generated/prisma"

export interface BehaviorInsights {
  periodDays: number
  generatedAt: string
  summary: {
    tradeCount: number
    moodEntries: number
    tradingDays: number
    netPnL: number
    winRate: number
    averageEmotion: number
    stressScore: number
    emotionalRiskPercent: number
    confidenceScore: number
    confidenceBand: "low" | "medium" | "high"
    disciplineStreakDays: number
    overtradingDays: number
    lossChasingEvents: number
    impulsiveTradeCount: number
    highVolatilityTradeCount: number
  }
  modules: {
    checkInRate: number
    reflectionCompletionRate: number
    riskAlignmentScore: number
  }
  achievements: {
    steadyHand: boolean
    emotionalMaster: boolean
    controlStreak: boolean
  }
  drivers: Array<{
    key: "impulsiveRate" | "overtradeDayRate" | "lossChasingRate" | "lowMoodRate"
    contribution: number
    explanation: string
  }>
  prompts: {
    mindful: string
    postTradeReview: string
    riskGuard: string
  }
  recommendations: string[]
  recommendationsDetailed: Array<{
    text: string
    priority: "low" | "medium" | "high"
    basedOn: string[]
  }>
}

type TradeWithParsedDate = Trade & {
  parsedEntryDate: Date
  netPnL: number
  isImpulsive: boolean
  isHighVolatility: boolean
}

const IMPULSIVE_PATTERN = /(revenge|fomo|panic|impulse|emotional|tilt|chase|overtrade)/i
const VOLATILITY_PATTERN = /(volatil|news|nfp|fomc|cpi)/i

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function confidenceBandFromScore(score: number): "low" | "medium" | "high" {
  if (score >= 75) return "high"
  if (score >= 45) return "medium"
  return "low"
}

function toPercent(part: number, total: number): number {
  if (total <= 0) return 0
  return round((part / total) * 100)
}

function parseDateSafe(raw: string | Date): Date | null {
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getStdDev(values: number[]): number {
  if (!values.length) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function buildMindfulPrompt(stressScore: number, emotionalRiskPercent: number): string {
  if (stressScore >= 70 || emotionalRiskPercent >= 35) {
    return "High stress detected: pause for 60 seconds and confirm this trade matches your plan, size, and invalidation."
  }
  if (stressScore >= 45 || emotionalRiskPercent >= 20) {
    return "Before executing, take one breath and confirm: setup quality, risk size, and stop placement."
  }
  return "Execution looks stable. Keep validating each entry against your predefined setup rules."
}

function buildPostTradePrompt(lossChasingEvents: number): string {
  if (lossChasingEvents > 0) {
    return "Review this trade: was it influenced by a previous loss, urgency to recover, or social/news pressure?"
  }
  return "Capture your state-of-mind, confidence level, and whether this trade matched your plan."
}

function buildRiskGuard(overtradingDays: number, impulsiveTradeCount: number): string {
  if (overtradingDays > 3 || impulsiveTradeCount > 5) {
    return "Set a temporary execution guard: max trades/day and mandatory pause after two consecutive losses."
  }
  return "Keep your current risk profile and continue monitoring for drift in trade frequency and size."
}

export function computeBehaviorInsights(
  tradesInput: Trade[],
  moodsInput: Mood[],
  periodDays: number,
): BehaviorInsights {
  const now = new Date()
  const fromDate = new Date(now)
  fromDate.setDate(fromDate.getDate() - periodDays)

  const periodTrades = tradesInput
    .map((trade) => {
      const parsedDate = parseDateSafe(trade.entryDate)
      if (!parsedDate || parsedDate < fromDate || parsedDate > now) return null

      const textBlob = `${trade.comment ?? ""} ${(trade.tags ?? []).join(" ")}`
      const isImpulsive = IMPULSIVE_PATTERN.test(textBlob)
      const isHighVolatility = VOLATILITY_PATTERN.test(textBlob)
      return {
        ...trade,
        parsedEntryDate: parsedDate,
        netPnL: Number(trade.pnl) - Number(trade.commission || 0),
        isImpulsive,
        isHighVolatility,
      } satisfies TradeWithParsedDate
    })
    .filter((t): t is TradeWithParsedDate => t !== null)
    .sort((a, b) => a.parsedEntryDate.getTime() - b.parsedEntryDate.getTime())

  const periodMoods = moodsInput.filter((mood) => mood.day >= fromDate && mood.day <= now)

  const tradeCount = periodTrades.length
  const moodEntries = periodMoods.length

  const dailyStats = new Map<string, { count: number; net: number; impulsive: number }>()
  let netPnL = 0
  let winCount = 0
  let impulsiveTradeCount = 0
  let highVolatilityTradeCount = 0

  for (const trade of periodTrades) {
    netPnL += trade.netPnL
    if (trade.netPnL > 0) winCount += 1
    if (trade.isImpulsive) impulsiveTradeCount += 1
    if (trade.isHighVolatility) highVolatilityTradeCount += 1

    const key = getDateKey(trade.parsedEntryDate)
    const existing = dailyStats.get(key) ?? { count: 0, net: 0, impulsive: 0 }
    existing.count += 1
    existing.net += trade.netPnL
    if (trade.isImpulsive) existing.impulsive += 1
    dailyStats.set(key, existing)
  }

  const dailyCounts = Array.from(dailyStats.values()).map((d) => d.count)
  const dailyCountMean = dailyCounts.length
    ? dailyCounts.reduce((sum, c) => sum + c, 0) / dailyCounts.length
    : 0
  const dailyCountStdDev = getStdDev(dailyCounts)
  const overtradeThreshold = Math.max(8, Math.ceil(dailyCountMean + dailyCountStdDev * 1.5))
  const overtradingDays = dailyCounts.filter((count) => count >= overtradeThreshold).length

  let lossChasingEvents = 0
  for (let i = 1; i < periodTrades.length; i += 1) {
    const current = periodTrades[i]
    const previous = periodTrades[i - 1]
    const sameDay = getDateKey(current.parsedEntryDate) === getDateKey(previous.parsedEntryDate)
    if (!sameDay) continue

    const quantityJump = Number(current.quantity) >= Number(previous.quantity) * 1.25
    if (previous.netPnL < 0 && quantityJump) {
      lossChasingEvents += 1
    }
  }

  const averageEmotion = periodMoods.length
    ? periodMoods.reduce((sum, mood) => sum + (mood.emotionValue ?? 50), 0) / periodMoods.length
    : 50
  const lowEmotionDays = periodMoods.filter((mood) => (mood.emotionValue ?? 50) < 35).length

  const impulsiveRate = toPercent(impulsiveTradeCount, Math.max(tradeCount, 1))
  const overtradeDayRate = toPercent(overtradingDays, Math.max(dailyStats.size, 1))
  const lossChasingRate = toPercent(lossChasingEvents, Math.max(tradeCount, 1))
  const lowMoodRate = toPercent(lowEmotionDays, Math.max(moodEntries, 1))

  const stressScore = round(
    clamp(
      impulsiveRate * 0.42 + overtradeDayRate * 0.23 + lossChasingRate * 0.2 + lowMoodRate * 0.15,
      0,
      100,
    ),
  )

  const emotionalRiskPercent = round(
    clamp(impulsiveRate * 0.6 + lossChasingRate * 0.25 + overtradeDayRate * 0.15, 0, 100),
  )

  const tradingDays = dailyStats.size
  const sampleAdequacy = clamp(
    toPercent(Math.min(tradeCount, 40), 40) * 0.55 +
      toPercent(Math.min(moodEntries, 20), 20) * 0.3 +
      toPercent(Math.min(tradingDays, 20), 20) * 0.15,
    0,
    100,
  )

  const confidencePenalty =
    (tradeCount < 8 ? 18 : 0) +
    (moodEntries < 5 ? 12 : 0) +
    (tradingDays < 5 ? 8 : 0) +
    (moodEntries === 0 ? 15 : 0)

  const confidenceScore = round(clamp(sampleAdequacy - confidencePenalty, 0, 100))
  const confidenceBand = confidenceBandFromScore(confidenceScore)

  const drivers: BehaviorInsights["drivers"] = [
    {
      key: "impulsiveRate" as const,
      contribution: round(impulsiveRate * 0.42),
      explanation: "Emotion-tagged trades are increasing stress pressure.",
    },
    {
      key: "overtradeDayRate" as const,
      contribution: round(overtradeDayRate * 0.23),
      explanation: "High trade-frequency days are raising behavioral drift.",
    },
    {
      key: "lossChasingRate" as const,
      contribution: round(lossChasingRate * 0.2),
      explanation: "Post-loss size escalation indicates chasing behavior.",
    },
    {
      key: "lowMoodRate" as const,
      contribution: round(lowMoodRate * 0.15),
      explanation: "Low emotion check-ins are linked to weaker execution quality.",
    },
  ].sort((a, b) => b.contribution - a.contribution)

  const sortedDays = Array.from(dailyStats.keys()).sort()
  let disciplineStreakDays = 0
  for (let i = sortedDays.length - 1; i >= 0; i -= 1) {
    const day = sortedDays[i]
    const dayStats = dailyStats.get(day)
    if (!dayStats) break

    const dayIsDisciplined = dayStats.impulsive === 0 && dayStats.count < overtradeThreshold
    if (!dayIsDisciplined) break
    disciplineStreakDays += 1
  }

  const winRate = toPercent(winCount, Math.max(tradeCount, 1))
  const checkInRate = toPercent(moodEntries, Math.max(tradingDays, 1))
  const reflectionCompletionRate = checkInRate
  const riskAlignmentScore = round(clamp(100 - emotionalRiskPercent, 0, 100))

  const recommendations: string[] = []
  const recommendationsDetailed: BehaviorInsights["recommendationsDetailed"] = []
  if (overtradingDays > 0) {
    const text = `Overtrading detected on ${overtradingDays} day(s). Set a daily max of ${Math.max(4, overtradeThreshold - 2)} trades.`
    recommendations.push(text)
    recommendationsDetailed.push({
      text,
      priority: overtradingDays >= 3 ? "high" : "medium",
      basedOn: ["overtradingDays", "overtradeThreshold"],
    })
  }
  if (lossChasingEvents > 0) {
    const text = `Detected ${lossChasingEvents} potential loss-chasing event(s). Add a cooldown after losing trades.`
    recommendations.push(text)
    recommendationsDetailed.push({
      text,
      priority: lossChasingEvents >= 2 ? "high" : "medium",
      basedOn: ["lossChasingEvents", "quantityJump"],
    })
  }
  if (impulsiveTradeCount > 0) {
    const text = `${impulsiveTradeCount} trade(s) were tagged/commented as emotional. Run a post-trade review prompt for these sessions.`
    recommendations.push(text)
    recommendationsDetailed.push({
      text,
      priority: impulsiveTradeCount >= 5 ? "high" : "medium",
      basedOn: ["impulsiveTradeCount", "trade comments/tags"],
    })
  }
  if (stressScore >= 60) {
    const text = "Stress score is elevated. Enable pre-trade breathing prompts during volatile windows."
    recommendations.push(text)
    recommendationsDetailed.push({
      text,
      priority: "high",
      basedOn: ["stressScore"],
    })
  }
  if (recommendations.length === 0) {
    const text = "Behavior profile is stable. Continue consistency and review strategy weekly."
    recommendations.push(text)
    recommendationsDetailed.push({
      text,
      priority: "low",
      basedOn: ["stable profile"],
    })
  }

  if (confidenceBand === "low") {
    recommendationsDetailed.push({
      text: "Signal confidence is low due to sparse behavior inputs. Add daily mood check-ins for stronger recommendations.",
      priority: "medium",
      basedOn: ["confidenceScore", "moodEntries"],
    })
  }

  return {
    periodDays,
    generatedAt: new Date().toISOString(),
    summary: {
      tradeCount,
      moodEntries,
      tradingDays,
      netPnL: round(netPnL),
      winRate,
      averageEmotion: round(averageEmotion),
      stressScore,
      emotionalRiskPercent,
      confidenceScore,
      confidenceBand,
      disciplineStreakDays,
      overtradingDays,
      lossChasingEvents,
      impulsiveTradeCount,
      highVolatilityTradeCount,
    },
    modules: {
      checkInRate,
      reflectionCompletionRate,
      riskAlignmentScore,
    },
    achievements: {
      steadyHand: disciplineStreakDays >= 30,
      emotionalMaster: emotionalRiskPercent <= 10 && lossChasingEvents === 0,
      controlStreak: disciplineStreakDays >= 7,
    },
    drivers,
    prompts: {
      mindful: buildMindfulPrompt(stressScore, emotionalRiskPercent),
      postTradeReview: buildPostTradePrompt(lossChasingEvents),
      riskGuard: buildRiskGuard(overtradingDays, impulsiveTradeCount),
    },
    recommendations,
    recommendationsDetailed,
  }
}

export interface ScoreMetrics {
    winRate: number
    profitFactor: number
    totalTrades: number
    consistency?: number // Optional: consistency score if available
    returnMultiple?: number // Optional: return on risk or similar
}

/**
 * Calculates a 0-100 trading score based on key metrics.
 * Weighting:
 * - Win Rate: 40% (Target 50%+)
 * - Profit Factor: 40% (Target 2.0+)
 * - Activity/Experience: 20% (Based on trade count)
 */
export function calculateTradingScore(metrics: ScoreMetrics): number {
    let score = 0

    // 1. Win Rate Score (0-40 points)
    // 50% win rate gets 20 points. 70%+ gets 40 points. <30% gets 0.
    const wr = metrics.winRate
    if (wr >= 70) score += 40
    else if (wr >= 50) score += 20 + (wr - 50)
    else if (wr >= 30) score += (wr - 30)

    // 2. Profit Factor Score (0-40 points)
    // PF 2.0+ gets 40 points. PF 1.0 gets 20 points.
    const pf = metrics.profitFactor
    if (pf >= 2.0) score += 40
    else if (pf >= 1.0) score += 20 + ((pf - 1.0) * 20)
    else score += (pf * 20)

    // 3. Experience Score (0-20 points)
    // 20+ trades gets full points.
    const trades = metrics.totalTrades
    if (trades >= 20) score += 20
    else score += trades

    return Math.min(Math.round(score), 100)
}

export function getScoreColor(score: number): string {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
}

export function getScoreLabel(score: number): string {
    if (score >= 90) return "Elite"
    if (score >= 80) return "Pro"
    if (score >= 60) return "Solid"
    if (score >= 40) return "Developing"
    return "Novice"
}

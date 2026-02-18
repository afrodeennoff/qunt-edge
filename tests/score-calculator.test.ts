import { describe, it, expect } from 'vitest'
import {
  deriveScoreMetricsFromTrades,
  calculateTradingScore,
  getScoreColor,
  getScoreLabel,
  ScoreTradeLike,
  ScoreMetrics,
} from '@/lib/score-calculator'

describe('score calculator', () => {
  describe('deriveScoreMetricsFromTrades', () => {
    it('returns defaults for null/undefined/empty input', () => {
      const expected = { winRate: 0, profitFactor: 0, totalTrades: 0 }
      expect(deriveScoreMetricsFromTrades(null)).toEqual(expected)
      expect(deriveScoreMetricsFromTrades(undefined)).toEqual(expected)
      expect(deriveScoreMetricsFromTrades([])).toEqual(expected)
    })

    it('calculates metrics for a single win', () => {
      const trades: ScoreTradeLike[] = [{ pnl: 100, commission: 5 }]
      const result = deriveScoreMetricsFromTrades(trades)
      expect(result.winRate).toBe(100)
      expect(result.profitFactor).toBe(100) // No losses
      expect(result.totalTrades).toBe(1)
    })

    it('calculates metrics for a single loss', () => {
      const trades: ScoreTradeLike[] = [{ pnl: -50, commission: 5 }]
      const result = deriveScoreMetricsFromTrades(trades)
      expect(result.winRate).toBe(0)
      expect(result.profitFactor).toBe(0)
      expect(result.totalTrades).toBe(1)
    })

    it('calculates metrics for mixed trades', () => {
      const trades: ScoreTradeLike[] = [
        { pnl: 100, commission: 10 }, // Net: 90 (Win)
        { pnl: -50, commission: 5 },  // Net: -55 (Loss)
        { pnl: 200, commission: 10 }, // Net: 190 (Win)
      ]
      // Gross Win: 90 + 190 = 280
      // Gross Loss: 55
      // Win Rate: 2/3 * 100 = 66.666...
      // Profit Factor: 280 / 55 = 5.09...

      const result = deriveScoreMetricsFromTrades(trades)
      expect(result.winRate).toBeCloseTo(66.67, 1)
      expect(result.profitFactor).toBeCloseTo(5.09, 2)
      expect(result.totalTrades).toBe(3)
    })

    it('treats break-even (0 net PnL) as a non-win (loss)', () => {
      const trades: ScoreTradeLike[] = [
        { pnl: 10, commission: 10 }, // Net: 0 (Loss)
        { pnl: 100, commission: 0 }, // Net: 100 (Win)
      ]
      // Wins: 1, Losses: 1
      // Gross Win: 100
      // Gross Loss: 0 (since 0 adds nothing)
      // Win Rate: 50%
      // Profit Factor: 100 / 0 -> 100 (based on implementation logic)

      const result = deriveScoreMetricsFromTrades(trades)
      expect(result.winRate).toBe(50)
      expect(result.profitFactor).toBe(100)
      expect(result.totalTrades).toBe(2)
    })

    it('normalizes string inputs correctly', () => {
      const trades: ScoreTradeLike[] = [
        { pnl: '100', commission: '10' }, // Net: 90
        { pnl: '-50', commission: null }, // Net: -50
        { pnl: undefined, commission: '5' }, // Net: -5
      ]
      // Wins: 1 (90)
      // Losses: 2 (-50, -5)
      // Gross Win: 90
      // Gross Loss: 55

      const result = deriveScoreMetricsFromTrades(trades)
      expect(result.winRate).toBeCloseTo(33.33, 2)
      expect(result.profitFactor).toBeCloseTo(90/55, 2)
      expect(result.totalTrades).toBe(3)
    })

    it('handles profit factor when gross loss is 0', () => {
      const trades: ScoreTradeLike[] = [{ pnl: 100, commission: 0 }]
      const result = deriveScoreMetricsFromTrades(trades)
      expect(result.profitFactor).toBe(100)
    })

     it('handles profit factor when gross loss is 0 and gross win is 0', () => {
      const trades: ScoreTradeLike[] = [{ pnl: 0, commission: 0 }]
      // Net: 0
      // Wins: 0
      // Losses: 1 (0)
      // Gross Win: 0
      // Gross Loss: 0
      // Profit Factor: 0 (grossWin > 0 ? 100 : 0)

      const result = deriveScoreMetricsFromTrades(trades)
      expect(result.profitFactor).toBe(0)
      expect(result.winRate).toBe(0)
    })
  })

  describe('calculateTradingScore', () => {
    it('calculates max score (100)', () => {
      const metrics: ScoreMetrics = {
        winRate: 80,       // > 70 -> 40 pts
        profitFactor: 3.0, // > 2.0 -> 40 pts
        totalTrades: 25,   // > 20 -> 20 pts
      }
      expect(calculateTradingScore(metrics)).toBe(100)
    })

    it('calculates a low score', () => {
      const metrics: ScoreMetrics = {
        winRate: 10,       // < 30 -> 0 pts
        profitFactor: 0.5, // < 1.0 -> 0.5 * 20 = 10 pts
        totalTrades: 5,    // < 20 -> 5 pts
      }
      // PF < 1.0 logic: score += pf * 20. So 0.5 * 20 = 10.
      // Total: 0 + 10 + 5 = 15.
      expect(calculateTradingScore(metrics)).toBe(15)
    })

    it('calculates minimum score (0)', () => {
      const metrics: ScoreMetrics = {
        winRate: 10,       // < 30 -> 0 pts
        profitFactor: 0,   // < 1.0 -> 0 * 20 = 0 pts
        totalTrades: 0,    // < 20 -> 0 pts
      }
      expect(calculateTradingScore(metrics)).toBe(0)
    })

    it('calculates intermediate score correctly', () => {
      const metrics: ScoreMetrics = {
        winRate: 60,       // 50-70: 20 + (60-50) = 30 pts
        profitFactor: 1.5, // 1.0-2.0: 20 + (0.5 * 20) = 30 pts
        totalTrades: 10,   // < 20: 10 pts
      }
      // Total: 30 + 30 + 10 = 70
      expect(calculateTradingScore(metrics)).toBe(70)
    })

    it('handles exact thresholds', () => {
      // Thresholds: WR 30, 50, 70. PF 1.0, 2.0. Trades 20.

      // WR 30 -> (30-30) = 0 pts from WR logic?
      // Logic: if (wr >= 30) score += (wr - 30). So 30 -> 0. Correct.
      // PF 1.0 -> 20 + ((1.0-1.0)*20) = 20 pts.
      // Trades 20 -> 20 pts.

      expect(calculateTradingScore({ winRate: 30, profitFactor: 1.0, totalTrades: 20 })).toBe(40)

      // WR 50 -> 20 + (0) = 20 pts
      expect(calculateTradingScore({ winRate: 50, profitFactor: 0, totalTrades: 0 })).toBe(20)

      // WR 70 -> 40 pts
       expect(calculateTradingScore({ winRate: 70, profitFactor: 0, totalTrades: 0 })).toBe(40)

      // PF 2.0 -> 40 pts
      expect(calculateTradingScore({ winRate: 0, profitFactor: 2.0, totalTrades: 0 })).toBe(40)
    })
  })

  describe('getScoreColor & getScoreLabel', () => {
    it('returns correct colors based on score', () => {
      expect(getScoreColor(90)).toBe('text-white')
      expect(getScoreColor(80)).toBe('text-white')
      expect(getScoreColor(60)).toBe('text-white/80')
      expect(getScoreColor(40)).toBe('text-white/60')
      expect(getScoreColor(39)).toBe('text-white/40')
    })

    it('returns correct labels based on score', () => {
      expect(getScoreLabel(90)).toBe('Elite')
      expect(getScoreLabel(80)).toBe('Pro')
      expect(getScoreLabel(60)).toBe('Solid')
      expect(getScoreLabel(40)).toBe('Developing')
      expect(getScoreLabel(39)).toBe('Novice')
    })
  })
})

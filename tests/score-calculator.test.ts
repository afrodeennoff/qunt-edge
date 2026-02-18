import { describe, expect, it } from 'vitest'
import {
  calculateTradingScore,
  deriveScoreMetricsFromTrades,
  getScoreColor,
  getScoreLabel,
  ScoreMetrics,
  ScoreTradeLike,
} from '../lib/score-calculator'

describe('score calculator', () => {
  describe('calculateTradingScore', () => {
    // Win Rate Tests
    it('calculates win rate score correctly for high win rate (>= 70%)', () => {
      const metrics: ScoreMetrics = { winRate: 75, profitFactor: 0, totalTrades: 0 }
      expect(calculateTradingScore(metrics)).toBe(40)
    })

    it('calculates win rate score correctly for medium win rate (50-70%)', () => {
      // 50% -> 20 pts
      // 60% -> 20 + (60-50) = 30 pts
      const metrics: ScoreMetrics = { winRate: 60, profitFactor: 0, totalTrades: 0 }
      expect(calculateTradingScore(metrics)).toBe(30)
    })

    it('calculates win rate score correctly for low win rate (30-50%)', () => {
      // 30% -> 0 pts
      // 40% -> 40-30 = 10 pts
      const metrics: ScoreMetrics = { winRate: 40, profitFactor: 0, totalTrades: 0 }
      expect(calculateTradingScore(metrics)).toBe(10)
    })

    it('calculates win rate score correctly for very low win rate (< 30%)', () => {
      const metrics: ScoreMetrics = { winRate: 20, profitFactor: 0, totalTrades: 0 }
      expect(calculateTradingScore(metrics)).toBe(0)
    })

    // Profit Factor Tests
    it('calculates profit factor score correctly for high PF (>= 2.0)', () => {
      const metrics: ScoreMetrics = { winRate: 0, profitFactor: 2.5, totalTrades: 0 }
      expect(calculateTradingScore(metrics)).toBe(40)
    })

    it('calculates profit factor score correctly for medium PF (1.0-2.0)', () => {
      // 1.0 -> 20 pts
      // 1.5 -> 20 + (1.5-1.0)*20 = 30 pts
      const metrics: ScoreMetrics = { winRate: 0, profitFactor: 1.5, totalTrades: 0 }
      expect(calculateTradingScore(metrics)).toBe(30)
    })

    it('calculates profit factor score correctly for low PF (< 1.0)', () => {
      // 0.5 -> 0.5 * 20 = 10 pts
      const metrics: ScoreMetrics = { winRate: 0, profitFactor: 0.5, totalTrades: 0 }
      expect(calculateTradingScore(metrics)).toBe(10)
    })

    // Experience Tests
    it('calculates experience score correctly for high trade count (>= 20)', () => {
      const metrics: ScoreMetrics = { winRate: 0, profitFactor: 0, totalTrades: 25 }
      expect(calculateTradingScore(metrics)).toBe(20)
    })

    it('calculates experience score correctly for low trade count (< 20)', () => {
      const metrics: ScoreMetrics = { winRate: 0, profitFactor: 0, totalTrades: 10 }
      expect(calculateTradingScore(metrics)).toBe(10)
    })

    // Combined Score Tests
    it('calculates total score correctly (perfect score)', () => {
      const metrics: ScoreMetrics = { winRate: 75, profitFactor: 2.5, totalTrades: 25 }
      // 40 + 40 + 20 = 100
      expect(calculateTradingScore(metrics)).toBe(100)
    })

    it('calculates total score correctly (mixed metrics)', () => {
      const metrics: ScoreMetrics = { winRate: 60, profitFactor: 1.5, totalTrades: 10 }
      // WR: 20 + 10 = 30
      // PF: 20 + 10 = 30
      // Exp: 10
      // Total: 70
      expect(calculateTradingScore(metrics)).toBe(70)
    })
  })

  describe('deriveScoreMetricsFromTrades', () => {
    it('returns zero metrics for empty trades', () => {
      expect(deriveScoreMetricsFromTrades([])).toEqual({
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
      })
    })

    it('returns zero metrics for null/undefined trades', () => {
      expect(deriveScoreMetricsFromTrades(null)).toEqual({
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
      })
      expect(deriveScoreMetricsFromTrades(undefined)).toEqual({
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
      })
    })

    it('calculates metrics correctly for a mix of trades', () => {
      const trades: ScoreTradeLike[] = [
        { pnl: 100, commission: 0 },   // Win: 100
        { pnl: -50, commission: 0 },   // Loss: -50
        { pnl: 200, commission: 0 },   // Win: 200
        { pnl: -50, commission: 0 },   // Loss: -50
      ]
      // Wins: 100, 200 -> Gross Win: 300
      // Losses: -50, -50 -> Gross Loss: 100
      // Total Trades: 4
      // Win Rate: 2/4 = 50%
      // Profit Factor: 300/100 = 3.0

      const metrics = deriveScoreMetricsFromTrades(trades)
      expect(metrics.totalTrades).toBe(4)
      expect(metrics.winRate).toBe(50)
      expect(metrics.profitFactor).toBe(3.0)
    })

    it('handles commissions correctly', () => {
       const trades: ScoreTradeLike[] = [
        { pnl: 100, commission: 10 },  // Net: 90 (Win)
        { pnl: -40, commission: 10 },  // Net: -50 (Loss)
      ]
      // Gross Win: 90
      // Gross Loss: 50
      // PF: 90/50 = 1.8

      const metrics = deriveScoreMetricsFromTrades(trades)
      expect(metrics.profitFactor).toBe(1.8)
    })

    it('handles break-even trades as losses', () => {
        const trades: ScoreTradeLike[] = [
            { pnl: 10, commission: 10 }, // Net: 0 (Loss)
            { pnl: 100, commission: 0 }  // Net: 100 (Win)
        ]
        // Win Rate: 1/2 = 50%
        // Gross Win: 100
        // Gross Loss: 0
        // Profit Factor: 100 (since Gross Loss is 0)

        const metrics = deriveScoreMetricsFromTrades(trades)
        expect(metrics.winRate).toBe(50)
        expect(metrics.profitFactor).toBe(100)
    })

    it('handles zero wins (profit factor 0)', () => {
        const trades: ScoreTradeLike[] = [
            { pnl: -100, commission: 0 }
        ]
        const metrics = deriveScoreMetricsFromTrades(trades)
        expect(metrics.profitFactor).toBe(0)
    })
  })

  describe('getScoreColor', () => {
      it('returns correct color for elite score', () => {
          expect(getScoreColor(85)).toBe("text-white")
      })
      it('returns correct color for pro score', () => {
          expect(getScoreColor(70)).toBe("text-white/80")
      })
      it('returns correct color for solid score', () => {
          expect(getScoreColor(50)).toBe("text-white/60")
      })
      it('returns correct color for novice score', () => {
          expect(getScoreColor(20)).toBe("text-white/40")
      })
  })

  describe('getScoreLabel', () => {
      it('returns Elite for >= 90', () => {
          expect(getScoreLabel(90)).toBe("Elite")
      })
      it('returns Pro for >= 80', () => {
          expect(getScoreLabel(80)).toBe("Pro")
      })
      it('returns Solid for >= 60', () => {
          expect(getScoreLabel(60)).toBe("Solid")
      })
      it('returns Developing for >= 40', () => {
          expect(getScoreLabel(40)).toBe("Developing")
      })
      it('returns Novice for < 40', () => {
          expect(getScoreLabel(39)).toBe("Novice")
      })
  })
})

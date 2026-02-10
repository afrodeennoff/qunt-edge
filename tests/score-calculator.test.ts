import { describe, it, expect } from 'vitest'
import { calculateTradingScore, getScoreColor, getScoreLabel } from '@/lib/score-calculator'

describe('calculateTradingScore', () => {
  it('returns 0 for minimal metrics', () => {
    const score = calculateTradingScore({
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0
    })
    expect(score).toBe(0)
  })

  it('returns 100 for maximal metrics', () => {
    const score = calculateTradingScore({
      winRate: 100,
      profitFactor: 3.0,
      totalTrades: 100
    })
    expect(score).toBe(100)
  })

  it('calculates win rate score correctly', () => {
    // < 30 -> 0
    expect(calculateTradingScore({ winRate: 29, profitFactor: 0, totalTrades: 0 })).toBe(0)
    // 30 -> 0 (30-30)
    expect(calculateTradingScore({ winRate: 30, profitFactor: 0, totalTrades: 0 })).toBe(0)
    // 40 -> 10 (40-30)
    expect(calculateTradingScore({ winRate: 40, profitFactor: 0, totalTrades: 0 })).toBe(10)
    // 49 -> 19 (49-30)
    expect(calculateTradingScore({ winRate: 49, profitFactor: 0, totalTrades: 0 })).toBe(19)

    // 50 -> 20 (20 + 0)
    expect(calculateTradingScore({ winRate: 50, profitFactor: 0, totalTrades: 0 })).toBe(20)
    // 60 -> 30 (20 + 10)
    expect(calculateTradingScore({ winRate: 60, profitFactor: 0, totalTrades: 0 })).toBe(30)
    // 69 -> 39 (20 + 19)
    expect(calculateTradingScore({ winRate: 69, profitFactor: 0, totalTrades: 0 })).toBe(39)

    // 70 -> 40
    expect(calculateTradingScore({ winRate: 70, profitFactor: 0, totalTrades: 0 })).toBe(40)
    // 80 -> 40
    expect(calculateTradingScore({ winRate: 80, profitFactor: 0, totalTrades: 0 })).toBe(40)
  })

  it('calculates profit factor score correctly', () => {
    // < 1.0 -> pf * 20
    expect(calculateTradingScore({ winRate: 0, profitFactor: 0.5, totalTrades: 0 })).toBe(10)
    expect(calculateTradingScore({ winRate: 0, profitFactor: 0.9, totalTrades: 0 })).toBe(18)

    // 1.0 -> 20
    expect(calculateTradingScore({ winRate: 0, profitFactor: 1.0, totalTrades: 0 })).toBe(20)
    // 1.5 -> 30 (20 + 0.5*20)
    expect(calculateTradingScore({ winRate: 0, profitFactor: 1.5, totalTrades: 0 })).toBe(30)
    // 1.9 -> 38 (20 + 0.9*20)
    expect(calculateTradingScore({ winRate: 0, profitFactor: 1.9, totalTrades: 0 })).toBe(38)

    // 2.0 -> 40
    expect(calculateTradingScore({ winRate: 0, profitFactor: 2.0, totalTrades: 0 })).toBe(40)
    // 3.0 -> 40
    expect(calculateTradingScore({ winRate: 0, profitFactor: 3.0, totalTrades: 0 })).toBe(40)
  })

  it('calculates trades score correctly', () => {
    // < 20 -> trades
    expect(calculateTradingScore({ winRate: 0, profitFactor: 0, totalTrades: 10 })).toBe(10)
    expect(calculateTradingScore({ winRate: 0, profitFactor: 0, totalTrades: 19 })).toBe(19)

    // >= 20 -> 20
    expect(calculateTradingScore({ winRate: 0, profitFactor: 0, totalTrades: 20 })).toBe(20)
    expect(calculateTradingScore({ winRate: 0, profitFactor: 0, totalTrades: 100 })).toBe(20)
  })

  it('calculates mixed score correctly', () => {
    // WR 60 (30 pts) + PF 1.5 (30 pts) + Trades 10 (10 pts) = 70
    expect(calculateTradingScore({ winRate: 60, profitFactor: 1.5, totalTrades: 10 })).toBe(70)
  })
})

describe('getScoreColor', () => {
  it('returns correct colors based on score', () => {
    expect(getScoreColor(39)).toBe('text-red-500')
    expect(getScoreColor(40)).toBe('text-yellow-500')
    expect(getScoreColor(59)).toBe('text-yellow-500')
    expect(getScoreColor(60)).toBe('text-green-500')
    expect(getScoreColor(79)).toBe('text-green-500')
    expect(getScoreColor(80)).toBe('text-emerald-500')
    expect(getScoreColor(100)).toBe('text-emerald-500')
  })
})

describe('getScoreLabel', () => {
  it('returns correct labels based on score', () => {
    expect(getScoreLabel(39)).toBe('Novice')
    expect(getScoreLabel(40)).toBe('Developing')
    expect(getScoreLabel(59)).toBe('Developing')
    expect(getScoreLabel(60)).toBe('Solid')
    expect(getScoreLabel(79)).toBe('Solid')
    expect(getScoreLabel(80)).toBe('Pro')
    expect(getScoreLabel(89)).toBe('Pro')
    expect(getScoreLabel(90)).toBe('Elite')
    expect(getScoreLabel(100)).toBe('Elite')
  })
})

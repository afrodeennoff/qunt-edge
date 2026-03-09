import { describe, expect, it } from 'vitest'
import { Prisma, Trade } from '@/prisma/generated/prisma'
import { calculateRiskMetricsV1 } from '@/lib/analytics/metrics-v1'
import { ANALYTICS_METRIC_VERSION } from '@/lib/analytics/metric-definitions'

function makeTrade(
  id: string,
  pnl: number,
  commission: number,
  entryDate: string
) {
  return {
    id,
    userId: 'u1',
    accountNumber: 'A1',
    instrument: 'ES',
    side: 'Long',
    quantity: new Prisma.Decimal(1),
    entryPrice: new Prisma.Decimal(5000),
    closePrice: new Prisma.Decimal(5005),
    pnl: new Prisma.Decimal(pnl),
    commission: new Prisma.Decimal(commission),
    entryId: null,
    closeId: null,
    entryDate: new Date(entryDate),
    closeDate: new Date(entryDate),
    timeInPosition: new Prisma.Decimal(60),
    comment: null,
    tags: [],
    groupId: '',
    imageBase64: null,
    imageBase64Second: null,
    images: [],
    videoUrl: null,
    createdAt: new Date(entryDate),
  }
}

describe('analytics metrics v1', () => {
  it('returns versioned metrics with deterministic expectancy', () => {
    const trades = [
      makeTrade('t1', 100, 10, '2026-01-01T12:00:00Z'),
      makeTrade('t2', -50, 5, '2026-01-02T12:00:00Z'),
      makeTrade('t3', 80, 10, '2026-01-03T12:00:00Z'),
    ]

    const first = calculateRiskMetricsV1(trades as Trade[])
    const second = calculateRiskMetricsV1(trades as Trade[])

    expect(first.metricVersion).toBe(ANALYTICS_METRIC_VERSION)
    expect(first.expectancy).toBeCloseTo(second.expectancy, 10)
    expect(first.winRate).toBeCloseTo(2 / 3, 10)
    expect(first.realizedPnl).toBeCloseTo(105, 10) // (100-10) + (-50-5) + (80-10)
  })

  it('computes streaks and drawdown on pathological sequence', () => {
    const trades = [
      makeTrade('a', 10, 0, '2026-01-01T12:00:00Z'),
      makeTrade('b', -10, 0, '2026-01-02T12:00:00Z'),
      makeTrade('c', -20, 0, '2026-01-03T12:00:00Z'),
      makeTrade('d', -5, 0, '2026-01-04T12:00:00Z'),
      makeTrade('e', 15, 0, '2026-01-05T12:00:00Z'),
    ]

    const metrics = calculateRiskMetricsV1(trades as Trade[])
    expect(metrics.losingStreak).toBe(3)
    expect(metrics.winningStreak).toBe(1)
    expect(metrics.maxDrawdown).toBeGreaterThan(0)
  })

  it('handles empty input gracefully', () => {
    const metrics = calculateRiskMetricsV1([])
    expect(metrics.winRate).toBe(0)
    expect(metrics.expectancy).toBe(0)
    expect(metrics.sharpeRatio).toBe(0)
    expect(metrics.maxDrawdown).toBe(0)
    expect(metrics.realizedPnl).toBe(0)
  })

  it('handles single trade input', () => {
    const trades = [makeTrade('t1', 100, 0, '2026-01-01T12:00:00Z')]
    const metrics = calculateRiskMetricsV1(trades as Trade[])

    expect(metrics.winRate).toBe(1)
    expect(metrics.expectancy).toBe(100)
    expect(metrics.sharpeRatio).toBe(0) // StdDev is 0 for single item
    expect(metrics.maxDrawdown).toBe(0)
    expect(metrics.realizedPnl).toBe(100)
  })

  it('handles all wins (100% win rate)', () => {
    const trades = [
      makeTrade('t1', 100, 0, '2026-01-01T12:00:00Z'),
      makeTrade('t2', 200, 0, '2026-01-02T12:00:00Z'),
    ]
    const metrics = calculateRiskMetricsV1(trades as Trade[])

    expect(metrics.winRate).toBe(1)
    expect(metrics.expectancy).toBe(150) // (150 * 1) - (0 * 0)
    expect(metrics.kellyFull).toBe(0) // avgLoss is 0 -> b=0 -> kelly=0
  })

  it('handles all losses (0% win rate)', () => {
    const trades = [
      makeTrade('t1', -100, 0, '2026-01-01T12:00:00Z'),
      makeTrade('t2', -50, 0, '2026-01-02T12:00:00Z'),
    ]
    const metrics = calculateRiskMetricsV1(trades as Trade[])

    expect(metrics.winRate).toBe(0)
    expect(metrics.expectancy).toBe(-75) // (0 * 0) - (75 * 1)
    expect(metrics.maxDrawdown).toBe(150) // Peak 0 -> -150
  })

  it('treats break-even trades as losses', () => {
    // Current logic: wins > 0, losses <= 0
    const trades = [
      makeTrade('t1', 100, 0, '2026-01-01T12:00:00Z'),
      makeTrade('t2', 0, 0, '2026-01-02T12:00:00Z'), // Net PnL 0
    ]
    const metrics = calculateRiskMetricsV1(trades as Trade[])

    expect(metrics.winRate).toBe(0.5)
    // AvgWin: 100, AvgLoss: 0 (0 / 1 = 0)
    expect(metrics.expectancy).toBe(50) // (100 * 0.5) - (0 * 0.5) = 50
  })

  it('calculates drawdown correctly for unsorted input', () => {
    // If sorted by date:
    // 1. -100 (Run: -100, Peak: 0, DD: 100)
    // 2. +200 (Run: 100, Peak: 100)
    // 3. -50 (Run: 50, Peak: 100, DD: 50)
    // Max DD: 100

    // If NOT sorted (processed as passed):
    // 1. +200 (Run: 200, Peak: 200)
    // 2. -100 (Run: 100, Peak: 200, DD: 100)
    // 3. -50 (Run: 50, Peak: 200, DD: 150)
    // Max DD: 150

    const trades = [
      makeTrade('t2', 200, 0, '2026-01-02T12:00:00Z'),
      makeTrade('t1', -100, 0, '2026-01-01T12:00:00Z'),
      makeTrade('t3', -50, 0, '2026-01-03T12:00:00Z'),
    ]

    const metrics = calculateRiskMetricsV1(trades as Trade[])
    expect(metrics.maxDrawdown).toBe(100)
  })

  it('verifies Sharpe and Sortino ratios manually', () => {
    // Day 1: +100
    // Day 2: -50
    // Day 3: +50
    // Daily Returns: [100, -50, 50]
    // Mean: 33.333...
    // Variance: ((100-33.33)^2 + (-50-33.33)^2 + (50-33.33)^2) / 3
    //         = (4444.89 + 6944.44 + 277.89) / 3 = 11667.22 / 3 = 3889.07
    // StdDev: sqrt(3889.07) = 62.36
    // Sharpe: (33.33 / 62.36) * sqrt(252) = 0.534 * 15.87 = ~8.48

    const trades = [
      makeTrade('t1', 100, 0, '2026-01-01T12:00:00Z'),
      makeTrade('t2', -50, 0, '2026-01-02T12:00:00Z'),
      makeTrade('t3', 50, 0, '2026-01-03T12:00:00Z'),
    ]

    const metrics = calculateRiskMetricsV1(trades as Trade[])

    // Rough check
    expect(metrics.sharpeRatio).toBeGreaterThan(8)
    expect(metrics.sharpeRatio).toBeLessThan(9)

    // Downside Deviation Check
    // Downside returns: [-50]
    // Downside Variance: (-50^2) / 3 = 2500 / 3 = 833.33
    // Downside Dev: sqrt(833.33) = 28.86
    // Sortino: (33.33 / 28.86) * sqrt(252) = 1.15 * 15.87 = ~18.3

    expect(metrics.sortinoRatio).toBeGreaterThan(18)
    expect(metrics.sortinoRatio).toBeLessThan(19)
  })

  it('calculates Kelly Criterion correctly', () => {
    // Win Rate 50%
    // Avg Win: 200, Avg Loss: 100 (R:R 2:1)
    // b = 2
    // Kelly = 0.5 - (0.5 / 2) = 0.25

    const trades = [
      makeTrade('t1', 200, 0, '2026-01-01T12:00:00Z'),
      makeTrade('t2', -100, 0, '2026-01-02T12:00:00Z'),
    ]

    const metrics = calculateRiskMetricsV1(trades as Trade[])
    expect(metrics.kellyFull).toBeCloseTo(0.25, 2)
    expect(metrics.kellyHalf).toBeCloseTo(0.125, 3)
  })
})

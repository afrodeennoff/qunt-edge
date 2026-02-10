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
})

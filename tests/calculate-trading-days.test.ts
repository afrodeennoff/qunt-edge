import { describe, expect, it } from 'vitest'
import { calculateTradingDays } from '@/lib/utils'
import { Trade } from '@/lib/data-types'
import Decimal from 'decimal.js'

// Helper to create a partial mock Trade
function createTrade(entryDate: string, pnl: number, commission: number = 0): Trade {
  return {
    entryDate: new Date(entryDate),
    pnl,
    commission,
    // Add other required fields with dummy values to satisfy the type if needed,
    // but the function only uses entryDate, pnl, and commission.
    // Casting to any to avoid filling all fields if TS complains about missing properties.
  } as any as Trade
}

describe('calculateTradingDays', () => {
  it('should return 0 days for empty trades array', () => {
    const result = calculateTradingDays([])
    expect(result).toEqual({
      totalTradingDays: 0,
      validTradingDays: 0,
      dailyPnL: {}
    })
  })

  it('should count a single trade as 1 trading day', () => {
    const trades = [createTrade('2023-10-01T10:00:00Z', 100, 5)]
    const result = calculateTradingDays(trades)

    expect(result.totalTradingDays).toBe(1)
    expect(result.validTradingDays).toBe(1)
    expect(Object.keys(result.dailyPnL)).toHaveLength(1)
    // 100 - 5 = 95
    expect(result.dailyPnL['2023-10-01'].toNumber()).toBe(95)
  })

  it('should group multiple trades on the same day', () => {
    const trades = [
      createTrade('2023-10-01T10:00:00Z', 100, 5),
      createTrade('2023-10-01T14:00:00Z', -50, 2)
    ]
    const result = calculateTradingDays(trades)

    expect(result.totalTradingDays).toBe(1)
    expect(result.validTradingDays).toBe(1)
    // (100 - 5) + (-50 - 2) = 95 - 52 = 43
    expect(result.dailyPnL['2023-10-01'].toNumber()).toBe(43)
  })

  it('should count trades on different days separately', () => {
    const trades = [
      createTrade('2023-10-01T10:00:00Z', 100, 5),
      createTrade('2023-10-02T10:00:00Z', 200, 10)
    ]
    const result = calculateTradingDays(trades)

    expect(result.totalTradingDays).toBe(2)
    expect(result.validTradingDays).toBe(2)
    expect(result.dailyPnL['2023-10-01'].toNumber()).toBe(95)
    expect(result.dailyPnL['2023-10-02'].toNumber()).toBe(190)
  })

  it('should handle decimal precision correctly', () => {
    const trades = [
      createTrade('2023-10-01T10:00:00Z', 0.1, 0),
      createTrade('2023-10-01T11:00:00Z', 0.2, 0)
    ]
    const result = calculateTradingDays(trades)

    expect(result.dailyPnL['2023-10-01'].toNumber()).toBeCloseTo(0.3)
  })

  describe('minPnlToCountAsDay logic', () => {
    it('should filter valid trading days based on threshold', () => {
      const trades = [
        createTrade('2023-10-01T10:00:00Z', 100, 0), // Net 100
        createTrade('2023-10-02T10:00:00Z', 50, 0),  // Net 50
        createTrade('2023-10-03T10:00:00Z', 10, 0)   // Net 10
      ]

      // Threshold 60: Only day 1 (100) is valid. Day 2 (50) and 3 (10) are not.
      const result = calculateTradingDays(trades, 60)

      expect(result.totalTradingDays).toBe(3)
      expect(result.validTradingDays).toBe(1)
    })

    it('should count all days if threshold is null or undefined', () => {
      const trades = [
        createTrade('2023-10-01T10:00:00Z', 100, 0),
        createTrade('2023-10-02T10:00:00Z', 50, 0)
      ]

      const result1 = calculateTradingDays(trades, null)
      expect(result1.validTradingDays).toBe(2)

      const result2 = calculateTradingDays(trades, undefined)
      expect(result2.validTradingDays).toBe(2)
    })

    it('should handle Decimal input for threshold', () => {
      const trades = [
        createTrade('2023-10-01T10:00:00Z', 100, 0),
        createTrade('2023-10-02T10:00:00Z', 50, 0)
      ]

      const result = calculateTradingDays(trades, new Decimal(60))
      expect(result.validTradingDays).toBe(1)
    })

    it('should handle string input for threshold', () => {
      const trades = [
        createTrade('2023-10-01T10:00:00Z', 100, 0),
        createTrade('2023-10-02T10:00:00Z', 50, 0)
      ]

      const result = calculateTradingDays(trades, '60')
      expect(result.validTradingDays).toBe(1)
    })

    it('should handle 0 threshold correctly (all positive days valid)', () => {
         const trades = [
        createTrade('2023-10-01T10:00:00Z', 100, 0),
        createTrade('2023-10-02T10:00:00Z', -50, 0)
      ]

      // If threshold is 0, any day with >= 0 PnL is valid?
      // The code says: if (threshold.gt(0)) { ... }
      // So if threshold is 0, it skips the filtering and returns totalTradingDays.
      // Let's verify this behavior.

      const result = calculateTradingDays(trades, 0)
      expect(result.totalTradingDays).toBe(2)
      // Since 0 is not gt(0), filtering is skipped, so validTradingDays should be equal to totalTradingDays (2)
      expect(result.validTradingDays).toBe(2)
    })
  })
})

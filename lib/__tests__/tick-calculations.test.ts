import { describe, it, expect } from 'vitest'
import {
  calculateTicksAndPoints,
  calculateTicksAndPointsForTrades,
  calculateTicksAndPointsForGroupedTrade,
  type TickCalculation
} from '../tick-calculations'
import type { Trade, TickDetails } from '@/prisma/generated/prisma'

// Helper to create a mock trade
// Using any cast to bypass strict Decimal type requirements for tests
// The implementation uses Number() which handles number or Decimal runtime objects
const createMockTrade = (overrides: Partial<Trade> = {}): Trade => ({
  id: 'trade-1',
  instrument: 'ESZ23',
  pnl: 100, // $100 profit
  quantity: 1,
  entryDate: new Date(),
  exitDate: new Date(),
  ...overrides,
} as unknown as Trade)

// Helper to create mock tick details
const createMockTickDetails = (overrides: Partial<TickDetails> = {}): TickDetails => ({
  id: 'tick-1',
  instrument: 'ES',
  tickValue: 12.5,
  tickSize: 0.25,
  ...overrides,
} as unknown as TickDetails)

describe('tick-calculations', () => {
  describe('calculateTicksAndPoints', () => {
    it('calculates ticks and points correctly for a standard trade', () => {
      const trade = createMockTrade({ pnl: 125 as any, quantity: 1 as any, instrument: 'ESZ23' })
      const tickDetails = {
        'ES': createMockTickDetails({ tickValue: 12.5 as any, tickSize: 0.25 as any })
      }

      const result = calculateTicksAndPoints(trade, tickDetails)

      expect(result).toEqual({
        ticks: 10, // 125 / 12.5 = 10
        points: 2.5, // 10 * 0.25 = 2.5
        tickValue: 12.5,
        tickSize: 0.25
      })
    })

    it('uses default values when no matching tick details are found', () => {
      const trade = createMockTrade({ pnl: 100 as any, quantity: 1 as any, instrument: 'UNKNOWN' })
      const tickDetails = {
        'ES': createMockTickDetails()
      }

      const result = calculateTicksAndPoints(trade, tickDetails)

      expect(result).toEqual({
        ticks: 100, // 100 / 1 = 100
        points: 1, // 100 * 0.01 = 1
        tickValue: 1,
        tickSize: 0.01
      })
    })

    it('finds the longest matching ticker', () => {
      const trade = createMockTrade({ pnl: 100 as any, quantity: 1 as any, instrument: 'MESH24' })
      const tickDetails = {
        'MES': createMockTickDetails({ tickValue: 1.25 as any, tickSize: 0.25 as any }), // Match
        'M': createMockTickDetails({ tickValue: 10 as any, tickSize: 1 as any }) // Shorter match
      }

      const result = calculateTicksAndPoints(trade, tickDetails)

      // Should match 'MES'
      expect(result.tickValue).toBe(1.25)
      expect(result.tickSize).toBe(0.25)
      // 100 / 1.25 = 80 ticks
      // 80 * 0.25 = 20 points
      expect(result.ticks).toBe(80)
      expect(result.points).toBe(20)
    })

    it('handles negative PnL correctly', () => {
      const trade = createMockTrade({ pnl: -50 as any, quantity: 1 as any, instrument: 'ESZ23' })
      const tickDetails = {
        'ES': createMockTickDetails({ tickValue: 12.5 as any, tickSize: 0.25 as any })
      }

      const result = calculateTicksAndPoints(trade, tickDetails)

      expect(result.ticks).toBe(-4) // -50 / 12.5 = -4
      expect(result.points).toBe(-1) // -4 * 0.25 = -1
    })

    it('handles zero PnL correctly', () => {
      const trade = createMockTrade({ pnl: 0 as any, quantity: 1 as any })
      const tickDetails = {
        'ES': createMockTickDetails({ tickValue: 12.5 as any, tickSize: 0.25 as any })
      }

      const result = calculateTicksAndPoints(trade, tickDetails)

      expect(result.ticks).toBe(0)
      expect(result.points).toBe(0)
    })

    it('handles rounding of points', () => {
      // Create a scenario where points would have many decimal places
      const trade = createMockTrade({ pnl: 33.33 as any, quantity: 1 as any, instrument: 'TEST' })
      const tickDetails = {
        'TEST': createMockTickDetails({ tickValue: 1 as any, tickSize: 0.0123 as any })
      }

      // ticks = 33.33 / 1 = 33
      // points = 33 * 0.0123 = 0.4059

      const result = calculateTicksAndPoints(trade, tickDetails)

      expect(result.ticks).toBe(33)
      expect(result.points).toBe(0.41) // Rounded to 2 decimals
    })

    it('handles NaN results gracefully (e.g. zero quantity)', () => {
      const trade = createMockTrade({ pnl: 100 as any, quantity: 0 as any }) // Division by zero -> Infinity
      const tickDetails = {
        'ES': createMockTickDetails({ tickValue: 12.5 as any, tickSize: 0.25 as any })
      }

      const result = calculateTicksAndPoints(trade, tickDetails)

      // Infinity handling depends on implementation, but NaN check should pass
      // Note: Math.round(Infinity) is Infinity. isNaN(Infinity) is false.
      // So checks in function: ticks = Infinity. points = Infinity.

      // Let's test explicit NaN case if possible, or just accept that 0 quantity might give Infinity
      // The function returns: ticks: isNaN(ticks) ? 0 : ticks.

      const tradeNaN = createMockTrade({ pnl: 0 as any, quantity: 0 as any })
      const resultNaN = calculateTicksAndPoints(tradeNaN, tickDetails)

      expect(resultNaN.ticks).toBe(0)
      expect(resultNaN.points).toBe(0)
    })
  })

  describe('calculateTicksAndPointsForTrades', () => {
    it('calculates for multiple trades', () => {
      const trades = [
        createMockTrade({ id: 't1', pnl: 125 as any, quantity: 1 as any, instrument: 'ES' }),
        createMockTrade({ id: 't2', pnl: 250 as any, quantity: 2 as any, instrument: 'ES' })
      ]
      const tickDetails = {
        'ES': createMockTickDetails({ tickValue: 12.5 as any, tickSize: 0.25 as any })
      }

      const result = calculateTicksAndPointsForTrades(trades, tickDetails)

      expect(Object.keys(result)).toHaveLength(2)
      expect(result['t1']).toEqual({ ticks: 10, points: 2.5, tickValue: 12.5, tickSize: 0.25 })
      expect(result['t2']).toEqual({ ticks: 10, points: 2.5, tickValue: 12.5, tickSize: 0.25 })
    })
  })

  describe('calculateTicksAndPointsForGroupedTrade', () => {
    it('calculates for a single trade object', () => {
      const trade = createMockTrade({ pnl: 125 as any, quantity: 1 as any, instrument: 'ES' })
      const tickDetails = {
        'ES': createMockTickDetails({ tickValue: 12.5 as any, tickSize: 0.25 as any })
      }

      const result = calculateTicksAndPointsForGroupedTrade(trade, tickDetails)

      expect(result).toEqual({ ticks: 10, points: 2.5, tickValue: 12.5, tickSize: 0.25 })
    })

    it('sums up ticks and points for grouped trades', () => {
      const groupedTrade = {
        trades: [
          createMockTrade({ pnl: 125 as any, quantity: 1 as any, instrument: 'ES' }), // 10 ticks, 2.5 points
          createMockTrade({ pnl: 250 as any, quantity: 1 as any, instrument: 'ES' })  // 20 ticks, 5.0 points
        ]
      }
      const tickDetails = {
        'ES': createMockTickDetails({ tickValue: 12.5 as any, tickSize: 0.25 as any })
      }

      const result = calculateTicksAndPointsForGroupedTrade(groupedTrade, tickDetails)

      expect(result.ticks).toBe(30) // 10 + 20
      expect(result.points).toBe(7.5) // 2.5 + 5.0
      expect(result.tickValue).toBe(1) // Default for grouped
      expect(result.tickSize).toBe(0.01) // Default for grouped
    })
  })
})

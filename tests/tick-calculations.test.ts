/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe } from 'vitest'
import {
  calculateTicksAndPoints,
  calculateTicksAndPointsForTrades,
  calculateTicksAndPointsForGroupedTrade
} from '../lib/tick-calculations'
import { Trade } from '@/lib/data-types'
import type { TickDetails } from '@/prisma/generated/prisma'

// Mock data setup
const mockTickDetails: Record<string, TickDetails> = {
  'NQ': { id: '1', ticker: 'NQ', tickSize: 0.25, tickValue: 5, contractSize: 20, createdAt: new Date(), updatedAt: new Date() } as any,
  'ES': { id: '2', ticker: 'ES', tickSize: 0.25, tickValue: 12.5, contractSize: 50, createdAt: new Date(), updatedAt: new Date() } as any,
  'GC': { id: '3', ticker: 'GC', tickSize: 0.1, tickValue: 10, contractSize: 100, createdAt: new Date(), updatedAt: new Date() } as any,
  // Add a longer ticker that contains a shorter one as prefix to test longest prefix match
  'ESH': { id: '4', ticker: 'ESH', tickSize: 0.5, tickValue: 25, contractSize: 50, createdAt: new Date(), updatedAt: new Date() } as any,
}

const baseTrade: Trade = {
  id: 'trade-1',
  instrument: 'NQH4',
  entryDate: new Date(),
  closeDate: new Date(),
  entryPrice: 100,
  closePrice: 101,
  quantity: 1,
  pnl: 20,
  commission: 0,
  userId: 'user-1',
  accountId: 'acc-1',
  accountNumber: 'acc-num-1',
  status: 'CLOSED',
  side: 'LONG',
  createdAt: new Date(),
  updatedAt: new Date(),
} as any

describe('calculateTicksAndPoints', () => {
  test('calculates correctly for NQ (standard case)', () => {
    // pnlPerContract = 20 / 1 = 20
    // tickValue = 5
    // ticks = 20 / 5 = 4
    // tickSize = 0.25
    // points = 4 * 0.25 = 1.0
    const result = calculateTicksAndPoints(baseTrade, mockTickDetails)
    expect(result.ticks).toBe(4)
    expect(result.points).toBe(1.0)
    expect(result.tickValue).toBe(5)
    expect(result.tickSize).toBe(0.25)
  })

  test('calculates correctly for ESH (longest prefix match)', () => {
    // ESH: tickValue=25, tickSize=0.5
    // 'ESH24' matches both 'ES' and 'ESH', but 'ESH' is longer.
    // pnlPerContract = 50 / 1 = 50
    // ticks = 50 / 25 = 2
    // points = 2 * 0.5 = 1.0
    const trade = { ...baseTrade, instrument: 'ESH24', pnl: 50 } as any
    const result = calculateTicksAndPoints(trade, mockTickDetails)

    expect(result.ticks).toBe(2)
    expect(result.points).toBe(1.0)
    expect(result.tickValue).toBe(25)
    expect(result.tickSize).toBe(0.5)
  })

  test('calculates correctly for partial match ES (not ESH)', () => {
    // Instrument 'ESM24' matches 'ES' but not 'ESH'.
    const trade = { ...baseTrade, instrument: 'ESM24', pnl: 50 } as any
    // ES details: tickValue=12.5, tickSize=0.25
    // ticks = 50 / 12.5 = 4
    // points = 4 * 0.25 = 1.0

    const result = calculateTicksAndPoints(trade, mockTickDetails)
    expect(result.ticks).toBe(4)
    expect(result.points).toBe(1.0)
    expect(result.tickValue).toBe(12.5)
    expect(result.tickSize).toBe(0.25)
  })

  test('handles unknown ticker gracefully', () => {
    const unknownTrade = { ...baseTrade, instrument: 'UNKNOWN', pnl: 20 } as any
    const result = calculateTicksAndPoints(unknownTrade, mockTickDetails)

    // Default: tickValue=1, tickSize=0.01
    // pnlPerContract = 20
    // ticks = 20 / 1 = 20
    // points = 20 * 0.01 = 0.2

    expect(result.ticks).toBe(20)
    expect(result.points).toBeCloseTo(0.2)
    expect(result.tickValue).toBe(1)
    expect(result.tickSize).toBe(0.01)
  })

  test('handles negative PnL', () => {
    const trade = { ...baseTrade, pnl: -20 } as any
    const result = calculateTicksAndPoints(trade, mockTickDetails)
    // -20 / 5 = -4 ticks
    // -4 * 0.25 = -1 point
    expect(result.ticks).toBe(-4)
    expect(result.points).toBe(-1.0)
  })

  test('handles zero PnL', () => {
    const trade = { ...baseTrade, pnl: 0 } as any
    const result = calculateTicksAndPoints(trade, mockTickDetails)
    expect(result.ticks).toBe(0)
    expect(result.points).toBe(0)
  })

  test('handles multiple contracts', () => {
    // pnl 100, qty 2. pnlPerContract = 50.
    // NQ: tickValue 5. ticks = 50 / 5 = 10. points = 10 * 0.25 = 2.5
    const trade = { ...baseTrade, pnl: 100, quantity: 2 } as any
    const result = calculateTicksAndPoints(trade, mockTickDetails)
    expect(result.ticks).toBe(10)
    expect(result.points).toBe(2.5)
  })

  test('handles zero quantity (edge case returns Infinity)', () => {
    const trade = { ...baseTrade, quantity: 0 } as any
    const result = calculateTicksAndPoints(trade, mockTickDetails)
    expect(result.ticks).toBe(Infinity)
    expect(result.points).toBe(Infinity)
  })

  test('handles NaN PnL (returns 0)', () => {
    const trade = { ...baseTrade, pnl: NaN } as any
    const result = calculateTicksAndPoints(trade, mockTickDetails)
    expect(result.ticks).toBe(0)
    expect(result.points).toBe(0)
  })
})

describe('calculateTicksAndPointsForTrades', () => {
  test('calculates for multiple trades', () => {
    const trade1 = { ...baseTrade, id: 't1', pnl: 20 } as any
    const trade2 = { ...baseTrade, id: 't2', pnl: 40 } as any // ticks=8, points=2

    const result = calculateTicksAndPointsForTrades([trade1, trade2], mockTickDetails)

    expect(result['t1'].ticks).toBe(4)
    expect(result['t2'].ticks).toBe(8)
  })

  test('handles empty array', () => {
    const result = calculateTicksAndPointsForTrades([], mockTickDetails)
    expect(Object.keys(result)).toHaveLength(0)
  })
})

describe('calculateTicksAndPointsForGroupedTrade', () => {
  test('aggregates multiple trades correctly', () => {
    const trade1 = { ...baseTrade, pnl: 20 } as any // 4 ticks, 1 point
    const trade2 = { ...baseTrade, pnl: 40 } as any // 8 ticks, 2 points

    const groupedTrade = {
      trades: [trade1, trade2]
    }

    const result = calculateTicksAndPointsForGroupedTrade(groupedTrade, mockTickDetails)

    // totalTicks = 4 + 8 = 12
    // totalPoints = 1 + 2 = 3
    // For grouped trade, defaults applied: tickValue=1, tickSize=0.01

    expect(result.ticks).toBe(12)
    expect(result.points).toBe(3.0)
    expect(result.tickValue).toBe(1)
    expect(result.tickSize).toBe(0.01)
  })

  test('handles single trade object fallback', () => {
    // Pass a single trade as groupedTrade
    const result = calculateTicksAndPointsForGroupedTrade(baseTrade, mockTickDetails)
    expect(result.ticks).toBe(4)
    expect(result.points).toBe(1.0)
    expect(result.tickValue).toBe(5)
  })
})

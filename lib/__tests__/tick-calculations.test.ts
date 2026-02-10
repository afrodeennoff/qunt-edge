import { describe, it, expect } from 'vitest'
import {
  calculateTicksAndPoints,
  calculateTicksAndPointsForTrades,
  calculateTicksAndPointsForGroupedTrade,
} from '../tick-calculations'
import type { Trade, TickDetails } from '@/prisma/generated/prisma'

describe('calculateTicksAndPoints', () => {
  const mockTickDetails: Record<string, TickDetails> = {
    ES: {
      id: '1',
      ticker: 'ES',
      tickValue: 12.5,
      tickSize: 0.25,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as TickDetails,
    MES: {
      id: '2',
      ticker: 'MES',
      tickValue: 1.25,
      tickSize: 0.25,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as TickDetails,
  }

  it('should calculate ticks and points correctly for a known ticker', () => {
    const trade = {
      id: 'trade-1',
      instrument: 'ESZ4',
      pnl: 125,
      quantity: 1,
    } as unknown as Trade

    const result = calculateTicksAndPoints(trade, mockTickDetails)

    expect(result).toEqual({
      ticks: 10, // 125 / 12.5 = 10
      points: 2.5, // 10 * 0.25 = 2.5
      tickValue: 12.5,
      tickSize: 0.25,
    })
  })

  it('should use default values if no matching ticker is found', () => {
    const trade = {
      id: 'trade-2',
      instrument: 'UNKNOWN',
      pnl: 100,
      quantity: 1,
    } as unknown as Trade

    const result = calculateTicksAndPoints(trade, mockTickDetails)

    expect(result).toEqual({
      ticks: 100, // 100 / 1 = 100
      points: 1, // 100 * 0.01 = 1
      tickValue: 1,
      tickSize: 0.01,
    })
  })

  it('should prioritize the longest matching ticker', () => {
    const trade = {
      id: 'trade-3',
      instrument: 'MESZ4', // Matches "MES" (length 3) and conceptually "ES" (length 2) if looking for substring
      pnl: 12.5,
      quantity: 1,
    } as unknown as Trade

    // Ensure "MES" is picked over "ES"
    const result = calculateTicksAndPoints(trade, mockTickDetails)

    expect(result).toEqual({
      ticks: 10, // 12.5 / 1.25 = 10
      points: 2.5, // 10 * 0.25 = 2.5
      tickValue: 1.25,
      tickSize: 0.25,
    })
  })

  it('should handle zero PnL correctly', () => {
    const trade = {
      id: 'trade-4',
      instrument: 'ESZ4',
      pnl: 0,
      quantity: 1,
    } as unknown as Trade

    const result = calculateTicksAndPoints(trade, mockTickDetails)

    expect(result).toEqual({
      ticks: 0,
      points: 0,
      tickValue: 12.5,
      tickSize: 0.25,
    })
  })

  it('should handle rounding for non-integer ticks', () => {
    // PnL per contract = 15.
    // Tick value = 12.5.
    // Ticks = 15 / 12.5 = 1.2 -> round to 1.
    const trade = {
      id: 'trade-5',
      instrument: 'ESZ4',
      pnl: 15,
      quantity: 1,
    } as unknown as Trade

    const result = calculateTicksAndPoints(trade, mockTickDetails)

    expect(result.ticks).toBe(1)
    expect(result.points).toBe(0.25) // 1 * 0.25
  })

  it('should round points to 2 decimal places', () => {
    // Use defaults: tickValue=1, tickSize=0.01
    // PnL = 10.555, Qty = 1
    // Ticks = 11 (10.555 / 1 = 10.555 -> 11)
    // Points = 11 * 0.01 = 0.11

    const trade = {
      id: 'trade-6',
      instrument: 'UNKNOWN',
      pnl: 10.555,
      quantity: 1,
    } as unknown as Trade

    const result = calculateTicksAndPoints(trade, mockTickDetails)
    expect(result.ticks).toBe(11)
    expect(result.points).toBe(0.11)
  })

  it('should handle string values in tickDetails', () => {
    const stringTickDetails = {
      NQ: {
        id: '3',
        ticker: 'NQ',
        tickValue: '20', // String
        tickSize: '0.25', // String
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as TickDetails,
    }

    const trade = {
      id: 'trade-7',
      instrument: 'NQZ4',
      pnl: 100,
      quantity: 1,
    } as unknown as Trade

    const result = calculateTicksAndPoints(trade, stringTickDetails)

    expect(result).toEqual({
      ticks: 5, // 100 / 20 = 5
      points: 1.25, // 5 * 0.25 = 1.25
      tickValue: 20,
      tickSize: 0.25,
    })
  })
})

describe('calculateTicksAndPointsForTrades', () => {
  const mockTickDetails: Record<string, TickDetails> = {
    ES: {
      id: '1',
      ticker: 'ES',
      tickValue: 12.5,
      tickSize: 0.25,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as TickDetails,
  }

  it('should calculate for multiple trades', () => {
    const trades = [
      { id: 't1', instrument: 'ESZ4', pnl: 125, quantity: 1 },
      { id: 't2', instrument: 'ESZ4', pnl: 250, quantity: 1 },
    ] as unknown as Trade[]

    const result = calculateTicksAndPointsForTrades(trades, mockTickDetails)

    expect(result['t1']).toEqual({
      ticks: 10,
      points: 2.5,
      tickValue: 12.5,
      tickSize: 0.25,
    })
    expect(result['t2']).toEqual({
      ticks: 20,
      points: 5.0,
      tickValue: 12.5,
      tickSize: 0.25,
    })
  })

  it('should handle empty array', () => {
    const result = calculateTicksAndPointsForTrades([], mockTickDetails)
    expect(result).toEqual({})
  })
})

describe('calculateTicksAndPointsForGroupedTrade', () => {
  const mockTickDetails: Record<string, TickDetails> = {
    ES: {
      id: '1',
      ticker: 'ES',
      tickValue: 12.5,
      tickSize: 0.25,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as TickDetails,
  }

  it('should sum up ticks and points for grouped trades', () => {
    const groupedTrade = {
      trades: [
        { id: 't1', instrument: 'ESZ4', pnl: 125, quantity: 1 }, // 10 ticks, 2.5 points
        { id: 't2', instrument: 'ESZ4', pnl: 250, quantity: 1 }, // 20 ticks, 5.0 points
      ],
    }

    const result = calculateTicksAndPointsForGroupedTrade(groupedTrade, mockTickDetails)

    expect(result).toEqual({
      ticks: 30, // 10 + 20
      points: 7.5, // 2.5 + 5.0
      tickValue: 1, // Default for grouped
      tickSize: 0.01, // Default for grouped
    })
  })

  it('should calculate normally for single trade (no trades array)', () => {
    const singleTrade = {
      id: 't1',
      instrument: 'ESZ4',
      pnl: 125,
      quantity: 1,
    } as unknown as Trade

    const result = calculateTicksAndPointsForGroupedTrade(singleTrade, mockTickDetails)

    expect(result).toEqual({
      ticks: 10,
      points: 2.5,
      tickValue: 12.5,
      tickSize: 0.25,
    })
  })

  it('should calculate normally for single trade (empty trades array)', () => {
    // This case is tricky. The code checks `if (groupedTrade.trades && groupedTrade.trades.length > 0)`.
    // If `trades` is empty, it falls through to `calculateTicksAndPoints(groupedTrade, tickDetails)`.
    // `groupedTrade` is passed as `Trade`.

    const tradeWithEmptyArray = {
      id: 't1',
      instrument: 'ESZ4',
      pnl: 125,
      quantity: 1,
      trades: [],
    }

    const result = calculateTicksAndPointsForGroupedTrade(tradeWithEmptyArray, mockTickDetails)

    expect(result).toEqual({
      ticks: 10,
      points: 2.5,
      tickValue: 12.5,
      tickSize: 0.25,
    })
  })
})

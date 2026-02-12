
import { describe, it, expect } from 'vitest'
import { calculateTicksAndPoints, getSortedTickers } from '../lib/tick-calculations'

// Mock types
type Trade = {
  id: string
  instrument: string
  pnl: number
  quantity: number
  [key: string]: any
}

type TickDetails = {
  tickValue: number
  tickSize: number
  [key: string]: any
}

describe('Tick Calculations', () => {
  const tickDetails: Record<string, TickDetails> = {
    'ES': { tickValue: 50, tickSize: 0.25 },
    'MES': { tickValue: 5, tickSize: 0.25 },
    'NQ': { tickValue: 20, tickSize: 0.25 },
    'MNQ': { tickValue: 2, tickSize: 0.25 }
  }

  it('sorts tickers correctly (longest first)', () => {
    const sorted = getSortedTickers(tickDetails as any)
    expect(sorted).toEqual(['MES', 'MNQ', 'ES', 'NQ'])
  })

  it('calculates correctly with sortedTickers', () => {
    const trade: Trade = {
      id: '1',
      instrument: 'MNQZ4',
      pnl: 100,
      quantity: 1,
    }
    const sortedTickers = getSortedTickers(tickDetails as any)
    const result = calculateTicksAndPoints(trade as any, tickDetails as any, sortedTickers)

    // MNQ: tickValue=2, pnl=100 -> ticks=50
    expect(result.ticks).toBe(50)
    expect(result.points).toBe(12.5) // 50 * 0.25
    expect(result.tickValue).toBe(2)
  })

  it('calculates correctly without sortedTickers', () => {
    const trade: Trade = {
      id: '1',
      instrument: 'MNQZ4',
      pnl: 100,
      quantity: 1,
    }
    const result = calculateTicksAndPoints(trade as any, tickDetails as any)

    // MNQ: tickValue=2, pnl=100 -> ticks=50
    expect(result.ticks).toBe(50)
    expect(result.points).toBe(12.5)
    expect(result.tickValue).toBe(2)
  })
})

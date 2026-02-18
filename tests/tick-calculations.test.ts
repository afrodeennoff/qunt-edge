/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe } from 'vitest'
import { calculateTicksAndPoints } from '../lib/tick-calculations'
import type { Trade, TickDetails } from '@/prisma/generated/prisma'

// Mock data setup
const mockTickDetails: Record<string, TickDetails> = {
  'NQ': { id: '1', ticker: 'NQ', tickSize: 0.25, tickValue: 5, contractSize: 20, createdAt: new Date(), updatedAt: new Date() } as any,
  'ES': { id: '2', ticker: 'ES', tickSize: 0.25, tickValue: 12.5, contractSize: 50, createdAt: new Date(), updatedAt: new Date() } as any,
  'GC': { id: '3', ticker: 'GC', tickSize: 0.1, tickValue: 10, contractSize: 100, createdAt: new Date(), updatedAt: new Date() } as any,
}

// Add more dummy tickers to simulate a larger configuration
for (let i = 0; i < 500; i++) {
  mockTickDetails[`DUMMY${i}`] = {
    id: `dummy-${i}`,
    ticker: `DUMMY${i}`,
    tickSize: 1,
    tickValue: 1,
    contractSize: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  } as any
}

const mockTrade: Trade = {
  id: 'trade-1',
  instrument: 'NQH4', // Matches NQ
  entryDate: new Date(),
  closeDate: new Date(),
  entryPrice: 100,
  closePrice: 101,
  quantity: 1,
  pnl: 20, // Logic: pnlPerContract = 20 / 1 = 20. ticks = 20 / tickValue(5) = 4. points = 4 * 0.25 = 1.
  commission: 0,
  userId: 'user-1',
  accountId: 'acc-1',
  accountNumber: 'acc-num-1',
  status: 'CLOSED',
  side: 'LONG',
  // other required fields mocked as any or minimal
} as any

describe('calculateTicksAndPoints', () => {
  test('calculates correctly for NQ', () => {
    const result = calculateTicksAndPoints(mockTrade, mockTickDetails)

    // pnlPerContract = 20 / 1 = 20
    // tickValue = 5
    // ticks = 20 / 5 = 4
    // tickSize = 0.25
    // points = 4 * 0.25 = 1.0

    expect(result.ticks).toBe(4)
    expect(result.points).toBe(1.0)
    expect(result.tickValue).toBe(5)
    expect(result.tickSize).toBe(0.25)
  })

  test('handles unknown ticker gracefully', () => {
    const unknownTrade = { ...mockTrade, instrument: 'UNKNOWN' }
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

  test('benchmark performance', () => {
    const iterations = 50000
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      calculateTicksAndPoints(mockTrade, mockTickDetails)
    }

    const end = performance.now()
    const duration = end - start
    console.log(`Benchmark (50k iterations): ${duration.toFixed(2)}ms`)

    // Without optimization, sorting 500 keys 50k times is expensive.
    // Expectation: this test passes, but logs time.
    expect(duration).toBeGreaterThan(0)
  })
})

import { describe, expect, it } from 'vitest'
import { normalizeTrade, normalizeTrades, tradeNetPnl } from '@/lib/ai/trade-normalization'
import type { SerializedTrade } from '@/server/database'

function createSerializedTrade(overrides: Partial<SerializedTrade> = {}): SerializedTrade {
  return {
    id: 'test-id',
    userId: 'test-user',
    accountNumber: 'test-account',
    instrument: 'test-instrument',
    side: 'Long',
    quantity: '1',
    entryPrice: '100',
    closePrice: '110',
    pnl: '10',
    commission: '1',
    entryDate: '2023-01-01T10:00:00Z',
    closeDate: '2023-01-01T11:00:00Z',
    timeInPosition: '3600',
    entryId: null,
    closeId: null,
    comment: null,
    tags: [],
    groupId: null,
    imageBase64: null,
    imageBase64Second: null,
    images: [],
    videoUrl: null,
    createdAt: new Date('2023-01-01T10:00:00Z'),
    ...overrides,
  } as SerializedTrade
}

describe('normalizeTrade', () => {
  it('correctly normalizes a valid trade', () => {
    const trade = createSerializedTrade({
      id: 't1',
      accountNumber: 'A1',
      userId: 'u1',
      instrument: 'AAPL',
      side: 'Long',
      quantity: '10',
      entryPrice: '150.50',
      closePrice: '155.00',
      pnl: '45.00',
      commission: '2.50',
      entryDate: '2023-01-01T10:00:00Z',
      closeDate: '2023-01-01T12:00:00Z',
      timeInPosition: '7200',
    })

    const normalized = normalizeTrade(trade)

    expect(normalized).toEqual({
      id: 't1',
      accountNumber: 'A1',
      userId: 'u1',
      instrument: 'AAPL',
      side: 'Long',
      quantity: 10,
      entryPrice: 150.50,
      closePrice: 155.00,
      pnl: 45.00,
      commission: 2.50,
      entryDate: new Date('2023-01-01T10:00:00Z'),
      closeDate: new Date('2023-01-01T12:00:00Z'),
      timeInPosition: 7200,
    })
  })

  it('handles null closeDate', () => {
    const trade = createSerializedTrade({
      closeDate: null,
    })

    const normalized = normalizeTrade(trade)

    expect(normalized.closeDate).toBeNull()
  })

  it('handles empty strings or invalid numbers by falling back to 0', () => {
    const trade = createSerializedTrade({
      quantity: '',
      entryPrice: 'invalid',
      closePrice: undefined as unknown as string, // Force undefined
      pnl: null as unknown as string, // Force null
      commission: 'NaN',
      timeInPosition: ' ',
    })

    const normalized = normalizeTrade(trade)

    expect(normalized.quantity).toBe(0)
    expect(normalized.entryPrice).toBe(0)
    expect(normalized.closePrice).toBe(0)
    expect(normalized.pnl).toBe(0)
    expect(normalized.commission).toBe(0)
    expect(normalized.timeInPosition).toBe(0)
  })

  it('handles invalid dates by falling back to epoch or null', () => {
    const trade = createSerializedTrade({
      entryDate: 'invalid-date',
      closeDate: 'another-invalid-date',
    })

    const normalized = normalizeTrade(trade)

    // normalizeTrade implementation uses toUtcDate(entryDate) || new Date(0)
    expect(normalized.entryDate).toEqual(new Date(0))
    // normalizeTrade uses toUtcDate(closeDate), which returns null for invalid dates
    expect(normalized.closeDate).toBeNull()
  })
})

describe('normalizeTrades', () => {
  it('normalizes an array of trades', () => {
    const trades = [
      createSerializedTrade({ id: 't1', pnl: '10' }),
      createSerializedTrade({ id: 't2', pnl: '20' }),
    ]

    const normalized = normalizeTrades(trades)

    expect(normalized).toHaveLength(2)
    expect(normalized[0].id).toBe('t1')
    expect(normalized[0].pnl).toBe(10)
    expect(normalized[1].id).toBe('t2')
    expect(normalized[1].pnl).toBe(20)
  })

  it('returns empty array for empty input', () => {
    const normalized = normalizeTrades([])
    expect(normalized).toEqual([])
  })
})

describe('tradeNetPnl', () => {
  it('calculates net pnl correctly', () => {
    const trade = {
      pnl: 100,
      commission: 5,
    }

    const netPnl = tradeNetPnl(trade)
    expect(netPnl).toBe(95)
  })

  it('handles negative pnl', () => {
    const trade = {
      pnl: -50,
      commission: 5,
    }

    const netPnl = tradeNetPnl(trade)
    expect(netPnl).toBe(-55)
  })

  it('handles zero commission', () => {
    const trade = {
      pnl: 100,
      commission: 0,
    }

    const netPnl = tradeNetPnl(trade)
    expect(netPnl).toBe(100)
  })
})

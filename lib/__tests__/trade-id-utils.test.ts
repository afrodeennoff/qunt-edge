import { describe, it, expect } from 'vitest'
import { generateDeterministicTradeId } from '../trade-id-utils'

describe('generateDeterministicTradeId', () => {
  const baseTradeData = {
    accountNumber: 'ACC123',
    entryId: 'ENTRY1',
    closeId: 'CLOSE1',
    instrument: 'ES',
    entryPrice: '4500.00',
    closePrice: '4510.00',
    entryDate: '2023-01-01T10:00:00Z',
    closeDate: '2023-01-01T10:15:00Z',
    quantity: 1,
    side: 'Buy',
    userId: 'user_123'
  }

  it('should generate a deterministic ID for the same input', () => {
    const id1 = generateDeterministicTradeId(baseTradeData)
    const id2 = generateDeterministicTradeId({ ...baseTradeData })

    expect(id1).toBe(id2)
    expect(typeof id1).toBe('string')
    expect(id1.length).toBe(36) // UUID length
  })

  it('should generate different IDs when any field changes', () => {
    const originalId = generateDeterministicTradeId(baseTradeData)

    const variations = [
      { ...baseTradeData, accountNumber: 'ACC124' },
      { ...baseTradeData, entryId: 'ENTRY2' },
      { ...baseTradeData, closeId: 'CLOSE2' },
      { ...baseTradeData, instrument: 'NQ' },
      { ...baseTradeData, entryPrice: '4501.00' },
      { ...baseTradeData, closePrice: '4511.00' },
      { ...baseTradeData, entryDate: '2023-01-01T10:00:01Z' },
      { ...baseTradeData, closeDate: '2023-01-01T10:15:01Z' },
      { ...baseTradeData, quantity: 2 },
      { ...baseTradeData, side: 'Sell' },
      { ...baseTradeData, userId: 'user_456' }
    ]

    variations.forEach(variation => {
      expect(generateDeterministicTradeId(variation)).not.toBe(originalId)
    })
  })

  it('should return a valid UUID-like format (8-4-4-4-12 hex)', () => {
    const id = generateDeterministicTradeId(baseTradeData)
    // Regex for 8-4-4-4-12 hex characters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    expect(id).toMatch(uuidRegex)
  })

  it('should handle empty strings in fields', () => {
    const emptyData = {
      accountNumber: '',
      entryId: '',
      closeId: '',
      instrument: '',
      entryPrice: '',
      closePrice: '',
      entryDate: '',
      closeDate: '',
      quantity: 0,
      side: '',
      userId: ''
    }

    const id = generateDeterministicTradeId(emptyData)
    expect(id).toBeDefined()
    // It should still produce a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    expect(id).toMatch(uuidRegex)

    // Should be deterministic even with empty fields
    const id2 = generateDeterministicTradeId({ ...emptyData })
    expect(id).toBe(id2)
  })

  it('should handle special characters in strings', () => {
    const specialData = {
      ...baseTradeData,
      instrument: 'ES #1',
      userId: 'user@example.com'
    }

    const id = generateDeterministicTradeId(specialData)
    expect(id).toBeDefined()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    expect(id).toMatch(uuidRegex)
  })
})

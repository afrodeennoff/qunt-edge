import { describe, expect, it } from 'vitest'
import { validateTradeData } from '../../lib/validation-schemas'

describe('validateTradeData', () => {
  const validTrade = {
    accountNumber: 'ACC-123',
    instrument: 'NQ',
    entryDate: '2023-01-01T10:00:00Z',
    closeDate: '2023-01-01T11:00:00Z',
    entryPrice: 10000,
    closePrice: 10050,
    quantity: 1,
    side: 'Long',
    pnl: 50,
  }

  it('validates a correct minimal trade object', () => {
    const result = validateTradeData(validTrade)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validTrade)
    }
  })

  it('validates a correct maximal trade object', () => {
    const fullTrade = {
      ...validTrade,
      timeInPosition: 3600,
      commission: 5,
      tags: ['strategy-A'],
      comment: 'Good trade',
      videoUrl: 'https://example.com/video',
      entryId: 'entry-1',
      closeId: 'close-1',
    }
    const result = validateTradeData(fullTrade)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(fullTrade)
    }
  })

  it('validates different casing for side', () => {
    const trade = { ...validTrade, side: 'long' }
    const result = validateTradeData(trade)
    expect(result.success).toBe(true)
  })

  it('fails when required fields are missing', () => {
    const invalidTrade = { ...validTrade }
    // @ts-expect-error
    delete invalidTrade.accountNumber
    const result = validateTradeData(invalidTrade)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('accountNumber')
    }
  })

  it('fails when field types are incorrect', () => {
    const invalidTrade = { ...validTrade, entryPrice: '10000' }
    const result = validateTradeData(invalidTrade)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('entryPrice')
      expect(result.error.issues[0].code).toBe('invalid_type')
    }
  })

  it('fails when numeric values are invalid (e.g. negative quantity)', () => {
    const invalidTrade = { ...validTrade, quantity: -1 }
    const result = validateTradeData(invalidTrade)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('quantity')
    }
  })

  it('fails when date strings are invalid', () => {
    const invalidTrade = { ...validTrade, entryDate: 'invalid-date' }
    const result = validateTradeData(invalidTrade)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('entryDate')
      // Accept either 'invalid_string' (Zod v3) or 'invalid_format' (observed behavior)
      expect(['invalid_string', 'invalid_format']).toContain(result.error.issues[0].code)
    }
  })

  it('fails when accountNumber format is invalid', () => {
    const invalidTrade = { ...validTrade, accountNumber: 'ACC@123' } // Invalid char '@'
    const result = validateTradeData(invalidTrade)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('accountNumber')
    }
  })

  it('fails when instrument is empty', () => {
    const invalidTrade = { ...validTrade, instrument: '' }
    const result = validateTradeData(invalidTrade)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('instrument')
    }
  })

  it('fails when videoUrl is not a valid URL', () => {
    const invalidTrade = { ...validTrade, videoUrl: 'not-a-url' }
    const result = validateTradeData(invalidTrade)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('videoUrl')
    }
  })
})

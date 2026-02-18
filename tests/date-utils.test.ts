import { describe, expect, it } from 'vitest'
import { isChronologicalRange, normalizeToUtcTimestamp, toValidDate } from '@/lib/date-utils'

describe('date-utils', () => {
  it('normalizes timestamps to UTC +00:00 format', () => {
    expect(normalizeToUtcTimestamp('2026-02-09T10:00:00-05:00')).toBe('2026-02-09T15:00:00.000+00:00')
  })

  it('rejects invalid timestamps', () => {
    expect(() => normalizeToUtcTimestamp('not-a-date')).toThrow('Invalid timestamp')
  })

  it('checks chronological date ranges', () => {
    expect(isChronologicalRange('2026-02-09T10:00:00Z', '2026-02-09T10:05:00Z')).toBe(true)
    expect(isChronologicalRange('2026-02-09T10:05:00Z', '2026-02-09T10:00:00Z')).toBe(false)
  })

  describe('toValidDate', () => {
    it('returns Date object for valid date string', () => {
      const dateStr = '2024-01-01T00:00:00.000Z'
      const result = toValidDate(dateStr)
      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toBe(dateStr)
    })

    it('returns Date object for valid Date instance', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const result = toValidDate(date)
      expect(result).toBeInstanceOf(Date)
      expect(result).toBe(date)
    })

    it('returns null for invalid date string', () => {
      expect(toValidDate('invalid-date')).toBeNull()
    })

    it('returns null for null', () => {
      expect(toValidDate(null)).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(toValidDate(undefined)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(toValidDate('')).toBeNull()
    })
  })
})

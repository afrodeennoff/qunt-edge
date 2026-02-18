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
    it('returns Date object for valid ISO string', () => {
      const date = toValidDate('2023-01-01T00:00:00Z')
      expect(date).toBeInstanceOf(Date)
      expect(date?.toISOString()).toBe('2023-01-01T00:00:00.000Z')
    })

    it('returns Date object for Date instance', () => {
      const input = new Date('2023-01-01')
      const output = toValidDate(input)
      expect(output).toBe(input)
    })

    it('returns null for null', () => {
      expect(toValidDate(null)).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(toValidDate(undefined)).toBeNull()
    })

    it('returns null for invalid date string', () => {
      expect(toValidDate('invalid-date')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(toValidDate('')).toBeNull()
    })
  })
})

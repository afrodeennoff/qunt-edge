import { describe, expect, it } from 'vitest'
import { isChronologicalRange, normalizeToUtcTimestamp } from '@/lib/date-utils'

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
})

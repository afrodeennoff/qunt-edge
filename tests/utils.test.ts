import { describe, expect, it } from 'vitest'
import { toFiniteNumber } from '@/lib/utils'

describe('toFiniteNumber', () => {
  it('returns the number if it is finite', () => {
    expect(toFiniteNumber(10)).toBe(10)
    expect(toFiniteNumber(-5.5)).toBe(-5.5)
    expect(toFiniteNumber(0)).toBe(0)
  })

  it('returns fallback if value is Infinity or NaN', () => {
    expect(toFiniteNumber(Infinity)).toBe(0)
    expect(toFiniteNumber(-Infinity)).toBe(0)
    expect(toFiniteNumber(NaN)).toBe(0)
  })

  it('parses numeric strings correctly', () => {
    expect(toFiniteNumber('123')).toBe(123)
    expect(toFiniteNumber('-45.67')).toBe(-45.67)
    expect(toFiniteNumber('0')).toBe(0)
    expect(toFiniteNumber('1e5')).toBe(100000)
    expect(toFiniteNumber('  123  ')).toBe(123)
  })

  it('returns fallback for non-numeric strings', () => {
    expect(toFiniteNumber('abc')).toBe(0)
    expect(toFiniteNumber('123a')).toBe(0)
  })

  it('returns fallback for other types', () => {
    expect(toFiniteNumber(null)).toBe(0)
    expect(toFiniteNumber(undefined)).toBe(0)
    expect(toFiniteNumber({})).toBe(0)
    expect(toFiniteNumber([])).toBe(0)
    expect(toFiniteNumber(true)).toBe(0)
  })

  it('uses provided fallback value', () => {
    expect(toFiniteNumber(Infinity, 99)).toBe(99)
    expect(toFiniteNumber(NaN, -1)).toBe(-1)
    expect(toFiniteNumber('invalid', 42)).toBe(42)
    expect(toFiniteNumber(null, 10)).toBe(10)
    expect(toFiniteNumber(undefined, 5)).toBe(5)
  })

  it('treats empty string as 0 (Number behavior)', () => {
     expect(toFiniteNumber('')).toBe(0)
     // Since Number('') is 0, which is finite, it returns the parsed value (0), ignoring fallback.
     expect(toFiniteNumber('', 100)).toBe(0)
  })
})

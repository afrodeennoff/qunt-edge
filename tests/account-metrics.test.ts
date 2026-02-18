import { describe, expect, it } from 'vitest'
import { getAccountStartDate } from '@/lib/account-metrics'
import { Account } from '@/lib/data-types'

describe('getAccountStartDate', () => {
  it('returns earliest trade entry date', () => {
    const account: Partial<Account> = {
      trades: [
        { entryDate: new Date('2024-01-05') } as any,
        { entryDate: new Date('2024-01-01') } as any,
        { entryDate: new Date('2024-01-03') } as any,
      ]
    }
    const result = getAccountStartDate(account as Account)
    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toContain('2024-01-01')
  })

  it('returns earliest daily metric date if no trades', () => {
    const account: Partial<Account> = {
      trades: [],
      dailyMetrics: [
        { date: new Date('2024-02-05') } as any,
        { date: new Date('2024-02-01') } as any,
      ]
    }
    const result = getAccountStartDate(account as Account)
    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toContain('2024-02-01')
  })

  it('returns earliest trade date even if daily metrics exist (priority to trades as per logic)', () => {
      // The logic: if (tradeDates.length > 0) return tradeDates[0]
      // So trades take precedence.
    const account: Partial<Account> = {
      trades: [
        { entryDate: new Date('2024-01-10') } as any,
      ],
      dailyMetrics: [
        { date: new Date('2024-01-01') } as any,
      ]
    }
    const result = getAccountStartDate(account as Account)
    expect(result?.toISOString()).toContain('2024-01-10')
  })

  it('returns null if no trades and no daily metrics', () => {
    const account: Partial<Account> = {
      trades: [],
      dailyMetrics: []
    }
    const result = getAccountStartDate(account as Account)
    expect(result).toBeNull()
  })

  it('returns null if trades and daily metrics are undefined', () => {
    const account: Partial<Account> = {}
    const result = getAccountStartDate(account as Account)
    expect(result).toBeNull()
  })

  it('ignores invalid dates in trades', () => {
    const account: Partial<Account> = {
      trades: [
        { entryDate: 'invalid' } as any,
        { entryDate: new Date('2024-03-01') } as any,
      ]
    }
    const result = getAccountStartDate(account as Account)
    expect(result?.toISOString()).toContain('2024-03-01')
  })
})

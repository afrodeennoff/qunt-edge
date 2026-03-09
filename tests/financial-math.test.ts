import { describe, expect, it } from 'vitest'
import { addMoney, netPnl, toMoneyNumber } from '@/lib/financial-math'

describe('financial-math', () => {
  it('avoids floating-point drift when summing money values', () => {
    const result = addMoney(0.1, 0.2, 0.3)
    expect(toMoneyNumber(result, 2)).toBe(0.6)
  })

  it('computes net PnL using decimal-safe subtraction', () => {
    const result = netPnl('100.15', '0.25')
    expect(toMoneyNumber(result, 2)).toBe(99.9)
  })
})

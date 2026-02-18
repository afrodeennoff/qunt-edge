import { describe, expect, it } from 'vitest'
import { calculatePnL, PnLCalculationInput } from '@/lib/domain/pnl-calculator'
import Decimal from 'decimal.js'

describe('calculatePnL', () => {
  it('should calculate LONG PnL correctly (profitable)', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 110,
      quantity: 2,
      direction: 'LONG',
      fees: 0,
      commissions: 0,
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toNumber()).toBe(20) // (110 - 100) * 2 = 20
    expect(result.netPnL.toNumber()).toBe(20)
    expect(result.totalFees.toNumber()).toBe(0)
    expect(result.pnlPerContract.toNumber()).toBe(10) // 20 / 2 = 10
    expect(result.pnlPercentage.toNumber()).toBe(10) // (20 / (100 * 2)) * 100 = 10%
  })

  it('should calculate LONG PnL correctly (losing)', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 90,
      quantity: 2,
      direction: 'LONG',
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toNumber()).toBe(-20) // (90 - 100) * 2 = -20
    expect(result.netPnL.toNumber()).toBe(-20)
    expect(result.pnlPercentage.toNumber()).toBe(-10)
  })

  it('should calculate SHORT PnL correctly (profitable)', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 90,
      quantity: 2,
      direction: 'SHORT',
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toNumber()).toBe(20) // (100 - 90) * 2 = 20
    expect(result.netPnL.toNumber()).toBe(20)
  })

  it('should calculate SHORT PnL correctly (losing)', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 110,
      quantity: 2,
      direction: 'SHORT',
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toNumber()).toBe(-20) // (100 - 110) * 2 = -20
    expect(result.netPnL.toNumber()).toBe(-20)
  })

  it('should handle fees and commissions', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 110,
      quantity: 1,
      direction: 'LONG',
      fees: 1.5,
      commissions: 2.5,
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toNumber()).toBe(10) // (110 - 100) * 1 = 10
    expect(result.totalFees.toNumber()).toBe(4) // 1.5 + 2.5 = 4
    expect(result.netPnL.toNumber()).toBe(6) // 10 - 4 = 6
    expect(result.pnlPerContract.toNumber()).toBe(6) // 6 / 1 = 6
  })

  it('should handle string inputs for precision', () => {
    // 0.1 + 0.2 usually equals 0.30000000000000004 in floating point
    // We test that calculations use Decimal correctly
    const input: PnLCalculationInput = {
      entryPrice: '0.1',
      exitPrice: '0.3',
      quantity: '1',
      direction: 'LONG',
      fees: '0.01',
      commissions: '0.01',
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toString()).toBe('0.2') // 0.3 - 0.1 = 0.2
    expect(result.totalFees.toString()).toBe('0.02')
    expect(result.netPnL.toString()).toBe('0.18') // 0.2 - 0.02 = 0.18
  })

  it('should handle zero quantity', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 110,
      quantity: 0,
      direction: 'LONG',
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toNumber()).toBe(0)
    expect(result.netPnL.toNumber()).toBe(0)
    expect(result.pnlPerContract.toNumber()).toBe(0)
    expect(result.pnlPercentage.toNumber()).toBe(0)
  })

  it('should handle large numbers', () => {
    const input: PnLCalculationInput = {
      entryPrice: '1000000000',
      exitPrice: '1000000010',
      quantity: '1000',
      direction: 'LONG',
    }

    const result = calculatePnL(input)

    expect(result.grossPnL.toString()).toBe('10000') // 10 * 1000
  })

  it('should return 0 pnlPercentage if entryPrice * quantity is 0', () => {
      // Case where entryPrice is 0 (unlikely but possible in some contexts or errors)
      const input: PnLCalculationInput = {
        entryPrice: 0,
        exitPrice: 10,
        quantity: 1,
        direction: 'LONG',
      }

      const result = calculatePnL(input)
      expect(result.pnlPercentage.toNumber()).toBe(0)
  })
})

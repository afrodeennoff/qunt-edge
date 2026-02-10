import { describe, expect, it } from 'vitest';
import { calculatePnL, PnLCalculationInput } from '@/lib/domain/pnl-calculator';
import Decimal from 'decimal.js';

describe('calculatePnL', () => {
  it('calculates profit for a LONG position', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 120,
      quantity: 10,
      direction: 'LONG',
      fees: 0,
      commissions: 0,
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(200); // (120 - 100) * 10 = 200
    expect(result.netPnL.toNumber()).toBe(200);
    expect(result.totalFees.toNumber()).toBe(0);
    expect(result.pnlPerContract.toNumber()).toBe(20); // 200 / 10 = 20
    expect(result.pnlPercentage.toNumber()).toBe(20); // (200 / (100 * 10)) * 100 = 20%
  });

  it('calculates loss for a LONG position', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 80,
      quantity: 10,
      direction: 'LONG',
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(-200); // (80 - 100) * 10 = -200
    expect(result.netPnL.toNumber()).toBe(-200);
    expect(result.pnlPerContract.toNumber()).toBe(-20);
    expect(result.pnlPercentage.toNumber()).toBe(-20);
  });

  it('calculates profit for a SHORT position', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 80,
      quantity: 10,
      direction: 'SHORT',
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(200); // (100 - 80) * 10 = 200
    expect(result.netPnL.toNumber()).toBe(200);
    expect(result.pnlPerContract.toNumber()).toBe(20);
    expect(result.pnlPercentage.toNumber()).toBe(20);
  });

  it('calculates loss for a SHORT position', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 120,
      quantity: 10,
      direction: 'SHORT',
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(-200); // (100 - 120) * 10 = -200
    expect(result.netPnL.toNumber()).toBe(-200);
    expect(result.pnlPerContract.toNumber()).toBe(-20);
    expect(result.pnlPercentage.toNumber()).toBe(-20);
  });

  it('subtracts fees and commissions correctly', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 120,
      quantity: 10,
      direction: 'LONG',
      fees: 5,
      commissions: 10,
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(200);
    expect(result.totalFees.toNumber()).toBe(15);
    expect(result.netPnL.toNumber()).toBe(185); // 200 - 15 = 185
  });

  it('handles zero quantity', () => {
    const input: PnLCalculationInput = {
      entryPrice: 100,
      exitPrice: 120,
      quantity: 0,
      direction: 'LONG',
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(0);
    expect(result.pnlPerContract.toNumber()).toBe(0);
    expect(result.pnlPercentage.toNumber()).toBe(0);
  });

  it('handles zero entry price', () => {
    // This is technically an edge case, maybe not possible in real trading but good to test
    const input: PnLCalculationInput = {
      entryPrice: 0,
      exitPrice: 100,
      quantity: 10,
      direction: 'LONG',
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(1000); // (100 - 0) * 10 = 1000
    expect(result.pnlPercentage.toNumber()).toBe(0); // Should be 0 to avoid division by zero
  });

  it('handles decimal precision correctly', () => {
    const input: PnLCalculationInput = {
      entryPrice: 0.1,
      exitPrice: 0.2,
      quantity: 10,
      direction: 'LONG',
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(1); // (0.2 - 0.1) * 10 = 1
    expect(result.pnlPerContract.toNumber()).toBe(0.1);
  });

  it('handles string inputs correctly', () => {
     const input: PnLCalculationInput = {
      entryPrice: '100.50',
      exitPrice: '120.50',
      quantity: '10',
      direction: 'LONG',
      fees: '5.50',
      commissions: '4.50',
    };

    const result = calculatePnL(input);

    expect(result.grossPnL.toNumber()).toBe(200); // (120.50 - 100.50) * 10 = 200
    expect(result.totalFees.toNumber()).toBe(10); // 5.50 + 4.50 = 10
    expect(result.netPnL.toNumber()).toBe(190); // 200 - 10 = 190
  });
});

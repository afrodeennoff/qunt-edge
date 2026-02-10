import { describe, it, expect } from 'vitest';
import {
  calculateTicksAndPoints,
  calculateTicksAndPointsForTrades,
  calculateTicksAndPointsForGroupedTrade,
} from '../tick-calculations';

// Mocks
const mockTickDetails: any = {
  'ES': {
    id: '1',
    ticker: 'ES',
    tickValue: 12.5,
    tickSize: 0.25,
  },
  'NQ': {
    id: '2',
    ticker: 'NQ',
    tickValue: 20,
    tickSize: 0.25,
  },
  'CL': {
    id: '3',
    ticker: 'CL',
    tickValue: 10,
    tickSize: 0.01,
  },
};

const mockTrade: any = {
  id: 't1',
  instrument: 'ESM2023',
  pnl: 100,
  quantity: 1,
  trades: [],
};

const mockGroupedTrade: any = {
  id: 'g1',
  trades: [
    {
      id: 't1',
      instrument: 'ESM2023',
      pnl: 50,
      quantity: 1,
    },
    {
      id: 't2',
      instrument: 'ESM2023',
      pnl: 75,
      quantity: 1,
    },
  ],
};

describe('tick-calculations', () => {
  it('calculateTicksAndPoints correctly identifies ticker and calculates values', () => {
    const result = calculateTicksAndPoints(mockTrade, mockTickDetails);

    // PnL per contract = 100 / 1 = 100
    // Ticks = 100 / 12.5 = 8
    // Points = 8 * 0.25 = 2.00

    expect(result.ticks).toBe(8);
    expect(result.points).toBe(2);
    expect(result.tickValue).toBe(12.5);
    expect(result.tickSize).toBe(0.25);
  });

  it('calculateTicksAndPoints returns default values when no ticker matches', () => {
    const unknownTrade: any = { ...mockTrade, instrument: 'UNKNOWN' };
    const result = calculateTicksAndPoints(unknownTrade, mockTickDetails);

    // Defaults: tickValue = 1, tickSize = 0.01
    // PnL = 100
    // Ticks = 100 / 1 = 100
    // Points = 100 * 0.01 = 1

    expect(result.ticks).toBe(100);
    expect(result.points).toBe(1);
    expect(result.tickValue).toBe(1);
    expect(result.tickSize).toBe(0.01);
  });

  it('calculateTicksAndPointsForTrades processes multiple trades', () => {
    const trades = [mockTrade, { ...mockTrade, id: 't2', pnl: 200 }];
    const results = calculateTicksAndPointsForTrades(trades, mockTickDetails);

    expect(results['t1'].ticks).toBe(8);
    expect(results['t2'].ticks).toBe(16); // 200 / 12.5 = 16
  });

  it('calculateTicksAndPointsForGroupedTrade sums up values correctly', () => {
    const result = calculateTicksAndPointsForGroupedTrade(mockGroupedTrade, mockTickDetails);

    // Trade 1: 50 pnl -> 4 ticks -> 1 point
    // Trade 2: 75 pnl -> 6 ticks -> 1.5 points
    // Total: 10 ticks, 2.5 points

    expect(result.ticks).toBe(10);
    expect(result.points).toBe(2.5);
  });

  it('calculateTicksAndPoints accepts pre-sorted tickers', () => {
    const sortedTickers = Object.keys(mockTickDetails).sort((a, b) => b.length - a.length);
    const result = calculateTicksAndPoints(mockTrade, mockTickDetails, sortedTickers);
    expect(result.ticks).toBe(8);
  });
});

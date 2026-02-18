import { describe, it, expect } from 'vitest';
import { normalizeTradeForClient, normalizeTradesForClient } from '@/lib/data-types';
import Decimal from 'decimal.js';

describe('normalizeTradeForClient', () => {
  it('should normalize a trade with number fields', () => {
    const tradeInput: any = {
      id: '1',
      entryPrice: 100,
      closePrice: 110,
      pnl: 10,
      commission: 2,
      quantity: 1,
      timeInPosition: 60,
      entryDate: new Date('2023-01-01T10:00:00Z'),
      closeDate: new Date('2023-01-01T10:01:00Z'),
      tags: ['tag1'],
      trades: [],
    };

    const result = normalizeTradeForClient(tradeInput);

    expect(result.entryPrice).toBe(100);
    expect(result.closePrice).toBe(110);
    expect(result.pnl).toBe(10);
    expect(result.commission).toBe(2);
    expect(result.quantity).toBe(1);
    expect(result.timeInPosition).toBe(60);
    expect(result.entryDate).toBeInstanceOf(Date);
    expect(result.entryDate.toISOString()).toBe('2023-01-01T10:00:00.000Z');
    expect(result.closeDate).toBeInstanceOf(Date);
    expect(result.closeDate?.toISOString()).toBe('2023-01-01T10:01:00.000Z');
    expect(result.tags).toEqual(['tag1']);
    expect(result.trades).toEqual([]);
  });

  it('should normalize a trade with string fields', () => {
    const tradeInput: any = {
      id: '1',
      entryPrice: '100.5',
      closePrice: '110.5',
      pnl: '10',
      commission: '2.5',
      quantity: '1',
      timeInPosition: '60',
      entryDate: '2023-01-01T10:00:00Z',
      closeDate: '2023-01-01T10:01:00Z',
      tags: ['tag1'],
    };

    const result = normalizeTradeForClient(tradeInput);

    expect(result.entryPrice).toBe(100.5);
    expect(result.closePrice).toBe(110.5);
    expect(result.pnl).toBe(10);
    expect(result.commission).toBe(2.5);
    expect(result.quantity).toBe(1);
    expect(result.timeInPosition).toBe(60);
    expect(result.entryDate).toBeInstanceOf(Date);
    expect(result.entryDate.toISOString()).toBe('2023-01-01T10:00:00.000Z');
    expect(result.closeDate).toBeInstanceOf(Date);
    expect(result.closeDate?.toISOString()).toBe('2023-01-01T10:01:00.000Z');
  });

  it('should normalize a trade with Decimal fields', () => {
    const tradeInput: any = {
      id: '1',
      entryPrice: new Decimal(100.5),
      closePrice: new Decimal(110.5),
      pnl: new Decimal(10),
      commission: new Decimal(2.5),
      quantity: new Decimal(1),
      timeInPosition: new Decimal(60),
      entryDate: new Date('2023-01-01T10:00:00Z'),
    };

    const result = normalizeTradeForClient(tradeInput);

    expect(result.entryPrice).toBe(100.5);
    expect(result.closePrice).toBe(110.5);
    expect(result.pnl).toBe(10);
    expect(result.commission).toBe(2.5);
    expect(result.quantity).toBe(1);
    expect(result.timeInPosition).toBe(60);
  });

  it('should handle null/undefined optional fields', () => {
    const tradeInput: any = {
      id: '1',
      entryPrice: 100,
      pnl: 10,
      quantity: 1,
      entryDate: new Date('2023-01-01T10:00:00Z'),
      closePrice: null,
      commission: undefined,
      closeDate: null,
      timeInPosition: null,
      tags: undefined,
      trades: null,
    };

    const result = normalizeTradeForClient(tradeInput);

    expect(result.closePrice).toBeNull();
    expect(result.commission).toBeNull();
    expect(result.closeDate).toBeNull();
    expect(result.timeInPosition).toBeNull();
    expect(result.tags).toEqual([]);
    expect(result.trades).toEqual([]);
  });

  it('should recursively normalize nested trades', () => {
    const tradeInput: any = {
      id: '1',
      entryPrice: '100',
      pnl: '10',
      quantity: '1',
      entryDate: '2023-01-01T10:00:00Z',
      trades: [
        {
          id: '2',
          entryPrice: '100',
          pnl: '5',
          quantity: '0.5',
          entryDate: '2023-01-01T10:00:00Z',
        },
      ],
    };

    const result = normalizeTradeForClient(tradeInput);

    expect(result.trades).toHaveLength(1);
    expect(result.trades![0].entryPrice).toBe(100);
    expect(result.trades![0].pnl).toBe(5);
    expect(result.trades![0].quantity).toBe(0.5);
    expect(result.trades![0].entryDate).toBeInstanceOf(Date);
  });
});

describe('normalizeTradesForClient', () => {
  it('should normalize an array of trades', () => {
    const tradesInput: any[] = [
      {
        id: '1',
        entryPrice: '100',
        pnl: '10',
        quantity: '1',
        entryDate: '2023-01-01T10:00:00Z',
      },
      {
        id: '2',
        entryPrice: '200',
        pnl: '20',
        quantity: '2',
        entryDate: '2023-01-02T10:00:00Z',
      },
    ];

    const result = normalizeTradesForClient(tradesInput);

    expect(result).toHaveLength(2);
    expect(result[0].entryPrice).toBe(100);
    expect(result[1].entryPrice).toBe(200);
  });
});

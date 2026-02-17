
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSmartInsights } from '@/app/[locale]/dashboard/actions/get-smart-insights';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    trade: {
      findMany: vi.fn(),
    },
    tradeAnalytics: {
      findMany: vi.fn(),
    },
  },
}));

// Mock getDatabaseUserId
vi.mock('@/app/[locale]/(landing)/propfirms/actions/timeframe-utils', () => ({
    Timeframe: {}
}));

describe('getSmartInsights', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return welcome insight if no trades', async () => {
    vi.mocked(prisma.trade.findMany).mockResolvedValue([]);
    vi.mocked(prisma.tradeAnalytics.findMany).mockResolvedValue([]);

    const insights = await getSmartInsights(userId);

    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('welcome');
  });

  it('should return instrument preference insight', async () => {
    const mockTrades: any[] = [
      { id: '1', instrument: 'NQ', pnl: 100, entryDate: new Date(), side: 'BUY' },
      { id: '2', instrument: 'NQ', pnl: 150, entryDate: new Date(), side: 'BUY' },
      { id: '3', instrument: 'ES', pnl: -50, entryDate: new Date(), side: 'SELL' },
    ];
    vi.mocked(prisma.trade.findMany).mockResolvedValue(mockTrades);
    vi.mocked(prisma.tradeAnalytics.findMany).mockResolvedValue([]);

    const insights = await getSmartInsights(userId);

    const instrumentInsight = insights.find(i => i.id === 'fav-instrument');
    expect(instrumentInsight).toBeDefined();
    expect(instrumentInsight?.metric).toBe('NQ');
  });

  it('should return risk alert on consecutive losses', async () => {
    const mockTrades: any[] = [
      { id: '1', instrument: 'NQ', pnl: -100, entryDate: new Date(), side: 'BUY' },
      { id: '2', instrument: 'NQ', pnl: -150, entryDate: new Date(), side: 'BUY' },
      { id: '3', instrument: 'ES', pnl: -50, entryDate: new Date(), side: 'SELL' },
    ];
    vi.mocked(prisma.trade.findMany).mockResolvedValue(mockTrades);
    vi.mocked(prisma.tradeAnalytics.findMany).mockResolvedValue([]);

    const insights = await getSmartInsights(userId);

    const riskInsight = insights.find(i => i.id === 'risk-streak');
    expect(riskInsight).toBeDefined();
    expect(riskInsight?.metric).toBe('-3 Streak');
  });

  it('should return high win rate insight', async () => {
    const mockTrades: any[] = Array(10).fill(null).map((_, i) => ({
      id: `trade-${i}`,
      instrument: 'NQ',
      pnl: i < 8 ? 100 : -50, // 80% win rate
      entryDate: new Date(),
      side: 'BUY'
    }));
    vi.mocked(prisma.trade.findMany).mockResolvedValue(mockTrades);
    vi.mocked(prisma.tradeAnalytics.findMany).mockResolvedValue([]);

    const insights = await getSmartInsights(userId);
    const winRateInsight = insights.find(i => i.id === 'high-winrate');
    expect(winRateInsight).toBeDefined();
    expect(winRateInsight?.title).toBe('High Probability Trader');
  });

  it('should return excellent risk management insight', async () => {
    const mockTrades: any[] = Array(5).fill(null).map((_, i) => ({
      id: `trade-${i}`,
      instrument: 'NQ',
      pnl: 100,
      entryDate: new Date(),
      side: 'BUY'
    }));

    const mockAnalytics: any[] = mockTrades.map(t => ({
      tradeId: t.id,
      riskRewardRatio: 2.5,
      efficiency: 50
    }));

    vi.mocked(prisma.trade.findMany).mockResolvedValue(mockTrades);
    vi.mocked(prisma.tradeAnalytics.findMany).mockResolvedValue(mockAnalytics);

    const insights = await getSmartInsights(userId);
    const rrInsight = insights.find(i => i.id === 'good-rr');
    expect(rrInsight).toBeDefined();
    expect(rrInsight?.title).toBe('Excellent Risk Management');
  });

  it('should return sniper execution insight', async () => {
    const mockTrades: any[] = Array(5).fill(null).map((_, i) => ({
        id: `trade-${i}`,
        instrument: 'NQ',
        pnl: 100,
        entryDate: new Date(),
        side: 'BUY'
    }));

    const mockAnalytics: any[] = mockTrades.map(t => ({
        tradeId: t.id,
        riskRewardRatio: 1.5,
        efficiency: 90
    }));

    vi.mocked(prisma.trade.findMany).mockResolvedValue(mockTrades);
    vi.mocked(prisma.tradeAnalytics.findMany).mockResolvedValue(mockAnalytics);

    const insights = await getSmartInsights(userId);
    const efficiencyInsight = insights.find(i => i.id === 'high-efficiency');
    expect(efficiencyInsight).toBeDefined();
    expect(efficiencyInsight?.title).toBe('Sniper Execution');
  });

});

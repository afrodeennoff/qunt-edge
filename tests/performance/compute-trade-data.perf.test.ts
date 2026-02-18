
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks
const mockPrisma = vi.hoisted(() => ({
  trade: {
    findMany: vi.fn(),
  },
  tradeAnalytics: {
    upsert: vi.fn(),
  },
}));

// Mock fetch for Databento
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
process.env.DATABENTO_API_KEY = 'test-key';
process.env.CRON_SECRET = 'test-secret';

// Mock prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body) => ({ json: async () => body, status: 200 })),
  },
}));

describe('Performance - Compute Trade Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    process.env.DATABENTO_API_KEY = 'test-key';
    process.env.CRON_SECRET = 'test-secret';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should process trades with controlled concurrency', async () => {
    // Dynamic import to ensure env vars are picked up if they are read at top level
    // However, top-level constants are read when the module is evaluated.
    // If the module was already imported (e.g. by another test or transitively), it's cached.
    // We should reset modules.

    vi.resetModules();
    process.env.DATABENTO_API_KEY = 'test-key';
    process.env.CRON_SECRET = 'test-secret';

    const { GET } = await import('../../app/api/cron/compute-trade-data/route');
    const NUM_TRADES = 100;

    // Mock trades
    const trades = Array.from({ length: NUM_TRADES }, (_, i) => ({
      id: `trade-${i}`,
      instrument: 'ES',
      entryPrice: 4000,
      closePrice: 4010,
      entryDate: new Date('2023-01-01T10:00:00Z'),
      closeDate: new Date('2023-01-01T10:10:00Z'),
      side: 'LONG',
      quantity: 1,
    }));

    mockPrisma.trade.findMany.mockResolvedValue(trades);

    // Mock Databento response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          ts_event: new Date('2023-01-01T10:00:00Z').getTime() * 1000000,
          open: 4000000000000,
          high: 4005000000000,
          low: 3995000000000,
          close: 4000000000000,
          volume: 100
        }
      ]),
    });

    // Concurrency tracking
    let currentConcurrent = 0;
    let maxConcurrent = 0;

    mockPrisma.tradeAnalytics.upsert.mockImplementation(async () => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);

      // Simulate DB delay
      await new Promise(resolve => setTimeout(resolve, 50));

      currentConcurrent--;
      return { id: 'analytics-id' };
    });

    // Create request
    const request = new Request('http://localhost/api/cron/compute-trade-data', {
      headers: {
        'authorization': 'Bearer test-secret'
      }
    });

    // Execute
    const responsePromise = GET(request);

    // Advance timers
    await vi.advanceTimersByTimeAsync(2000);

    // Wait for completion
    await responsePromise;

    console.log(`Max concurrent DB writes: ${maxConcurrent}`);

    // Expect max concurrent to be equal to BATCH_SIZE (50)
    expect(maxConcurrent).toBeLessThanOrEqual(50);
  });
});

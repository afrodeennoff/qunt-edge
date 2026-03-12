import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAiTrades, clearTradeAccessCache, type TradeAccessProfile } from '@/lib/ai/trade-access'

// Mock the getAllTradesForAi function
vi.mock('@/lib/ai/get-all-trades', () => ({
  getAllTradesForAi: vi.fn(),
}))

import { getAllTradesForAi } from '@/lib/ai/get-all-trades'

const mockGetAllTradesForAi = getAllTradesForAi as ReturnType<typeof vi.fn>

describe('trade-access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearTradeAccessCache()
  })

  describe('getAiTrades', () => {
    const mockTrades = [
      {
        id: '1',
        userId: 'test',
        accountNumber: '123',
        instrument: 'ES',
        direction: 'LONG',
        entryPrice: '5000',
        closePrice: '5010',
        pnl: '1000',
        commission: '5',
        quantity: '1',
        timeInPosition: '3600',
        entryDate: '2024-01-01T00:00:00Z',
        closeDate: '2024-01-01T01:00:00Z',
        status: 'CLOSED',
        imageBase64: 'base64data1',
        imageBase64Second: 'base64data2',
        videoUrl: 'https://example.com/video',
        comment: 'Test trade',
        groupId: '',
        tags: [],
      },
      {
        id: '2',
        userId: 'test',
        accountNumber: '123',
        instrument: 'NQ',
        direction: 'SHORT',
        entryPrice: '17000',
        closePrice: '16900',
        pnl: '-500',
        commission: '5',
        quantity: '1',
        timeInPosition: '1800',
        entryDate: '2024-01-02T00:00:00Z',
        closeDate: '2024-01-02T00:30:00Z',
        status: 'CLOSED',
        imageBase64: null,
        imageBase64Second: null,
        videoUrl: null,
        comment: null,
        groupId: '',
        tags: [],
      },
    ]

    it('returns summary with aggregate metrics only', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      const result = await getAiTrades({ userId: 'test', profile: 'summary' })

      expect(result.trades).toBeUndefined()
      expect(result.aggregates).toBeDefined()
      expect(result.aggregates?.count).toBe(2)
      expect(result.aggregates?.totalPnl).toBe(500) // 1000 + (-500)
      expect(result.aggregates?.winRate).toBe(50) // 1 win out of 2 = 50%
    })

    it('excludes imageBase64 from analysis profile', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      const result = await getAiTrades({ userId: 'test', profile: 'analysis' })

      expect(result.trades).toBeDefined()
      expect(result.trades?.length).toBe(2)

      // Image fields should be undefined (excluded)
      expect(result.trades?.[0].imageBase64).toBeUndefined()
      expect(result.trades?.[0].imageBase64Second).toBeUndefined()
      
      // Other fields should still be present
      expect(result.trades?.[0].instrument).toBe('ES')
      expect(result.trades?.[0].pnl).toBe('1000')
    })

    it('excludes videoUrl and comment from analysis profile', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      const result = await getAiTrades({ userId: 'test', profile: 'analysis' })

      expect(result.trades?.[0].videoUrl).toBeUndefined()
      expect(result.trades?.[0].comment).toBeUndefined()
    })

    it('excludes imageBase64 from detail profile', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      const result = await getAiTrades({ userId: 'test', profile: 'detail' })

      expect(result.trades).toBeDefined()
      expect(result.trades?.length).toBe(2)

      // Image fields should be excluded from detail profile too
      expect(result.trades?.[0].imageBase64).toBeUndefined()
      expect(result.trades?.[0].imageBase64Second).toBeUndefined()

      // Other fields should be present in detail
      expect(result.trades?.[0].videoUrl).toBe('https://example.com/video')
      expect(result.trades?.[0].comment).toBe('Test trade')
    })

    it('memoizes within same request', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      await getAiTrades({ userId: 'test', profile: 'detail' })
      await getAiTrades({ userId: 'test', profile: 'detail' })
      await getAiTrades({ userId: 'test', profile: 'detail' })

      // Should only fetch once due to memoization
      expect(mockGetAllTradesForAi).toHaveBeenCalledTimes(1)
    })

    it('does not memoize across different profiles', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      await getAiTrades({ userId: 'test', profile: 'summary' })
      await getAiTrades({ userId: 'test', profile: 'detail' })

      // Should fetch twice because different profiles
      expect(mockGetAllTradesForAi).toHaveBeenCalledTimes(2)
    })

    it('does not memoize across different users', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      await getAiTrades({ userId: 'user1', profile: 'detail' })
      await getAiTrades({ userId: 'user2', profile: 'detail' })

      // Should fetch twice because different users
      expect(mockGetAllTradesForAi).toHaveBeenCalledTimes(2)
    })

    it('passes through truncated and dataQualityWarning', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: true,
        fetchedPages: 5,
        dataQualityWarning: 'Analysis is based on a capped subset',
      })

      const result = await getAiTrades({ userId: 'test', profile: 'detail' })

      expect(result.truncated).toBe(true)
      expect(result.fetchedPages).toBe(5)
      expect(result.dataQualityWarning).toBe('Analysis is based on a capped subset')
    })

    it('computes correct aggregates for empty trades', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: [],
        truncated: false,
        fetchedPages: 1,
      })

      const result = await getAiTrades({ userId: 'test', profile: 'summary' })

      expect(result.aggregates).toEqual({
        count: 0,
        totalPnl: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        totalCommission: 0,
      })
    })

    it('computes correct aggregates for all winning trades', async () => {
      const winningTrades = [
        { ...mockTrades[0], pnl: '1000' },
        { ...mockTrades[1], pnl: '500' },
      ]
      mockGetAllTradesForAi.mockResolvedValue({
        trades: winningTrades,
        truncated: false,
        fetchedPages: 1,
      })

      const result = await getAiTrades({ userId: 'test', profile: 'summary' })

      expect(result.aggregates?.winRate).toBe(100)
      expect(result.aggregates?.avgWin).toBe(750)
    })

    it('computes correct aggregates for all losing trades', async () => {
      const losingTrades = [
        { ...mockTrades[0], pnl: '-200' },
        { ...mockTrades[1], pnl: '-300' },
      ]
      mockGetAllTradesForAi.mockResolvedValue({
        trades: losingTrades,
        truncated: false,
        fetchedPages: 1,
      })

      const result = await getAiTrades({ userId: 'test', profile: 'summary' })

      expect(result.aggregates?.winRate).toBe(0)
      expect(result.aggregates?.avgLoss).toBe(250)
    })

    it('handles forceRefresh option', async () => {
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades,
        truncated: false,
        fetchedPages: 1,
      })

      await getAiTrades({ userId: 'test', profile: 'detail', forceRefresh: false })
      await getAiTrades({ userId: 'test', profile: 'detail', forceRefresh: true })

      // Second call with forceRefresh should not use cache
      expect(mockGetAllTradesForAi).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearTradeAccessCache', () => {
    it('clears memoization cache', async () => {
      const mockTrades = [{}]
      mockGetAllTradesForAi.mockResolvedValue({
        trades: mockTrades as never,
        truncated: false,
        fetchedPages: 1,
      })

      await getAiTrades({ userId: 'test', profile: 'detail' })
      
      // Clear cache
      clearTradeAccessCache()
      
      // Call again - should fetch since cache was cleared
      await getAiTrades({ userId: 'test', profile: 'detail' })

      expect(mockGetAllTradesForAi).toHaveBeenCalledTimes(2)
    })
  })

  describe('TradeAccessProfile type', () => {
    it('accepts valid profile values', () => {
      const validProfiles: TradeAccessProfile[] = ['summary', 'analysis', 'detail']
      
      expect(validProfiles).toContain('summary')
      expect(validProfiles).toContain('analysis')
      expect(validProfiles).toContain('detail')
    })
  })
})

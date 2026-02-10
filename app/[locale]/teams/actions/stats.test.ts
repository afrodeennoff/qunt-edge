import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetUserById, mockSupabase } = vi.hoisted(() => {
  const mockGetUserById = vi.fn()
  const mockSupabase = {
    auth: {
      admin: {
        getUserById: mockGetUserById,
      },
    },
  }
  return { mockGetUserById, mockSupabase }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
  User: class User {},
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    trade: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { getUserEquityData } from './stats'
import { prisma } from '@/lib/prisma'

describe('getUserEquityData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty result if no users have trades', async () => {
    (prisma.trade.groupBy as any).mockResolvedValue([])

    const result = await getUserEquityData(1, 10)

    expect(result).toEqual({
      users: [],
      totalUsers: 0,
      hasMore: false,
    })
    expect(prisma.trade.groupBy).toHaveBeenCalledTimes(1)
  })

  it('should return user equity data correctly', async () => {
    // Mock user IDs with trades and total users count
    (prisma.trade.groupBy as any)
      .mockResolvedValueOnce([
        { userId: 'user1' },
        { userId: 'user2' },
      ])
      .mockResolvedValueOnce([
         { userId: 'user1' },
         { userId: 'user2' },
         { userId: 'user3' }
      ]);

    // Mock Supabase user responses
    mockGetUserById.mockImplementation((userId) => {
      if (userId === 'user1') {
        return Promise.resolve({ data: { user: { id: 'user1', email: 'user1@example.com', created_at: '2023-01-01' } }, error: null })
      }
      if (userId === 'user2') {
        return Promise.resolve({ data: { user: { id: 'user2', email: 'user2@example.com', created_at: '2023-01-02' } }, error: null })
      }
      return Promise.resolve({ data: { user: null }, error: 'User not found' })
    })

    // Mock trades
    const mockTrades = [
      {
        id: 't1',
        userId: 'user1',
        pnl: 100,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        entryDate: new Date('2023-01-01T10:00:00Z'),
        closeDate: new Date('2023-01-01T11:00:00Z'),
        instrument: 'AAPL',
        side: 'BUY',
        entryPrice: 150,
        closePrice: 155,
        quantity: 10,
        commission: 2
      },
      {
        id: 't2',
        userId: 'user1',
        pnl: -50,
        createdAt: new Date('2023-01-02T10:00:00Z'),
        entryDate: new Date('2023-01-02T10:00:00Z'),
        closeDate: new Date('2023-01-02T11:00:00Z'),
        instrument: 'GOOGL',
        side: 'SELL',
        entryPrice: 200,
        closePrice: 205,
        quantity: 5,
        commission: 2
      }
    ];

    (prisma.trade.findMany as any).mockResolvedValue(mockTrades)

    const result = await getUserEquityData(1, 10)

    expect(result.users).toHaveLength(2)
    // user1 has trades
    expect(result.users[0].userId).toBe('user1')
    expect(result.users[0].statistics.totalTrades).toBe(2)
    // user2 has no trades in mockTrades
    expect(result.users[1].userId).toBe('user2')
    expect(result.users[1].statistics.totalTrades).toBe(0)

    expect(result.totalUsers).toBe(3)
    expect(result.hasMore).toBe(false)
  })
})

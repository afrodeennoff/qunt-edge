import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to define mocks accessible in vi.mock
const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      subscription: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      subscriptionEvent: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
          findUnique: vi.fn(),
      },
      usageMetric: {
          upsert: vi.fn(),
          findMany: vi.fn()
      }
    }
  }
})

// Mock the module
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock dependencies of subscription-manager
vi.mock('@/server/payment-service', () => ({
  paymentService: {
    recordTransaction: vi.fn()
  }
}))

vi.mock('@/lib/whop', () => ({
  whop: {}
}))

vi.mock('server-only', () => ({}))

// Import the manager AFTER mocking
import { subscriptionManager } from '@/server/subscription-manager'

describe('SubscriptionManager Grace Periods', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should batch update PAUSED subscriptions and create events', async () => {
        const now = new Date()
        const expiredDate = new Date(now.getTime() - 86400000) // 1 day ago

        const subscriptions = [
            {
                id: 'sub1',
                userId: 'user1',
                email: 'user1@example.com',
                status: 'ACTIVE',
                endDate: expiredDate,
                plan: 'PRO'
            },
            {
                id: 'sub2',
                userId: 'user2',
                email: 'user2@example.com',
                status: 'ACTIVE',
                endDate: expiredDate,
                plan: 'PRO'
            }
        ]

        mockPrisma.subscription.findMany.mockResolvedValue(subscriptions)
        mockPrisma.subscription.updateMany.mockResolvedValue({ count: 2 })
        mockPrisma.subscriptionEvent.createMany.mockResolvedValue({ count: 2 })

        const result = await subscriptionManager.checkAndEnforceGracePeriods()

        expect(result.processed).toBe(2)
        expect(result.errors).toBe(0)

        // Verify findMany called
        expect(mockPrisma.subscription.findMany).toHaveBeenCalled()

        // Verify updateMany for PAUSED
        expect(mockPrisma.subscription.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['sub1', 'sub2'] } },
            data: { status: 'PAUSED' }
        })

        // Verify createMany events
        expect(mockPrisma.subscriptionEvent.createMany).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({
                    userId: 'user1',
                    eventType: 'GRACE_PERIOD_STARTED'
                }),
                expect.objectContaining({
                    userId: 'user2',
                    eventType: 'GRACE_PERIOD_STARTED'
                })
            ])
        })
    })

     it('should batch update CANCELLED subscriptions if grace period expired', async () => {
        const now = new Date()
        // 8 days ago (assuming grace period is 7 days)
        const expiredDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)

        const subscriptions = [
            {
                id: 'sub3',
                userId: 'user3',
                email: 'user3@example.com',
                status: 'ACTIVE',
                endDate: expiredDate,
                plan: 'PRO'
            }
        ]

        mockPrisma.subscription.findMany.mockResolvedValue(subscriptions)
        mockPrisma.subscription.updateMany.mockResolvedValue({ count: 1 })
        mockPrisma.subscriptionEvent.createMany.mockResolvedValue({ count: 1 })

        const result = await subscriptionManager.checkAndEnforceGracePeriods()

        expect(result.processed).toBe(1)
        expect(result.errors).toBe(0)

        // Verify updateMany for CANCELLED
        expect(mockPrisma.subscription.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['sub3'] } },
            data: { status: 'CANCELLED' }
        })

        // Verify createMany events
        expect(mockPrisma.subscriptionEvent.createMany).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({
                    userId: 'user3',
                    eventType: 'GRACE_PERIOD_ENDED'
                })
            ])
        })
    })

    it('should handle mixed PAUSED and CANCELLED', async () => {
         const now = new Date()
         const recentExpired = new Date(now.getTime() - 86400000) // 1 day ago
         const oldExpired = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

         const subscriptions = [
            { id: 'subP', userId: 'userP', email: 'p@e.com', status: 'ACTIVE', endDate: recentExpired },
            { id: 'subC', userId: 'userC', email: 'c@e.com', status: 'ACTIVE', endDate: oldExpired }
         ]

        mockPrisma.subscription.findMany.mockResolvedValue(subscriptions)
        mockPrisma.subscription.updateMany.mockResolvedValue({ count: 1 })
        mockPrisma.subscriptionEvent.createMany.mockResolvedValue({ count: 2 })

        await subscriptionManager.checkAndEnforceGracePeriods()

        // Expect TWO updateMany calls: one for paused, one for cancelled
        expect(mockPrisma.subscription.updateMany).toHaveBeenCalledTimes(2)

        expect(mockPrisma.subscription.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['subP'] } },
            data: { status: 'PAUSED' }
        })

        expect(mockPrisma.subscription.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['subC'] } },
            data: { status: 'CANCELLED' }
        })

        // Expect ONE createMany call with both events
        expect(mockPrisma.subscriptionEvent.createMany).toHaveBeenCalledWith({
             data: expect.arrayContaining([
                expect.objectContaining({ subscriptionId: 'subP', eventType: 'GRACE_PERIOD_STARTED' }),
                expect.objectContaining({ subscriptionId: 'subC', eventType: 'GRACE_PERIOD_ENDED' })
            ])
        })
    })
})

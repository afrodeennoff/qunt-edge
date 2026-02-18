import { describe, it, expect, vi, beforeEach } from 'vitest'
import { subscriptionManager } from '@/server/subscription-manager'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn((ops) => Promise.all(ops)),
    subscription: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    subscriptionEvent: {
      create: vi.fn(),
      createMany: vi.fn(),
    },
  },
}))

describe('SubscriptionManager Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifies batched updates in checkAndEnforceGracePeriods for mixed paused and cancelled', async () => {
    const pausedDate = new Date()
    pausedDate.setDate(pausedDate.getDate() - 1) // Expired 1 day ago (within 7 days grace)

    const cancelledDate = new Date()
    cancelledDate.setDate(cancelledDate.getDate() - 10) // Expired 10 days ago (outside 7 days grace)

    const mockSubscriptions = Array.from({ length: 100 }, (_, i) => ({
      id: `sub_${i}`,
      userId: `user_${i}`,
      email: `user${i}@example.com`,
      status: 'ACTIVE',
      endDate: i < 50 ? pausedDate : cancelledDate,
    }))

    vi.mocked(prisma.subscription.findMany).mockResolvedValue(mockSubscriptions as any)
    vi.mocked(prisma.subscription.update).mockResolvedValue({} as any)
    vi.mocked(prisma.subscriptionEvent.create).mockResolvedValue({} as any)
    vi.mocked(prisma.subscription.updateMany).mockResolvedValue({ count: 50 } as any)
    vi.mocked(prisma.subscriptionEvent.createMany).mockResolvedValue({ count: 100 } as any)
    vi.mocked(prisma.$transaction).mockResolvedValue([
      { count: 50 }, // updateMany paused
      { count: 50 }, // updateMany cancelled
      { count: 100 } // createMany events
    ] as any)

    await subscriptionManager.checkAndEnforceGracePeriods()

    const updateCalls = vi.mocked(prisma.subscription.update).mock.calls.length
    const createCalls = vi.mocked(prisma.subscriptionEvent.create).mock.calls.length
    const updateManyCalls = vi.mocked(prisma.subscription.updateMany).mock.calls.length
    const createManyCalls = vi.mocked(prisma.subscriptionEvent.createMany).mock.calls.length
    const transactionCalls = vi.mocked(prisma.$transaction).mock.calls.length

    console.log(`Update calls: ${updateCalls}`)
    console.log(`Create calls: ${createCalls}`)
    console.log(`UpdateMany calls: ${updateManyCalls}`)
    console.log(`CreateMany calls: ${createManyCalls}`)
    console.log(`Transaction calls: ${transactionCalls}`)

    // Expect Optimized behavior (0 individual updates/creates, batched calls used)
    expect(updateCalls).toBe(0)
    expect(createCalls).toBe(0)
    // 1 call for paused, 1 call for cancelled
    expect(updateManyCalls).toBe(2)
    expect(createManyCalls).toBe(1)
    expect(transactionCalls).toBe(1)
  })
})

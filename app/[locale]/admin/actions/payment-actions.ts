'use server'

import { paymentService } from '@/server/payment-service'
import { subscriptionManager } from '@/server/subscription-manager'
import { assertAdminAccess, logAdminMutation } from '@/server/authz'
import { revalidatePath } from 'next/cache'

export async function getTransactionsAction(options?: { limit?: number; offset?: number; status?: string }) {
    const admin = await assertAdminAccess()

    const { prisma } = await import('@/lib/prisma')

    try {
        const transactions = await prisma.paymentTransaction.findMany({
            orderBy: { createdAt: 'desc' },
            take: options?.limit || 50,
            skip: options?.offset || 0,
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        })

        logAdminMutation({
            action: 'list-transactions',
            actor: admin,
            details: { limit: options?.limit || 50, offset: options?.offset || 0 }
        })

        return { success: true, transactions }
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return { success: false, error: 'Failed to fetch transactions' }
    }
}

export async function refundTransactionAction(transactionId: string) {
    const admin = await assertAdminAccess()

    const result = await paymentService.processRefund({
        transactionId,
        reason: 'Admin requested refund'
    })

    if (result.success) {
        logAdminMutation({
            action: 'refund-transaction',
            actor: admin,
            target: transactionId
        })
        revalidatePath('/admin')
    }

    return result
}

export async function getSubscriptionsAction() {
    const admin = await assertAdminAccess()

    const { prisma } = await import('@/lib/prisma')

    try {
        const subscriptions = await prisma.subscription.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        })

        logAdminMutation({
            action: 'list-subscriptions',
            actor: admin,
            details: { limit: 50 }
        })

        return { success: true, subscriptions }
    } catch (error) {
        console.error('Error fetching subscriptions:', error)
        return { success: false, error: 'Failed to fetch subscriptions' }
    }
}

export async function cancelSubscriptionAction(userId: string) {
    const admin = await assertAdminAccess()

    const result = await subscriptionManager.cancelSubscription({
        userId,
        cancelAtPeriodEnd: false,
        reason: 'Admin cancelled'
    })

    if (result.success) {
        logAdminMutation({
            action: 'cancel-subscription',
            actor: admin,
            target: userId
        })
        revalidatePath('/admin')
    }

    return result
}

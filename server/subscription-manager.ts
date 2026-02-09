import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { paymentService } from './payment-service'
import { getSubscriptionDetails } from './subscription'
import { whop } from '@/lib/whop'

export interface SubscriptionDetails {
  userId: string
  email: string
  plan: string
  status: 'ACTIVE' | 'CANCELLED' | 'TRIAL' | 'PAST_DUE' | 'PAUSED'
  interval?: 'month' | 'quarter' | 'year' | 'lifetime'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  trialEndsAt?: Date
}

export interface GracePeriodConfig {
  enabled: boolean
  duration: number
  unit: 'days' | 'hours'
}

const GRACE_PERIOD_CONFIG: GracePeriodConfig = {
  enabled: true,
  duration: 7,
  unit: 'days',
}

const TRIAL_DAYS = 14

export class SubscriptionManager {
  private static instance: SubscriptionManager

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager()
    }
    return SubscriptionManager.instance
  }

  async createSubscription(data: {
    userId: string
    email: string
    plan: string
    interval: 'month' | 'quarter' | 'year' | 'lifetime'
    whopMembershipId?: string
    trial?: boolean
    metadata?: Record<string, any>
  }): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: data.userId },
      })

      const now = new Date()
      let endDate: Date | null = null
      let trialEndsAt: Date | null = null
      let status: string = 'ACTIVE'

      if (data.trial) {
        trialEndsAt = new Date(now)
        trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS)
        endDate = trialEndsAt
        status = 'TRIAL'
      } else {
        endDate = this.calculateEndDate(data.interval)
      }

      const subscription = await prisma.subscription.upsert({
        where: { userId: data.userId },
        update: {
          plan: data.plan.toUpperCase(),
          status,
          interval: data.interval,
          endDate,
          trialEndsAt,
        },
        create: {
          userId: data.userId,
          email: data.email,
          plan: data.plan.toUpperCase(),
          status,
          interval: data.interval,
          endDate,
          trialEndsAt,
        },
      })

      await this.recordSubscriptionEvent({
        userId: data.userId,
        email: data.email,
        subscriptionId: subscription.id,
        eventType: data.trial ? 'TRIAL_STARTED' : 'ACTIVATED',
        eventData: {
          plan: data.plan,
          interval: data.interval,
          whopMembershipId: data.whopMembershipId,
          ...data.metadata,
        },
      })

      logger.info('[SubscriptionManager] Subscription created/updated', {
        subscriptionId: subscription.id,
        userId: data.userId,
        plan: data.plan,
        status,
      })

      return { success: true, subscriptionId: subscription.id }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to create subscription', { error, data })
      return { success: false, error: 'Failed to create subscription' }
    }
  }

  async updateSubscription(data: {
    userId: string
    plan?: string
    interval?: 'month' | 'quarter' | 'year' | 'lifetime'
    status?: string
    endDate?: Date
    metadata?: Record<string, any>
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: data.userId },
      })

      if (!subscription) {
        return { success: false, error: 'Subscription not found' }
      }

      const updateData: any = {}
      const eventLogs: Array<{ eventType: string; eventData: any }> = []

      if (data.plan && data.plan !== subscription.plan) {
        updateData.plan = data.plan.toUpperCase()
        eventLogs.push({
          eventType: data.plan > subscription.plan ? 'PLAN_UPGRADED' : 'PLAN_DOWNGRADED',
          eventData: {
            oldPlan: subscription.plan,
            newPlan: data.plan,
          },
        })
      }

      if (data.interval && data.interval !== subscription.interval) {
        updateData.interval = data.interval
      }

      if (data.status && data.status !== subscription.status) {
        updateData.status = data.status
        eventLogs.push({
          eventType: `STATUS_${data.status.toUpperCase()}`,
          eventData: {
            oldStatus: subscription.status,
            newStatus: data.status,
          },
        })
      }

      if (data.endDate) {
        updateData.endDate = data.endDate
      }

      await prisma.subscription.update({
        where: { userId: data.userId },
        data: updateData,
      })

      for (const log of eventLogs) {
        await this.recordSubscriptionEvent({
          userId: data.userId,
          email: subscription.email,
          subscriptionId: subscription.id,
          eventType: log.eventType as any,
          eventData: { ...log.eventData, ...data.metadata },
        })
      }

      logger.info('[SubscriptionManager] Subscription updated', {
        userId: data.userId,
        updateData,
      })

      return { success: true }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to update subscription', { error, data })
      return { success: false, error: 'Failed to update subscription' }
    }
  }

  async cancelSubscription(data: {
    userId: string
    cancelAtPeriodEnd?: boolean
    reason?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: data.userId },
      })

      if (!subscription) {
        return { success: false, error: 'Subscription not found' }
      }

      if (subscription.status === 'CANCELLED') {
        return { success: false, error: 'Subscription already cancelled' }
      }

      if (data.cancelAtPeriodEnd && subscription.endDate) {
        await prisma.subscription.update({
          where: { userId: data.userId },
          data: {
            cancelAtPeriodEnd: true,
          },
        })

        await this.recordSubscriptionEvent({
          userId: data.userId,
          email: subscription.email,
          subscriptionId: subscription.id,
          eventType: 'CANCELLED',
          eventData: {
            cancelAtPeriodEnd: true,
            effectiveDate: subscription.endDate,
            reason: data.reason,
          },
        })

        logger.info('[SubscriptionManager] Subscription scheduled for cancellation', {
          userId: data.userId,
          effectiveDate: subscription.endDate,
        })
      } else {
        await prisma.subscription.update({
          where: { userId: data.userId },
          data: {
            status: 'CANCELLED',
            endDate: new Date(),
          },
        })

        await this.recordSubscriptionEvent({
          userId: data.userId,
          email: subscription.email,
          subscriptionId: subscription.id,
          eventType: 'CANCELLED',
          eventData: {
            immediate: true,
            reason: data.reason,
          },
        })

        logger.info('[SubscriptionManager] Subscription cancelled immediately', {
          userId: data.userId,
        })
      }

      return { success: true }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to cancel subscription', { error, data })
      return { success: false, error: 'Failed to cancel subscription' }
    }
  }

  async handlePaymentFailure(data: {
    userId: string
    email: string
    whopMembershipId: string
    attemptNumber: number
  }): Promise<{ success: boolean; actionTaken?: string; error?: string }> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: data.userId },
      })

      if (!subscription) {
        return { success: false, error: 'Subscription not found' }
      }

      const maxRetries = 3

      if (data.attemptNumber >= maxRetries) {
        await prisma.subscription.update({
          where: { userId: data.userId },
          data: {
            status: 'CANCELLED',
            endDate: new Date(),
          },
        })

        await this.recordSubscriptionEvent({
          userId: data.userId,
          email: data.email,
          subscriptionId: subscription.id,
          eventType: 'CANCELLED',
          eventData: {
            reason: 'payment_failed_max_retries',
            attempts: data.attemptNumber,
          },
        })

        logger.warn('[SubscriptionManager] Subscription cancelled due to payment failure', {
          userId: data.userId,
          attempts: data.attemptNumber,
        })

        return { success: true, actionTaken: 'cancelled' }
      } else {
        await prisma.subscription.update({
          where: { userId: data.userId },
          data: {
            status: 'PAST_DUE',
          },
        })

        await this.recordSubscriptionEvent({
          userId: data.userId,
          email: data.email,
          subscriptionId: subscription.id,
          eventType: 'PAYMENT_FAILED',
          eventData: {
            attemptNumber: data.attemptNumber,
            maxRetries,
          },
        })

        logger.info('[SubscriptionManager] Payment failure recorded, subscription past due', {
          userId: data.userId,
          attemptNumber: data.attemptNumber,
        })

        return { success: true, actionTaken: 'marked_past_due' }
      }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to handle payment failure', { error, data })
      return { success: false, error: 'Failed to handle payment failure' }
    }
  }

  async handlePaymentSuccess(data: {
    userId: string
    email: string
    whopMembershipId: string
    amount: number
    renewalDate?: Date
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const membership = await (whop.memberships as any).retrieve({
        id: data.whopMembershipId,
      })

      const planName = membership.metadata?.plan || membership.product?.title || 'PLUS'
      const interval = planName.toLowerCase().includes('monthly') ? 'month' :
        planName.toLowerCase().includes('quarterly') ? 'quarter' :
          planName.toLowerCase().includes('yearly') ? 'year' :
            planName.toLowerCase().includes('lifetime') ? 'lifetime' : 'month'

      let endDate = data.renewalDate
      if (!endDate) {
        endDate = this.calculateEndDate(interval)
      }

      await prisma.subscription.update({
        where: { userId: data.userId },
        data: {
          status: 'ACTIVE',
          endDate,
          plan: planName.toUpperCase(),
          interval,
        },
      })

      const subscription = await prisma.subscription.findUnique({
        where: { userId: data.userId },
      })

      if (subscription) {
        await this.recordSubscriptionEvent({
          userId: data.userId,
          email: data.email,
          subscriptionId: subscription.id,
          eventType: 'PAYMENT_SUCCEEDED',
          eventData: {
            amount: data.amount,
            renewalDate: endDate,
          },
        })
      }

      await paymentService.recordTransaction({
        userId: data.userId,
        email: data.email,
        whopTransactionId: `pay_${Date.now()}`,
        whopMembershipId: data.whopMembershipId,
        amount: data.amount,
        status: 'COMPLETED',
      })

      logger.info('[SubscriptionManager] Payment success handled', {
        userId: data.userId,
        amount: data.amount,
        endDate,
      })

      return { success: true }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to handle payment success', { error, data })
      return { success: false, error: 'Failed to handle payment success' }
    }
  }

  async checkAndEnforceGracePeriods(): Promise<{ processed: number; errors: number }> {
    try {
      const now = new Date()
      let processed = 0
      let errors = 0

      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            lte: now,
          },
        },
      })

      for (const subscription of expiringSubscriptions) {
        try {
          if (!subscription.endDate) continue
          const gracePeriodEnd = new Date(subscription.endDate)
          gracePeriodEnd.setDate(
            gracePeriodEnd.getDate() + GRACE_PERIOD_CONFIG.duration
          )

          if (now < gracePeriodEnd && GRACE_PERIOD_CONFIG.enabled) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'PAUSED',
              },
            })

            await this.recordSubscriptionEvent({
              userId: subscription.userId,
              email: subscription.email,
              subscriptionId: subscription.id,
              eventType: 'GRACE_PERIOD_STARTED',
              eventData: {
                gracePeriodEndsAt: gracePeriodEnd,
              },
            })

            logger.info('[SubscriptionManager] Grace period started', {
              subscriptionId: subscription.id,
              gracePeriodEndsAt: gracePeriodEnd,
            })
          } else {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'CANCELLED',
              },
            })

            await this.recordSubscriptionEvent({
              userId: subscription.userId,
              email: subscription.email,
              subscriptionId: subscription.id,
              eventType: 'GRACE_PERIOD_ENDED',
              eventData: {
                reason: 'grace_period_expired',
              },
            })

            logger.info('[SubscriptionManager] Grace period ended, subscription cancelled', {
              subscriptionId: subscription.id,
            })
          }

          processed++
        } catch (error) {
          logger.error('[SubscriptionManager] Error processing grace period', {
            error,
            subscriptionId: subscription.id,
          })
          errors++
        }
      }

      logger.info('[SubscriptionManager] Grace period check completed', {
        processed,
        errors,
      })

      return { processed, errors }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to check grace periods', { error })
      return { processed: 0, errors: 1 }
    }
  }

  private calculateEndDate(interval: 'month' | 'quarter' | 'year' | 'lifetime'): Date {
    const now = new Date()

    if (interval === 'lifetime') {
      const lifetimeDate = new Date(now)
      lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100)
      return lifetimeDate
    }

    if (interval === 'year') {
      const yearDate = new Date(now)
      yearDate.setFullYear(yearDate.getFullYear() + 1)
      return yearDate
    }

    if (interval === 'quarter') {
      const quarterDate = new Date(now)
      quarterDate.setMonth(quarterDate.getMonth() + 3)
      return quarterDate
    }

    const monthDate = new Date(now)
    monthDate.setMonth(monthDate.getMonth() + 1)
    return monthDate
  }

  private async recordSubscriptionEvent(data: {
    userId: string
    email: string
    subscriptionId: string
    eventType: string
    eventData: Record<string, any>
  }): Promise<void> {
    try {
      await prisma.subscriptionEvent.create({
        data: {
          userId: data.userId,
          email: data.email,
          subscriptionId: data.subscriptionId,
          eventType: data.eventType as any,
          eventData: data.eventData,
        },
      })
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to record subscription event', {
        error,
        data,
      })
    }
  }

  async getUserSubscriptionHistory(userId: string): Promise<{
    success: boolean
    subscription?: any
    events?: any[]
    error?: string
  }> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      })

      if (!subscription) {
        return { success: false, error: 'Subscription not found' }
      }

      const events = await prisma.subscriptionEvent.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })

      return {
        success: true,
        subscription,
        events,
      }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to fetch subscription history', { error, userId })
      return { success: false, error: 'Failed to fetch subscription history' }
    }
  }

  async getSubscriptionUsageMetrics(userId: string): Promise<{
    success: boolean
    metrics?: Array<{
      metricType: string
      metricValue: number
      periodStart: Date
      periodEnd: Date
    }>
    error?: string
  }> {
    try {
      const metrics = await prisma.usageMetric.findMany({
        where: { userId },
        orderBy: { periodStart: 'desc' },
        take: 50,
      })

      return { success: true, metrics }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to fetch usage metrics', { error, userId })
      return { success: false, error: 'Failed to fetch usage metrics' }
    }
  }

  async recordUsageMetric(data: {
    userId: string
    email: string
    metricType: string
    metricValue: number
    periodStart: Date
    periodEnd: Date
    metadata?: Record<string, any>
  }): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.usageMetric.upsert({
        where: {
          userId_metricType_periodStart: {
            userId: data.userId,
            metricType: data.metricType,
            periodStart: data.periodStart,
          },
        },
        update: {
          metricValue: data.metricValue,
          periodEnd: data.periodEnd,
          metadata: data.metadata || {},
        },
        create: {
          userId: data.userId,
          email: data.email,
          metricType: data.metricType,
          metricValue: data.metricValue,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          metadata: data.metadata || {},
        },
      })

      return { success: true }
    } catch (error) {
      logger.error('[SubscriptionManager] Failed to record usage metric', { error, data })
      return { success: false, error: 'Failed to record usage metric' }
    }
  }
}

export const subscriptionManager = SubscriptionManager.getInstance()

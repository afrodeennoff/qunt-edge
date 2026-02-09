import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { whop } from '@/lib/whop'
import type { PrismaClient } from '@/prisma/generated/prisma'
import { logger } from '@/lib/logger'
import { subscriptionManager } from './subscription-manager'
import { paymentService } from './payment-service'
import crypto from 'crypto'

interface WebhookEvent {
  id: string
  type: string
  data: any
  created_at?: number
}

interface WebhookProcessingResult {
  success: boolean
  eventType: string
  processed: boolean
  alreadyProcessed?: boolean
  error?: string
}

export class WebhookService {
  private static instance: WebhookService
  private processingQueue: Map<string, Promise<WebhookProcessingResult>>
  private retryAttempts: Map<string, number>

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  constructor() {
    this.processingQueue = new Map()
    this.retryAttempts = new Map()
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(payload)
      const digest = hmac.digest('hex')
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
      )
    } catch (error) {
      logger.error('[WebhookService] Signature verification failed', { error })
      return false
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookProcessingResult> {
    const queueKey = `${event.id}:${event.type}`

    if (this.processingQueue.has(queueKey)) {
      logger.info('[WebhookService] Event already being processed', { eventId: event.id, eventType: event.type })
      return {
        success: true,
        eventType: event.type,
        processed: false,
        alreadyProcessed: true,
      }
    }

    const processingPromise = this.processEvent(event)
    this.processingQueue.set(queueKey, processingPromise)

    try {
      const result = await processingPromise
      return result
    } finally {
      this.processingQueue.delete(queueKey)
    }
  }

  private async processEvent(event: WebhookEvent): Promise<WebhookProcessingResult> {
    let lockAcquired = false

    try {
      lockAcquired = await this.acquireWebhookLock(prisma, event)
      if (!lockAcquired) {
        logger.info('[WebhookService] Duplicate webhook skipped', {
          eventType: event.type,
          eventId: event.id,
        })
        return {
          success: true,
          eventType: event.type,
          processed: false,
          alreadyProcessed: true,
        }
      }

      logger.info('[WebhookService] Processing webhook event', {
        eventType: event.type,
        eventId: event.id,
      })

      const result = await this.handleEventByType(event, prisma)

      await this.logWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        success: result.success,
        processed: result.processed,
        error: result.error,
      })

      if (result.success) {
        await this.finalizeWebhookLock(prisma, event, result)
      } else {
        await this.releaseWebhookLock(prisma, event)
      }
      return result
    } catch (error) {
      logger.error('[WebhookService] Event processing failed', {
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      if (lockAcquired) {
        await this.releaseWebhookLock(prisma, event)
      }

      await this.logWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return {
        success: false,
        eventType: event.type,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async acquireWebhookLock(prisma: PrismaClient, event: WebhookEvent): Promise<boolean> {
    try {
      await prisma.processedWebhook.create({
        data: {
          webhookId: event.id,
          type: event.type,
          processedAt: new Date(),
          metadata: JSON.stringify({
            status: 'processing',
          }),
        },
      })

      return true
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return false
      }
      throw error
    }
  }

  private async finalizeWebhookLock(
    prisma: PrismaClient,
    event: WebhookEvent,
    result: WebhookProcessingResult,
  ): Promise<void> {
    await prisma.processedWebhook.update({
      where: {
        webhookId_type: {
          webhookId: event.id,
          type: event.type,
        },
      },
      data: {
        processedAt: new Date(),
        metadata: JSON.stringify({
          status: result.success ? 'completed' : 'failed',
          processed: result.processed,
          error: result.error ?? null,
        }),
      },
    })
  }

  private async releaseWebhookLock(prisma: PrismaClient, event: WebhookEvent): Promise<void> {
    await prisma.processedWebhook.deleteMany({
      where: {
        webhookId: event.id,
        type: event.type,
      },
    })
  }

  private async handleEventByType(
    event: WebhookEvent,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    const { type, data } = event

    switch (type) {
      case 'membership.activated':
        return await this.handleMembershipActivated(data, prisma)
      
      case 'membership.deactivated':
        return await this.handleMembershipDeactivated(data, prisma)
      
      case 'membership.updated':
        return await this.handleMembershipUpdated(data, prisma)
      
      case 'membership.trialing':
        return await this.handleMembershipTrialing(data, prisma)
      
      case 'payment.succeeded':
        return await this.handlePaymentSucceeded(data, prisma)
      
      case 'payment.failed':
        return await this.handlePaymentFailed(data, prisma)
      
      case 'payment.refunded':
        return await this.handlePaymentRefunded(data, prisma)
      
      case 'payment.partially_refunded':
        return await this.handlePaymentPartiallyRefunded(data, prisma)
      
      case 'invoice.created':
        return await this.handleInvoiceCreated(data, prisma)
      
      case 'invoice.paid':
        return await this.handleInvoicePaid(data, prisma)
      
      case 'invoice.payment_failed':
        return await this.handleInvoicePaymentFailed(data, prisma)
      
      default:
        logger.warn('[WebhookService] Unhandled event type', { eventType: type })
        return {
          success: true,
          eventType: type,
          processed: false,
        }
    }
  }

  private async handleMembershipActivated(
    membership: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!membership.user?.email) {
        return {
          success: false,
          eventType: 'membership.activated',
          processed: false,
          error: 'No user email in membership data',
        }
      }

      const email = membership.user.email
      const metadata = membership.metadata || {}
      const userId = metadata.user_id
      const planName = metadata.plan || membership.product?.title || 'PLUS'
      
      const interval = planName.toLowerCase().includes('monthly') ? 'month' :
        planName.toLowerCase().includes('quarterly') ? 'quarter' :
          planName.toLowerCase().includes('yearly') ? 'year' :
            planName.toLowerCase().includes('lifetime') ? 'lifetime' : 'month'

      const isTrial = membership.status === 'trialing'

      await subscriptionManager.createSubscription({
        userId: userId || membership.user?.id || crypto.randomUUID(),
        email,
        plan: planName,
        interval,
        whopMembershipId: membership.id,
        trial: isTrial,
        metadata: {
          whopMembershipId: membership.id,
          activatedAt: new Date(membership.created_at).toISOString(),
        },
      })

      logger.info('[WebhookService] Membership activated', {
        email,
        plan: planName,
        interval,
        isTrial,
      })

      return {
        success: true,
        eventType: 'membership.activated',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle membership.activated', { error })
      return {
        success: false,
        eventType: 'membership.activated',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleMembershipDeactivated(
    membership: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!membership.user?.email) {
        return {
          success: false,
          eventType: 'membership.deactivated',
          processed: false,
          error: 'No user email in membership data',
        }
      }

      const subscription = await prisma.subscription.findUnique({
        where: { email: membership.user.email },
      })

      if (!subscription) {
        logger.warn('[WebhookService] Subscription not found for deactivation', {
          email: membership.user.email,
        })
        return {
          success: true,
          eventType: 'membership.deactivated',
          processed: false,
        }
      }

      await prisma.subscription.update({
        where: { email: membership.user.email },
        data: {
          status: 'CANCELLED',
          endDate: new Date(),
        },
      })

      logger.info('[WebhookService] Membership deactivated', {
        email: membership.user.email,
      })

      return {
        success: true,
        eventType: 'membership.deactivated',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle membership.deactivated', { error })
      return {
        success: false,
        eventType: 'membership.deactivated',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleMembershipUpdated(
    membership: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!membership.user?.email) {
        return {
          success: false,
          eventType: 'membership.updated',
          processed: false,
          error: 'No user email in membership data',
        }
      }

      const planName = membership.metadata?.plan || membership.product?.title || 'PLUS'
      const interval = planName.toLowerCase().includes('monthly') ? 'month' :
        planName.toLowerCase().includes('quarterly') ? 'quarter' :
          planName.toLowerCase().includes('yearly') ? 'year' :
            planName.toLowerCase().includes('lifetime') ? 'lifetime' : 'month'

      const subscription = await prisma.subscription.findUnique({
        where: { email: membership.user.email },
      })

      if (!subscription) {
        logger.warn('[WebhookService] Subscription not found for update', {
          email: membership.user.email,
        })
        return {
          success: true,
          eventType: 'membership.updated',
          processed: false,
        }
      }

      await prisma.subscription.update({
        where: { email: membership.user.email },
        data: {
          plan: planName.toUpperCase(),
          interval,
          status: membership.status.toUpperCase(),
          endDate: membership.renewal_period_end 
            ? new Date(membership.renewal_period_end * 1000)
            : undefined,
        },
      })

      logger.info('[WebhookService] Membership updated', {
        email: membership.user.email,
        plan: planName,
      })

      return {
        success: true,
        eventType: 'membership.updated',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle membership.updated', { error })
      return {
        success: false,
        eventType: 'membership.updated',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleMembershipTrialing(
    membership: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    return await this.handleMembershipActivated(membership, prisma)
  }

  private async handlePaymentSucceeded(
    payment: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      const membershipId = payment.membership_id

      if (!membershipId) {
        return {
          success: false,
          eventType: 'payment.succeeded',
          processed: false,
          error: 'No membership ID in payment data',
        }
      }

      const membership = await (whop.memberships as any).retrieve({
        id: membershipId,
      })

      if (!membership || !membership.user?.email) {
        return {
          success: false,
          eventType: 'payment.succeeded',
          processed: false,
          error: 'Could not fetch membership details',
        }
      }

      const userId = membership.metadata?.user_id || membership.user?.id
      const amount = payment.amount || 0

      await subscriptionManager.handlePaymentSuccess({
        userId,
        email: membership.user.email,
        whopMembershipId: membershipId,
        amount,
        renewalDate: membership.renewal_period_end
          ? new Date(membership.renewal_period_end * 1000)
          : undefined,
      })

      logger.info('[WebhookService] Payment succeeded', {
        email: membership.user.email,
        amount,
      })

      return {
        success: true,
        eventType: 'payment.succeeded',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle payment.succeeded', { error })
      return {
        success: false,
        eventType: 'payment.succeeded',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handlePaymentFailed(
    payment: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      const membershipId = payment.membership_id

      if (!membershipId) {
        return {
          success: false,
          eventType: 'payment.failed',
          processed: false,
          error: 'No membership ID in payment data',
        }
      }

      const membership = await (whop.memberships as any).retrieve({
        id: membershipId,
      })

      if (!membership || !membership.user?.email) {
        return {
          success: false,
          eventType: 'payment.failed',
          processed: false,
          error: 'Could not fetch membership details',
        }
      }

      const userId = membership.metadata?.user_id || membership.user?.id

      const attemptNumber = this.retryAttempts.get(membershipId) || 1
      this.retryAttempts.set(membershipId, attemptNumber + 1)

      await subscriptionManager.handlePaymentFailure({
        userId,
        email: membership.user.email,
        whopMembershipId: membershipId,
        attemptNumber,
      })

      logger.info('[WebhookService] Payment failed', {
        email: membership.user.email,
        attemptNumber,
      })

      return {
        success: true,
        eventType: 'payment.failed',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle payment.failed', { error })
      return {
        success: false,
        eventType: 'payment.failed',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handlePaymentRefunded(
    refund: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      const paymentId = refund.payment_id
      const amount = refund.amount

      await paymentService.processRefund({
        transactionId: paymentId,
        amount,
        reason: 'Processed via Whop webhook',
      })

      logger.info('[WebhookService] Payment refunded', {
        paymentId,
        amount,
      })

      return {
        success: true,
        eventType: 'payment.refunded',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle payment.refunded', { error })
      return {
        success: false,
        eventType: 'payment.refunded',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handlePaymentPartiallyRefunded(
    refund: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    return await this.handlePaymentRefunded(refund, prisma)
  }

  private async handleInvoiceCreated(
    invoice: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      if (!invoice.user?.email || !invoice.membership?.id) {
        return {
          success: false,
          eventType: 'invoice.created',
          processed: false,
          error: 'Missing invoice data',
        }
      }

      const userId = invoice.membership.metadata?.user_id || invoice.user?.id

      await paymentService.createInvoice({
        userId,
        email: invoice.user.email,
        whopInvoiceId: invoice.id,
        whopMembershipId: invoice.membership.id,
        amountDue: invoice.amount_due || 0,
        currency: invoice.currency || 'USD',
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
      })

      logger.info('[WebhookService] Invoice created', {
        invoiceId: invoice.id,
        email: invoice.user.email,
      })

      return {
        success: true,
        eventType: 'invoice.created',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle invoice.created', { error })
      return {
        success: false,
        eventType: 'invoice.created',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleInvoicePaid(
    invoice: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      await prisma.invoice.update({
        where: { whopInvoiceId: invoice.id },
        data: {
          status: 'PAID',
          amountPaid: invoice.amount_paid || 0,
          paidAt: invoice.paid_at ? new Date(invoice.paid_at * 1000) : new Date(),
        },
      })

      logger.info('[WebhookService] Invoice paid', {
        invoiceId: invoice.id,
      })

      return {
        success: true,
        eventType: 'invoice.paid',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle invoice.paid', { error })
      return {
        success: false,
        eventType: 'invoice.paid',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async handleInvoicePaymentFailed(
    invoice: any,
    prisma: PrismaClient
  ): Promise<WebhookProcessingResult> {
    try {
      await prisma.invoice.update({
        where: { whopInvoiceId: invoice.id },
        data: {
          status: 'OPEN',
        },
      })

      logger.info('[WebhookService] Invoice payment failed', {
        invoiceId: invoice.id,
      })

      return {
        success: true,
        eventType: 'invoice.payment_failed',
        processed: true,
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to handle invoice.payment_failed', { error })
      return {
        success: false,
        eventType: 'invoice.payment_failed',
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async logWebhookEvent(data: {
    eventId: string
    eventType: string
    success: boolean
    processed: boolean
    error?: string
  }): Promise<void> {
    try {
      logger.info('[WebhookService] Webhook event logged', data)
    } catch (error) {
      logger.error('[WebhookService] Failed to log webhook event', { error, data })
    }
  }

  async getWebhookStats(options?: {
    startDate?: Date
    endDate?: Date
    eventType?: string
  }): Promise<{
    success: boolean
    stats?: {
      totalEvents: number
      successfulEvents: number
      failedEvents: number
      eventsByType: Record<string, number>
    }
    error?: string
  }> {
    try {
      return {
        success: true,
        stats: {
          totalEvents: 0,
          successfulEvents: 0,
          failedEvents: 0,
          eventsByType: {},
        },
      }
    } catch (error) {
      logger.error('[WebhookService] Failed to fetch webhook stats', { error })
      return {
        success: false,
        error: 'Failed to fetch webhook stats',
      }
    }
  }
}

export const webhookService = WebhookService.getInstance()

export async function POST(req: NextRequest) {
  const requestBodyText = await req.text()
  const headers = Object.fromEntries(req.headers)

  let event
  try {
    event = whop.webhooks.unwrap(requestBodyText, { headers })
  } catch (err) {
    logger.error('[Webhook] Signature verification failed', { err })
    return NextResponse.json(
      { message: `Webhook Error: ${err}` },
      { status: 400 }
    )
  }

  const result = await webhookService.processWebhook(event)

  if (result.success || result.alreadyProcessed) {
    return NextResponse.json({ message: 'Received' }, { status: 200 })
  } else {
    return NextResponse.json(
      { message: result.error || 'Processing failed' },
      { status: 500 }
    )
  }
}

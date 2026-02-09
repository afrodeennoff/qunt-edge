import { prisma } from '@/lib/prisma'
import { whop } from '@/lib/whop'
import { logger } from '@/lib/logger'
import crypto from 'crypto'
import { PromotionType, TransactionStatus, TransactionType, InvoiceStatus } from '@/prisma/generated/prisma'
import type { Prisma } from '@/prisma/generated/prisma'

export interface PlanConfig {
  id: string
  name: string
  lookupKey: string
  amount: number
  currency: string
  interval: 'month' | 'quarter' | 'year' | 'lifetime'
  features: string[]
  trialDays?: number
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  monthly: {
    id: process.env.NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID || 'plan_55MGVOxft6Ipz',
    name: 'Monthly',
    lookupKey: 'monthly',
    amount: 2900,
    currency: 'USD',
    interval: 'month',
    features: ['Full platform access', 'Unlimited accounts', 'Priority support'],
  },
  quarterly: {
    id: process.env.NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID || 'plan_LqkGRNIhM2A2z',
    name: 'Quarterly',
    lookupKey: 'quarterly',
    amount: 7500,
    currency: 'USD',
    interval: 'quarter',
    features: ['Full platform access', 'Unlimited accounts', 'Priority support', 'Save 15%'],
  },
  yearly: {
    id: process.env.NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID || 'plan_JWhvqxtgDDqFf',
    name: 'Yearly',
    lookupKey: 'yearly',
    amount: 25000,
    currency: 'USD',
    interval: 'year',
    features: ['Full platform access', 'Unlimited accounts', 'Priority support', 'Save 30%'],
  },
  lifetime: {
    id: process.env.NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID || '',
    name: 'Lifetime',
    lookupKey: 'lifetime',
    amount: 49900,
    currency: 'USD',
    interval: 'lifetime',
    features: ['Lifetime access', 'All future updates', 'Priority support', 'Exclusive features'],
  },
}

export interface CheckoutSessionOptions {
  planKey: string
  userId: string
  email: string
  metadata?: Record<string, unknown>
  promotionCode?: string
  referralCode?: string
}

export class PaymentService {
  private static instance: PaymentService

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<{
    success: boolean
    checkoutUrl?: string
    error?: string
  }> {
    try {
      const { planKey, userId, email, metadata = {}, referralCode } = options
      const plan = PLAN_CONFIGS[planKey]

      if (!plan) {
        return { success: false, error: 'Invalid plan selected' }
      }

      const companyId = process.env.WHOP_COMPANY_ID || 'biz_jh37YZGpH5dWIY'

      const checkoutMetadata: Record<string, unknown> = {
        user_id: userId,
        email,
        plan: planKey,
        ...metadata,
      }

      if (referralCode) {
        checkoutMetadata.referral_code = referralCode
      }

      const checkoutConfig = await whop.checkoutConfigurations.create({
        company_id: companyId,
        plan_id: plan.id,
        metadata: checkoutMetadata,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      })

      logger.info('[PaymentService] Checkout session created', {
        userId,
        email,
        plan: planKey,
      })

      return {
        success: true,
        checkoutUrl: checkoutConfig.purchase_url,
      }
    } catch (error) {
      logger.error('[PaymentService] Failed to create checkout session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        options,
      })
      return {
        success: false,
        error: 'Failed to create checkout session. Please try again.',
      }
    }
  }

  async validatePromotionCode(code: string): Promise<{
    valid: boolean
    discount?: number
    type?: 'percentage' | 'fixed'
    error?: string
  }> {
    try {
      const promotion = await prisma.promotion.findUnique({
        where: { code: code.toUpperCase() },
      })

      if (!promotion) {
        return { valid: false, error: 'Invalid promotion code' }
      }

      if (!promotion.isActive) {
        return { valid: false, error: 'This promotion code is not active' }
      }

      const now = new Date()
      if (promotion.validFrom > now) {
        return { valid: false, error: 'This promotion code is not yet valid' }
      }

      if (promotion.validUntil && promotion.validUntil < now) {
        return { valid: false, error: 'This promotion code has expired' }
      }

      if (promotion.maxRedemptions && promotion.currentRedemptions >= promotion.maxRedemptions) {
        return { valid: false, error: 'This promotion code has reached maximum redemptions' }
      }

      return {
        valid: true,
        discount: promotion.value,
        type: promotion.type === PromotionType.PERCENTAGE ? 'percentage' : 'fixed',
      }
    } catch (error) {
      logger.error('[PaymentService] Failed to validate promotion code', { error, code })
      return { valid: false, error: 'Failed to validate promotion code' }
    }
  }

  async recordTransaction(data: {
    userId: string
    email: string
    whopTransactionId: string
    whopMembershipId?: string
    amount: number
    currency?: string
    type?: TransactionType
    status?: TransactionStatus
    metadata?: Prisma.InputJsonValue
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const transaction = await prisma.paymentTransaction.create({
        data: {
          userId: data.userId,
          email: data.email,
          whopTransactionId: data.whopTransactionId,
          whopMembershipId: data.whopMembershipId,
          amount: data.amount,
          currency: data.currency || 'USD',
          type: data.type || TransactionType.SUBSCRIPTION,
          status: data.status || TransactionStatus.PENDING,
          metadata: data.metadata,
        },
      })

      logger.info('[PaymentService] Transaction recorded', {
        transactionId: transaction.id,
        userId: data.userId,
        amount: data.amount,
      })

      return { success: true, transactionId: transaction.id }
    } catch (error) {
      logger.error('[PaymentService] Failed to record transaction', { error, data })
      return { success: false, error: 'Failed to record transaction' }
    }
  }

  async createInvoice(data: {
    userId: string
    email: string
    whopInvoiceId: string
    whopMembershipId?: string
    amountDue: number
    currency?: string
    dueDate?: Date
    lines?: Prisma.InputJsonValue
    invoicePdf?: string
    hostedInvoiceUrl?: string
  }): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    try {
      const invoice = await prisma.invoice.create({
        data: {
          userId: data.userId,
          email: data.email,
          whopInvoiceId: data.whopInvoiceId,
          whopMembershipId: data.whopMembershipId,
          amountDue: data.amountDue,
          currency: data.currency || 'USD',
          dueDate: data.dueDate,
          lines: data.lines ?? [],
          invoicePdf: data.invoicePdf,
          hostedInvoiceUrl: data.hostedInvoiceUrl,
          status: 'OPEN',
        },
      })

      logger.info('[PaymentService] Invoice created', {
        invoiceId: invoice.id,
        userId: data.userId,
        amountDue: data.amountDue,
      })

      return { success: true, invoiceId: invoice.id }
    } catch (error) {
      logger.error('[PaymentService] Failed to create invoice', { error, data })
      return { success: false, error: 'Failed to create invoice' }
    }
  }

  async processRefund(data: {
    transactionId: string
    amount?: number
    reason?: string
  }): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: data.transactionId },
      })

      if (!transaction) {
        return { success: false, error: 'Transaction not found' }
      }

      if (transaction.status !== 'COMPLETED') {
        return { success: false, error: 'Cannot refund a non-completed transaction' }
      }

      const refundAmount = data.amount || transaction.amount

      if (refundAmount > transaction.amount) {
        return { success: false, error: 'Refund amount exceeds transaction amount' }
      }

      const refund = await prisma.refund.create({
        data: {
          userId: transaction.userId,
          email: transaction.email,
          whopRefundId: `refund_${crypto.randomUUID()}`,
          whopPaymentId: transaction.whopTransactionId,
          transactionId: transaction.id,
          amount: refundAmount,
          currency: transaction.currency,
          status: 'PENDING',
          reason: data.reason,
        },
      })

      logger.info('[PaymentService] Refund initiated', {
        refundId: refund.id,
        transactionId: data.transactionId,
        amount: refundAmount,
      })

      return { success: true, refundId: refund.id }
    } catch (error) {
      logger.error('[PaymentService] Failed to process refund', { error, data })
      return { success: false, error: 'Failed to process refund' }
    }
  }

  async getTransactionHistory(userId: string, options?: {
    limit?: number
    offset?: number
    status?: TransactionStatus | string
  }): Promise<{
    success: boolean
    transactions?: unknown[]
    error?: string
  }> {
    try {
      const transactions = await prisma.paymentTransaction.findMany({
        where: {
          userId,
          ...(options?.status && { status: options.status as TransactionStatus }),
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      })

      return { success: true, transactions }
    } catch (error) {
      logger.error('[PaymentService] Failed to fetch transaction history', { error, userId })
      return { success: false, error: 'Failed to fetch transaction history' }
    }
  }

  async getInvoices(userId: string, options?: {
    limit?: number
    offset?: number
    status?: InvoiceStatus | string
  }): Promise<{
    success: boolean
    invoices?: unknown[]
    error?: string
  }> {
    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          userId,
          ...(options?.status && { status: options.status as InvoiceStatus }),
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      })

      return { success: true, invoices }
    } catch (error) {
      logger.error('[PaymentService] Failed to fetch invoices', { error, userId })
      return { success: false, error: 'Failed to fetch invoices' }
    }
  }

  async getFinancialSummary(userId: string): Promise<{
    success: boolean
    summary?: {
      totalSpent: number
      transactionCount: number
      activeSubscription: boolean
      nextBillingDate?: Date
      lastPaymentDate?: Date
    }
    error?: string
  }> {
    try {
      const transactions = await prisma.paymentTransaction.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
      })

      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      })

      const lastTransaction = transactions[0]

      return {
        success: true,
        summary: {
          totalSpent,
          transactionCount: transactions.length,
          activeSubscription: subscription?.status === 'ACTIVE',
          nextBillingDate: subscription?.endDate || undefined,
          lastPaymentDate: lastTransaction?.createdAt,
        },
      }
    } catch (error) {
      logger.error('[PaymentService] Failed to fetch financial summary', { error, userId })
      return { success: false, error: 'Failed to fetch financial summary' }
    }
  }
}

export const paymentService = PaymentService.getInstance()

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { paymentService } from '@/server/payment-service'
import { subscriptionManager } from '@/server/subscription-manager'
import { webhookService } from '@/server/webhook-service'
import { securityManager } from '@/server/payment-security'
import { prisma } from '@/lib/prisma'

describe('Payment System Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  describe('Payment Service Tests', () => {
    describe('Checkout Session Creation', () => {
      it('should create a checkout session for monthly plan', async () => {
        const result = await paymentService.createCheckoutSession({
          planKey: 'monthly',
          userId: 'test-user-1',
          email: 'test@example.com',
        })

        expect(result.success).toBe(true)
        expect(result.checkoutUrl).toBeDefined()
      })

      it('should create a checkout session with referral code', async () => {
        const result = await paymentService.createCheckoutSession({
          planKey: 'yearly',
          userId: 'test-user-2',
          email: 'test@example.com',
          referralCode: 'REFERRAL123',
        })

        expect(result.success).toBe(true)
      })

      it('should fail with invalid plan', async () => {
        const result = await paymentService.createCheckoutSession({
          planKey: 'invalid-plan',
          userId: 'test-user-3',
          email: 'test@example.com',
        })

        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid plan')
      })
    })

    describe('Promotion Code Validation', () => {
      it('should validate a valid promotion code', async () => {
        await prisma.promotion.create({
          data: {
            code: 'TEST20',
            name: 'Test Promotion',
            type: 'PERCENTAGE',
            value: 20,
            durationType: 'ONCE',
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
        })

        const result = await paymentService.validatePromotionCode('TEST20')

        expect(result.valid).toBe(true)
        expect(result.discount).toBe(20)
        expect(result.type).toBe('percentage')
      })

      it('should reject expired promotion code', async () => {
        await prisma.promotion.create({
          data: {
            code: 'EXPIRED',
            name: 'Expired Promotion',
            type: 'PERCENTAGE',
            value: 20,
            durationType: 'ONCE',
            validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            validUntil: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
        })

        const result = await paymentService.validatePromotionCode('EXPIRED')

        expect(result.valid).toBe(false)
        expect(result.error).toContain('expired')
      })

      it('should reject inactive promotion code', async () => {
        await prisma.promotion.create({
          data: {
            code: 'INACTIVE',
            name: 'Inactive Promotion',
            type: 'PERCENTAGE',
            value: 20,
            durationType: 'ONCE',
            validFrom: new Date(),
            isActive: false,
          },
        })

        const result = await paymentService.validatePromotionCode('INACTIVE')

        expect(result.valid).toBe(false)
        expect(result.error).toContain('not active')
      })
    })

    describe('Transaction Recording', () => {
      it('should record a successful transaction', async () => {
        const result = await paymentService.recordTransaction({
          userId: 'test-user',
          email: 'test@example.com',
          whopTransactionId: 'txn_test_123',
          amount: 2900,
          currency: 'USD',
          type: 'SUBSCRIPTION',
          status: 'COMPLETED',
        })

        expect(result.success).toBe(true)
        expect(result.transactionId).toBeDefined()
      })

      it('should not record duplicate transactions', async () => {
        const txnData = {
          userId: 'test-user',
          email: 'test@example.com',
          whopTransactionId: 'txn_test_123',
          amount: 2900,
          currency: 'USD',
          type: 'SUBSCRIPTION' as const,
          status: 'COMPLETED' as const,
        }

        await paymentService.recordTransaction(txnData)
        const result = await paymentService.recordTransaction(txnData)

        expect(result.success).toBe(false)
      })
    })

    describe('Invoice Creation', () => {
      it('should create an invoice', async () => {
        const result = await paymentService.createInvoice({
          userId: 'test-user',
          email: 'test@example.com',
          whopInvoiceId: 'inv_test_123',
          amountDue: 2900,
          currency: 'USD',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })

        expect(result.success).toBe(true)
        expect(result.invoiceId).toBeDefined()
      })
    })

    describe('Refund Processing', () => {
      it('should process a full refund', async () => {
        const txn = await prisma.paymentTransaction.create({
          data: {
            userId: 'test-user',
            email: 'test@example.com',
            whopTransactionId: 'txn_test_refund',
            amount: 2900,
            currency: 'USD',
            type: 'SUBSCRIPTION',
            status: 'COMPLETED',
          },
        })

        const result = await paymentService.processRefund({
          transactionId: txn.id,
          amount: 2900,
          reason: 'Customer requested refund',
        })

        expect(result.success).toBe(true)
        expect(result.refundId).toBeDefined()
      })

      it('should process a partial refund', async () => {
        const txn = await prisma.paymentTransaction.create({
          data: {
            userId: 'test-user',
            email: 'test@example.com',
            whopTransactionId: 'txn_test_partial',
            amount: 2900,
            currency: 'USD',
            type: 'SUBSCRIPTION',
            status: 'COMPLETED',
          },
        })

        const result = await paymentService.processRefund({
          transactionId: txn.id,
          amount: 1450,
          reason: 'Partial refund requested',
        })

        expect(result.success).toBe(true)
      })

      it('should fail to refund non-completed transaction', async () => {
        const txn = await prisma.paymentTransaction.create({
          data: {
            userId: 'test-user',
            email: 'test@example.com',
            whopTransactionId: 'txn_test_pending',
            amount: 2900,
            currency: 'USD',
            type: 'SUBSCRIPTION',
            status: 'PENDING',
          },
        })

        const result = await paymentService.processRefund({
          transactionId: txn.id,
        })

        expect(result.success).toBe(false)
        expect(result.error).toContain('non-completed')
      })
    })
  })

  describe('Subscription Manager Tests', () => {
    describe('Subscription Creation', () => {
      it('should create a monthly subscription', async () => {
        const result = await subscriptionManager.createSubscription({
          userId: 'test-user-monthly',
          email: 'test@example.com',
          plan: 'monthly',
          interval: 'month',
        })

        expect(result.success).toBe(true)
        expect(result.subscriptionId).toBeDefined()
      })

      it('should create a trial subscription', async () => {
        const result = await subscriptionManager.createSubscription({
          userId: 'test-user-trial',
          email: 'test@example.com',
          plan: 'monthly',
          interval: 'month',
          trial: true,
        })

        expect(result.success).toBe(true)
      })

      it('should create a lifetime subscription', async () => {
        const result = await subscriptionManager.createSubscription({
          userId: 'test-user-lifetime',
          email: 'test@example.com',
          plan: 'lifetime',
          interval: 'lifetime',
        })

        expect(result.success).toBe(true)
      })
    })

    describe('Subscription Updates', () => {
      it('should upgrade subscription plan', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'test-user-upgrade',
            email: 'test@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const result = await subscriptionManager.updateSubscription({
          userId: sub.userId,
          plan: 'YEARLY',
          interval: 'year',
        })

        expect(result.success).toBe(true)
      })

      it('should downgrade subscription plan', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'test-user-downgrade',
            email: 'test@example.com',
            plan: 'YEARLY',
            status: 'ACTIVE',
            interval: 'year',
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        })

        const result = await subscriptionManager.updateSubscription({
          userId: sub.userId,
          plan: 'MONTHLY',
          interval: 'month',
        })

        expect(result.success).toBe(true)
      })
    })

    describe('Subscription Cancellation', () => {
      it('should cancel subscription immediately', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'test-user-cancel-immediate',
            email: 'test@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const result = await subscriptionManager.cancelSubscription({
          userId: sub.userId,
          cancelAtPeriodEnd: false,
          reason: 'Not using the service',
        })

        expect(result.success).toBe(true)
      })

      it('should schedule subscription cancellation', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'test-user-cancel-end',
            email: 'test@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const result = await subscriptionManager.cancelSubscription({
          userId: sub.userId,
          cancelAtPeriodEnd: true,
          reason: 'Too expensive',
        })

        expect(result.success).toBe(true)
      })
    })

    describe('Payment Failure Handling', () => {
      it('should mark subscription as past due on first failure', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'test-user-fail-1',
            email: 'test@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const result = await subscriptionManager.handlePaymentFailure({
          userId: sub.userId,
          email: sub.email,
          whopMembershipId: 'membership_test',
          attemptNumber: 1,
        })

        expect(result.success).toBe(true)
        expect(result.actionTaken).toBe('marked_past_due')
      })

      it('should cancel subscription after 3 failures', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'test-user-fail-3',
            email: 'test@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const result = await subscriptionManager.handlePaymentFailure({
          userId: sub.userId,
          email: sub.email,
          whopMembershipId: 'membership_test',
          attemptNumber: 3,
        })

        expect(result.success).toBe(true)
        expect(result.actionTaken).toBe('cancelled')
      })
    })

    describe('Payment Success Handling', () => {
      it('should update subscription on successful payment', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'test-user-success',
            email: 'test@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const result = await subscriptionManager.handlePaymentSuccess({
          userId: sub.userId,
          email: sub.email,
          whopMembershipId: 'membership_test',
          amount: 2900,
          renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        })

        expect(result.success).toBe(true)
      })
    })

    describe('Grace Period Management', () => {
      it('should start grace period for expired subscriptions', async () => {
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
        await prisma.subscription.create({
          data: {
            userId: 'test-user-grace',
            email: 'test@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: pastDate,
          },
        })

        const result = await subscriptionManager.checkAndEnforceGracePeriods()

        expect(result.processed).toBeGreaterThan(0)
      })
    })
  })

  describe('Webhook Service Tests', () => {
    describe('Membership Events', () => {
      it('should process membership.activated event', async () => {
        const event = {
          id: 'evt_test_activated',
          type: 'membership.activated',
          data: {
            user: { email: 'webhook@example.com', id: 'user_webhook' },
            metadata: { user_id: 'user_webhook', plan: 'monthly' },
            product: { title: 'Monthly' },
            created_at: Date.now() / 1000,
          },
          created_at: Date.now() / 1000,
        }

        const result = await webhookService.processWebhook(event)

        expect(result.success).toBe(true)
        expect(result.processed).toBe(true)
      })

      it('should process membership.deactivated event', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'user_webhook_deactivate',
            email: 'webhook@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const event = {
          id: 'evt_test_deactivated',
          type: 'membership.deactivated',
          data: {
            user: { email: 'webhook@example.com' },
          },
          created_at: Date.now() / 1000,
        }

        const result = await webhookService.processWebhook(event)

        expect(result.success).toBe(true)
      })

      it('should process membership.updated event', async () => {
        const sub = await prisma.subscription.create({
          data: {
            userId: 'user_webhook_update',
            email: 'webhook@example.com',
            plan: 'MONTHLY',
            status: 'ACTIVE',
            interval: 'month',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        const event = {
          id: 'evt_test_updated',
          type: 'membership.updated',
          data: {
            user: { email: 'webhook@example.com' },
            metadata: { plan: 'yearly' },
            product: { title: 'Yearly' },
            status: 'active',
            renewal_period_end: (Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000,
          },
          created_at: Date.now() / 1000,
        }

        const result = await webhookService.processWebhook(event)

        expect(result.success).toBe(true)
      })
    })

    describe('Payment Events', () => {
      it('should process payment.succeeded event', async () => {
        const event = {
          id: 'evt_test_payment_success',
          type: 'payment.succeeded',
          data: {
            membership_id: 'membership_test',
            amount: 2900,
            currency: 'USD',
          },
          created_at: Date.now() / 1000,
        }

        vi.spyOn(webhookService as any, 'fetchMembership').mockResolvedValue({
          user: { email: 'payment@example.com', id: 'user_payment' },
          metadata: { user_id: 'user_payment', plan: 'monthly' },
          renewal_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
        })

        const result = await webhookService.processWebhook(event)

        expect(result.success).toBe(true)
      })

      it('should process payment.failed event', async () => {
        const event = {
          id: 'evt_test_payment_failed',
          type: 'payment.failed',
          data: {
            membership_id: 'membership_test_fail',
            amount: 2900,
          },
          created_at: Date.now() / 1000,
        }

        const result = await webhookService.processWebhook(event)

        expect(result.success).toBe(true)
      })
    })

    describe('Invoice Events', () => {
      it('should process invoice.created event', async () => {
        const event = {
          id: 'evt_test_invoice_created',
          type: 'invoice.created',
          data: {
            id: 'inv_test_webhook',
            user: { email: 'invoice@example.com', id: 'user_invoice' },
            membership: { id: 'membership_invoice', metadata: { user_id: 'user_invoice' } },
            amount_due: 2900,
            currency: 'USD',
            hosted_invoice_url: 'https://example.com/invoice',
          },
          created_at: Date.now() / 1000,
        }

        const result = await webhookService.processWebhook(event)

        expect(result.success).toBe(true)
      })

      it('should process invoice.paid event', async () => {
        const invoice = await prisma.invoice.create({
          data: {
            userId: 'user_invoice_paid',
            email: 'invoice@example.com',
            whopInvoiceId: 'inv_test_paid',
            amountDue: 2900,
            currency: 'USD',
            status: 'OPEN',
          },
        })

        const event = {
          id: 'evt_test_invoice_paid',
          type: 'invoice.paid',
          data: {
            id: 'inv_test_paid',
            amount_paid: 2900,
            paid_at: Date.now() / 1000,
          },
          created_at: Date.now() / 1000,
        }

        const result = await webhookService.processWebhook(event)

        expect(result.success).toBe(true)
      })
    })
  })

  describe('Security Manager Tests', () => {
    describe('Encryption/Decryption', () => {
      it('should encrypt and decrypt text correctly', () => {
        const plaintext = 'sensitive-data-123'
        const encrypted = securityManager.encrypt(plaintext)
        const decrypted = securityManager.decrypt(encrypted)

        expect(decrypted).toBe(plaintext)
      })

      it('should produce different encrypted values for same input', () => {
        const plaintext = 'same-input'
        const encrypted1 = securityManager.encrypt(plaintext)
        const encrypted2 = securityManager.encrypt(plaintext)

        expect(encrypted1).not.toBe(encrypted2)
      })
    })

    describe('Input Validation', () => {
      it('should validate valid email', () => {
        const result = securityManager.validateEmail('test@example.com')
        expect(result).toBe(true)
      })

      it('should reject invalid email', () => {
        const result = securityManager.validateEmail('invalid-email')
        expect(result).toBe(false)
      })

      it('should validate valid amount', () => {
        const result = securityManager.validateAmount(29.99)
        expect(result).toBe(true)
      })

      it('should reject invalid amount', () => {
        const result = securityManager.validateAmount(-10)
        expect(result).toBe(false)
      })
    })

    describe('Data Masking', () => {
      it('should mask card number correctly', () => {
        const cardNumber = '4242424242424242'
        const masked = securityManager.maskCardNumber(cardNumber)

        expect(masked).toBe('4242************4242')
      })

      it('should mask email correctly', () => {
        const email = 'test@example.com'
        const masked = securityManager.maskEmail(email)

        expect(masked).toMatch(/^te\*+@example\.com$/)
      })
    })

    describe('Rate Limiting', () => {
      it('should allow requests within limit', async () => {
        const result = await securityManager.checkRateLimit('user-1')
        expect(result.allowed).toBe(true)
      })

      it('should block requests over limit', async () => {
        for (let i = 0; i < 101; i++) {
          await securityManager.checkRateLimit('user-spam')
        }

        const result = await securityManager.checkRateLimit('user-spam')
        expect(result.allowed).toBe(false)
      })
    })

    describe('Suspicious Activity Detection', () => {
      it('should detect suspicious activity with high score', () => {
        const result = securityManager.detectSuspiciousActivity({
          userId: 'test-user',
          email: 'invalid-email',
          actionType: 'checkout',
        })

        expect(result.suspicious).toBe(true)
        expect(result.score).toBeGreaterThanOrEqual(50)
      })

      it('should not detect suspicious activity for normal data', () => {
        const result = securityManager.detectSuspiciousActivity({
          userId: 'test-user',
          email: 'test@example.com',
          actionType: 'checkout',
        })

        expect(result.suspicious).toBe(false)
        expect(result.score).toBeLessThan(50)
      })
    })
  })

  describe('End-to-End Payment Flow Tests', () => {
    it('should complete full subscription lifecycle', async () => {
      const userId = 'e2e-test-user'
      const email = 'e2e@example.com'

      const checkoutResult = await paymentService.createCheckoutSession({
        planKey: 'monthly',
        userId,
        email,
      })
      expect(checkoutResult.success).toBe(true)

      const subResult = await subscriptionManager.createSubscription({
        userId,
        email,
        plan: 'monthly',
        interval: 'month',
      })
      expect(subResult.success).toBe(true)

      const paymentResult = await paymentService.recordTransaction({
        userId,
        email,
        whopTransactionId: 'txn_e2e',
        amount: 2900,
        type: 'SUBSCRIPTION',
        status: 'COMPLETED',
      })
      expect(paymentResult.success).toBe(true)

      const cancelResult = await subscriptionManager.cancelSubscription({
        userId,
        cancelAtPeriodEnd: false,
      })
      expect(cancelResult.success).toBe(true)
    })

    it('should handle payment failure and retry', async () => {
      const userId = 'e2e-retry-user'
      const email = 'retry@example.com'

      await subscriptionManager.createSubscription({
        userId,
        email,
        plan: 'monthly',
        interval: 'month',
      })

      const fail1Result = await subscriptionManager.handlePaymentFailure({
        userId,
        email,
        whopMembershipId: 'membership_retry',
        attemptNumber: 1,
      })
      expect(fail1Result.actionTaken).toBe('marked_past_due')

      const fail2Result = await subscriptionManager.handlePaymentFailure({
        userId,
        email,
        whopMembershipId: 'membership_retry',
        attemptNumber: 2,
      })
      expect(fail2Result.actionTaken).toBe('marked_past_due')

      const fail3Result = await subscriptionManager.handlePaymentFailure({
        userId,
        email,
        whopMembershipId: 'membership_retry',
        attemptNumber: 3,
      })
      expect(fail3Result.actionTaken).toBe('cancelled')
    })

    it('should handle plan upgrade', async () => {
      const userId = 'e2e-upgrade-user'
      const email = 'upgrade@example.com'

      await subscriptionManager.createSubscription({
        userId,
        email,
        plan: 'monthly',
        interval: 'month',
      })

      const upgradeResult = await subscriptionManager.updateSubscription({
        userId,
        plan: 'yearly',
        interval: 'year',
      })
      expect(upgradeResult.success).toBe(true)
    })

    it('should handle refund flow', async () => {
      const userId = 'e2e-refund-user'
      const email = 'refund@example.com'

      const txn = await prisma.paymentTransaction.create({
        data: {
          userId,
          email,
          whopTransactionId: 'txn_e2e_refund',
          amount: 2900,
          currency: 'USD',
          type: 'SUBSCRIPTION',
          status: 'COMPLETED',
        },
      })

      const refundResult = await paymentService.processRefund({
        transactionId: txn.id,
        amount: 2900,
        reason: 'Customer satisfaction',
      })
      expect(refundResult.success).toBe(true)
    })
  })
})

# Payment System Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Overview

The payment system is built on top of Whop payment gateway and provides comprehensive subscription management, payment processing, and access control capabilities.

### Key Features
- **Payment Gateway Integration**: Seamless integration with Whop for payment processing
- **Subscription Management**: Complete lifecycle management for subscriptions
- **Webhook Handling**: Robust webhook event processing with retry logic
- **Security**: PCI compliance, encryption, and fraud detection
- **Access Control**: Middleware and hooks for protecting premium features
- **Admin Tools**: Comprehensive admin interfaces for managing subscriptions and generating reports

## Align with Whop's Get Started

When you configure pricing or add new tiers, follow the official Whop Getting Started guide (https://docs.whop.com/get-started). Key steps to keep in sync with this project:

1. **Create a Whop company/product** and define the plans you will sell (monthly, quarterly, yearly, lifetime) so the plan IDs map to the `PLAN_CONFIGS` entries in `server/payment-service.ts`.
2. **Set up your checkout/embedded experience**, capture the purchase URL, and pass the metadata (user_id, plan, referral code) exactly as `createCheckoutSession` expects.
3. **Configure the webhook endpoint (`/api/whop/webhook`)** and copy the `WHOP_WEBHOOK_SECRET` into your environment so the server can validate incoming events before `webhook-service` processes them.
4. **Wire up payouts and invoices** inside Whop and rely on the `paymentService` helpers to record transactions/invoices locally whenever events fire.

## Installation & Setup

### 1. Install Dependencies

The payment system uses the following main dependencies:
- `@whop/sdk` - Whop payment gateway SDK
- `@prisma/client` - Database ORM
- `crypto` - Built-in Node.js module for encryption

### 2. Environment Variables

Add the following variables to your `.env` file:

```bash
# Whop Configuration
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
WHOP_COMPANY_ID=biz_jh37YZGpH5dWIY
WHOP_CLIENT_SECRET=your_client_secret
WHOP_WEBHOOK_SECRET=your_webhook_secret

# Plan IDs
NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID=plan_55MGVOxft6Ipz
NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID=plan_LqkGRNIhM2A2z
NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID=plan_JWhvqxtgDDqFf
NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID=your_lifetime_plan_id

# Security
ENCRYPTION_KEY=your_32_character_encryption_key

# Admin
ADMIN_EMAIL_DOMAINS=yourdomain.com,anotherdomain.com
```

### 3. Generate Encryption Key

Generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Configuration

### Plan Configuration

Plans are configured in [`server/payment-service.ts`](../server/payment-service.ts):

```typescript
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  monthly: {
    id: 'plan_55MGVOxft6Ipz',
    name: 'Monthly',
    lookupKey: 'monthly',
    amount: 2900,
    currency: 'USD',
    interval: 'month',
    features: ['Full platform access', 'Unlimited accounts', 'Priority support'],
  },
  // ... more plans
}
```

### Grace Period Configuration

Configure grace period settings in [`server/subscription-manager.ts`](../server/subscription-manager.ts):

```typescript
const GRACE_PERIOD_CONFIG: GracePeriodConfig = {
  enabled: true,
  duration: 7,
  unit: 'days',
}
```

## Database Setup

### 1. Update Prisma Schema

The payment system extends the existing Prisma schema with new models:
- `PaymentTransaction` - Payment transaction records
- `Invoice` - Invoice records
- `Refund` - Refund records
- `SubscriptionEvent` - Audit trail
- `PaymentMethod` - Stored payment methods
- `Promotion` - Discount codes
- `UsageMetric` - Usage tracking

### 2. Run Migrations

```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Initial Data (Optional)

Create seed data for promotions:

```typescript
await prisma.promotion.create({
  data: {
    code: 'WELCOME20',
    name: 'Welcome Discount',
    type: 'PERCENTAGE',
    value: 20,
    durationType: 'ONCE',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
})
```

## API Reference

### Payment Service

#### `createCheckoutSession(options)`

Creates a checkout session for a new subscription.

```typescript
const result = await paymentService.createCheckoutSession({
  planKey: 'monthly',
  userId: 'user_123',
  email: 'user@example.com',
  referralCode: 'REFERRAL123',
})
```

#### `validatePromotionCode(code)`

Validates a promotion code.

```typescript
const result = await paymentService.validatePromotionCode('WELCOME20')
```

### Subscription Manager

#### `createSubscription(data)`

Creates or updates a subscription.

```typescript
await subscriptionManager.createSubscription({
  userId: 'user_123',
  email: 'user@example.com',
  plan: 'monthly',
  interval: 'month',
  trial: true,
})
```

#### `cancelSubscription(data)`

Cancels a subscription.

```typescript
await subscriptionManager.cancelSubscription({
  userId: 'user_123',
  cancelAtPeriodEnd: true,
  reason: 'Too expensive',
})
```

### Webhook Service

The webhook service handles all Whop webhook events automatically. Events processed:
- `membership.activated`
- `membership.deactivated`
- `membership.updated`
- `membership.trialing`
- `payment.succeeded`
- `payment.failed`
- `payment.refunded`
- `invoice.created`
- `invoice.paid`
- `invoice.payment_failed`

## Usage Examples

### Creating a Checkout Flow

```typescript
'use server'

import { paymentService } from '@/server/payment-service'
import { redirect } from 'next/navigation'

export async function initiateCheckout(planKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/authentication?redirect=' + encodeURIComponent('/pricing'))
  }

  const result = await paymentService.createCheckoutSession({
    planKey,
    userId: user.id,
    email: user.email!,
  })

  if (result.success && result.checkoutUrl) {
    redirect(result.checkoutUrl)
  } else {
    redirect('/pricing?error=' + encodeURIComponent(result.error || 'Unknown error'))
  }
}
```

### Checking Subscription Status

```typescript
'use server'

import { getSubscriptionDetails } from '@/server/subscription'

export async function checkAccess() {
  const subscription = await getSubscriptionDetails()

  if (!subscription || !subscription.isActive) {
    return { allowed: false, reason: 'No active subscription' }
  }

  return { allowed: true, plan: subscription.plan }
}
```

### Protecting Routes

```typescript
import { useSubscriptionGuard } from '@/hooks/use-subscription'

export default function PremiumFeature() {
  const { Guard } = useSubscriptionGuard('advanced_analytics')

  return (
    <Guard>
      <div>Your premium content here</div>
    </Guard>
  )
}
```

### Admin: Managing Subscriptions

```typescript
'use server'

import { prisma } from '@/lib/prisma'

export async function updateUserSubscription(subscriptionId: string, plan: string) {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      plan: plan.toUpperCase(),
      status: 'ACTIVE',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })
}
```

## Testing

### Unit Tests

```typescript
import { paymentService } from '@/server/payment-service'

describe('PaymentService', () => {
  it('should create a checkout session', async () => {
    const result = await paymentService.createCheckoutSession({
      planKey: 'monthly',
      userId: 'test-user',
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })
})
```

### Integration Tests

```typescript
import { POST } from '@/app/api/whop/webhook/route'
import { NextRequest } from 'next/server'

describe('Webhook Handler', () => {
  it('should process membership.activated event', async () => {
    const mockEvent = {
      id: 'evt_test',
      type: 'membership.activated',
      data: {
        user: { email: 'test@example.com' },
        metadata: { user_id: 'user_123', plan: 'monthly' },
      },
    }

    const response = await POST(new NextRequest('http://localhost/api/whop/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
    }))

    expect(response.status).toBe(200)
  })
})
```

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events

**Problem**: Webhooks are not being processed.

**Solutions**:
- Verify webhook secret in environment variables
- Check Whop dashboard for webhook URL configuration
- Ensure server is publicly accessible
- Check webhook signature verification

#### 2. Subscription Not Active After Payment

**Problem**: User completed payment but subscription not active.

**Solutions**:
- Check webhook processing logs
- Verify database connectivity
- Check for errors in webhook event handling
- Manually sync with Whop API

#### 3. Access Control Not Working

**Problem**: Users can access premium features without subscription.

**Solutions**:
- Verify middleware is configured correctly
- Check subscription status in headers
- Ensure `getSubscriptionDetails()` returns correct data
- Clear browser cache

### Debug Mode

Enable debug logging:

```typescript
// In your server action or API route
process.env.LOG_LEVEL = 'debug'
```

### Testing Webhooks Locally

Use ngrok or similar to expose your local server:

```bash
ngrok http 3000
```

Then update your Whop webhook URL to use the ngrok URL.

## Best Practices

### Security
1. Never log full payment details
2. Always validate user input
3. Use webhook signature verification
4. Encrypt sensitive data at rest
5. Implement rate limiting

### Performance
1. Cache subscription status (5-minute TTL)
2. Use database indexes for queries
3. Implement webhook processing queue
4. Monitor webhook processing times

### Monitoring
1. Track conversion rates
2. Monitor webhook failure rates
3. Alert on payment failure spikes
4. Track subscription churn
5. Monitor API response times

## Support

For issues or questions:
- Check the logs: `logger.error()` calls throughout the codebase
- Review Whop documentation: https://docs.whop.com/
- Check database for subscription records
- Test webhook endpoints using Whop's webhook testing tools

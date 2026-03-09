# Complete Payment System Guide

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [How It Works](#how-it-works)
7. [API Reference](#api-reference)
8. [Frontend Integration](#frontend-integration)
9. [Admin Panel](#admin-panel)
10. [Testing](#testing)
11. [Security](#security)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)
14. [FAQ](#faq)

---

## Introduction

This payment system is a comprehensive, production-ready solution built on top of Whop payment gateway. It provides complete subscription management, payment processing, webhook handling, access control, and admin tools.

### What This System Does

✅ **Subscription Management** - Full lifecycle: create, update, cancel, renew
✅ **Payment Processing** - Integration with Whop for secure payments
✅ **Webhook Handling** - Automatic processing of all payment events
✅ **Access Control** - Protect premium features with middleware and hooks
✅ **Admin Tools** - Manage subscriptions and generate financial reports
✅ **Security** - PCI compliant with encryption and fraud detection
✅ **Testing** - Comprehensive test suite included

### Key Features

| Feature | Description |
|---------|-------------|
| **Multiple Plans** | Monthly, quarterly, yearly, and lifetime options |
| **Trial Support** | 14-day free trials with automatic conversion |
| **Grace Period** | 7-day grace period after subscription expires |
| **Payment Recovery** | Automatic retry logic for failed payments |
| **Promotion Codes** | Discount code system with validation |
| **Refund Processing** | Full and partial refund support |
| **Audit Trail** | Complete event history for all subscriptions |
| **Financial Reports** | MRR, ARR, churn, and revenue analytics |

---

## System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  Pricing Page  │  Checkout  │  Dashboard  │  Admin Panel  │  Billing UI │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  /api/whop/checkout  │  /api/whop/webhook  │  /api/admin/*    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  PaymentService  │  SubscriptionManager  │  WebhookService      │
│  SecurityManager │  RateLimiter          │  ReportService       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Prisma ORM)  │  Whop API  │  Cache  │  Audit Logs  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Payment Service (`server/payment-service.ts`)
- Creates checkout sessions via Whop
- Validates promotion codes
- Records transactions
- Creates invoices
- Processes refunds

#### 2. Subscription Manager (`server/subscription-manager.ts`)
- Creates/updates/cancels subscriptions
- Handles payment failures with retry logic
- Manages grace periods
- Tracks usage metrics
- Records subscription events

#### 3. Webhook Service (`server/webhook-service.ts`)
- Processes all Whop webhook events
- Verifies webhook signatures
- Handles idempotency
- Manages event queue

#### 4. Security Manager (`server/payment-security.ts`)
- Encrypts/decrypts sensitive data
- Validates inputs
- Detects suspicious activity
- Implements rate limiting
- Masks sensitive data

#### 5. Middleware (`middleware.ts`)
- Protects routes based on subscription status
- Checks admin access
- Adds subscription headers

#### 6. React Hooks (`hooks/use-subscription.ts`)
- `useSubscription()` - Get subscription details
- `useSubscriptionGuard()` - Protect premium features
- `useTrialStatus()` - Track trial status
- `useSubscriptionExpiry()` - Monitor expiry

---

## Installation & Setup

### Step 1: Install Dependencies

The payment system uses these key dependencies:

```json
{
  "@whop/sdk": "^0.0.23",           // Whop payment gateway
  "@prisma/client": "^7.2.0",        // Database ORM
  "@prisma/adapter-pg": "^7.2.0",    // PostgreSQL adapter
  "pg": "^8.17.2",                   // PostgreSQL client
  "crypto": "built-in"               // Node.js encryption
}
```

Install them:

```bash
npm install @whop/sdk @prisma/client @prisma/adapter-pg pg
```

### Step 2: Install Test Dependencies (Optional)

For running the test suite:

```bash
npm install --save-dev vitest @vitest/ui vite-tsconfig-paths
```

### Step 3: Update Environment Variables

Add these variables to your `.env` file:

```bash
# ============================================
# PAYMENT SYSTEM CONFIGURATION
# ============================================

# Whop Configuration
WHOP_API_KEY=your_whop_api_key_here
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id_here
WHOP_COMPANY_ID=biz_jh37YZGpH5dWIY
WHOP_CLIENT_SECRET=your_client_secret_here
WHOP_WEBHOOK_SECRET=your_webhook_secret_here

# Plan IDs
NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID=plan_55MGVOxft6Ipz
NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID=plan_LqkGRNIhM2A2z
NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID=plan_JWhvqxtgDDqFf
NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID=your_lifetime_plan_id_here

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Admin Access
ADMIN_EMAIL_DOMAINS=yourdomain.com,admin.com

# Application URL (for redirects)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 4: Generate Encryption Key

Generate a secure 32-byte encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and set it as `ENCRYPTION_KEY` in your `.env` file.

### Step 5: Get Whop Credentials

1. Go to [Whop Dashboard](https://whop.com/dashboard/)
2. Create a new app or use existing one
3. Copy your API credentials:
   - API Key
   - App ID
   - Company ID
   - Client Secret
   - Webhook Secret

### Step 6: Configure Whop Webhook

In your Whop dashboard, set the webhook URL to:

```
https://yourdomain.com/api/whop/webhook
```

For local testing, use ngrok:

```bash
npx ngrok http 3000
```

Then use the ngrok URL in Whop dashboard.

---

## Configuration

### Plan Configuration

Plans are configured in `server/payment-service.ts`:

```typescript
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  monthly: {
    id: 'plan_55MGVOxft6Ipz',
    name: 'Monthly',
    lookupKey: 'monthly',
    amount: 2900,           // $29.00 in cents
    currency: 'USD',
    interval: 'month',
    features: [
      'Full platform access',
      'Unlimited accounts',
      'Priority support'
    ],
  },
  quarterly: {
    id: 'plan_LqkGRNIhM2A2z',
    name: 'Quarterly',
    lookupKey: 'quarterly',
    amount: 7500,           // $75.00 in cents
    currency: 'USD',
    interval: 'quarter',
    features: [
      'Full platform access',
      'Unlimited accounts',
      'Priority support',
      'Save 15%'
    ],
  },
  yearly: {
    id: 'plan_JWhvqxtgDDqFf',
    name: 'Yearly',
    lookupKey: 'yearly',
    amount: 25000,          // $250.00 in cents
    currency: 'USD',
    interval: 'year',
    features: [
      'Full platform access',
      'Unlimited accounts',
      'Priority support',
      'Save 30%'
    ],
  },
  lifetime: {
    id: 'your_lifetime_plan_id',
    name: 'Lifetime',
    lookupKey: 'lifetime',
    amount: 49900,          // $499.00 in cents
    currency: 'USD',
    interval: 'lifetime',
    features: [
      'Lifetime access',
      'All future updates',
      'Priority support',
      'Exclusive features'
    ],
  },
}
```

### Grace Period Configuration

Configure in `server/subscription-manager.ts`:

```typescript
const GRACE_PERIOD_CONFIG: GracePeriodConfig = {
  enabled: true,    // Enable/disable grace period
  duration: 7,      // Days after expiry before cancellation
  unit: 'days',
}
```

### Trial Configuration

Trial days are configured in `server/subscription-manager.ts`:

```typescript
const TRIAL_DAYS = 14  // 14-day free trial
```

### Feature Access Configuration

Configure feature access in `hooks/use-subscription.ts`:

```typescript
const FEATURE_ACCESS: FeatureAccessConfig = {
  FREE: ['basic_dashboard', 'limited_accounts', 'community_access'],
  MONTHLY: [
    'basic_dashboard',
    'unlimited_accounts',
    'priority_support',
    'api_access'
  ],
  QUARTERLY: [
    'basic_dashboard',
    'unlimited_accounts',
    'priority_support',
    'api_access',
    'advanced_analytics'
  ],
  YEARLY: [
    'basic_dashboard',
    'unlimited_accounts',
    'priority_support',
    'api_access',
    'advanced_analytics',
    'custom_integrations'
  ],
  LIFETIME: ['all_features'],
}
```

---

## Database Setup

### Database Models

The payment system adds these models to your Prisma schema:

```prisma
// Payment transactions
model PaymentTransaction {
  id                String   @id @default(uuid())
  userId            String
  email             String
  whopTransactionId String   @unique
  amount            Float
  currency          String   @default("USD")
  status            TransactionStatus
  type              TransactionType
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
}

// Invoices
model Invoice {
  id                String   @id @default(uuid())
  userId            String
  email             String
  whopInvoiceId     String   @unique
  amountDue         Float
  amountPaid        Float    @default(0)
  currency          String   @default("USD")
  status            InvoiceStatus
  dueDate           DateTime?
  paidAt            DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
}

// Refunds
model Refund {
  id                String   @id @default(uuid())
  userId            String
  email             String
  whopRefundId      String   @unique
  transactionId     String
  amount            Float
  currency          String   @default("USD")
  status            RefundStatus
  reason            String?
  processedAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
}

// Subscription events (audit trail)
model SubscriptionEvent {
  id              String   @id @default(uuid())
  userId          String
  email           String
  subscriptionId  String
  eventType       SubscriptionEventType
  eventData       Json
  createdAt       DateTime @default(now())
}

// Promotions
model Promotion {
  id              String   @id @default(uuid())
  code            String   @unique
  name            String
  type            PromotionType
  value           Float
  durationType    DurationType
  maxRedemptions  Int?
  currentRedemptions Int   @default(0)
  validFrom       DateTime
  validUntil      DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Usage metrics
model UsageMetric {
  id              String   @id @default(uuid())
  userId          String
  email           String
  metricType      String
  metricValue     Float
  periodStart     DateTime
  periodEnd       DateTime
  metadata        Json?
  createdAt       DateTime @default(now())
}
```

### Running Migrations

Step 1: Generate Prisma client

```bash
npx prisma generate
```

Step 2: Push schema to database

```bash
npx prisma db push
```

Step 3: (Optional) Create seed data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create welcome discount
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

  // Create holiday promotion
  await prisma.promotion.create({
    data: {
      code: 'HOLIDAY25',
      name: 'Holiday Special',
      type: 'PERCENTAGE',
      value: 25,
      durationType: 'REPEATING',
      durationInMonths: 3,
      maxRedemptions: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seed:

```bash
npx ts-node prisma/seed.ts
```

---

## How It Works

### Complete Payment Flow

#### 1. New User Subscription

```
User → Pricing Page → Selects Plan → Checkout
                              ↓
                    Create Checkout Session (Whop)
                              ↓
                    User Completes Payment
                              ↓
                    Whop Sends Webhook Event
                              ↓
                    membership.activated Received
                              ↓
                    Create Subscription Record
                              ↓
                    Grant Access to User
                              ↓
                    Send Confirmation Email
```

#### 2. Subscription Renewal

```
Renewal Date Arrives
        ↓
Whop Processes Payment
        ↓
Payment Succeeded
        ↓
Webhook: payment.succeeded
        ↓
Update Subscription End Date
        ↓
Log Transaction
        ↓
Send Renewal Notification
```

#### 3. Payment Failure

```
Whop Attempts Payment
        ↓
Payment Fails
        ↓
Webhook: payment.failed
        ↓
Mark Subscription as PAST_DUE
        ↓
Attempt 1: Retry immediately
        ↓
Attempt 2: Retry in 24 hours
        ↓
Attempt 3: Retry in 48 hours
        ↓
All retries failed
        ↓
Cancel Subscription
        ↓
Notify User
```

#### 4. Subscription Cancellation

```
User Requests Cancellation
        ↓
Two Options:
  1. Immediate: Cancel now
  2. End of Period: Keep access until period end
        ↓
Update cancel_at_period_end Flag
        ↓
User Continues Access (if end of period)
        ↓
Period Ends
        ↓
Webhook: membership.deactivated
        ↓
Revoke Access
        ↓
Send Cancellation Confirmation
```

### Webhook Event Processing

The webhook service handles these events:

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `membership.activated` | New subscription created | Create/update subscription record |
| `membership.deactivated` | Subscription cancelled | Set status to CANCELLED |
| `membership.updated` | Plan changed | Update subscription details |
| `membership.trialing` | Trial started | Create trial subscription |
| `payment.succeeded` | Payment successful | Update end date, log transaction |
| `payment.failed` | Payment failed | Mark as PAST_DUE, initiate retry |
| `payment.refunded` | Refund processed | Create refund record |
| `invoice.created` | Invoice generated | Create invoice record |
| `invoice.paid` | Invoice paid | Update invoice status |

### Access Control Flow

```
User Attempts to Access Premium Feature
            ↓
Middleware Checks Authentication
            ↓
Get Subscription Details
            ↓
Is Subscription Active?
  ├── No → Redirect to Pricing
  └── Yes → Check Feature Access
           ├── Feature Allowed → Grant Access
           └── Feature Restricted → Show Upgrade Modal
```

---

## API Reference

### Payment Service API

#### `createCheckoutSession(options)`

Creates a checkout session for a new subscription.

```typescript
const result = await paymentService.createCheckoutSession({
  planKey: 'monthly',                    // Required: Plan identifier
  userId: 'user_123',                     // Required: User ID
  email: 'user@example.com',              // Required: User email
  metadata: { custom_field: 'value' },    // Optional: Custom metadata
  promotionCode: 'SAVE20',                // Optional: Promotion code
  referralCode: 'REFERRAL123',            // Optional: Referral code
})

// Returns:
{
  success: boolean,
  checkoutUrl?: string,   // URL to redirect user to
  error?: string          // Error message if failed
}
```

#### `validatePromotionCode(code)`

Validates a promotion code.

```typescript
const result = await paymentService.validatePromotionCode('WELCOME20')

// Returns:
{
  valid: boolean,
  discount?: number,     // Discount amount
  type?: 'percentage' | 'fixed',
  error?: string         // Error message if invalid
}
```

#### `recordTransaction(data)`

Records a payment transaction.

```typescript
const result = await paymentService.recordTransaction({
  userId: 'user_123',
  email: 'user@example.com',
  whopTransactionId: 'txn_abc123',
  whopMembershipId: 'mem_xyz789',
  amount: 2900,                  // Amount in cents
  currency: 'USD',
  type: 'SUBSCRIPTION',
  status: 'COMPLETED',
  metadata: { custom: 'data' }
})

// Returns:
{
  success: boolean,
  transactionId?: string,
  error?: string
}
```

#### `processRefund(data)`

Processes a refund.

```typescript
const result = await paymentService.processRefund({
  transactionId: 'txn_abc123',
  amount: 2900,                  // Optional: omit for full refund
  reason: 'Customer requested refund'
})

// Returns:
{
  success: boolean,
  refundId?: string,
  error?: string
}
```

#### `getTransactionHistory(userId, options)`

Gets transaction history for a user.

```typescript
const result = await paymentService.getTransactionHistory('user_123', {
  limit: 50,              // Optional: default 50
  offset: 0,              // Optional: default 0
  status: 'COMPLETED'     // Optional: filter by status
})

// Returns:
{
  success: boolean,
  transactions?: Array<{
    id: string
    amount: number
    currency: string
    status: string
    type: string
    createdAt: Date
  }>,
  error?: string
}
```

### Subscription Manager API

#### `createSubscription(data)`

Creates or updates a subscription.

```typescript
const result = await subscriptionManager.createSubscription({
  userId: 'user_123',
  email: 'user@example.com',
  plan: 'monthly',              // Plan name
  interval: 'month',            // Billing interval
  whopMembershipId: 'mem_abc',  // Optional: Whop membership ID
  trial: true,                  // Optional: Create as trial
  metadata: { custom: 'data' }  // Optional: Custom metadata
})

// Returns:
{
  success: boolean,
  subscriptionId?: string,
  error?: string
}
```

#### `updateSubscription(data)`

Updates an existing subscription.

```typescript
const result = await subscriptionManager.updateSubscription({
  userId: 'user_123',
  plan: 'yearly',               // Optional: New plan
  interval: 'year',             // Optional: New interval
  status: 'ACTIVE',             // Optional: New status
  endDate: new Date(),          // Optional: New end date
  metadata: { updated: true }   // Optional: Custom metadata
})

// Returns:
{
  success: boolean,
  error?: string
}
```

#### `cancelSubscription(data)`

Cancels a subscription.

```typescript
const result = await subscriptionManager.cancelSubscription({
  userId: 'user_123',
  cancelAtPeriodEnd: true,       // true = cancel at period end
                                 // false = cancel immediately
  reason: 'Too expensive'        // Optional: Cancellation reason
})

// Returns:
{
  success: boolean,
  error?: string
}
```

#### `handlePaymentSuccess(data)`

Handles successful payment (webhook).

```typescript
const result = await subscriptionManager.handlePaymentSuccess({
  userId: 'user_123',
  email: 'user@example.com',
  whopMembershipId: 'mem_abc',
  amount: 2900,
  renewalDate: new Date()        // Optional: New renewal date
})

// Returns:
{
  success: boolean,
  error?: string
}
```

#### `handlePaymentFailure(data)`

Handles failed payment (webhook).

```typescript
const result = await subscriptionManager.handlePaymentFailure({
  userId: 'user_123',
  email: 'user@example.com',
  whopMembershipId: 'mem_abc',
  attemptNumber: 1               // Current retry attempt (1-3)
})

// Returns:
{
  success: boolean,
  actionTaken?: 'marked_past_due' | 'cancelled',
  error?: string
}
```

### Admin API Endpoints

#### `GET /api/admin/subscriptions`

Get all subscriptions with filtering and pagination.

```typescript
const response = await fetch('/api/admin/subscriptions?' + new URLSearchParams({
  page: '1',
  limit: '50',
  status: 'ACTIVE',        // Optional: filter by status
  plan: 'MONTHLY',         // Optional: filter by plan
  search: 'user@example'   // Optional: search by email/user ID
}))

const data = await response.json()
// Returns: { subscriptions: [...], pagination: {...} }
```

#### `PATCH /api/admin/subscriptions`

Update a subscription.

```typescript
const response = await fetch('/api/admin/subscriptions', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptionId: 'sub_abc123',
    action: 'updatePlan',     // Actions: updatePlan, extendTrial, grantFreeAccess, cancel, reactivate
    plan: 'YEARLY',
    endDate: new Date()
  })
})

const data = await response.json()
// Returns: { subscription: {...} }
```

#### `GET /api/admin/reports`

Generate financial reports.

```typescript
// Overview report
const response = await fetch('/api/admin/reports?type=overview')

// Revenue report
const response = await fetch('/api/admin/reports?type=revenue&startDate=2024-01-01&endDate=2024-12-31')

// Churn report
const response = await fetch('/api/admin/reports?type=churn')

// Subscription report
const response = await fetch('/api/admin/reports?type=subscriptions')

// Transaction report
const response = await fetch('/api/admin/reports?type=transactions')
```

---

## Frontend Integration

### 1. Creating a Checkout Button

```typescript
'use server'

import { paymentService } from '@/server/payment-service'
import { createClient } from '@/server/auth'
import { redirect } from 'next/navigation'

export async function initiateCheckout(planKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/authentication?redirect=' + encodeURIComponent('/pricing'))
  }

  const result = await paymentService.createCheckoutSession({
    planKey,
    userId: user.id,
    email: user.email,
  })

  if (result.success && result.checkoutUrl) {
    redirect(result.checkoutUrl)
  } else {
    redirect('/pricing?error=' + encodeURIComponent(result.error || 'Unknown error'))
  }
}
```

Usage in component:

```tsx
'use client'

import { initiateCheckout } from '@/app/actions/checkout'

export default function PricingCard() {
  return (
    <div className="pricing-card">
      <h2>Monthly Plan - $29/month</h2>
      <button onClick={() => initiateCheckout('monthly')}>
        Subscribe Now
      </button>
    </div>
  )
}
```

### 2. Displaying Subscription Status

```tsx
'use client'

import { useSubscription } from '@/hooks/use-subscription'

export default function SubscriptionStatus() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!subscription) {
    return <div>No subscription found</div>
  }

  return (
    <div>
      <h2>Subscription Status</h2>
      <p>Plan: {subscription.plan}</p>
      <p>Status: {subscription.status}</p>
      <p>Active: {subscription.isActive ? 'Yes' : 'No'}</p>
      {subscription.daysUntilExpiry > 0 && (
        <p>Expires in {subscription.daysUntilExpiry} days</p>
      )}
      {subscription.isTrial && (
        <p>Trial ends: {subscription.trialEndsAt?.toLocaleDateString()}</p>
      )}
    </div>
  )
}
```

### 3. Protecting Premium Features

```tsx
'use client'

import { useSubscriptionGuard } from '@/hooks/use-subscription'

export default function PremiumAnalytics() {
  const { Guard, canAccess } = useSubscriptionGuard('advanced_analytics')

  if (!canAccess) {
    return (
      <div>
        <h3>Premium Feature</h3>
        <p>This feature requires a higher-tier plan.</p>
        <a href="/pricing">Upgrade Now</a>
      </div>
    )
  }

  return (
    <Guard>
      <div className="analytics-dashboard">
        <h2>Advanced Analytics</h2>
        {/* Your premium analytics content */}
      </div>
    </Guard>
  )
}
```

### 4. Trial Status Banner

```tsx
'use client'

import { useTrialStatus } from '@/hooks/use-subscription'

export default function TrialBanner() {
  const { isTrial, trialDaysRemaining, trialEndingSoon } = useTrialStatus()

  if (!isTrial) {
    return null
  }

  return (
    <div className={trialEndingSoon ? 'bg-orange-500' : 'bg-blue-500'}>
      <p>
        You have {trialDaysRemaining} days left in your trial.
        {trialEndingSoon && ' Your trial is ending soon!'}
        <a href="/pricing">Upgrade Now</a>
      </p>
    </div>
  )
}
```

### 5. Expiry Warning

```tsx
'use client'

import { useSubscriptionExpiry } from '@/hooks/use-subscription'

export default function ExpiryWarning() {
  const { daysRemaining, isExpiringSoon, inGracePeriod } = useSubscriptionExpiry()

  if (inGracePeriod) {
    return (
      <div className="bg-red-500">
        <p>
          Your subscription has expired. You have {7 + daysRemaining} days
          of grace period remaining. Renew now to avoid losing access.
        </p>
      </div>
    )
  }

  if (isExpiringSoon) {
    return (
      <div className="bg-yellow-500">
        <p>
          Your subscription expires in {daysRemaining} days.
          <a href="/dashboard/billing">Renew Now</a>
        </p>
      </div>
    )
  }

  return null
}
```

### 6. Billing Page with Transaction History

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useSubscription } from '@/hooks/use-subscription'

interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  type: string
  createdAt: Date
}

export default function BillingPage() {
  const { subscription } = useSubscription()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      const response = await fetch('/api/payment/transactions')
      const data = await response.json()
      setTransactions(data.transactions || [])
      setLoading(false)
    }
    fetchTransactions()
  }, [])

  return (
    <div>
      <h1>Billing & Payments</h1>

      {/* Subscription Info */}
      <section>
        <h2>Current Plan</h2>
        <p>Plan: {subscription?.plan}</p>
        <p>Status: {subscription?.status}</p>
        <p>
          Expires: {subscription?.endDate?.toLocaleDateString()}
        </p>
      </section>

      {/* Transaction History */}
      <section>
        <h2>Payment History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                  <td>{txn.type}</td>
                  <td>${(txn.amount / 100).toFixed(2)}</td>
                  <td>{txn.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
```

---

## Admin Panel

### 1. Subscription Management Page

```tsx
'use client'

import { useEffect, useState } from 'react'

interface Subscription {
  id: string
  email: string
  plan: string
  status: string
  endDate: Date
  totalSpent: number
  transactionCount: number
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', plan: '', search: '' })

  useEffect(() => {
    fetchSubscriptions()
  }, [filter])

  async function fetchSubscriptions() {
    const params = new URLSearchParams(filter)
    const response = await fetch(`/api/admin/subscriptions?${params}`)
    const data = await response.json()
    setSubscriptions(data.subscriptions || [])
    setLoading(false)
  }

  async function handleUpdateSubscription(
    subscriptionId: string,
    action: string,
    data: any
  ) {
    await fetch('/api/admin/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, action, ...data }),
    })
    fetchSubscriptions()
  }

  return (
    <div>
      <h1>Subscription Management</h1>

      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="TRIAL">Trial</option>
        </select>

        <input
          type="text"
          placeholder="Search by email..."
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>End Date</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.email}</td>
                <td>{sub.plan}</td>
                <td>{sub.status}</td>
                <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                <td>${(sub.totalSpent / 100).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleUpdateSubscription(sub.id, 'cancel', {})}>
                    Cancel
                  </button>
                  <button onClick={() => handleUpdateSubscription(sub.id, 'updatePlan', { plan: 'YEARLY' })}>
                    Upgrade to Yearly
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

### 2. Financial Reports Page

```tsx
'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function AdminReports() {
  const [reportType, setReportType] = useState('overview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [reportType])

  async function fetchReport() {
    setLoading(true)
    const response = await fetch(`/api/admin/reports?type=${reportType}`)
    const result = await response.json()
    setData(result)
    setLoading(false)
  }

  return (
    <div>
      <h1>Financial Reports</h1>

      {/* Report Type Selector */}
      <div className="tabs">
        <button onClick={() => setReportType('overview')}>Overview</button>
        <button onClick={() => setReportType('revenue')}>Revenue</button>
        <button onClick={() => setReportType('churn')}>Churn</button>
        <button onClick={() => setReportType('subscriptions')}>Subscriptions</button>
      </div>

      {/* Report Content */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {reportType === 'overview' && (
            <div className="overview-metrics">
              <div className="metric">
                <h3>Total Revenue</h3>
                <p>${(data.overview.totalRevenue / 100).toFixed(2)}</p>
              </div>
              <div className="metric">
                <h3>Active Subscriptions</h3>
                <p>{data.overview.activeSubscriptions}</p>
              </div>
              <div className="metric">
                <h3>MRR</h3>
                <p>${data.overview.mrr}</p>
              </div>
              <div className="metric">
                <h3>ARR</h3>
                <p>${data.overview.arr}</p>
              </div>
              <div className="metric">
                <h3>ARPU</h3>
                <p>${data.overview.arpu}</p>
              </div>
              <div className="metric">
                <h3>LTV</h3>
                <p>${data.overview.ltv}</p>
              </div>
            </div>
          )}

          {reportType === 'revenue' && (
            <div className="revenue-chart">
              <h3>Revenue by Month</h3>
              <BarChart width={800} height={400} data={data.revenueByMonth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </div>
          )}

          {reportType === 'churn' && (
            <div className="churn-metrics">
              <h3>Churn Rate: {data.churnRate}</h3>
              <p>Total Cancellations: {data.cancelledSubscriptions}</p>

              <h4>Cancellations by Plan</h4>
              <ul>
                {Object.entries(data.churnByPlan).map(([plan, count]) => (
                  <li key={plan}>{plan}: {count}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## Testing

### Running Tests

Install test dependencies:

```bash
npm install --save-dev vitest @vitest/ui vite-tsconfig-paths
```

Run tests:

```bash
# Run all payment tests
npm run test:payment

# Run with UI
npm run test:payment:ui

# Run with coverage
npm run test:payment:coverage
```

### Test Coverage

The test suite includes:

#### 1. Payment Service Tests
- ✅ Checkout session creation
- ✅ Promotion code validation (valid, expired, inactive)
- ✅ Transaction recording
- ✅ Invoice creation
- ✅ Refund processing (full and partial)
- ✅ Transaction history retrieval

#### 2. Subscription Manager Tests
- ✅ Subscription creation (regular, trial, lifetime)
- ✅ Subscription updates (upgrade, downgrade)
- ✅ Subscription cancellation (immediate and scheduled)
- ✅ Payment failure handling (with retry logic)
- ✅ Payment success handling
- ✅ Grace period enforcement

#### 3. Webhook Service Tests
- ✅ membership.activated event
- ✅ membership.deactivated event
- ✅ membership.updated event
- ✅ payment.succeeded event
- ✅ payment.failed event
- ✅ invoice.created event
- ✅ invoice.paid event

#### 4. Security Manager Tests
- ✅ Encryption and decryption
- ✅ Input validation
- ✅ Data masking (card numbers, emails)
- ✅ Rate limiting
- ✅ Suspicious activity detection

#### 5. End-to-End Tests
- ✅ Complete subscription lifecycle
- ✅ Payment failure and recovery
- ✅ Plan upgrade flow
- ✅ Refund flow

### Writing Custom Tests

```typescript
import { describe, it, expect } from 'vitest'
import { paymentService } from '@/server/payment-service'

describe('My Custom Tests', () => {
  it('should test custom functionality', async () => {
    const result = await paymentService.createCheckoutSession({
      planKey: 'monthly',
      userId: 'test-user',
      email: 'test@example.com',
    })

    expect(result.success).toBe(true)
    expect(result.checkoutUrl).toBeDefined()
  })
})
```

---

## Security

### PCI Compliance

✅ **No Card Data Stored Locally** - All card data handled by Whop
✅ **HTTPS Only** - All payment endpoints use HTTPS
✅ **Webhook Signature Verification** - All webhooks verified
✅ **Encryption at Rest** - Sensitive data encrypted with AES-256-GCM
✅ **Secure Audit Logging** - All transactions logged

### Data Encryption

Sensitive data is encrypted using AES-256-GCM:

```typescript
import { securityManager } from '@/server/payment-security'

// Encrypt
const encrypted = securityManager.encrypt('sensitive-data')

// Decrypt
const decrypted = securityManager.decrypt(encrypted)
```

### Webhook Signature Verification

All webhooks are verified using HMAC-SHA256:

```typescript
import { webhookService } from '@/server/webhook-service'

const isValid = await webhookService.verifyWebhookSignature(
  payload,
  signature,
  timestamp
)
```

### Rate Limiting

Rate limiting prevents abuse:

```typescript
import { securityManager } from '@/server/payment-security'

const result = await securityManager.checkRateLimit('user-identifier')
// Returns: { allowed: boolean, remainingRequests: number, resetTime: number }
```

### Input Validation

All inputs are validated and sanitized:

```typescript
import { securityManager } from '@/server/payment-security'

// Validate email
const isValidEmail = securityManager.validateEmail('user@example.com')

// Validate amount
const isValidAmount = securityManager.validateAmount(29.99)

// Sanitize input
const clean = securityManager.sanitizeInput(userInput)
```

### Data Masking

Sensitive data is masked in logs:

```typescript
import { securityManager } from '@/server/payment-security'

// Mask card number
const masked = securityManager.maskCardNumber('4242424242424242')
// Returns: "4242************4242"

// Mask email
const maskedEmail = securityManager.maskEmail('test@example.com')
// Returns: "te********@example.com"
```

### Fraud Detection

Suspicious activity is detected:

```typescript
import { securityManager } from '@/server/payment-security'

const result = securityManager.detectSuspiciousActivity({
  userId: 'user-123',
  email: 'user@example.com',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  actionType: 'checkout'
})

// Returns: { suspicious: boolean, reasons: string[], score: number }
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Webhook Not Receiving Events

**Symptoms**: Users complete payment but subscription not activated

**Solutions**:
1. Check webhook secret in `.env` file
2. Verify webhook URL in Whop dashboard
3. Ensure server is publicly accessible
4. Check webhook signature verification
5. Review server logs for webhook processing errors

**Debug Steps**:
```bash
# Check webhook secret
echo $WHOP_WEBHOOK_SECRET

# View webhook logs
tail -f logs/webhook.log

# Test webhook locally with ngrok
npx ngrok http 3000
```

#### Issue 2: Subscription Not Active After Payment

**Symptoms**: Payment successful but subscription shows as inactive

**Solutions**:
1. Check database for subscription record
2. Verify webhook was received and processed
3. Check `getSubscriptionDetails()` returns correct data
4. Clear browser cache and recheck

**Debug Steps**:
```sql
-- Check subscription in database
SELECT * FROM "Subscription" WHERE email = 'user@example.com';

-- Check subscription events
SELECT * FROM "SubscriptionEvent" WHERE email = 'user@example.com' ORDER BY "createdAt" DESC;
```

#### Issue 3: Access Control Not Working

**Symptoms**: Users can access premium features without subscription

**Solutions**:
1. Verify middleware is configured correctly
2. Check subscription status in headers
3. Ensure `getSubscriptionDetails()` returns correct data
4. Clear browser cache
5. Check React hooks are implemented correctly

**Debug Steps**:
```typescript
// Check subscription headers
const response = await fetch('/api/protected-route')
console.log(response.headers.get('x-subscription-status'))
console.log(response.headers.get('x-subscription-plan'))
```

#### Issue 4: Payment Failure Not Handled

**Symptoms**: Failed payments not triggering retry logic

**Solutions**:
1. Check webhook is receiving `payment.failed` events
2. Verify `handlePaymentFailure()` is called
3. Check retry counter in database
4. Review error logs

**Debug Steps**:
```sql
-- Check payment transactions
SELECT * FROM "PaymentTransaction" WHERE email = 'user@example.com' AND status = 'FAILED';

-- Check subscription status
SELECT * FROM "Subscription" WHERE email = 'user@example.com';
```

#### Issue 5: Encryption Errors

**Symptoms**: Error decrypting data

**Solutions**:
1. Verify `ENCRYPTION_KEY` is set in `.env`
2. Ensure key is 32 bytes (base64 encoded)
3. Check encryption/decryption is using same key

**Debug Steps**:
```bash
# Check encryption key length
echo -n $ENCRYPTION_KEY | base64 -d | wc -c
# Should output: 32

# Generate new key if needed
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Debug Mode

Enable debug logging:

```typescript
// In your server action or API route
process.env.LOG_LEVEL = 'debug'
```

### Testing Webhooks Locally

Use ngrok to expose your local server:

```bash
npx ngrok http 3000
```

Then update your Whop webhook URL to use the ngrok URL.

### Checking Database Records

```sql
-- View all subscriptions
SELECT * FROM "Subscription";

-- View user subscription
SELECT * FROM "Subscription" WHERE email = 'user@example.com';

-- View payment transactions
SELECT * FROM "PaymentTransaction" WHERE email = 'user@example.com';

-- View subscription events
SELECT * FROM "SubscriptionEvent" WHERE email = 'user@example.com';

-- View invoices
SELECT * FROM "Invoice" WHERE email = 'user@example.com';

-- View refunds
SELECT * FROM "Refund" WHERE email = 'user@example.com';
```

---

## Best Practices

### Security

1. **Never log full payment details**
   ```typescript
   // Bad
   console.log(paymentData)

   // Good
   logger.info('[Payment]', { amount: paymentData.amount, status: paymentData.status })
   ```

2. **Always validate user input**
   ```typescript
   const email = securityManager.sanitizeInput(userInput.email)
   if (!securityManager.validateEmail(email)) {
     throw new Error('Invalid email')
   }
   ```

3. **Use webhook signature verification**
   ```typescript
   const isValid = await webhookService.verifyWebhookSignature(payload, signature, timestamp)
   if (!isValid) {
     throw new Error('Invalid webhook signature')
   }
   ```

4. **Encrypt sensitive data at rest**
   ```typescript
   const encrypted = securityManager.encrypt(sensitiveData)
   await prisma.user.update({ data: { encryptedField: encrypted } })
   ```

5. **Implement rate limiting**
   ```typescript
   const rateLimit = await securityManager.checkRateLimit(userId)
   if (!rateLimit.allowed) {
     throw new Error('Rate limit exceeded')
   }
   ```

### Performance

1. **Cache subscription status (5-minute TTL)**
   ```typescript
   const cached = await cache.get(`subscription:${userId}`)
   if (cached) return cached
   ```

2. **Use database indexes**
   ```prisma
   @@index([userId])
   @@index([email])
   @@index([status])
   ```

3. **Implement webhook processing queue**
   ```typescript
   // Events are queued automatically
   await webhookService.processWebhook(event)
   ```

4. **Monitor webhook processing times**
   ```typescript
   const start = Date.now()
   await webhookService.processWebhook(event)
   const duration = Date.now() - start
   logger.info('[Webhook]', { duration })
   ```

### Monitoring

1. **Track conversion rates**
   ```typescript
   const conversionRate = (completedPayments / initiatedCheckouts) * 100
   logger.info('[Metrics]', { conversionRate })
   ```

2. **Monitor webhook failure rates**
   ```typescript
   const failureRate = (failedWebhooks / totalWebhooks) * 100
   if (failureRate > 5) {
     alert('High webhook failure rate')
   }
   ```

3. **Alert on payment failure spikes**
   ```typescript
   if (recentFailedPayments > threshold) {
     sendAlert('Unusual payment failure activity')
   }
   ```

4. **Track subscription churn**
   ```typescript
   const churnRate = (cancelledSubscriptions / totalSubscriptions) * 100
   logger.info('[Metrics]', { churnRate })
   ```

5. **Monitor API response times**
   ```typescript
   const responseTime = Date.now() - startTime
   if (responseTime > 1000) {
     logger.warn('[Performance]', { endpoint, responseTime })
   }
   ```

### Error Handling

1. **Always use try-catch for payment operations**
   ```typescript
   try {
     await paymentService.createCheckoutSession(data)
   } catch (error) {
     logger.error('[Payment]', { error: error.message })
     throw new Error('Payment processing failed')
   }
   ```

2. **Provide user-friendly error messages**
   ```typescript
   if (!result.success) {
     return {
       error: 'Unable to process payment. Please try again or contact support.'
     }
   }
   ```

3. **Log all errors with context**
   ```typescript
   logger.error('[Payment]', {
     error: error.message,
     userId,
     planKey,
     timestamp: new Date().toISOString()
   })
   ```

### User Experience

1. **Show clear pricing information**
   ```tsx
   <div className="pricing-card">
     <h2>Monthly Plan</h2>
     <p>$29/month</p>
     <ul>
       <li>Unlimited accounts</li>
       <li>Priority support</li>
     </ul>
   </div>
   ```

2. **Provide trial expiry warnings**
   ```tsx
   {trialEndingSoon && (
     <Alert>
       Your trial ends in {trialDaysRemaining} days.
       <Link href="/pricing">Upgrade Now</Link>
     </Alert>
   )}
   ```

3. **Send confirmation emails**
   ```typescript
   await sendEmail({
     to: user.email,
     subject: 'Subscription Confirmed',
     template: 'subscription-confirmed'
   })
   ```

4. **Show upcoming renewal reminders**
   ```tsx
   {isExpiringSoon && (
     <Alert>
       Your subscription renews in {daysRemaining} days.
       <Link href="/dashboard/billing">Manage Subscription</Link>
     </Alert>
   )}
   ```

---

## FAQ

### Q: How do I add a new pricing plan?

**A**: Update `PLAN_CONFIGS` in `server/payment-service.ts`:

```typescript
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  // ... existing plans
  custom: {
    id: 'plan_custom_id',
    name: 'Custom Plan',
    lookupKey: 'custom',
    amount: 4900,
    currency: 'USD',
    interval: 'month',
    features: ['Custom features'],
  },
}
```

### Q: How do I change the trial duration?

**A**: Update `TRIAL_DAYS` in `server/subscription-manager.ts`:

```typescript
const TRIAL_DAYS = 30  // 30-day trial
```

### Q: How do I customize the grace period?

**A**: Update `GRACE_PERIOD_CONFIG` in `server/subscription-manager.ts`:

```typescript
const GRACE_PERIOD_CONFIG: GracePeriodConfig = {
  enabled: true,
  duration: 14,     // 14 days
  unit: 'days',
}
```

### Q: How do I add a new promotion code?

**A**: Create a promotion in the database:

```typescript
await prisma.promotion.create({
  data: {
    code: 'SUMMER30',
    name: 'Summer Sale',
    type: 'PERCENTAGE',
    value: 30,
    durationType: 'ONCE',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
})
```

### Q: How do I process a refund?

**A**: Use the admin API:

```typescript
await paymentService.processRefund({
  transactionId: 'txn_abc123',
  amount: 2900,  // Amount in cents
  reason: 'Customer requested refund'
})
```

### Q: How do I check if a user has an active subscription?

**A**: Use the subscription hook:

```typescript
const { subscription } = useSubscription()
if (subscription?.isActive) {
  // User has active subscription
}
```

### Q: How do I protect a route?

**A**: Use middleware:

```typescript
// In middleware.ts
if (pathname.startsWith('/premium') && !subscription.isActive) {
  return NextResponse.redirect(new URL('/pricing', req.url))
}
```

### Q: How do I add a new feature to a plan?

**A**: Update `FEATURE_ACCESS` in `hooks/use-subscription.ts`:

```typescript
const FEATURE_ACCESS: FeatureAccessConfig = {
  MONTHLY: [
    'basic_dashboard',
    'unlimited_accounts',
    'priority_support',
    'api_access',
    'new_feature'  // Add here
  ],
}
```

### Q: How do I test webhooks locally?

**A**: Use ngrok:

```bash
npx ngrok http 3000
```

Then update your Whop webhook URL to use the ngrok URL.

### Q: How do I view financial reports?

**A**: Use the admin API:

```typescript
const response = await fetch('/api/admin/reports?type=overview')
const data = await response.json()
console.log(data.overview.mrr, data.overview.arr)
```

### Q: How do I handle failed payments?

**A**: The system handles this automatically:
1. Mark subscription as PAST_DUE
2. Retry payment (3 attempts with exponential backoff)
3. Cancel subscription after final failure
4. Notify user at each step

### Q: How do I customize the upgrade modal?

**A**: Modify the `useSubscriptionGuard` hook:

```typescript
export function useSubscriptionGuard(feature: string) {
  // ... existing code

  const Guard = ({ children }: { children: React.ReactNode }) => {
    if (showGuard) {
      return (
        <div className="custom-upgrade-modal">
          {/* Your custom modal */}
        </div>
      )
    }
    return <>{children}</>
  }

  return { Guard, canAccess, isLoading }
}
```

### Q: How do I add custom metadata to subscriptions?

**A**: Pass metadata when creating:

```typescript
await subscriptionManager.createSubscription({
  userId: 'user_123',
  email: 'user@example.com',
  plan: 'monthly',
  interval: 'month',
  metadata: {
    source: 'google_ads',
    campaign: 'summer_2024',
    custom_field: 'value'
  }
})
```

### Q: How do I migrate from another payment provider?

**A**: 
1. Export existing subscriptions
2. Create migration script to import into database
3. Update Whop with existing customer data
4. Test webhook processing
5. Gradually switch over

### Q: How do I handle subscription downgrades?

**A**: Use the update function:

```typescript
await subscriptionManager.updateSubscription({
  userId: 'user_123',
  plan: 'MONTHLY',  // Downgrade from YEARLY
  interval: 'month'
})
```

### Q: How do I add a custom webhook handler?

**A**: Extend the webhook service:

```typescript
// In server/webhook-service.ts
private async handleEventByType(event: WebhookEvent) {
  switch (event.type) {
    // ... existing cases
    case 'custom.event':
      return await this.handleCustomEvent(event.data)
  }
}

private async handleCustomEvent(data: any) {
  // Your custom logic
}
```

---

## Quick Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WHOP_API_KEY` | Yes | Whop API key |
| `NEXT_PUBLIC_WHOP_APP_ID` | Yes | Whop app ID |
| `WHOP_COMPANY_ID` | Yes | Whop company ID |
| `WHOP_CLIENT_SECRET` | Yes | Whop client secret |
| `WHOP_WEBHOOK_SECRET` | Yes | Whop webhook secret |
| `ENCRYPTION_KEY` | Yes | 32-byte encryption key |
| `ADMIN_EMAIL_DOMAINS` | No | Admin email domains |

### Key Files

| File | Purpose |
|------|---------|
| `server/payment-service.ts` | Payment gateway integration |
| `server/subscription-manager.ts` | Subscription management |
| `server/webhook-service.ts` | Webhook processing |
| `server/payment-security.ts` | Security utilities |
| `middleware.ts` | Route protection |
| `hooks/use-subscription.ts` | React hooks |
| `app/api/admin/subscriptions/route.ts` | Admin subscriptions API |
| `app/api/admin/reports/route.ts` | Admin reports API |
| `app/api/whop/webhook/route.ts` | Webhook endpoint |

### Common Commands

```bash
# Database
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema to database
npx prisma studio          # Open Prisma Studio

# Testing
npm run test:payment       # Run payment tests
npm run test:payment:ui    # Run tests with UI
npm run test:payment:coverage  # Run tests with coverage

# Development
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
```

### Support Resources

- **Whop Documentation**: https://docs.whop.com/
- **Prisma Documentation**: https://www.prisma.io/docs
- **Next.js Documentation**: https://nextjs.org/docs

---

## Conclusion

This payment system provides a complete, production-ready solution for managing subscriptions and processing payments. It's built with security, scalability, and maintainability in mind.

For questions or issues:
1. Check this guide
2. Review the code documentation
3. Check server logs
4. Review Whop dashboard

Happy coding! 🚀

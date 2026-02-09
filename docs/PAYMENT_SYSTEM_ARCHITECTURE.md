# Payment System Architecture

## Overview
This document describes the comprehensive payment system architecture for QuntEdge, built on top of Whop payment gateway integration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                              │
├─────────────────────────────────────────────────────────────────────┤
│  Pricing Pages  │  Checkout Flow  │  Billing Dashboard  │  Admin UI │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         API Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│  /api/payment/*  │  /api/whop/*  │  /api/subscription/*  │  /api/admin/* │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Service Layer (Server Actions)                   │
├─────────────────────────────────────────────────────────────────────┤
│  PaymentService  │  SubscriptionService  │  WebhookService  │  ReportService │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Layer                                     │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Prisma) │  Whop API │  Cache │  Audit Logs │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Payment Gateway Integration (Whop)
- Checkout session creation
- Payment method management
- Transaction processing
- Webhook event handling

### 2. Subscription Management
- Plan tier management
- Subscription lifecycle
- Trial management
- Cancellation flows
- Plan upgrades/downgrades

### 3. Transaction Processing
- Payment tracking
- Invoice generation
- Refund processing
- Payment failure handling
- Retry logic with exponential backoff

### 4. Access Control
- Middleware for route protection
- Feature-based access control
- Grace period enforcement
- Subscription validation

### 5. Admin Operations
- User subscription management
- Refund processing
- Financial reporting
- Transaction history
- Analytics dashboard

## Data Model

### Core Tables
- `Subscription` - User subscriptions
- `PaymentTransaction` - Payment transaction records
- `Invoice` - Invoice records
- `Refund` - Refund records
- `SubscriptionEvent` - Audit trail
- `PaymentMethod` - Stored payment methods
- `Promotion` - Discount codes and promotions

## Payment Flow

### New Subscription Flow
1. User selects plan
2. Create checkout session via Whop
3. User completes payment
4. Webhook receives `membership.activated` event
5. Create subscription record
6. Grant access to user
7. Send confirmation email

### Renewal Flow
1. Whop processes recurring payment
2. Webhook receives `payment.succeeded` event
3. Update subscription end date
4. Send renewal notification
5. Log transaction

### Cancellation Flow
1. User requests cancellation
2. Update `cancel_at_period_end` flag
3. Access continues until period end
4. Webhook receives `membership.deactivated` event
5. Revoke access
6. Send cancellation confirmation

### Payment Failure Flow
1. Whop attempts payment
2. Payment fails
3. Webhook receives `payment.failed` event
4. Update subscription status to PAST_DUE
5. Initiate retry logic (3 attempts with exponential backoff)
6. Notify user of failed payment
7. After final failure, cancel subscription
8. Send payment failure notification

## Security Measures

### PCI Compliance
- No card data stored locally (handled by Whop)
- HTTPS only for payment endpoints
- Webhook signature verification
- Sensitive data encryption at rest

### Data Protection
- Encrypt PII in database
- Secure audit logging
- Role-based access control
- API rate limiting
- Input validation and sanitization

### Fraud Detection
- Unusual activity monitoring
- Rate limiting per user
- IP-based suspicious activity detection
- Transaction velocity checks

## Webhook Events Handled

### Membership Events
- `membership.activated` - New subscription created
- `membership.deactivated` - Subscription cancelled
- `membership.updated` - Plan changed
- `membership.trialing` - Trial started

### Payment Events
- `payment.succeeded` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Refund processed
- `payment.partially_refunded` - Partial refund

### Invoice Events
- `invoice.created` - Invoice generated
- `invoice.paid` - Invoice paid
- `invoice.payment_failed` - Invoice payment failed

## Error Handling

### Transaction Errors
- Database transaction rollback
- Event retry with dead letter queue
- Graceful degradation
- User-friendly error messages

### Webhook Errors
- Signature verification failure
- Event processing errors
- Idempotency key handling
- Automatic retry for failed webhooks

## Monitoring & Logging

### Metrics Tracked
- Conversion rate (checkout → payment)
- Churn rate
- Payment success rate
- Average revenue per user (ARPU)
- Customer lifetime value (CLV)

### Alerts
- Payment failure rate threshold
- Webhook processing failures
- Unusual refund activity
- API error rate spikes

## Testing Scenarios

### Unit Tests
- Subscription validation logic
- Price calculation
- Discount application
- Access control middleware

### Integration Tests
- Checkout flow completion
- Webhook event processing
- Subscription lifecycle
- Refund processing

### End-to-End Tests
- New user signup and payment
- Existing user upgrade
- Payment failure and recovery
- Cancellation flow

## Performance Optimization

### Caching Strategy
- Subscription status cache (5-minute TTL)
- Plan pricing cache (1-hour TTL)
- User access permissions cache
- Invoice list caching

### Database Optimization
- Indexed queries on email, userId
- Connection pooling
- Query result pagination
- Archival of old transactions

## Compliance & Legal

### GDPR Compliance
- User data export
- Right to be forgotten
- Data retention policies
- Consent management

### SOX Compliance (if applicable)
- Audit trail for all financial transactions
- Segregation of duties
- Documented approval processes
- Regular security audits

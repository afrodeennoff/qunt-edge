# Subscription Backend Setup Guide (Whop Interaction)

This project uses **Whop** for payments and subscription management, and **Supabase/Prisma** for local access control.

## 1. Environment Variables
Ensure the following variables are set in your `.env` and production environment (Vercel/Railway/etc.):

```env
# Whop API Configuration
WHOP_API_KEY=your_whop_api_key_starting_with_biz_
WHOP_COMPANY_ID=your_company_id (e.g., biz_...)
WHOP_WEBHOOK_SECRET=your_webhook_signing_secret

# Whop Product/Plan IDs
# Map these ID's to the corresponding Plans in your Whop Dashboard
NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID=plan_...
NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID=plan_...
NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID=plan_...
NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID=plan_...
```

## 2. Webhook Configuration
Navigate to your [Whop Developer Settings](https://whop.com/settings/developer) and add a webhook endpoint.

- **Endpoint URL**: `https://your-domain.com/api/whop/webhook`
- **Events to Listen For**:
  - `membership.activated` (New subscriptions)
  - `membership.deactivated` (Cancellations)
  - `payment.succeeded` (Renewals)

## 3. How It Works
1. **Checkout**: User clicks a plan -> `app/api/whop/checkout` creates a session -> User pays on Whop.
2. **Activation**: Whop sends `membership.activated` -> Webhook upserts `Subscription` in Postgres (Status: ACTIVE).
3. **Access Control**: Middleware/API checks `Subscription` in Postgres.
4. **Renewal**: User pays renewal -> Whop sends `payment.succeeded` -> Webhook extends `endDate` in Postgres.
5. **Cancellation**: User cancels -> Whop sends `membership.deactivated` (at end of period) -> Webhook sets Status: CANCELLED.

## 4. Testing
- Use the **Whop Test Mode** to simulate payments.
- Check the `Subscription` table in your database to verify updates.

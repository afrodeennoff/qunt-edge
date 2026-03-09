# Payment System Audit and Fixes - Implementation Plan

## 1. Audit and Consistency Fixes
- [ ] Fix double slash redirects in `app/api/whop/checkout/route.ts` and `app/api/whop/checkout-team/route.ts`.
- [ ] Update `whop` imports to use `getWhop()` instead of the deprecated static export.
- [ ] Ensure `WHOP_WEBHOOK_SECRET` and other keys are used with safe fallbacks or clear error messages.

## 2. Team Payment Integration
- [ ] Update `server/webhook-service.ts` to handle `type: 'team'` metadata in `membership.activated`.
- [ ] Implement team creation/verification in the webhook handler.
- [ ] Link `TeamSubscription` to the created team and user.
- [ ] Update `app/[locale]/teams/components/team-management.tsx` to optionally use the checkout flow if a paid team plan is required.

## 3. Redirect and Navigation Fixes
- [ ] Ensure trailing slashes are handled consistently via `getWebsiteURL()`.
- [ ] Fix dashboard/settings redirect after successful team purchase.

## 4. Testing and Validation
- [ ] Verify webhook processing with mock payloads.
- [ ] Check checkout flow for both individual and team plans.
- [ ] Audit `prisma/schema.prisma` for any missing constraints in payment models.

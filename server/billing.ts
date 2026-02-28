'use server'

import { createClient, getDatabaseUserId } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { getWhop, parseWhopDate } from '@/lib/whop'
import { logger } from '@/lib/logger'

export type SubscriptionWithPrice = {
  id: string
  status: string
  current_period_end: number
  current_period_start: number
  created: number
  cancel_at_period_end: boolean
  cancel_at: number | null
  canceled_at: number | null
  trial_end: number | null
  trial_start: number | null
  manage_url?: string
  plan: {
    id: string
    name: string
    amount: number
    interval: 'month' | 'quarter' | 'year' | 'lifetime'
  }
  promotion?: {
    amount_off: number | null
    percent_off: number | null
    duration: {
      duration: 'forever' | 'once' | 'repeating'
      duration_in_months: number | null
    }
  }
  invoices?: Array<{
    id: string
    amount_paid: number
    status: string
    created: number
    invoice_pdf: string | null
    hosted_invoice_url: string | null
  }>
}

export async function getSubscriptionData() {
  const supabase = await createClient()
  const userId = await getDatabaseUserId()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return null // No email, no sub

    const normalizedEmail = user.email.toLowerCase().trim()

    // 1. Check local database for active subscription
    const localSubscription = await prisma.subscription.findUnique({
      where: { email: normalizedEmail },
    })

    // OPTIMIZATION: Trust local DB if recent or active. 
    // We assume webhooks will keep us in sync for critical events (cancellation/renewal).
    // If local text is ACTIVE, we return it to avoid API latency.

    const normalizedStatus = localSubscription?.status?.toUpperCase()
    const hasActiveLocalSubscription =
      normalizedStatus === 'ACTIVE' ||
      normalizedStatus === 'TRIAL' ||
      normalizedStatus === 'TRIALING'

    if (localSubscription && hasActiveLocalSubscription) {
      logger.debug('[getSubscriptionData] Cache Hit', { email: normalizedEmail });

      const interval = localSubscription.interval as any || 'month';

      return {
        id: localSubscription.id,
        status: localSubscription.status,
        current_period_end: localSubscription.endDate ? Math.floor(localSubscription.endDate.getTime() / 1000) : 0,
        current_period_start: Math.floor(localSubscription.createdAt.getTime() / 1000),
        created: Math.floor(localSubscription.createdAt.getTime() / 1000),
        cancel_at_period_end: false,
        cancel_at: null,
        canceled_at: null,
        trial_end: localSubscription.trialEndsAt ? Math.floor(localSubscription.trialEndsAt.getTime() / 1000) : null,
        trial_start: null,
        manage_url: undefined,
        plan: {
          id: localSubscription.plan,
          name: localSubscription.plan,
          amount: 0,
          interval: interval
        },
        invoices: []
      } as SubscriptionWithPrice
    }

    logger.info('[getSubscriptionData] Cache Miss - Fetching Whop API', { email: normalizedEmail });

    if (!process.env.WHOP_API_KEY) {
      logger.warn('[getSubscriptionData] WHOP_API_KEY missing, skipping Whop API lookup', { email: normalizedEmail })
      return null
    }

    const companyId = process.env.WHOP_COMPANY_ID || "biz_jh37YZGpH5dWIY";
    const whop = getWhop()

    // 2. Fetch active memberships from Whop for real-time verification (Fallback)
    const members = await whop.members.list({
      company_id: companyId,
      query: normalizedEmail,
    });

    if (members.data.length === 0) {
      return null;
    }

    const whopUserId = members.data[0].user?.id;
    if (!whopUserId) {
      return null;
    }

    // Now list memberships for this user
    const memberships = await whop.memberships.list({
      company_id: companyId,
      user_ids: [whopUserId],
      statuses: ['active', 'trialing'],
    });

    const activeMemberships = memberships.data;

    if (activeMemberships.length === 0) {
      return null;
    }

    // Sort by most recently created
    const membership = activeMemberships.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    // Get plan details
    const planId = membership.plan.id;
    const planName = membership.product.title || 'PLUS';
    const interval = planName.toLowerCase().includes('monthly') ? 'month' :
      planName.toLowerCase().includes('quarterly') ? 'quarter' :
        planName.toLowerCase().includes('yearly') ? 'year' :
          planName.toLowerCase().includes('lifetime') ? 'lifetime' : 'month';

    const createdDate = parseWhopDate(membership.created_at) || new Date();
    const created = Math.floor(createdDate.getTime() / 1000);
    const renewalDate = parseWhopDate(membership.renewal_period_end);
    const periodEnd = renewalDate
      ? Math.floor(renewalDate.getTime() / 1000)
      : created + 30 * 24 * 60 * 60; // Default 30 days

    const whopStatus = membership.status.toLowerCase()
    const dbStatus =
      whopStatus === 'active'
        ? 'ACTIVE'
        : whopStatus === 'trialing'
          ? 'TRIAL'
          : whopStatus.toUpperCase()

    // Sync to local DB
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        email: normalizedEmail,
        status: dbStatus,
        plan: planName,
        endDate: parseWhopDate(membership.renewal_period_end) || null,
        interval: interval
      },
      create: {
        userId,
        email: normalizedEmail,
        plan: planName,
        status: dbStatus,
        endDate: parseWhopDate(membership.renewal_period_end) || null,
        interval: interval
      }
    });

    return {
      id: membership.id,
      status: dbStatus,
      current_period_end: periodEnd,
      current_period_start: created,
      created: created,
      cancel_at_period_end: !!membership.cancel_at_period_end,
      cancel_at: renewalDate ? Math.floor(renewalDate.getTime() / 1000) : null,
      canceled_at: parseWhopDate(membership.canceled_at) ? Math.floor(parseWhopDate(membership.canceled_at)!.getTime() / 1000) : null,
      trial_end: membership.status === 'trialing' ? periodEnd : null,
      trial_start: membership.status === 'trialing' ? created : null,
      manage_url: membership.manage_url || undefined,
      plan: {
        id: planId,
        name: planName,
        amount: 0, // We'd need to fetch the plan for the exact amount
        interval: interval as any,
      },
      // Whop invoices/payments can be fetched if needed
      invoices: []
    } as SubscriptionWithPrice

  } catch (error) {
    const status = (error as { status?: number })?.status
    if (status === 401) {
      logger.warn('Error fetching Whop subscription: unauthorized', { error })
      return null
    }
    logger.error('Error fetching Whop subscription:', { error })
    return null
  }
}

export async function updateSubscription(action: 'pause' | 'resume' | 'cancel', _subscriptionId: string) {
  // For Whop, we typically direct users to the billing portal (manage_url)
  // But we can also use the API if needed for direct cancellation
  try {
    if (action === 'cancel') {
      // Whop API for cancellation if available
      // await whop.memberships.update(subscriptionId, { ... });
      // For now, return a message that it should be done via portal or implemented here
      return { success: false, error: 'Please use the Whop billing portal to manage your subscription.' }
    }
    return { success: true }
  } catch (error) {
    logger.error('Error updating Whop subscription:', { error })
    return { success: false, error: 'Failed to update subscription' }
  }
}

export async function collectSubscriptionFeedback(
  event: string,
  cancellationReason?: string,
  feedback?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) throw new Error('User not found')

    await prisma.subscriptionFeedback.create({
      data: {
        email: user.email,
        event,
        cancellationReason,
        feedback,
      },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error collecting subscription feedback:', { error })
    return { success: false, error: 'Failed to collect feedback' }
  }
}

export async function switchSubscriptionPlan(newLookupKey: string) {
  // For Whop, switching plans usually involves a new checkout or managing via portal
  // We return a flag indicating a new checkout is required
  return {
    success: false,
    error: 'Plan switching requires a new checkout session',
    requiresCheckout: true,
    lookupKey: newLookupKey
  }
}

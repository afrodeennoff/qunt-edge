import { getSubscriptionDetails } from '@/server/subscription'
import { prisma } from '@/lib/prisma'

export type AiGuardFeature =
  | 'chat'
  | 'support'
  | 'editor'
  | 'analysis'
  | 'transcribe'
  | 'mappings'
  | 'format-trades'
  | 'search'

type EntitlementResult = {
  allowed: boolean
  reason?: string
  plan?: string
  isActive: boolean
}

const INACTIVE_ALLOWED_FEATURES = new Set<AiGuardFeature>([
  'search',
  'mappings',
  'format-trades',
])

export async function canAccessAiFeature(
  userId: string,
  feature: AiGuardFeature,
): Promise<EntitlementResult> {
  const userSubscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      status: true,
      plan: true,
      trialEndsAt: true,
    },
  })

  const now = new Date()
  const hasActiveSubscription = Boolean(
    userSubscription && (
      userSubscription.status === 'ACTIVE' ||
      (userSubscription.status === 'PENDING' && userSubscription.trialEndsAt && userSubscription.trialEndsAt > now)
    ),
  )

  const fallbackSubscription = hasActiveSubscription ? null : await getSubscriptionDetails()
  const isActive = hasActiveSubscription || Boolean(fallbackSubscription?.isActive)
  const plan = userSubscription?.plan ?? fallbackSubscription?.plan ?? undefined

  if (isActive) {
    return { allowed: true, plan, isActive: true }
  }

  if (INACTIVE_ALLOWED_FEATURES.has(feature)) {
    return {
      allowed: true,
      reason: 'Allowed on inactive plan for baseline features.',
      plan,
      isActive: false,
    }
  }

  return {
    allowed: false,
    reason: 'Active subscription required for this AI feature.',
    plan,
    isActive: false,
  }
}

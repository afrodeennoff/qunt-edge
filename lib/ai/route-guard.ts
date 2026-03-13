import { canAccessAiFeature, type AiGuardFeature } from '@/lib/ai/entitlements'
import { assertWithinAiBudget } from '@/lib/ai/usage-budget'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'

type LimiterResult = {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

type LimiterFn = (req: Request, opts?: { subject?: string }) => Promise<LimiterResult>

export async function guardAiRequest(
  req: Request,
  feature: AiGuardFeature,
  limiter: LimiterFn,
): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; response: ReturnType<typeof apiError> }
> {
  const supabase = createRouteClient(req)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.id || !user.email) {
    return {
      ok: false,
      response: apiError('UNAUTHORIZED', 'Authentication required', 401),
    }
  }

  const entitlement = await canAccessAiFeature(user.id, feature)
  if (!entitlement.allowed) {
    return {
      ok: false,
      response: apiError('FORBIDDEN', entitlement.reason ?? 'Feature not available for current plan', 403, {
        plan: entitlement.plan,
        feature,
      }),
    }
  }

  try {
    const budget = await assertWithinAiBudget(user.id, entitlement.isActive)
    if (!budget.allowed) {
      return {
        ok: false,
        response: apiError('BUDGET_EXCEEDED', 'Monthly AI budget exceeded for your plan.', 402, {
          feature,
          plan: entitlement.plan,
          limit: budget.limit,
          used: budget.used,
          remaining: budget.remaining,
        }),
      }
    }
  } catch {
    // In test/dev fallback, do not block core route behavior when budget backing store is unavailable.
    if (process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        response: apiError('SERVICE_UNAVAILABLE', 'AI budget service temporarily unavailable.', 503),
      }
    }
  }

  let rateLimitResult: LimiterResult
  try {
    rateLimitResult = await limiter(req, { subject: user.id })
  } catch {
    return {
      ok: false,
      response: apiError('SERVICE_UNAVAILABLE', 'Rate limiting temporarily unavailable.', 503),
    }
  }

  if (!rateLimitResult.success) {
    return {
      ok: false,
      response: apiError('RATE_LIMITED', 'Too many requests. Please try again later.', 429, {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
      }),
    }
  }

  return {
    ok: true,
    userId: user.id,
    email: user.email,
  }
}

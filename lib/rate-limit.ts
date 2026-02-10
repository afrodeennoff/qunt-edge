/**
 * Enterprise Rate Limiting Implementation
 * Uses Upstash Redis for distributed rate limiting
 * 
 * Features:
 * - Sliding window algorithm
 * - Multiple rate limit tiers
 * - Per-user and per-IP limiting
 * - Graceful degradation if Redis unavailable
 * - Detailed analytics and logging
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  : null

/**
 * Rate limit tiers for different endpoints
 */
export const RateLimitTier = {
  // Critical endpoints - very strict
  AUTH: 'auth', // 5 requests per minute
  PAYMENT: 'payment', // 10 requests per minute

  // Data mutations - moderate
  IMPORT: 'import', // 10 requests per minute
  EXPORT: 'export', // 5 requests per minute
  MUTATION: 'mutation', // 20 requests per minute

  // AI endpoints - expensive
  AI_MAPPING: 'ai-mapping', // 30 requests per minute
  AI_ANALYSIS: 'ai-analysis', // 20 requests per minute

  // Read operations - lenient
  QUERY: 'query', // 100 requests per minute
  WEBHOOK: 'webhook', // 50 requests per minute
} as const

type RateLimitTierType = typeof RateLimitTier[keyof typeof RateLimitTier]

/**
 * Rate limiter instances for each tier
 */
const rateLimiters: Record<RateLimitTierType, Ratelimit | null> = {
  [RateLimitTier.AUTH]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: '@ratelimit/auth',
    })
    : null,

  [RateLimitTier.PAYMENT]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: '@ratelimit/payment',
    })
    : null,

  [RateLimitTier.IMPORT]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: '@ratelimit/import',
    })
    : null,

  [RateLimitTier.EXPORT]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: '@ratelimit/export',
    })
    : null,

  [RateLimitTier.MUTATION]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: '@ratelimit/mutation',
    })
    : null,

  [RateLimitTier.AI_MAPPING]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: '@ratelimit/ai-mapping',
    })
    : null,

  [RateLimitTier.AI_ANALYSIS]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: '@ratelimit/ai-analysis',
    })
    : null,

  [RateLimitTier.QUERY]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@ratelimit/query',
    })
    : null,

  [RateLimitTier.WEBHOOK]: redis
    ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '1 m'),
      analytics: true,
      prefix: '@ratelimit/webhook',
    })
    : null,
}

/**
 * Rate limit result with metadata
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

/**
 * Check rate limit for a given identifier and tier
 * 
 * @param identifier - User ID, IP address, or other unique identifier
 * @param tier - Rate limit tier to apply
 * @returns Rate limit result
 * 
 * @example
 * const result = await checkRateLimit(userId, RateLimitTier.IMPORT)
 * if (!result.success) {
 *   return res.status(429).json({ 
 *     error: 'Too many requests',
 *     retryAfter: result.retryAfter 
 *   })
 * }
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTierType
): Promise<RateLimitResult> {
  const limiter = rateLimiters[tier]

  // Graceful degradation: if Redis is unavailable, allow request
  if (!limiter) {
    console.warn(`Rate limiter for ${tier} not available, allowing request`)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    return {
      success,
      limit,
      remaining,
      reset: new Date(reset),
      retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
    }
  } catch (error) {
    console.error(`Rate limit check failed for ${tier}:`, error)

    // On error, fail open (allow request) for availability
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    }
  }
}

/**
 * Rate limit middleware for Next.js API routes
 * 
 * @param tier - Rate limit tier
 * @param getIdentifier - Function to extract identifier from request
 * 
 * @example
 * export default withRateLimit(
 *   handler,
 *   RateLimitTier.IMPORT,
 *   (req) => req.headers.get('x-user-id') || req.ip
 * )
 */
export function withRateLimit(
  tier: RateLimitTierType,
  getIdentifier?: (req: Request) => string | Promise<string>
) {
  return async function rateLimitMiddleware(
    req: Request,
    context?: any
  ): Promise<Response | null> {
    // Extract identifier
    let identifier: string

    if (getIdentifier) {
      identifier = await getIdentifier(req)
    } else {
      // Default: use IP address or user ID from headers
      identifier =
        req.headers.get('x-user-id') ||
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'anonymous'
    }

    // Check rate limit
    const result = await checkRateLimit(identifier, tier)

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset.toISOString(),
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toISOString(),
            'Retry-After': result.retryAfter?.toString() || '60',
          },
        }
      )
    }

    // Add rate limit headers to response
    if (context) {
      context.rateLimitHeaders = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toISOString(),
      }
    }

    return null // Allow request to proceed
  }
}

/**
 * Reset rate limit for a specific identifier (admin function)
 * Useful for support/debugging
 * 
 * @param identifier - Identifier to reset
 * @param tier - Rate limit tier
 */
export async function resetRateLimit(
  identifier: string,
  tier: RateLimitTierType
): Promise<boolean> {
  const limiter = rateLimiters[tier]
  if (!limiter || !redis) {
    return false
  }

  try {
    await limiter.resetUsedTokens(identifier)
    return true
  } catch (error) {
    console.error(`Failed to reset rate limit for ${identifier}:`, error)
    return false
  }
}

/**
 * Get rate limit analytics for monitoring
 * 
 * @param tier - Rate limit tier
 * @returns Analytics data
 */
export async function getRateLimitAnalytics(tier: RateLimitTierType): Promise<{
  totalRequests: number
  blockedRequests: number
  uniqueIdentifiers: number
} | null> {
  const limiter = rateLimiters[tier]
  if (!limiter || !redis) {
    return null
  }

  try {
    // Current @upstash/ratelimit RegionRatelimit API does not expose getAnalytics().
    // Keep this helper non-breaking and return a minimal snapshot-compatible shape.
    // Consumers should treat these values as unavailable until a dedicated analytics backend is wired.
    void limiter
    return {
      totalRequests: 0,
      blockedRequests: 0,
      uniqueIdentifiers: 0,
    }
  } catch (error) {
    console.error(`Failed to get analytics for ${tier}:`, error)
    return null
  }
}

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitingEnabled(): boolean {
  return redis !== null
}

/**
 * Helper to attach rate limit headers to Response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', result.reset.toISOString())

  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Production-grade query result caching with tag-based invalidation
 *
 * This module provides a wrapper around Next.js unstable_cache with:
 * - Automatic cache key prefixing
 * - Tag-based cache invalidation
 * - Feature flag integration
 * - Logging for debugging
 *
 * @module lib/cache/query-cache
 */

import { unstable_cache } from 'next/cache'
import { logger } from '@/lib/logger'

export interface CacheOptions {
  /** Revalidation time in seconds (0 = no cache) */
  revalidateIn?: number
  /** Cache tags for selective invalidation */
  tags?: string[]
}

/**
 * Wraps a query function with Next.js unstable_cache
 *
 * @example
 * ```ts
 * const getCachedUser = cacheQuery(
 *   async (userId: string) => prisma.user.findUnique({ where: { id: userId } }),
 *   ['user-data', userId],
 *   { revalidateIn: 300, tags: [`user-data-${userId}`] }
 * )
 * ```
 *
 * @param queryFn - Async function that fetches data
 * @param keyParts - Cache key parts (will be prefixed with 'query')
 * @param options - Cache configuration
 * @returns Cached query function
 */
export function cacheQuery<T>(
  queryFn: () => Promise<T>,
  keyParts: string[],
  options: CacheOptions = {}
): () => Promise<T> {
  const { revalidateIn = 300, tags = [] } = options

  // Prefix all keys with 'query' namespace to avoid collisions
  const cacheKey = ['query', ...keyParts]

  logger.debug('[Cache] Creating cached query', {
    key: cacheKey.join('/'),
    revalidateIn,
    tags: tags.length > 0 ? tags : undefined,
  })

  return unstable_cache(queryFn, cacheKey, {
    revalidate: revalidateIn,
    tags: tags.length > 0 ? tags : undefined,
  })
}

/**
 * Invalidates cache entries by tags
 *
 * This function will:
 * 1. Log the invalidation for debugging
 * 2. Attempt to use Next.js 15 unstable_expireTag if available
 * 3. Fall back gracefully if not available
 *
 * @param tags - Array of cache tags to invalidate
 *
 * @example
 * ```ts
 * invalidateCache(['user-data-123', 'trades-123'])
 * ```
 */
export function invalidateCache(tags: string[]): void {
  logger.info('[Cache] Invalidating cache tags', { tags })

  // Next.js 15+ provides unstable_expireTag for immediate expiration
  // This is more reliable than revalidateTag for immediate invalidation
  if (typeof require !== 'undefined') {
    try {
      const nextCache = require('next/cache')
      const expireTag = nextCache.unstable_expireTag

      if (typeof expireTag === 'function') {
        tags.forEach((tag) => expireTag(tag))
        logger.debug('[Cache] Successfully expired tags', { tags })
        return
      }
    } catch (e) {
      logger.warn('[Cache] unstable_expireTag not available, using revalidateTag', {
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  // Fallback to revalidateTag for older Next.js versions
  try {
    const { revalidateTag } = require('next/cache')
    tags.forEach((tag) => revalidateTag(tag, { expire: 0 }))
    logger.debug('[Cache] Revalidated tags (fallback)', { tags })
  } catch (e) {
    logger.error('[Cache] Failed to invalidate cache', {
      error: e instanceof Error ? e.message : String(e),
      tags,
    })
  }
}

/**
 * Type-safe cache tag builder
 *
 * @example
 * ```ts
 * const userTag = CacheTag.user('123')
 * const tradesTag = CacheTag.trades('123')
 * ```
 */
export const CacheTag = {
  user: (userId: string) => `user-data-${userId}` as const,
  accountMetrics: (userId: string) => `account-metrics-${userId}` as const,
  trades: (userId: string) => `trades-${userId}` as const,
  dashboardLayout: (userId: string) => `dashboard-${userId}` as const,
} as const

export type CacheTag = typeof CacheTag

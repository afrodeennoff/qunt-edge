/**
 * Feature Flag System for Performance Optimization Rollout
 *
 * This system provides controlled, gradual rollout of performance optimizations
 * with emergency rollback capabilities.
 *
 * Usage:
 * ```ts
 * import { FEATURE_FLAGS, shouldShowOptimizations } from '@/lib/feature-flags'
 *
 * if (FEATURE_FLAGS.ENABLE_SKELETON_LOADING) {
 *   // Show skeleton loading UI
 * }
 *
 * if (shouldShowOptimizations(userId)) {
 *   // Apply optimizations for this user
 * }
 * ```
 */

function getFeatureFlags() {
  return {
    // Performance optimizations
    ENABLE_SKELETON_LOADING: process.env.NEXT_PUBLIC_ENABLE_SKELETON_LOADING === 'true',
    ENABLE_DEFERRED_COMPUTATIONS: process.env.NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS === 'true',
    ENABLE_LAZY_LOADING: process.env.NEXT_PUBLIC_ENABLE_LAZY_LOADING === 'true',
    ENABLE_QUERY_CACHING: process.env.NEXT_PUBLIC_ENABLE_QUERY_CACHING === 'true',

    // Rollout controls
    ROLLOUT_PERCENTAGE: Number(process.env.NEXT_PUBLIC_PERF_ROLLOUT_PCT) || 0,

    // Safety
    ENABLE_EMERGENCY_ROLLBACK: process.env.NEXT_PUBLIC_EMERGENCY_ROLLBACK === 'true',
  } as const
}

// Export a frozen object for normal usage
export const FEATURE_FLAGS = Object.freeze(getFeatureFlags())

export type FeatureFlag = keyof typeof FEATURE_FLAGS

/**
 * Determines if a user should see performance optimizations based on:
 * 1. Emergency rollback status (always false if enabled)
 * 2. Gradual rollout percentage
 * 3. Deterministic user ID hashing
 *
 * @param userId - Optional user ID for consistent rollout assignment
 * @returns true if optimizations should be shown to this user
 */
export function shouldShowOptimizations(userId?: string): boolean {
  // Emergency rollback overrides everything
  if (FEATURE_FLAGS.ENABLE_EMERGENCY_ROLLBACK) {
    return false
  }

  // 100% rollout = everyone gets it
  if (FEATURE_FLAGS.ROLLOUT_PERCENTAGE >= 100) {
    return true
  }

  // 0% rollout = nobody gets it
  if (FEATURE_FLAGS.ROLLOUT_PERCENTAGE <= 0) {
    return false
  }

  // Gradual rollout: deterministic hash-based assignment
  if (userId) {
    const hash = hashCode(userId)
    return (hash % 100) < FEATURE_FLAGS.ROLLOUT_PERCENTAGE
  }

  // No userId provided: use random sampling (less consistent)
  return Math.random() * 100 < FEATURE_FLAGS.ROLLOUT_PERCENTAGE
}

/**
 * Simple deterministic string hash function
 *
 * @param str - String to hash
 * @returns Non-negative integer hash
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Check if a specific feature flag is enabled
 *
 * @param flag - Feature flag name
 * @returns true if the flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return !!FEATURE_FLAGS[flag]
}

/**
 * Get current rollout status as a human-readable string
 *
 * @returns Status description
 */
export function getRolloutStatus(): string {
  if (FEATURE_FLAGS.ENABLE_EMERGENCY_ROLLBACK) {
    return 'EMERGENCY_ROLLBACK'
  }

  const pct = FEATURE_FLAGS.ROLLOUT_PERCENTAGE

  if (pct === 0) return 'DISABLED'
  if (pct >= 100) return 'FULL_ROLLOUT'
  if (pct < 10) return 'PILOT'
  if (pct < 50) return 'EARLY_ACCESS'
  return 'GRADUAL_ROLLOUT'
}

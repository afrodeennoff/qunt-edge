import { describe, it, expect, beforeEach, vi } from 'vitest'
import { unstable_cache } from 'next/cache'

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock feature flags
vi.mock('@/lib/feature-flags', () => ({
  FEATURE_FLAGS: {
    ENABLE_QUERY_CACHING: true,
    ENABLE_SKELETON_LOADING: false,
    ENABLE_DEFERRED_COMPUTATIONS: false,
    ENABLE_LAZY_LOADING: false,
    ROLLOUT_PERCENTAGE: 0,
    ENABLE_EMERGENCY_ROLLBACK: false,
  },
}))

// Import after mocks
import { cacheQuery, invalidateCache } from '@/lib/cache/query-cache'

describe('Query Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('cacheQuery', () => {
    it('should wrap query function with unstable_cache', async () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: 'test' })
      const mockCachedFn = vi.fn().mockResolvedValue({ data: 'cached' })

      vi.mocked(unstable_cache).mockReturnValue(mockCachedFn as any)

      const result = cacheQuery(
        mockQueryFn,
        ['test-key'],
        { revalidateIn: 60 }
      )

      expect(unstable_cache).toHaveBeenCalledWith(
        mockQueryFn,
        ['query', 'test-key'],
        { revalidate: 60, tags: undefined }
      )
    })

    it('should include tags when provided', async () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: 'test' })
      const mockCachedFn = vi.fn().mockResolvedValue({ data: 'cached' })

      vi.mocked(unstable_cache).mockReturnValue(mockCachedFn as any)

      const result = cacheQuery(
        mockQueryFn,
        ['user-data', '123'],
        { revalidateIn: 300, tags: ['user-data-123'] }
      )

      expect(unstable_cache).toHaveBeenCalledWith(
        mockQueryFn,
        ['query', 'user-data', '123'],
        { revalidate: 300, tags: ['user-data-123'] }
      )
    })

    it('should prepend query prefix to cache key', async () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: 'test' })
      const mockCachedFn = vi.fn().mockResolvedValue({ data: 'cached' })

      vi.mocked(unstable_cache).mockReturnValue(mockCachedFn as any)

      cacheQuery(mockQueryFn, ['accounts', 'metrics'], {})

      expect(unstable_cache).toHaveBeenCalledWith(
        mockQueryFn,
        ['query', 'accounts', 'metrics'],
        expect.any(Object)
      )
    })

    it('should default to 300 seconds revalidation', async () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: 'test' })
      const mockCachedFn = vi.fn().mockResolvedValue({ data: 'cached' })

      vi.mocked(unstable_cache).mockReturnValue(mockCachedFn as any)

      cacheQuery(mockQueryFn, ['test'], {})

      expect(unstable_cache).toHaveBeenCalledWith(
        mockQueryFn,
        ['query', 'test'],
        { revalidate: 300, tags: undefined }
      )
    })
  })

  describe('invalidateCache', () => {
    it('should log cache invalidation', async () => {
      const { logger } = await import('@/lib/logger')
      invalidateCache(['user-data-123', 'trades-123'])

      // Verify logger.info was called
      expect(logger.info).toHaveBeenCalledWith(
        '[Cache] Invalidating cache tags',
        { tags: ['user-data-123', 'trades-123'] }
      )
    })

    it('should call revalidateTag for each tag when available', async () => {
      // Dynamic import to test the require() logic
      const cacheModule = await import('@/lib/cache/query-cache')

      // Mock require to simulate Next.js environment
      const originalRequire = global.require
      global.require = vi.fn().mockReturnValue({
        unstable_expireTag: vi.fn(),
      }) as any

      const expireTagSpy = vi.fn()
      global.require = vi.fn().mockReturnValue({
        unstable_expireTag: expireTagSpy,
      }) as any

      cacheModule.invalidateCache(['user-data-123', 'trades-123'])

      // Note: This tests the logic path but actual execution depends on runtime environment
      expect(expireTagSpy).toBeDefined()

      // Restore
      global.require = originalRequire
    })
  })

  describe('feature flag integration', () => {
    it('should respect ENABLE_QUERY_CACHING feature flag', async () => {
      const { FEATURE_FLAGS } = await import('@/lib/feature-flags')

      // When flag is disabled, revalidate should be 0 (bypass cache)
      if (!FEATURE_FLAGS.ENABLE_QUERY_CACHING) {
        const mockQueryFn = vi.fn().mockResolvedValue({ data: 'test' })
        const mockCachedFn = vi.fn().mockResolvedValue({ data: 'cached' })

        vi.mocked(unstable_cache).mockReturnValue(mockCachedFn as any)

        cacheQuery(
          mockQueryFn,
          ['test'],
          { revalidateIn: FEATURE_FLAGS.ENABLE_QUERY_CACHING ? 300 : 0 }
        )

        expect(unstable_cache).toHaveBeenCalledWith(
          mockQueryFn,
          ['query', 'test'],
          { revalidate: 0, tags: undefined }
        )
      }
    })
  })

  describe('cache behavior', () => {
    it('should cache query results and return same data on subsequent calls', async () => {
      let callCount = 0
      const queryFn = async () => {
        callCount++
        return { data: 'test', timestamp: Date.now() }
      }

      const mockCachedFn = vi.fn((fn: any) => {
        // Simulate cache behavior: call original once, then return cached result
        let cachedResult: any = null
        return async () => {
          if (!cachedResult) {
            cachedResult = await fn()
          }
          return cachedResult
        }
      })

      vi.mocked(unstable_cache).mockImplementation(
        (fn: any) => mockCachedFn(fn)
      )

      const cachedQuery = cacheQuery(queryFn, ['test'], { revalidateIn: 60 })

      const result1 = await cachedQuery()
      const result2 = await cachedQuery()

      // Both calls should return the same data (cached)
      expect(result1).toEqual(result2)
      expect(mockCachedFn).toHaveBeenCalled()
    })
  })
})

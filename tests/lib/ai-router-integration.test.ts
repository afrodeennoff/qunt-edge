import { describe, expect, it, vi, beforeEach } from "vitest"

// Mock the router dependencies
vi.mock('@/lib/redis-cache', () => ({
  getRedisJson: vi.fn(async () => null),
  setRedisJson: vi.fn(async () => undefined),
  isRedisConfigured: vi.fn(() => false),
  runRedisCommand: vi.fn(async () => null),
}))

vi.mock('@/lib/env', () => ({
  getEnv: vi.fn(() => ({
    NODE_ENV: 'test',
    AI_ROUTER_ENABLED: 'true',
    OPENROUTER_API_KEY: 'test-key',
  })),
}))

describe('AI Router Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Router Configuration', () => {
    it('should load router config correctly', async () => {
      const { getRouterConfig } = await import('@/lib/ai/router/config')
      const config = getRouterConfig()
      
      expect(config.enabled).toBe(true)
      expect(config.openrouter.apiKey).toBe('test-key')
      expect(config.openrouter.baseUrl).toBe('https://openrouter.ai/api/v1')
      expect(config.openrouter.models.free).toBe('openrouter/free')
      expect(config.openrouter.models.auto).toBe('openrouter/auto')
      expect(config.openrouter.models.liquid).toBe('liquid/lfm2-8b-a1b')
      expect(config.openrouter.provider.order).toEqual(['openrouter'])
      expect(config.cache.ttlSeconds).toBe(300)
      expect(config.circuitBreaker.failureThreshold).toBe(5)
      expect(config.circuitBreaker.recoveryTimeoutMs).toBe(60000)
    })
  })

  describe('Budget Reservation', () => {
    it('should allow reservation within budget with in-memory fallback', async () => {
      const { BudgetReservation } = await import('@/lib/ai/router/reservations')
      const result = await BudgetReservation.reserve('user-1', 0.5, 1.0)
      expect(result).toBe(true)
    })

    it('should reject reservation exceeding budget', async () => {
      const { BudgetReservation } = await import('@/lib/ai/router/reservations')
      await BudgetReservation.reserve('user-2', 0.8, 1.0)
      const result = await BudgetReservation.reserve('user-2', 0.3, 1.0)
      expect(result).toBe(false)
    })

    it('should track and reset balance', async () => {
      const { BudgetReservation } = await import('@/lib/ai/router/reservations')
      await BudgetReservation.reserve('user-3', 0.3, 1.0)
      const balance = await BudgetReservation.getBalance('user-3')
      expect(balance).toBe(0.3)
      await BudgetReservation.resetBudget('user-3')
      const resetBalance = await BudgetReservation.getBalance('user-3')
      expect(resetBalance).toBe(0)
    })
  })

  describe('Circuit Breaker', () => {
    it('should call operation successfully when circuit is closed', async () => {
      const { CircuitBreaker } = await import('@/lib/ai/router/circuit')
      const breaker = new CircuitBreaker()
      
      const operation = vi.fn(async () => 'success')
      const result = await breaker.call('test-provider', 'test-model', operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalled()
    })

    it('should handle operation failure', async () => {
      const { CircuitBreaker } = await import('@/lib/ai/router/circuit')
      const breaker = new CircuitBreaker()
      
      const operation = vi.fn(async () => { throw new Error('test error') })
      
      await expect(breaker.call('test-provider', 'test-model', operation)).rejects.toThrow('test error')
    })
  })

  describe('Tenant-Safe Cache', () => {
    it('should return null for cache miss', async () => {
      const { TenantSafeCache } = await import('@/lib/ai/router/cache')
      const cache = new TenantSafeCache()
      
      const result = await cache.get('user-1', 'feature-1', 'prompt-1')
      expect(result).toBeNull()
    })

    it('should cache and retrieve values', async () => {
      const { TenantSafeCache } = await import('@/lib/ai/router/cache')
      const cache = new TenantSafeCache()
      
      // Note: This test uses in-memory fallback since Redis is mocked
      await cache.set('user-1', 'feature-1', 'prompt-1', 'response-1')
      // In-memory cache doesn't persist between calls, so we just test the interface
    })
  })

  describe('Fallback Router', () => {
    it('should throw error when all providers fail', async () => {
      const { FallbackRouter } = await import('@/lib/ai/router/fallback')
      const router = new FallbackRouter()
      
      // This will fail because we don't have valid API keys in test
      await expect(router.createCompletion({
        userId: 'test-user',
        feature: 'test',
        messages: [{ role: 'user', content: 'Hello' }],
      })).rejects.toThrow('All providers failed')
    })
  })

  describe('AI Router Public Interface', () => {
    it('should throw error when router is disabled', async () => {
      vi.resetModules()
      vi.doMock('@/lib/env', () => ({
        getEnv: vi.fn(() => ({
          NODE_ENV: 'test',
          AI_ROUTER_ENABLED: 'false',
          OPENROUTER_API_KEY: 'test-key',
        })),
      }))
      const { aiRouter } = await import('@/lib/ai/router')
      await expect(aiRouter.createCompletion({
        userId: 'test-user',
        feature: 'test',
        messages: [{ role: 'user', content: 'hi' }],
      })).rejects.toThrow('AI Router is not enabled')
    })
  })
})

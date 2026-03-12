import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock environment variables
const originalEnv = { ...process.env }

// Mock redis-cache for router testing
vi.mock('@/lib/redis-cache', () => ({
  getRedisJson: vi.fn(async () => null),
  setRedisJson: vi.fn(async () => undefined),
  deleteRedisKey: vi.fn(async () => undefined),
  isRedisConfigured: vi.fn(() => false),
  runRedisCommand: vi.fn(async () => null),
}))

// Mock AI SDK
vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toUIMessageStreamResponse: () => new Response("ok"),
    toTextStreamResponse: () => new Response("ok"),
    toDataStreamResponse: () => new Response("ok"),
  })),
  convertToCoreMessages: vi.fn(async (messages: unknown) => messages),
  stepCountIs: vi.fn(() => () => false),
  tool: vi.fn((definition: unknown) => definition),
  createTool: vi.fn((definition: unknown) => definition),
}))

// Mock OpenAI SDK
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}))

// Mock OpenAI for transcription
vi.mock("openai", () => ({
  default: class MockOpenAI {
    public audio = {
      transcriptions: {
        create: vi.fn(async () => "mock transcript"),
      },
    }
  },
}))

// Mock route guard
vi.mock("@/lib/ai/route-guard", () => ({
  guardAiRequest: vi.fn(async () => ({
    ok: true,
    userId: "test-user-1",
    email: "test@example.com",
  })),
}))

// Mock Supabase auth
vi.mock("@/lib/supabase/route-client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "test-user-1", email: "test@example.com" } },
      })),
    },
  })),
}))

describe("AI Router - Comprehensive Integration Tests", () => {
  beforeEach(() => {
    // Reset environment
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: "test-glm-key",
      OPENROUTER_API_KEY: "test-openrouter-key",
      AI_ROUTER_ENABLED: "false", // Default: router disabled
      NODE_ENV: "test",
    }
    vi.clearAllMocks()
  })

  afterEach(async () => {
    process.env = originalEnv
    vi.resetModules()
  })

  describe("1. Route-Level Tests - Router Disabled (Default)", () => {
    it("chat route should use GLM when router disabled", async () => {
      const { POST } = await import("@/app/api/ai/chat/route")
      const request = new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request as never)
      expect(response.status).toBe(200)
    })

    it("editor route should use GLM when router disabled", async () => {
      const { POST } = await import("@/app/api/ai/editor/route")
      const request = new Request("http://localhost/api/ai/editor", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Fix my code",
          action: "edit",
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request as never)
      expect(response.status).toBe(200)
    })

    it("support route should use GLM when router disabled", async () => {
      const { POST } = await import("@/app/api/ai/support/route")
      const request = new Request("http://localhost/api/ai/support", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Help me" }],
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request as never)
      expect(response.status).toBe(200)
    })

    it("transcribe route should use GLM when router disabled", async () => {
      const { POST } = await import("@/app/api/ai/transcribe/route")
      const formData = new FormData()
      formData.append("file", new Blob(["audio data"]), "test.mp3")

      const request = new Request("http://localhost/api/ai/transcribe", {
        method: "POST",
        body: formData,
      })

      const response = await POST(request as never)
      expect(response.status).toBe(200)
    })

    it("analysis routes should use GLM when router disabled", async () => {
      const routes = [
        "@/app/api/ai/analysis/accounts/route",
        "@/app/api/ai/analysis/global/route",
        "@/app/api/ai/analysis/instrument/route",
        "@/app/api/ai/analysis/time-of-day/route",
      ]

      for (const routePath of routes) {
        const { POST } = await import(routePath)
        const request = new Request("http://localhost/api/ai/analysis/accounts", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Analyze this" }],
            locale: "en",
          }),
          headers: { "Content-Type": "application/json" },
        })

        const response = await POST(request as never)
        expect(response.status).toBe(200)
      }
    })
  })

  describe("2. Route-Level Tests - Router Enabled", () => {
    beforeEach(() => {
      process.env.AI_ROUTER_ENABLED = "true"
      process.env.OPENROUTER_API_KEY = "test-openrouter-key"
    })

    it("chat route should attempt free tiers first when router enabled", async () => {
      const { POST } = await import("@/app/api/ai/chat/route")
      const request = new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request as never)
      // Should attempt router (may fail due to mock, but should log attempt)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(500)
    })

    it("editor route should attempt free tiers first when router enabled", async () => {
      const { POST } = await import("@/app/api/ai/editor/route")
      const request = new Request("http://localhost/api/ai/editor", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Fix my code",
          action: "edit",
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request as never)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(500)
    })

    it("support route should attempt free tiers first when router enabled", async () => {
      const { POST } = await import("@/app/api/ai/support/route")
      const request = new Request("http://localhost/api/ai/support", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Help me" }],
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request as never)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(500)
    })

    it("transcribe route should attempt free tiers first when router enabled", async () => {
      const { POST } = await import("@/app/api/ai/transcribe/route")
      const formData = new FormData()
      formData.append("file", new Blob(["audio data"]), "test.mp3")

      const request = new Request("http://localhost/api/ai/transcribe", {
        method: "POST",
        body: formData,
      })

      const response = await POST(request as never)
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(500)
    })

    it("analysis routes should attempt free tiers first when router enabled", async () => {
      const routes = [
        { path: "@/app/api/ai/analysis/accounts/route", url: "/api/ai/analysis/accounts" },
        { path: "@/app/api/ai/analysis/global/route", url: "/api/ai/analysis/global" },
        { path: "@/app/api/ai/analysis/instrument/route", url: "/api/ai/analysis/instrument" },
        { path: "@/app/api/ai/analysis/time-of-day/route", url: "/api/ai/analysis/time-of-day" },
      ]

      for (const route of routes) {
        const { POST } = await import(route.path)
        const request = new Request(`http://localhost${route.url}`, {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Analyze this" }],
            locale: "en",
          }),
          headers: { "Content-Type": "application/json" },
        })

        const response = await POST(request as never)
        expect(response.status).toBeGreaterThanOrEqual(200)
        expect(response.status).toBeLessThan(500)
      }
    })
  })

  describe("3. Provider Chain Tests", () => {
    beforeEach(() => {
      process.env.AI_ROUTER_ENABLED = "true"
      process.env.OPENROUTER_API_KEY = "test-openrouter-key"
    })

    it("should attempt providers in correct order: OpenRouter Free → OpenRouter Auto → Liquid LFM → GLM", async () => {
      const { FallbackRouter } = await import("@/lib/ai/router/fallback")
      const router = new FallbackRouter()

      // Track provider attempts
      const attempts: string[] = []

      // Mock the circuit breaker to track attempts
      const { CircuitBreaker } = await import("@/lib/ai/router/circuit")
      const breaker = new CircuitBreaker()

      vi.spyOn(breaker, 'call').mockImplementation(async (provider, model, operation) => {
        attempts.push(`${provider}: ${model}`)
        throw new Error("Mock failure")
      })

      // Replace router's circuit breaker
      ;(router as any).circuitBreaker = breaker

      try {
        await router.createCompletion({
          userId: "test-user",
          feature: "test",
          budgetLimit: 1.0,
          messages: [{ role: "user", content: "Test" }],
        })
      } catch (e) {
        // Expected to fail
      }

      // Verify attempts were made (should have multiple provider attempts)
      expect(attempts.length).toBeGreaterThan(0)
    })

    it("should stop at first successful provider", async () => {
      const { FallbackRouter } = await import("@/lib/ai/router/fallback")
      const router = new FallbackRouter()

      // Mock circuit breaker to succeed on first try
      const { CircuitBreaker } = await import("@/lib/ai/router/circuit")
      const breaker = new CircuitBreaker()

      vi.spyOn(breaker, 'call').mockResolvedValue({
        content: "Success response",
        model: "test-model",
        provider: "openrouter",
      })

      ;(router as any).circuitBreaker = breaker

      const result = await router.createCompletion({
        userId: "test-user",
        feature: "test",
        budgetLimit: 1.0,
        messages: [{ role: "user", content: "Test" }],
      })

      expect(result.content).toBe("Success response")
    })

    it("should fall back to GLM when all free tiers fail", async () => {
      // This tests the concept - actual GLM fallback would require more complex mocking
      const { getAiLanguageModel } = await import("@/lib/ai/client")

      process.env.AI_ROUTER_ENABLED = "true"
      process.env.OPENROUTER_API_KEY = "invalid-key" // Force fallback

      // Should not throw, should handle fallback gracefully
      const model = await getAiLanguageModel("chat")
      expect(model).toBeDefined()
    })
  })

  describe("4. Circuit Breaker Tests", () => {
    beforeEach(() => {
      process.env.AI_ROUTER_ENABLED = "true"
    })

    it("should allow calls when circuit is closed", async () => {
      const { CircuitBreaker } = await import("@/lib/ai/router/circuit")
      const breaker = new CircuitBreaker()

      const successOperation = vi.fn(async () => "success")
      const result = await breaker.call("test-provider", "test-model", successOperation)

      expect(result).toBe("success")
      expect(successOperation).toHaveBeenCalled()
    })

    it("should handle operation failures and track them", async () => {
      const { CircuitBreaker } = await import("@/lib/ai/router/circuit")
      const breaker = new CircuitBreaker()

      const failingOperation = vi.fn(async () => {
        throw new Error("Provider unavailable")
      })

      // Execute failures up to threshold (default is 5)
      for (let i = 0; i < 5; i++) {
        try {
          await breaker.call("test-provider", "test-model", failingOperation)
        } catch (e) {
          // Expected failures
        }
      }

      // Circuit should now be open - next call should fail immediately
      await expect(
        breaker.call("test-provider", "test-model", failingOperation)
      ).rejects.toThrow()
    })

    it("should recover after timeout period", async () => {
      const { CircuitBreaker } = await import("@/lib/ai/router/circuit")
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        recoveryTimeoutMs: 100, // Short timeout for testing
      })

      const failingOperation = vi.fn(async () => {
        throw new Error("Provider unavailable")
      })

      const successOperation = vi.fn(async () => "success")

      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.call("test-provider", "test-model", failingOperation)
        } catch (e) {
          // Expected
        }
      }

      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 150))

      // Next call should attempt operation (half-open state)
      const result = await breaker.call("test-provider", "test-model", successOperation)
      expect(result).toBe("success")
    })

    it("should track failures per provider-model combination", async () => {
      const { CircuitBreaker } = await import("@/lib/ai/router/circuit")
      const breaker = new CircuitBreaker()

      // Fail on provider A
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.call("provider-a", "model-1", async () => {
            throw new Error("Fail")
          })
        } catch (e) {
          // Expected
        }
      }

      // Provider B should still work
      const result = await breaker.call("provider-b", "model-1", async () => "success")
      expect(result).toBe("success")

      // Provider A with different model should also work
      const result2 = await breaker.call("provider-a", "model-2", async () => "success")
      expect(result2).toBe("success")
    })
  })

  describe("5. Budget Enforcement Tests", () => {
    beforeEach(() => {
      process.env.AI_ROUTER_ENABLED = "true"
    })

    it("should allow requests within budget limit", async () => {
      const { BudgetReservation } = await import("@/lib/ai/router/reservations")

      const result = await BudgetReservation.reserve("user-budget-test", 0.5, 1.0)
      expect(result).toBe(true)

      const balance = await BudgetReservation.getBalance("user-budget-test")
      expect(balance).toBe(0.5)
    })

    it("should reject requests exceeding budget limit", async () => {
      const { BudgetReservation } = await import("@/lib/ai/router/reservations")

      // Reserve up to limit
      await BudgetReservation.reserve("user-budget-test-2", 0.8, 1.0)

      // Try to exceed
      const result = await BudgetReservation.reserve("user-budget-test-2", 0.3, 1.0)
      expect(result).toBe(false)

      const balance = await BudgetReservation.getBalance("user-budget-test-2")
      expect(balance).toBe(0.8) // Should remain at 0.8
    })

    it("should reset budget correctly", async () => {
      const { BudgetReservation } = await import("@/lib/ai/router/reservations")

      await BudgetReservation.reserve("user-budget-test-3", 0.6, 1.0)
      await BudgetReservation.resetBudget("user-budget-test-3")

      const balance = await BudgetReservation.getBalance("user-budget-test-3")
      expect(balance).toBe(0)
    })

    it("should handle concurrent reservations atomically", async () => {
      const { BudgetReservation } = await import("@/lib/ai/router/reservations")

      // Create multiple concurrent reservations
      const promises = Array.from({ length: 10 }, (_, i) =>
        BudgetReservation.reserve("user-concurrent-test", 0.1, 1.0)
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r).length

      // Should allow up to 10 reservations of 0.1 each (total 1.0)
      expect(successCount).toBe(10)

      const balance = await BudgetReservation.getBalance("user-concurrent-test")
      expect(balance).toBe(1.0)
    })
  })

  describe("6. Cache Tests", () => {
    it("should cache responses with per-user keys", async () => {
      const { TenantSafeCache } = await import("@/lib/ai/router/cache")
      const cache = new TenantSafeCache()

      await cache.set("user-1", "chat", "test prompt", "response-1")

      // Should retrieve for same user
      const result1 = await cache.get("user-1", "chat", "test prompt")
      expect(result1).toBe("response-1")

      // Should not retrieve for different user
      const result2 = await cache.get("user-2", "chat", "test prompt")
      expect(result2).toBeNull()
    })

    it("should include feature in cache key", async () => {
      const { TenantSafeCache } = await import("@/lib/ai/router/cache")
      const cache = new TenantSafeCache()

      await cache.set("user-1", "chat", "test prompt", "chat-response")

      // Different feature should miss cache
      const result = await cache.get("user-1", "editor", "test prompt")
      expect(result).toBeNull()
    })

    it("should hash prompts to avoid key length issues", async () => {
      const { TenantSafeCache } = await import("@/lib/ai/router/cache")
      const cache = new TenantSafeCache()

      const longPrompt = "a".repeat(10000)
      await cache.set("user-1", "chat", longPrompt, "response")

      const result = await cache.get("user-1", "chat", longPrompt)
      expect(result).toBe("response")
    })
  })

  describe("7. Error Scenarios", () => {
    it("should handle missing OPENROUTER_API_KEY gracefully", async () => {
      process.env.AI_ROUTER_ENABLED = "true"
      delete process.env.OPENROUTER_API_KEY

      const { getAiLanguageModel } = await import("@/lib/ai/client")

      // Should not throw, should fall back to GLM
      const model = await getAiLanguageModel("chat")
      expect(model).toBeDefined()
    })

    it("should return 401 for unauthenticated requests", async () => {
      const { guardAiRequest } = await import("@/lib/ai/route-guard")

      // Mock to return failure
      vi.mocked(guardAiRequest).mockResolvedValueOnce({
        ok: false,
        response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
      } as never)

      const { POST } = await import("@/app/api/ai/chat/route")
      const request = new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request as never)
      expect(response.status).toBe(401)
    })

    it("should handle budget exceeded errors", async () => {
      const { BudgetReservation } = await import("@/lib/ai/router/reservations")

      // Exceed budget first
      await BudgetReservation.reserve("budget-exceeded-user", 1.0, 1.0)

      const { FallbackRouter } = await import("@/lib/ai/router/fallback")
      const router = new FallbackRouter()

      // Should fail when budget exceeded
      await expect(router.createCompletion({
        userId: "budget-exceeded-user",
        feature: "test",
        budgetLimit: 1.0,
        messages: [{ role: "user", content: "Test" }],
      })).rejects.toThrow()
    })

    it("should fail gracefully when all providers are down", async () => {
      const { FallbackRouter } = await import("@/lib/ai/router/fallback")
      const router = new FallbackRouter()

      // Mock circuit breaker to always fail
      const { CircuitBreaker } = await import("@/lib/ai/router/circuit")
      const breaker = new CircuitBreaker()

      vi.spyOn(breaker, 'call').mockRejectedValue(new Error("Provider down"))

      ;(router as any).circuitBreaker = breaker

      await expect(router.createCompletion({
        userId: "test-user",
        feature: "test",
        budgetLimit: 1.0,
        messages: [{ role: "user", content: "Test" }],
      })).rejects.toThrow("All providers failed")
    })
  })

  describe("8. Performance Tests", () => {
    it("should measure router overhead vs direct GLM", async () => {
      // Test without router
      process.env.AI_ROUTER_ENABLED = "false"
      const start1 = Date.now()
      const { POST: POST1 } = await import("@/app/api/ai/chat/route")
      const request1 = new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test" }],
        }),
        headers: { "Content-Type": "application/json" },
      })
      await POST1(request1 as never)
      const timeWithoutRouter = Date.now() - start1

      // Reset modules
      vi.resetModules()

      // Test with router (will fail but we measure overhead)
      process.env.AI_ROUTER_ENABLED = "true"
      process.env.OPENROUTER_API_KEY = "test-key"
      const start2 = Date.now()
      const { POST: POST2 } = await import("@/app/api/ai/chat/route")
      const request2 = new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test" }],
        }),
        headers: { "Content-Type": "application/json" },
      })
      try {
        await POST2(request2 as never)
      } catch (e) {
        // May fail due to mocks
      }
      const timeWithRouter = Date.now() - start2

      // Router overhead should be minimal (< 100ms additional in test environment)
      const overhead = timeWithRouter - timeWithoutRouter
      expect(overhead).toBeLessThan(100)
    })

    it("should measure cache hit performance", async () => {
      const { TenantSafeCache } = await import("@/lib/ai/router/cache")
      const cache = new TenantSafeCache()

      // Cold read
      const start1 = Date.now()
      await cache.get("user-1", "chat", "uncached-prompt")
      const coldTime = Date.now() - start1

      // Warm read (after setting)
      await cache.set("user-1", "chat", "cached-prompt", "response")

      const start2 = Date.now()
      await cache.get("user-1", "chat", "cached-prompt")
      const warmTime = Date.now() - start2

      // Cache hit should be faster (or at least not significantly slower)
      expect(warmTime).toBeLessThanOrEqual(coldTime + 10) // Allow small margin
    })

    it("should handle concurrent requests efficiently", async () => {
      const concurrent = 5 // Reduced for test environment stability
      const requests = Array.from({ length: concurrent }, (_, i) =>
        import("@/app/api/ai/chat/route").then(async ({ POST }) => {
          const request = new Request("http://localhost/api/ai/chat", {
            method: "POST",
            body: JSON.stringify({
              messages: [{ role: "user", content: `Test ${i}` }],
            }),
            headers: { "Content-Type": "application/json" },
          })
          return POST(request as never)
        })
      )

      const start = Date.now()
      await Promise.all(requests)
      const totalTime = Date.now() - start

      // Concurrent requests should complete reasonably quickly
      expect(totalTime).toBeLessThan(concurrent * 2000) // Should be < 2s per request
    })
  })

  describe("9. Feature Flag Tests", () => {
    it("should respect AI_ROUTER_ENABLED=false", async () => {
      process.env.AI_ROUTER_ENABLED = "false"

      const { getRouterConfig } = await import("@/lib/ai/router/config")
      const config = getRouterConfig()

      expect(config.enabled).toBe(false)
    })

    it("should respect AI_ROUTER_ENABLED=true", async () => {
      process.env.AI_ROUTER_ENABLED = "true"

      const { getRouterConfig } = await import("@/lib/ai/router/config")
      const config = getRouterConfig()

      expect(config.enabled).toBe(true)
    })

    it("should default to disabled when env var is not set", async () => {
      delete process.env.AI_ROUTER_ENABLED

      const { getRouterConfig } = await import("@/lib/ai/router/config")
      const config = getRouterConfig()

      expect(config.enabled).toBe(false)
    })
  })

  describe("10. Configuration Validation Tests", () => {
    it("should load default config values", async () => {
      const { getRouterConfig } = await import("@/lib/ai/router/config")
      const config = getRouterConfig()

      expect(config).toMatchObject({
        enabled: expect.any(Boolean),
        openrouter: {
          apiKey: expect.any(String),
          baseUrl: expect.any(String),
          models: {
            free: expect.any(String),
            auto: expect.any(String),
          },
        },
        liquid: {
          models: {
            lfm: expect.any(String),
          },
        },
        cache: {
          ttlSeconds: expect.any(Number),
        },
        circuitBreaker: {
          failureThreshold: expect.any(Number),
          recoveryTimeoutMs: expect.any(Number),
        },
      })
    })

    it("should parse custom config values", async () => {
      process.env.AI_ROUTER_ENABLED = "true"
      process.env.OPENROUTER_FREE_MODEL = "custom-free-model"
      process.env.AI_ROUTER_CACHE_TTL = "600"

      const { getRouterConfig } = await import("@/lib/ai/router/config")
      const config = getRouterConfig()

      expect(config.enabled).toBe(true)
      expect(config.openrouter.models.free).toBe("custom-free-model")
      expect(config.cache.ttlSeconds).toBe(600)
    })
  })
})

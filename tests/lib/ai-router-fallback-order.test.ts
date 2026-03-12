import { beforeEach, describe, expect, it, vi } from "vitest";

const attempts: string[] = [];

vi.mock("@/lib/ai/router/config", () => ({
  getRouterConfig: vi.fn(() => ({
    enabled: true,
    openrouter: {
      apiKey: "test-key",
      baseUrl: "https://openrouter.ai/api/v1",
      models: {
        byokFree: ["groq/llama-3.1-8b-instant", "zai/glm-4.7-flash"],
        free: "openrouter/free",
        auto: "openrouter/auto",
      },
      provider: {
        order: ["groq", "zai", "openrouter"],
        sort: "price",
        maxPrice: { input: 0.05, output: 0.05 },
      },
    },
    cache: { ttlSeconds: 300 },
    circuitBreaker: { failureThreshold: 5, recoveryTimeoutMs: 60_000 },
  })),
}));

vi.mock("@/lib/ai/router/openrouter", () => ({
  OpenRouterClient: class {
    async createCompletion(options: { model: string }) {
      attempts.push(options.model);
      throw new Error("forced failure");
    }
  },
}));

vi.mock("@/lib/ai/router/circuit", () => ({
  CircuitBreaker: class {
    async call(_provider: string, _model: string, operation: () => Promise<unknown>) {
      return operation();
    }
  },
}));

vi.mock("@/lib/ai/router/cache", () => ({
  TenantSafeCache: class {
    async get() {
      return null;
    }
    async set() {
      return;
    }
  },
}));

describe("Fallback router order", () => {
  beforeEach(() => {
    attempts.length = 0;
  });

  it("uses BYOK -> free -> auto -> requestedModel sequence", async () => {
    const { FallbackRouter } = await import("@/lib/ai/router/fallback");
    const router = new FallbackRouter();

    await expect(
      router.createCompletion({
        userId: "u1",
        feature: "chat",
        requestedModel: "openai/gpt-4o",
        messages: [{ role: "user", content: "hello" }],
      }),
    ).rejects.toThrow("All providers failed");

    expect(attempts).toEqual([
      "groq/llama-3.1-8b-instant",
      "zai/glm-4.7-flash",
      "openrouter/free",
      "openrouter/auto",
      "openai/gpt-4o",
    ]);
  });

  it("deduplicates requestedModel when already present in BYOK pool", async () => {
    const { FallbackRouter } = await import("@/lib/ai/router/fallback");
    const router = new FallbackRouter();

    await expect(
      router.createCompletion({
        userId: "u2",
        feature: "chat",
        requestedModel: "zai/glm-4.7-flash",
        messages: [{ role: "user", content: "hello" }],
      }),
    ).rejects.toThrow("All providers failed");

    expect(attempts).toEqual([
      "groq/llama-3.1-8b-instant",
      "zai/glm-4.7-flash",
      "openrouter/free",
      "openrouter/auto",
    ]);
  });
});


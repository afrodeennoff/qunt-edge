import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  process.env = { ...ORIGINAL_ENV };
}

describe("AI env model validation", () => {
  afterEach(() => {
    restoreEnv();
    vi.resetModules();
  });

  it("fails clearly in production when router enabled without OPENROUTER_API_KEY", async () => {
    Object.assign(process.env, {
      NODE_ENV: "production",
      AI_ROUTER_ENABLED: "true",
    });
    delete process.env.OPENROUTER_API_KEY;

    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/OPENROUTER_API_KEY is required/i);
  });

  it("rejects invalid model identifiers", async () => {
    Object.assign(process.env, {
      NODE_ENV: "development",
      AI_MODEL_CHAT: "bad model id",
    });

    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/Invalid model identifier format/i);
  });

  it("accepts per-feature model overrides and router model overrides", async () => {
    Object.assign(process.env, {
      NODE_ENV: "development",
      AI_MODEL_DEFAULT: "zai/glm-4.7-flash",
      AI_MODEL_SUPPORT: "openai/gpt-4o-mini",
      AI_ROUTER_MODEL_FREE: "openrouter/free",
      AI_ROUTER_MODEL_AUTO: "openrouter/auto",
      AI_ROUTER_MODEL_LIQUID: "liquid/lfm2-8b-a1b",
    });

    const { getEnv } = await import("@/lib/env");
    const env = getEnv();

    expect(env.AI_MODEL_DEFAULT).toBe("zai/glm-4.7-flash");
    expect(env.AI_MODEL_SUPPORT).toBe("openai/gpt-4o-mini");
    expect(env.AI_ROUTER_MODEL_FREE).toBe("openrouter/free");
    expect(env.AI_ROUTER_MODEL_AUTO).toBe("openrouter/auto");
    expect(env.AI_ROUTER_MODEL_LIQUID).toBe("liquid/lfm2-8b-a1b");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const envKeys = [
  "AI_MODEL",
  "AI_MODEL_DEFAULT",
  "AI_MODEL_CHAT",
  "AI_MODEL_SUPPORT",
  "AI_MODEL_EDITOR",
  "AI_MODEL_MAPPINGS",
  "AI_MODEL_FORMAT_TRADES",
  "AI_MODEL_ANALYSIS",
  "AI_MODEL_SEARCH",
  "AI_TIMEOUT_MS",
  "AI_MAX_STEPS",
  "AI_LOG_SAMPLE_RATE",
] as const;

const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

describe("AI policy", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const key of envKeys) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of envKeys) {
      const value = originalEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("uses default model when no env override is provided", async () => {
    const { getAiPolicy } = await import("@/lib/ai/policy");
    expect(getAiPolicy("chat").model).toBe("glm-4.7-flash");
  });

  it("uses AI_MODEL_DEFAULT over legacy AI_MODEL", async () => {
    process.env.AI_MODEL = "openai/gpt-4o-mini";
    process.env.AI_MODEL_DEFAULT = "zai/glm-4.7-flash";
    const { getAiPolicy } = await import("@/lib/ai/policy");
    expect(getAiPolicy("analysis").model).toBe("zai/glm-4.7-flash");
  });

  it("uses per-feature override when provided", async () => {
    process.env.AI_MODEL_DEFAULT = "zai/glm-4.7-flash";
    process.env.AI_MODEL_SUPPORT = "openai/gpt-4o-mini";
    const { getAiPolicy } = await import("@/lib/ai/policy");
    expect(getAiPolicy("support").model).toBe("openai/gpt-4o-mini");
    expect(getAiPolicy("chat").model).toBe("zai/glm-4.7-flash");
  });

  it("reads timeout and max steps from env", async () => {
    process.env.AI_TIMEOUT_MS = "45000";
    process.env.AI_MAX_STEPS = "7";
    const { getAiPolicy } = await import("@/lib/ai/policy");
    const policy = getAiPolicy("editor");
    expect(policy.timeoutMs).toBe(45000);
    expect(policy.maxSteps).toBe(7);
  });
});

import { describe, expect, it } from "vitest";
import { getAiPolicy } from "@/lib/ai/policy";

describe("AI policy", () => {
  it("uses GLM default model when AI_MODEL is not provided", () => {
    const originalModel = process.env.AI_MODEL;
    delete process.env.AI_MODEL;

    const policy = getAiPolicy("chat");
    expect(policy.model).toBe("glm-4.7-flash");

    if (originalModel) process.env.AI_MODEL = originalModel;
  });

  it("reads env overrides for timeout and max steps", () => {
    const originalTimeout = process.env.AI_TIMEOUT_MS;
    const originalSteps = process.env.AI_MAX_STEPS;

    process.env.AI_TIMEOUT_MS = "45000";
    process.env.AI_MAX_STEPS = "7";

    const policy = getAiPolicy("editor");
    expect(policy.timeoutMs).toBe(45000);
    expect(policy.maxSteps).toBe(7);

    if (originalTimeout) process.env.AI_TIMEOUT_MS = originalTimeout;
    else delete process.env.AI_TIMEOUT_MS;

    if (originalSteps) process.env.AI_MAX_STEPS = originalSteps;
    else delete process.env.AI_MAX_STEPS;
  });
});

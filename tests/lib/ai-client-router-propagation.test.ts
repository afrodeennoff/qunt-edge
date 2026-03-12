import { beforeEach, describe, expect, it, vi } from "vitest";

const createCompletionMock = vi.fn();
const getRouterConfigMock = vi.fn();

vi.mock("@/lib/ai/router", () => ({
  aiRouter: {
    createCompletion: (...args: unknown[]) => createCompletionMock(...args),
  },
}));

vi.mock("@/lib/ai/router/config", () => ({
  getRouterConfig: () => getRouterConfigMock(),
}));

describe("AI client router propagation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    getRouterConfigMock.mockReturnValue({
      enabled: true,
      openrouter: { apiKey: "test-openrouter-key" },
    });
    createCompletionMock.mockResolvedValue({
      content: "ok",
      provider: "openrouter-auto",
      model: "openrouter/auto",
    });
  });

  it("normalizes and forwards requested model into router completion", async () => {
    const { createCompletionWithRouter } = await import("@/lib/ai/client");
    await createCompletionWithRouter(
      "chat",
      "user-1",
      [{ role: "user", content: "hello" }],
      { model: "gpt-4o", temperature: 0.2 },
    );

    expect(createCompletionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        feature: "chat",
        requestedModel: "openai/gpt-4o",
        temperature: 0.2,
      }),
    );
  });

  it("uses normalized policy model when explicit model is not provided", async () => {
    const { createCompletionWithRouter } = await import("@/lib/ai/client");
    await createCompletionWithRouter(
      "chat",
      "user-2",
      [{ role: "user", content: "hi" }],
      {},
    );

    expect(createCompletionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-2",
        feature: "chat",
        requestedModel: "zai/glm-4.7-flash",
      }),
    );
  });
});


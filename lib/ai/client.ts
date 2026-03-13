import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";
import { aiRouter } from "@/lib/ai/router";
import { getRouterConfig } from "@/lib/ai/router/config";
import { logAiError } from "@/lib/ai/error-utils";

const baseURL = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
const aiApiKey = process.env.OPENROUTER_API_KEY;
let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;

const aiClient = createOpenAI({
  baseURL,
  apiKey: aiApiKey,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://quntedge.com",
    "X-Title": "Qunt Edge",
  },
});

type RouterAwareModel = ReturnType<typeof aiClient>;

function normalizeModelForOpenRouter(model: string): string {
  const trimmed = model.trim();
  if (!trimmed || trimmed.includes("/")) return trimmed;
  if (trimmed.startsWith("gpt-") || trimmed.startsWith("o1") || trimmed.startsWith("o3")) {
    return `openai/${trimmed}`;
  }
  if (trimmed.startsWith("glm-")) {
    return `zai/${trimmed}`;
  }
  return trimmed;
}

/**
 * Returns a router-aware OpenAI-compatible language model via OpenRouter.
 * When AI router is enabled, model calls use the canonical fallback chain:
 * BYOK pool -> openrouter/free -> openrouter/auto -> requested model.
 */
export function getAiLanguageModel(feature: AiFeature) {
  if (!aiApiKey && !hasWarnedMissingApiKey) {
    console.warn("[AI] OPENROUTER_API_KEY is missing. AI routes will fail until it is configured.");
    hasWarnedMissingApiKey = true;
  }

  if (!process.env.AI_BASE_URL && !hasWarnedMissingBaseUrl) {
    console.warn(`[AI] AI_BASE_URL not set, defaulting to OpenRouter: ${baseURL}`);
    hasWarnedMissingBaseUrl = true;
  }

  const { model } = getAiPolicy(feature);
  return getAiLanguageModelById(normalizeModelForOpenRouter(model));
}

export function getAiLanguageModelById(model: string) {
  const normalizedModel = normalizeModelForOpenRouter(model);
  const routerConfig = getRouterConfig();
  if (!routerConfig.enabled) {
    return aiClient(normalizedModel);
  }

  const chain = buildRouterModelChain(normalizedModel, routerConfig);
  return createFallbackModel(chain);
}

function buildRouterModelChain(model: string, routerConfig: ReturnType<typeof getRouterConfig>): string[] {
  const seen = new Set<string>();
  const chain = [
    ...routerConfig.openrouter.models.byokFree,
    routerConfig.openrouter.models.free,
    routerConfig.openrouter.models.auto,
    model,
  ];
  return chain.filter((id) => {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}

function createFallbackModel(modelChain: string[]): RouterAwareModel {
  const baseModel = aiClient(modelChain[0]) as unknown as Record<string, unknown>;
  const fallbackModel = {
    ...baseModel,
    modelId: modelChain[0],
    async doGenerate(options: unknown) {
      let lastError: unknown;
      for (const modelId of modelChain) {
        try {
          const candidate = aiClient(modelId) as unknown as { doGenerate: (o: unknown) => Promise<unknown> };
          return await candidate.doGenerate(options);
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError ?? new Error("All fallback models failed");
    },
    async doStream(options: unknown) {
      let lastError: unknown;
      for (const modelId of modelChain) {
        try {
          const candidate = aiClient(modelId) as unknown as { doStream: (o: unknown) => Promise<unknown> };
          return await candidate.doStream(options);
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError ?? new Error("All fallback models failed");
    },
  };
  return fallbackModel as unknown as RouterAwareModel;
}

/**
 * Direct completion function that uses the router for free tier attempts.
 * This should be used when you want explicit control over the routing process.
 */
export async function createCompletionWithRouter(
  feature: AiFeature,
  userId: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { temperature?: number; model?: string } = {}
): Promise<{ content: string; provider: string; model: string }> {
  const routerConfig = getRouterConfig();
  const { model } = getAiPolicy(feature);
  const normalizedModel = normalizeModelForOpenRouter(options.model || model);
  
  // Router disabled: use direct OpenRouter completion.
  if (!routerConfig.enabled) {
    if (!aiApiKey) {
      throw new Error("OPENROUTER_API_KEY is required for direct OpenRouter fallback");
    }

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${aiApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://quntedge.com",
        "X-Title": "Qunt Edge",
      },
      body: JSON.stringify({
        model: normalizedModel,
        messages,
        temperature: options.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter completion failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter completion returned empty content");
    }

    return { content, provider: "openrouter-direct", model: normalizedModel };
  }

  try {
    const result = await aiRouter.createCompletion({
      userId,
      feature,
      messages,
      temperature: options.temperature ?? 0.3,
      requestedModel: normalizedModel,
    });

    return {
      content: result.content,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    logAiError("[AI Router] Completion failed", error, { feature, userId });
    throw error;
  }
}

export function getAiBaseURL(): string {
  return baseURL;
}

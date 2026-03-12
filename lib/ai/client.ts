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
 * Returns a direct OpenAI-compatible language model via OpenRouter.
 * Router attempts are intentionally handled only by createCompletionWithRouter().
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
  return aiClient(normalizeModelForOpenRouter(model));
}

export function getAiLanguageModelById(model: string) {
  return aiClient(normalizeModelForOpenRouter(model));
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
      temperature: options.temperature || 0.3,
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

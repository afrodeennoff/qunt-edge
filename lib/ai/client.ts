import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";
import { aiRouter } from "@/lib/ai/router";
import { getRouterConfig } from "@/lib/ai/router/config";
import { logAiError } from "@/lib/ai/error-utils";

const baseURL = process.env.AI_BASE_URL || (() => {
  // MEDIUM: Fail explicitly in development if AI_BASE_URL is not configured
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'AI_BASE_URL must be configured in development. ' +
      'Set it in your .env.local file. ' +
      'Example: AI_BASE_URL=https://api.z.ai/api/paas/v4'
    );
  }
  return "https://api.z.ai/api/paas/v4";
})();
let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;

const aiClient = createOpenAI({
  baseURL,
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Returns a direct OpenAI-compatible language model (GLM via AI_BASE_URL).
 * Router attempts are intentionally handled only by createCompletionWithRouter().
 */
export function getAiLanguageModel(feature: AiFeature) {
  if (!process.env.OPENAI_API_KEY && !hasWarnedMissingApiKey) {
    console.warn("[AI] OPENAI_API_KEY is missing. AI routes will fail until it is configured.");
    hasWarnedMissingApiKey = true;
  }

  if (!process.env.AI_BASE_URL && !hasWarnedMissingBaseUrl) {
    console.warn(`[AI] AI_BASE_URL not set, falling back to default: ${baseURL}`);
    hasWarnedMissingBaseUrl = true;
  }

  const { model } = getAiPolicy(feature);
  return aiClient(model);
}

export function getAiLanguageModelById(model: string) {
  return aiClient(model);
}

/**
 * Direct completion function that uses the router for free tier attempts.
 * This should be used when you want explicit control over the routing process.
 */
export async function createCompletionWithRouter(
  feature: AiFeature,
  userId: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { temperature?: number } = {}
): Promise<{ content: string; provider: string; model: string }> {
  const routerConfig = getRouterConfig();
  const { model } = getAiPolicy(feature);
  
  // Router disabled: use direct GLM completion (OpenAI-compatible API).
  if (!routerConfig.enabled) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for direct GLM fallback");
    }

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`GLM completion failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("GLM completion returned empty content");
    }

    return { content, provider: "openai-compatible", model };
  }

  try {
    const result = await aiRouter.createCompletion({
      userId,
      feature,
      messages,
      temperature: options.temperature || 0.3,
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

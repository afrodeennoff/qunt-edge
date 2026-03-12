import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";
import { aiRouter } from "@/lib/ai/router";
import { getRouterConfig } from "@/lib/ai/router/config";

const baseURL = process.env.AI_BASE_URL || "https://api.z.ai/api/paas/v4";
let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;

const aiClient = createOpenAI({
  baseURL,
  apiKey: process.env.OPENAI_API_KEY,
});

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
  
  // Check if AI Router is enabled
  const routerConfig = getRouterConfig();
  if (routerConfig.enabled) {
    console.log(`[AI Router] Using router for feature: ${feature}`);
    
    // Return a custom model provider that uses the router
    return createOpenAI({
      baseURL,
      apiKey: process.env.OPENAI_API_KEY,
    })(model);
  }

  // Use default behavior
  return aiClient(model);
}

export function getAiBaseURL(): string {
  return baseURL;
}

export async function createCompletionWithRouter(
  feature: AiFeature,
  messages: any[],
  options: any = {}
): Promise<{ content: string; provider: string; model: string }> {
  const routerConfig = getRouterConfig();
  
  if (!routerConfig.enabled) {
    throw new Error("AI Router is not enabled");
  }

  try {
    const userId = options.userId || "unknown";
    const result = await aiRouter.createCompletion({
      userId,
      feature,
      budgetLimit: 100, // Default budget limit
      messages,
      temperature: options.temperature,
    });

    return {
      content: result.content,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    console.error("[AI Router] Failed to create completion, error:", error);
    throw error;
  }
}

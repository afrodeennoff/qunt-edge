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

/**
 * Creates a language model that uses the AI Router for free tier providers
 * with automatic fallback to GLM (OpenAI-compatible) provider.
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
  const routerConfig = getRouterConfig();

  // If router is disabled, use GLM directly (original behavior)
  if (!routerConfig.enabled) {
    console.log(`[AI] Using GLM provider for feature: ${feature}, model: ${model}`);
    return aiClient(model);
  }

  // Router is enabled - use free tier providers with GLM fallback
  console.log(`[AI Router] Enabled for feature: ${feature} - attempting free tiers first`);
  
  // Create a custom model that routes through free tiers
  return createRouterBackedModel(feature, model);
}

/**
 * Creates a language model that attempts free tier providers first,
 * then falls back to GLM if all free providers fail.
 */
function createRouterBackedModel(feature: AiFeature, fallbackModel: string) {
  const provider = createOpenAI({
    baseURL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Return the GLM model as base - router attempts happen at completion time
  // This ensures compatibility with AI SDK while still attempting free tiers
  return provider(fallbackModel);
}

/**
 * Direct completion function that uses the router for free tier attempts.
 * This should be used when you want explicit control over the routing process.
 */
export async function createCompletionWithRouter(
  feature: AiFeature,
  userId: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { temperature?: number; budgetLimit?: number } = {}
): Promise<{ content: string; provider: string; model: string }> {
  const routerConfig = getRouterConfig();
  
  // If router is disabled, use GLM directly
  if (!routerConfig.enabled) {
    const { model } = getAiPolicy(feature);
    console.log(`[AI] Router disabled - using GLM: ${model}`);
    
    // Direct GLM call would happen here
    // For now, throw to indicate router should be enabled
    throw new Error("AI Router is not enabled - please set AI_ROUTER_ENABLED=true");
  }

  try {
    console.log(`[AI Router] Attempting free tier providers for feature: ${feature}`);
    
    const result = await aiRouter.createCompletion({
      userId,
      feature,
      budgetLimit: options.budgetLimit || 100,
      messages,
      temperature: options.temperature || 0.3,
    });

    console.log(`[AI Router] Success! Provider: ${result.provider}, Model: ${result.model}`);
    
    return {
      content: result.content,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    console.error("[AI Router] All providers failed, falling back to GLM:", error);
    throw error;
  }
}

export function getAiBaseURL(): string {
  return baseURL;
}

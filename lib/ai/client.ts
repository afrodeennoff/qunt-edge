import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";
import { aiRouter } from "./router";
import { getRouterConfig } from "./router/config";

const baseURL = process.env.AI_BASE_URL || "https://api.z.ai/api/paas/v4";
let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;

const aiClient = createOpenAI({
  baseURL,
  apiKey: process.env.OPENAI_API_KEY,
});

export function getAiLanguageModel(feature: AiFeature) {
  const routerConfig = getRouterConfig();
  
  // Use router if enabled
  if (routerConfig.enabled) {
    // Return a wrapper that uses the router
    return {
      doGenerate: async (options: any) => {
        const result = await aiRouter.createCompletion({
          userId: options.userId || 'anonymous',
          feature,
          budgetLimit: 1.0, // Default budget limit
          messages: options.messages.map((msg: any) => ({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content as string,
          })),
          temperature: options.temperature,
        });
        
        return {
          text: result.content,
        };
      },
    } as any;
  }
  
  // Fallback to existing BYOK implementation
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

export function getAiBaseURL(): string {
  return baseURL;
}

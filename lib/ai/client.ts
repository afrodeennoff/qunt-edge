import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";

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
  return aiClient(model);
}

export function getAiBaseURL(): string {
  return baseURL;
}

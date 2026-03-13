import { getEnv } from "@/lib/env";

export type AiFeature =
  | "chat"
  | "support"
  | "editor"
  | "mappings"
  | "format-trades"
  | "analysis"
  | "search";

export interface AiFeaturePolicy {
  feature: AiFeature;
  model: string;
  provider: string;
  timeoutMs: number;
  maxSteps: number;
  temperature: number;
  logSampleRate: number;
}

const DEFAULT_MODEL = "glm-4.7-flash";
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_STEPS = 10;
const DEFAULT_LOG_SAMPLE_RATE = 0.25;
const DEFAULT_PROVIDER = "openrouter";

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function normalizeSampleRate(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function getBasePolicy() {
  const env = getEnv();
  const model = env.AI_MODEL_DEFAULT || env.AI_MODEL || DEFAULT_MODEL;
  const timeoutMs = Math.max(5000, parseNumber(env.AI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS));
  const maxSteps = Math.max(1, Math.floor(parseNumber(env.AI_MAX_STEPS, DEFAULT_MAX_STEPS)));
  const logSampleRate = normalizeSampleRate(
    parseNumber(env.AI_LOG_SAMPLE_RATE, DEFAULT_LOG_SAMPLE_RATE),
  );

  return {
    model,
    timeoutMs,
    maxSteps,
    logSampleRate,
  };
}

export function getAiPolicy(feature: AiFeature): AiFeaturePolicy {
  const base = getBasePolicy();
  const env = getEnv();

  const defaultsByFeature: Record<AiFeature, Pick<AiFeaturePolicy, "temperature">> = {
    chat: { temperature: 0.3 },
    support: { temperature: 0.3 },
    editor: { temperature: 0.3 },
    mappings: { temperature: 0.1 },
    "format-trades": { temperature: 0.1 },
    analysis: { temperature: 0.25 },
    search: { temperature: 0.1 },
  };

  const featureModelOverride: Record<AiFeature, string | undefined> = {
    chat: env.AI_MODEL_CHAT,
    support: env.AI_MODEL_SUPPORT,
    editor: env.AI_MODEL_EDITOR,
    mappings: env.AI_MODEL_MAPPINGS,
    "format-trades": env.AI_MODEL_FORMAT_TRADES,
    analysis: env.AI_MODEL_ANALYSIS,
    search: env.AI_MODEL_SEARCH,
  };

  return {
    feature,
    provider: DEFAULT_PROVIDER,
    model: featureModelOverride[feature] || base.model,
    timeoutMs: base.timeoutMs,
    maxSteps: base.maxSteps,
    temperature: defaultsByFeature[feature].temperature,
    logSampleRate: base.logSampleRate,
  };
}

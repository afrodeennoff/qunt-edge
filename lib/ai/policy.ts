export type AiFeature = "chat" | "editor" | "mappings" | "analysis";

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
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const timeoutMs = Math.max(5000, parseNumber(process.env.AI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS));
  const maxSteps = Math.max(1, Math.floor(parseNumber(process.env.AI_MAX_STEPS, DEFAULT_MAX_STEPS)));
  const logSampleRate = normalizeSampleRate(
    parseNumber(process.env.AI_LOG_SAMPLE_RATE, DEFAULT_LOG_SAMPLE_RATE),
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

  const defaultsByFeature: Record<AiFeature, Pick<AiFeaturePolicy, "temperature">> = {
    chat: { temperature: 0.3 },
    editor: { temperature: 0.3 },
    mappings: { temperature: 0.1 },
    analysis: { temperature: 0.25 },
  };

  return {
    feature,
    provider: DEFAULT_PROVIDER,
    model: base.model,
    timeoutMs: base.timeoutMs,
    maxSteps: base.maxSteps,
    temperature: defaultsByFeature[feature].temperature,
    logSampleRate: base.logSampleRate,
  };
}

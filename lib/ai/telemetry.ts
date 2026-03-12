import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export type AiErrorCategory =
  | "validation"
  | "tool_failure"
  | "model_timeout"
  | "rate_limit"
  | "budget_exceeded"
  | "internal";

export interface AiUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AiBudgetMetadata {
  budgetLimit?: number;
  budgetUsed?: number;
  budgetRemaining?: number;
}

export interface AiRequestLogInput {
  userId?: string | null;
  route: string;
  feature: string;
  model: string;
  provider: string;
  usage?: AiUsage | null;
  latencyMs: number;
  toolCallsCount?: number;
  finishReason?: string | null;
  success: boolean;
  errorCategory?: AiErrorCategory | null;
  errorCode?: string | null;
  sampleRate?: number;
  budgetMetadata?: AiBudgetMetadata;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

export function extractUsage(usage: any): AiUsage {
  if (!usage || typeof usage !== "object") return {};

  const promptTokens =
    toNumber(usage.promptTokens) ??
    toNumber(usage.inputTokens) ??
    toNumber(usage.prompt_tokens) ??
    undefined;

  const completionTokens =
    toNumber(usage.completionTokens) ??
    toNumber(usage.outputTokens) ??
    toNumber(usage.completion_tokens) ??
    undefined;

  const totalTokens = toNumber(usage.totalTokens) ?? toNumber(usage.total_tokens) ?? undefined;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

export function categorizeAiError(error: unknown): AiErrorCategory {
  const maybeError = error as any;
  const code = String(maybeError?.code || maybeError?.type || "").toLowerCase();
  const message = String(maybeError?.message || "").toLowerCase();
  const status = Number(maybeError?.status || maybeError?.statusCode || 0);

  if (status === 429 || code.includes("rate") || message.includes("rate limit")) {
    return "rate_limit";
  }
  if (status === 408 || code.includes("timeout") || message.includes("timeout")) {
    return "model_timeout";
  }
  if (code.includes("budget") || message.includes("budget")) {
    return "budget_exceeded";
  }
  if (code.includes("validation") || message.includes("invalid") || status === 400) {
    return "validation";
  }
  if (code.includes("tool") || message.includes("tool")) {
    return "tool_failure";
  }
  return "internal";
}

function shouldLogSuccess(sampleRate: number): boolean {
  if (sampleRate >= 1) return true;
  if (sampleRate <= 0) return false;
  return Math.random() < sampleRate;
}

export async function logAiRequest(input: AiRequestLogInput): Promise<void> {
  const sampleRate = input.sampleRate ?? 1;
  if (input.success && !shouldLogSuccess(sampleRate)) {
    return;
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO "public"."AiRequestLog" (
        "id",
        "userId",
        "route",
        "feature",
        "model",
        "provider",
        "promptTokens",
        "completionTokens",
        "totalTokens",
        "latencyMs",
        "toolCallsCount",
        "finishReason",
        "success",
        "errorCategory",
        "errorCode",
        "createdAt",
        "budgetLimit",
        "budgetUsed",
        "budgetRemaining"
      ) VALUES (
        ${randomUUID()},
        ${input.userId ?? null},
        ${input.route},
        ${input.feature},
        ${input.model},
        ${input.provider},
        ${input.usage?.promptTokens ?? null},
        ${input.usage?.completionTokens ?? null},
        ${input.usage?.totalTokens ?? null},
        ${Math.round(input.latencyMs)},
        ${input.toolCallsCount ?? 0},
        ${input.finishReason ?? null},
        ${input.success},
        ${input.errorCategory ?? null},
        ${input.errorCode ?? null},
        ${new Date()},
        ${input.budgetMetadata?.budgetLimit ?? null},
        ${input.budgetMetadata?.budgetUsed ?? null},
        ${input.budgetMetadata?.budgetRemaining ?? null}
      )
    `;
  } catch (error) {
    console.error("[AI Telemetry] Failed to persist AI log", error);
  }
}

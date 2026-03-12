import { streamText, stepCountIs } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { getCurrentDayData } from "./tools/get-current-day-data";
import { ActionSchema } from "./schema";
import { getDayData } from "./tools/get-trading-summary";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { rateLimit } from "@/lib/rate-limit";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";

export const maxDuration = 90;
const editorRateLimit = rateLimit({ limit: 15, window: 60_000, identifier: "ai-editor" });

type EditorAction = z.infer<typeof ActionSchema>;

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { statusCode?: number; type?: string }
  return candidate.statusCode === 429 || candidate.type === 'rate_limit_exceeded'
}

function isProvider4xxError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { statusCode?: number }
  return typeof candidate.statusCode === 'number' && candidate.statusCode >= 400 && candidate.statusCode < 500
}

const getSystemPrompt = (action: EditorAction, locale: string, date: string) => {
  const baseContext = `You are an expert trading journal assistant embedded inside a rich text editor.

CONTEXT: The user is writing in their trading journal focusing on futures trading. They may be reflecting on their trades, emotions, market conditions, or overall performance.
RULE: Respond in ${locale} language or follow the user's conversation language.

Return ONLY the response with no preface, no markdown fences, no notes, and no explanations.
Keep formatting simple and suitable for insertion into a paragraph.`;

  switch (action) {
    case "explain":
      return `${baseContext}

TASK: Explain the provided text in simple, clear terms.
- Use 2-4 concise sentences
- Clarify what's already written without adding new claims
- Make it understandable for traders at any level
- Focus on the trading context and implications`;

    case "improve":
      return `${baseContext}

TASK: Identify concrete improvements to the provided text.
- Return a short bulleted list (3-5 items)
- Each bullet should start with an action verb
- Keep each point to one line maximum
- Focus on trading-specific improvements (clarity, actionability, specificity)
- Prioritize improvements that help the trader learn from their experience`;

    case "suggest_question":
      return `${baseContext}

TASK: Generate insightful questions that help the trader reflect deeper on their journal entry.
- Always base your question on current day trading data
- Create a single thought-provoking question
- Question should encourage self-reflection and learning
- Focus on decision-making process, emotional state, risk management, market analysis
- Question should be specific to the content provided
- Make questions actionable and relevant to improving trading performance`;

    case "trades_summary":
      return `${baseContext}

TASK: ONLY BASED ON TOOL RESULT for date ${date}: Summarize the trader's trading activities for the current day.
- Include key metrics such as profit/loss, win/loss ratio, average trade size`;

    default:
      return baseContext;
  }
};

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("editor");
  const startedAt = Date.now();

  // Apply AI route guard (auth + entitlements + rate limit + budget)
  const guard = await guardAiRequest(req, 'editor', editorRateLimit)
  if (!guard.ok) return guard.response
  const { userId } = guard

  try {
    const body = await req.json();
    const { prompt, locale = "en", action = "explain", date } = body;

    const validatedAction = ActionSchema.parse(action);
    const systemPrompt = getSystemPrompt(validatedAction, locale, date);

    const tools: Record<string, any> = {};
    if (validatedAction === "suggest_question") {
      tools.getCurrentDayData = getCurrentDayData;
    }
    if (validatedAction === "trades_summary") {
      tools.getDayData = getDayData;
    }

    let toolCallsCount = 0;

    const result = streamText({
      model: getAiLanguageModel("editor"),
      prompt,
      system: systemPrompt,
      temperature:
        validatedAction === "suggest_question"
          ? Math.max(policy.temperature, 0.6)
          : policy.temperature,
      tools,
      stopWhen: stepCountIs(policy.maxSteps),
      onStepFinish: (step) => {
        toolCallsCount += step.toolCalls?.length ?? 0;
      },
      onFinish: (finalResult) => {
        void logAiRequest({
          route: "/api/ai/editor",
          feature: "editor",
          model: policy.model,
          provider: policy.provider,
          usage: extractUsage(finalResult.usage),
          latencyMs: Date.now() - startedAt,
          toolCallsCount,
          finishReason: finalResult.finishReason ?? null,
          success: true,
          sampleRate: policy.logSampleRate,
        });
      },
      onError: ({ error }) => {
        void logAiRequest({
          route: "/api/ai/editor",
          feature: "editor",
          model: policy.model,
          provider: policy.provider,
          latencyMs: Date.now() - startedAt,
          toolCallsCount,
          success: false,
          errorCategory: categorizeAiError(error),
          errorCode: getAiErrorCode(error),
          sampleRate: 1,
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError("BAD_REQUEST", "Malformed JSON request body", 400);
    }

    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_FAILED", "Invalid request parameters", 400, {
        issues: error.errors,
      });
    }

    if (isRateLimitError(error)) {
      return apiError(
        "RATE_LIMITED",
        "AI service is temporarily busy. Please try again in a moment.",
        429,
        {
          type: "rate_limit_exceeded",
          retryAfter: 60,
        },
        { "Retry-After": "60" },
      );
    }

    if (isProvider4xxError(error)) {
      return apiError(
        "SERVICE_UNAVAILABLE",
        "AI service is temporarily unavailable. Please try again later.",
        503,
        { type: "service_unavailable" },
      );
    }

    void logAiRequest({
      route: "/api/ai/editor",
      feature: "editor",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    logAiError("Error in editor AI route", error, { userId });
    return apiError("INTERNAL_ERROR", "An unexpected error occurred. Please try again.", 500, {
      type: "internal_error",
      context: "Failed to process AI request",
    });
  }
}

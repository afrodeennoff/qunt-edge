import { streamText, stepCountIs } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { getCurrentDayData } from "./tools/get-current-day-data";
import { ActionSchema } from "./schema";
import { getDayData } from "./tools/get-trading-summary";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit";
import { createRouteClient } from "@/lib/supabase/route-client";

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

  try {
    const supabase = createRouteClient(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const limit = await editorRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

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
          errorCode: error && typeof error === 'object' && 'code' in error ? String((error as { code?: unknown }).code ?? '') || null : null,
          sampleRate: 1,
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request parameters",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (isRateLimitError(error)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "AI service is temporarily busy. Please try again in a moment.",
          type: "rate_limit_exceeded",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }

    if (isProvider4xxError(error)) {
      return new Response(
        JSON.stringify({
          error: "Service temporarily unavailable",
          message: "AI service is temporarily unavailable. Please try again later.",
          type: "service_unavailable",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        },
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
      errorCode: error && typeof error === 'object' && 'code' in error ? String((error as { code?: unknown }).code ?? '') || null : null,
      sampleRate: 1,
    });

    console.error("Error in editor AI route:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process AI request",
        message: "An unexpected error occurred. Please try again.",
        type: "internal_error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

import { convertToModelMessages, streamText, UIMessage, stepCountIs } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { generateAnalysisComponent } from "./generate-analysis-component";
import { getAccountPerformance } from "./get-account-performance";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { rateLimit } from "@/lib/rate-limit";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";

export const maxDuration = 300;
const accountsAnalysisRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: "ai-analysis-accounts" });

const analysisSchema = z.object({
  username: z.string().optional(),
  locale: z.string().default("en"),
  timezone: z.string().default("UTC"),
  currentTime: z.string().default(new Date().toISOString()),
});

function getLanguageInstructions(locale: string) {
  if (locale === "fr") {
    return `- You MUST respond in French (français)
- All content must be in French except for the specific trading terms listed below
- Use French grammar, vocabulary, and sentence structure throughout your response`;
  }
  return `- You MUST respond in ${locale} language`;
}

function getAccountAnalysisPrompt(
  locale: string,
  username?: string,
  timezone?: string,
  currentTime?: string,
) {
  return `# ROLE & PERSONA
You are an expert trading analyst with deep knowledge of quantitative analysis, risk management, and trading psychology. You provide detailed, actionable insights based on trading data.

## CONTEXT & TIMING
${username ? `- Trader: ${username}` : "- Anonymous Trader"}
- Current Time (${timezone || "UTC"}): ${currentTime}
- User Timezone: ${timezone || "UTC"}

## COMMUNICATION LANGUAGE
${getLanguageInstructions(locale)}
- ALWAYS use English trading jargon even when responding in other languages
- Keep these terms in English: Short, Long, Call, Put, Bull, Bear, Stop Loss, Take Profit, Entry, Exit, Bullish, Bearish, Scalping, Swing Trading, Day Trading, Position, Leverage, Margin, Pip, Spread, Breakout, Support, Resistance

## ACCOUNT TRADING ANALYSIS

You are analyzing performance across different trading accounts. Your primary task is to:

1. Get Account Data: First, call getAccountPerformance to get comprehensive account statistics and comparisons
2. Generate Analysis Components: Then, call generateAnalysisComponent with the account data to create structured analysis components
3. Provide Insights: Based on the generated components and data, provide detailed analysis and recommendations

### ANALYSIS PROCESS
1. First, call getAccountPerformance to get account performance data
2. Then, call generateAnalysisComponent with analysisType: 'accounts' and pass the account data
3. Provide detailed insights and recommendations based on the generated components

### FOCUS AREAS
- Account Comparison: Performance ranking and metrics comparison
- Risk Distribution: How risk is managed across different accounts
- Trading Patterns: Different strategies or behaviors per account
- Capital Allocation: Effectiveness of capital distribution
- Account Management: Overall portfolio management effectiveness

### RESPONSE FORMAT
- Start by calling getAccountPerformance to get the data
- Then call generateAnalysisComponent with the account data
- Use the generated components as a foundation for your analysis
- Provide detailed insights and actionable recommendations
- Reference specific metrics and data points from the tool responses`;
}

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("analysis");
  const startedAt = Date.now();

  const guard = await guardAiRequest(req, 'analysis', accountsAnalysisRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {

    const {
      messages,
      username,
      locale,
      timezone,
      currentTime,
    }: {
      messages: UIMessage[];
      username: string;
      currentTime: string;
      locale: string;
      timezone: string;
    } = await req.json();

    const validatedData = analysisSchema.parse({
      username,
      locale,
      timezone,
      currentTime,
    });
    const modelMessages = await convertToModelMessages(messages);

    let toolCallsCount = 0;

    const result = streamText({
      model: getAiLanguageModel("analysis"),
      system: getAccountAnalysisPrompt(
        validatedData.locale,
        validatedData.username,
        validatedData.timezone,
        validatedData.currentTime,
      ),
      tools: {
        getAccountPerformance,
        generateAnalysisComponent,
      },
      messages: modelMessages,
      temperature: policy.temperature,
      stopWhen: stepCountIs(policy.maxSteps),
      onStepFinish: (step) => {
        toolCallsCount += step.toolCalls?.length ?? 0;
      },
      onFinish: (finalResult) => {
        void logAiRequest({
          route: "/api/ai/analysis/accounts",
          feature: "analysis",
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
          route: "/api/ai/analysis/accounts",
          feature: "analysis",
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
      return apiError("VALIDATION_FAILED", "Invalid analysis request payload", 400, {
        issues: error.errors,
      });
    }

    void logAiRequest({
      route: "/api/ai/analysis/accounts",
      feature: "analysis",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    logAiError("Error in account analysis route", error, { userId });
    return apiError("INTERNAL_ERROR", "Failed to process account analysis", 500);
  }
}

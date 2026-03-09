import { streamText, stepCountIs } from "ai";
import { NextRequest } from "next/server";
import { z } from 'zod/v3';
import { apiError } from "@/lib/api-response";
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit";
import { createRouteClient } from "@/lib/supabase/route-client";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";

// Analysis Tools
import { generateAnalysisComponent } from "../accounts/generate-analysis-component";
import { getOverallPerformanceMetrics } from "../../chat/tools/get-overall-performance-metrics";
import { getPerformanceTrends } from "../../chat/tools/get-performance-trends";
import { getCurrentWeekSummary } from "../../chat/tools/get-current-week-summary";
import { getPreviousWeekSummary } from "../../chat/tools/get-previous-week-summary";
import { getTradesSummary } from "../../chat/tools/get-trades-summary";
import { getMostTradedInstruments } from "../../chat/tools/get-most-traded-instruments";

export const maxDuration = 30;
const globalAnalysisRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: "ai-analysis-global", requireDistributedInProduction: true });

const analysisSchema = z.object({
  username: z.string().optional(),
  locale: z.string().default('en'),
  timezone: z.string().default('UTC'),
});

// Remove the schema as we're using streamText with tools instead

function getLanguageInstructions(locale: string) {
  if (locale === 'fr') {
    return `- You MUST respond in French (français)
- All content must be in French except for the specific trading terms listed below
- Use French grammar, vocabulary, and sentence structure throughout your response`;
  }
  return `- You MUST respond in ${locale} language`;
}

function getGlobalAnalysisPrompt(locale: string) {
  return `# ROLE & PERSONA
You are an expert trading analyst with deep knowledge of quantitative analysis, risk management, and trading psychology. You provide detailed, actionable insights based on trading data.

## COMMUNICATION LANGUAGE
${getLanguageInstructions(locale)}
- ALWAYS use English trading jargon even when responding in other languages
- Keep these terms in English: Short, Long, Call, Put, Bull, Bear, Stop Loss, Take Profit, Entry, Exit, Bullish, Bearish, Scalping, Swing Trading, Day Trading, Position, Leverage, Margin, Pip, Spread, Breakout, Support, Resistance

## GLOBAL TRADING ANALYSIS

You are analyzing overall trading performance across all accounts and instruments. Your primary task is to:

1. **Generate Analysis Components**: Use the generateAnalysisComponent tool to create structured analysis components for global trading performance
2. **Gather Supporting Data**: Use the available data tools to get comprehensive statistics and trends
3. **Provide Insights**: Based on the generated components and data, provide detailed analysis and recommendations

### ANALYSIS PROCESS
1. First, call generateAnalysisComponent with analysisType: 'global' to get the structured analysis framework
2. Use getOverallPerformanceMetrics to get comprehensive statistics
3. Use getPerformanceTrends to identify patterns over time
4. Use other data tools as needed to support your analysis
5. Provide detailed insights and recommendations based on all the gathered data

### FOCUS AREAS
- **Performance Evaluation**: Overall profitability, win rate trends, and risk metrics
- **Risk Management**: Maximum drawdown, risk-reward ratios, and position sizing effectiveness
- **Trading Consistency**: Performance stability over time and variance analysis
- **Behavioral Patterns**: Trading frequency, average trade duration, and psychological factors
- **Trend Analysis**: Month-over-month and week-over-week performance evolution

### RESPONSE FORMAT
- Start by calling generateAnalysisComponent to get the structured analysis
- Use the generated components as a foundation for your analysis
- Supplement with data from other tools
- Provide detailed insights and actionable recommendations
- Reference specific metrics and data points from the tool responses`;
}

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("analysis");
  const startedAt = Date.now();
  let toolCallsCount = 0;

  try {
    const supabase = createRouteClient(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user?.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const limit = await globalAnalysisRateLimit(req);
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      });
    }

    const { username, locale, timezone } = await req.json();

    const validatedData = analysisSchema.parse({ username, locale, timezone });

    const result = streamText({
      model: getAiLanguageModel("analysis"),
      system: getGlobalAnalysisPrompt(validatedData.locale),
      tools: {
        generateAnalysisComponent,
        getOverallPerformanceMetrics,
        getPerformanceTrends,
        getTradesSummary,
        getCurrentWeekSummary,
        getPreviousWeekSummary,
        getMostTradedInstruments
      },
      messages: [
        {
          role: "user",
          content: `Analyze my global trading performance and provide detailed insights in ${validatedData.locale} language. Use the generateAnalysisComponent tool to create structured analysis components.`
        }
      ],
      temperature: policy.temperature,
      stopWhen: stepCountIs(policy.maxSteps),
      onStepFinish: (step) => {
        toolCallsCount += step.toolCalls?.length ?? 0;
      },
      onFinish: (finalResult) => {
        void logAiRequest({
          route: "/api/ai/analysis/global",
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
          route: "/api/ai/analysis/global",
          feature: "analysis",
          model: policy.model,
          provider: policy.provider,
          latencyMs: Date.now() - startedAt,
          toolCallsCount,
          success: false,
          errorCategory: categorizeAiError(error),
          errorCode: error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "") || null : null,
          sampleRate: 1,
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    void logAiRequest({
      route: "/api/ai/analysis/global",
      feature: "analysis",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "") || null : null,
      sampleRate: 1,
    });
    console.error("Error in global analysis route:", error);
    return new Response(JSON.stringify({ error: "Failed to process global analysis" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

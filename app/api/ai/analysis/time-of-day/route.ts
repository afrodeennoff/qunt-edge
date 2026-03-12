import { streamText, stepCountIs } from "ai";
import { NextRequest } from "next/server";
import { z } from 'zod/v3';
import { rateLimit } from "@/lib/rate-limit";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { guardAiRequest } from "@/lib/ai/route-guard";

// Analysis Tools
import { generateAnalysisComponent } from "../accounts/generate-analysis-component";
import { getTimeOfDayPerformance } from "../../chat/tools/get-time-of-day-performance";
import { getCurrentWeekSummary } from "../../chat/tools/get-current-week-summary";
import { getPreviousWeekSummary } from "../../chat/tools/get-previous-week-summary";
import { getTradesSummary } from "../../chat/tools/get-trades-summary";
import { getMostTradedInstruments } from "../../chat/tools/get-most-traded-instruments";

export const maxDuration = 30;
const timeOfDayAnalysisRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: "ai-analysis-time-of-day" });

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

function getTimeOfDayAnalysisPrompt(locale: string, timezone: string) {
  return `# ROLE & PERSONA
You are an expert trading analyst with deep knowledge of quantitative analysis, risk management, and trading psychology. You provide detailed, actionable insights based on trading data.

## COMMUNICATION LANGUAGE
${getLanguageInstructions(locale)}
- ALWAYS use English trading jargon even when responding in other languages
- Keep these terms in English: Short, Long, Call, Put, Bull, Bear, Stop Loss, Take Profit, Entry, Exit, Bullish, Bearish, Scalping, Swing Trading, Day Trading, Position, Leverage, Margin, Pip, Spread, Breakout, Support, Resistance

## TIME-BASED TRADING ANALYSIS

You are analyzing performance based on time patterns and trading sessions in the user's timezone (${timezone}). Your primary task is to:

1. **Generate Analysis Components**: Use the generateAnalysisComponent tool to create structured analysis components for time-based performance
2. **Gather Supporting Data**: Use the available data tools to get comprehensive time-based statistics and patterns
3. **Provide Insights**: Based on the generated components and data, provide detailed analysis and recommendations

### ANALYSIS PROCESS
1. First, call generateAnalysisComponent with analysisType: 'time_of_day' to get the structured analysis framework
2. Use getTimeOfDayPerformance for comprehensive time-based analysis (properly timezone-adjusted)
3. Use other data tools as needed to support your analysis
4. Provide detailed insights and recommendations based on all the gathered data

### FOCUS AREAS
- **Optimal Trading Hours**: Best and worst performing time periods in ${timezone} timezone
- **Session Analysis**: Performance during different market sessions (Asian, European, US) adjusted for ${timezone}
- **Day-of-Week Patterns**: Weekly performance variations in user's timezone
- **Time-Based Risk**: Volatility and drawdown patterns by time
- **Market Condition Correlation**: Performance vs market opening/closing times relative to ${timezone}

### IMPORTANT TIMEZONE CONTEXT
- All time analysis is performed in ${timezone} timezone
- Trading sessions and hourly breakdowns reflect the user's local time
- Day-of-week analysis accounts for timezone differences
- Recommendations should consider the user's timezone when suggesting optimal trading windows

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

  // Apply AI route guard (auth + entitlements + rate limit + budget)
  const guard = await guardAiRequest(req, 'analysis', timeOfDayAnalysisRateLimit)
  if (!guard.ok) return guard.response
  const { userId } = guard

  try {

    const { username, locale, timezone } = await req.json();

    const validatedData = analysisSchema.parse({ username, locale, timezone });

    const result = streamText({
      model: getAiLanguageModel("analysis"),
      system: getTimeOfDayAnalysisPrompt(validatedData.locale, validatedData.timezone),
      tools: {
        generateAnalysisComponent,
        getTimeOfDayPerformance,
        getTradesSummary,
        getCurrentWeekSummary,
        getPreviousWeekSummary,
        getMostTradedInstruments
      },
      messages: [
        {
          role: "user",
          content: `Analyze my time-based trading performance and provide detailed insights in ${validatedData.locale} language. Use the generateAnalysisComponent tool to create structured analysis components.`
        }
      ],
      temperature: policy.temperature,
      stopWhen: stepCountIs(policy.maxSteps),
      onStepFinish: (step) => {
        toolCallsCount += step.toolCalls?.length ?? 0;
      },
      onFinish: (finalResult) => {
        void logAiRequest({
          route: "/api/ai/analysis/time-of-day",
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
          route: "/api/ai/analysis/time-of-day",
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

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    void logAiRequest({
      route: "/api/ai/analysis/time-of-day",
      feature: "analysis",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "") || null : null,
      sampleRate: 1,
    });
    console.error("Error in time of day analysis route:", error);
    return new Response(JSON.stringify({ error: "Failed to process time of day analysis" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

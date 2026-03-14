import { convertToModelMessages, streamText, stepCountIs, UIMessage } from "ai";
import { z } from "zod/v3";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";

// Analysis Tools - Accounts
import { generateAnalysisComponent } from "../analysis/accounts/generate-analysis-component";
import { getAccountPerformance } from "../analysis/accounts/get-account-performance";

// Analysis Tools - Shared
import { getTimeOfDayPerformance } from "../chat/tools/get-time-of-day-performance";
import { getInstrumentPerformance } from "../chat/tools/get-instrument-performance";
import { getCurrentWeekSummary } from "../chat/tools/get-current-week-summary";
import { getPreviousWeekSummary } from "../chat/tools/get-previous-week-summary";
import { getTradesSummary } from "../chat/tools/get-trades-summary";
import { getMostTradedInstruments } from "../chat/tools/get-most-traded-instruments";

// Unified schema with type dispatch - all fields optional except type
export const unifiedSchema = z.object({
  type: z.enum(["accounts", "instrument", "time-of-day"]),
  messages: z.array(z.custom<UIMessage>()).optional(),
  username: z.string().optional(),
  locale: z.string().optional().default("en"),
  timezone: z.string().optional().default("UTC"),
  currentTime: z.string().optional().default(new Date().toISOString()),
});

type UnifiedData = z.infer<typeof unifiedSchema>;

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

function getInstrumentAnalysisPrompt(locale: string) {
  return `# ROLE & PERSONA
You are an expert trading analyst with deep knowledge of quantitative analysis, risk management, and trading psychology. You provide detailed, actionable insights based on trading data.

## COMMUNICATION LANGUAGE
${getLanguageInstructions(locale)}
- ALWAYS use English trading jargon even when responding in other languages
- Keep these terms in English: Short, Long, Call, Put, Bull, Bear, Stop Loss, Take Profit, Entry, Exit, Bullish, Bearish, Scalping, Swing Trading, Day Trading, Position, Leverage, Margin, Pip, Spread, Breakout, Support, Resistance

## INSTRUMENT TRADING ANALYSIS

You are analyzing performance across different trading instruments. Your primary task is to:

1. **Generate Analysis Components**: Use the generateAnalysisComponent tool to create structured analysis components for instrument performance
2. **Gather Supporting Data**: Use the available data tools to get comprehensive instrument statistics and comparisons
3. **Provide Insights**: Based on the generated components and data, provide detailed analysis and recommendations

### ANALYSIS PROCESS
1. First, call generateAnalysisComponent with analysisType: 'instruments' to get the structured analysis framework
2. Use getInstrumentPerformance to get detailed metrics per instrument
3. Use getMostTradedInstruments for volume and frequency analysis
4. Use other data tools as needed to support your analysis
5. Provide detailed insights and recommendations based on all the gathered data

### FOCUS AREAS
- **Instrument Performance**: Best and worst performing instruments with specific metrics
- **Trading Volume**: Most and least traded instruments and their profitability
- **Risk Analysis**: Volatility and drawdown patterns by instrument
- **Specialization Opportunities**: Instruments showing consistent performance
- **Diversification Assessment**: Portfolio allocation effectiveness across instruments

### RESPONSE FORMAT
- Start by calling generateAnalysisComponent to get the structured analysis
- Use the generated components as a foundation for your analysis
- Supplement with data from other tools
- Provide detailed insights and actionable recommendations
- Reference specific metrics and data points from the tool responses`;
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

// Handler for accounts analysis (returns UIMessage stream)
export async function handleAccountsAnalysis(
  data: UnifiedData,
  policy: ReturnType<typeof getAiPolicy>,
  startedAt: number,
  userId: string,
  route: string
) {
  const modelMessages = await convertToModelMessages(data.messages || []);
  let toolCallsCount = 0;

  const result = streamText({
    model: getAiLanguageModel("analysis"),
    system: getAccountAnalysisPrompt(
      data.locale,
      data.username,
      data.timezone,
      data.currentTime,
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
        userId,
        route,
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
        userId,
        route,
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
}

// Handler for instrument analysis (returns text stream)
export async function handleInstrumentAnalysis(
  data: UnifiedData,
  policy: ReturnType<typeof getAiPolicy>,
  startedAt: number,
  userId: string,
  route: string
) {
  let toolCallsCount = 0;

  const result = streamText({
    model: getAiLanguageModel("analysis"),
    system: getInstrumentAnalysisPrompt(data.locale),
    tools: {
      generateAnalysisComponent,
      getInstrumentPerformance,
      getMostTradedInstruments,
      getTradesSummary,
      getCurrentWeekSummary,
      getPreviousWeekSummary,
    },
    messages: [
      {
        role: "user",
        content: `Analyze my instrument trading performance and provide detailed insights in ${data.locale} language. Use the generateAnalysisComponent tool to create structured analysis components.`,
      },
    ],
    temperature: policy.temperature,
    stopWhen: stepCountIs(policy.maxSteps),
    onStepFinish: (step) => {
      toolCallsCount += step.toolCalls?.length ?? 0;
    },
    onFinish: (finalResult) => {
      void logAiRequest({
        userId,
        route,
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
        userId,
        route,
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

  return result.toTextStreamResponse();
}

// Handler for time-of-day analysis (returns text stream)
export async function handleTimeOfDayAnalysis(
  data: UnifiedData,
  policy: ReturnType<typeof getAiPolicy>,
  startedAt: number,
  userId: string,
  route: string
) {
  let toolCallsCount = 0;

  const result = streamText({
    model: getAiLanguageModel("analysis"),
    system: getTimeOfDayAnalysisPrompt(data.locale, data.timezone),
    tools: {
      generateAnalysisComponent,
      getTimeOfDayPerformance,
      getTradesSummary,
      getCurrentWeekSummary,
      getPreviousWeekSummary,
      getMostTradedInstruments,
    },
    messages: [
      {
        role: "user",
        content: `Analyze my time-based trading performance and provide detailed insights in ${data.locale} language. Use the generateAnalysisComponent tool to create structured analysis components.`,
      },
    ],
    temperature: policy.temperature,
    stopWhen: stepCountIs(policy.maxSteps),
    onStepFinish: (step) => {
      toolCallsCount += step.toolCalls?.length ?? 0;
    },
    onFinish: (finalResult) => {
      void logAiRequest({
        userId,
        route,
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
        userId,
        route,
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

  return result.toTextStreamResponse();
}
import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { getFinancialNews } from "./tools/get-financial-news";
import { getJournalEntries } from "./tools/get-journal-entries";
import { getMostTradedInstruments } from "./tools/get-most-traded-instruments";
import { getLastTradesData } from "./tools/get-last-trade-data";
import { getTradesDetails } from "./tools/get-trades-details";
import { getTradesSummary } from "./tools/get-trades-summary";
import { getCurrentWeekSummary } from "./tools/get-current-week-summary";
import { getPreviousWeekSummary } from "./tools/get-previous-week-summary";
import { getWeekSummaryForDate } from "./tools/get-week-summary-for-date";
import { getPreviousConversation } from "./tools/get-previous-conversation";
import { generateEquityChart } from "./tools/generate-equity-chart";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { buildSystemPrompt } from "./prompts";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { enforcePromptSafety, sanitizeUserMessages } from "@/lib/ai/prompt-safety";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";

export const maxDuration = 60;
const MAX_CHAT_BODY_BYTES = 1024 * 1024;
const MAX_CHAT_MESSAGES = 100;
const chatRateLimit = rateLimit({ limit: 30, window: 60_000, identifier: "ai-chat" });

type ChatIntent = "analytics_data" | "coaching" | "news_context" | "general";
const chatMessageSchema = z.object({
  role: z.string(),
  content: z.unknown().optional(),
  parts: z.array(
    z.object({
      type: z.string().optional(),
      text: z.string().optional(),
    }),
  ).optional(),
  text: z.string().optional(),
})
const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "messages are required"),
  username: z.string().optional(),
  locale: z.string().optional().default("en"),
  timezone: z.string().optional().default("UTC"),
});
type ParsedChatRequest = z.infer<typeof chatRequestSchema>;
type ParsedChatMessage = ParsedChatRequest["messages"][number];

const availableChatTools = {
  getJournalEntries,
  getPreviousConversation,
  getMostTradedInstruments,
  getLastTradesData,
  getTradesDetails,
  getTradesSummary,
  getCurrentWeekSummary,
  getPreviousWeekSummary,
  getWeekSummaryForDate,
  getFinancialNews,
  generateEquityChart,
};

type ChatToolName = keyof typeof availableChatTools;

function extractLastUserText(messages: ParsedChatMessage[]): string {
  const lastUserMessage = [...messages].reverse().find((message) => message?.role === "user");
  if (!lastUserMessage) return "";

  if (typeof lastUserMessage.content === "string") {
    return lastUserMessage.content;
  }

  if (Array.isArray(lastUserMessage.parts)) {
    return lastUserMessage.parts
      .filter((part) => part?.type === "text" && typeof part?.text === "string")
      .map((part) => part.text as string)
      .join(" ");
  }

  if (typeof lastUserMessage.text === "string") {
    return lastUserMessage.text;
  }

  return "";
}

function classifyIntent(text: string): ChatIntent {
  const value = text.toLowerCase();

  if (/(news|cpi|fomc|nfp|calendar|macro|event)/.test(value)) {
    return "news_context";
  }

  if (/(win rate|pnl|drawdown|equity|trade|trades|performance|metric|stats|analy[sz]e|summary|compare)/.test(value)) {
    return "analytics_data";
  }

  if (/(emotion|mindset|psychology|stress|discipline|coach|confidence|fear|fomo|revenge)/.test(value)) {
    return "coaching";
  }

  return "general";
}

function getToolingPolicy(intent: ChatIntent) {
  if (intent === "analytics_data") {
    return {
      requiresTool: true,
      allowedToolNames: [
        "getMostTradedInstruments",
        "getLastTradesData",
        "getTradesDetails",
        "getTradesSummary",
        "getCurrentWeekSummary",
        "getPreviousWeekSummary",
        "getWeekSummaryForDate",
        "generateEquityChart",
      ] as ChatToolName[],
    };
  }

  if (intent === "news_context") {
    return {
      requiresTool: true,
      allowedToolNames: ["getFinancialNews"] as ChatToolName[],
    };
  }

  return {
    requiresTool: false,
    allowedToolNames: null as ChatToolName[] | null,
  };
}

function withToolGuards(tools: Record<string, any>, maxCallsPerTool = 2) {
  const callCount = new Map<string, number>();
  const seenArgs = new Set<string>();

  return Object.fromEntries(
    Object.entries(tools).map(([name, definition]) => {
      const execute = definition?.execute;
      if (!definition || typeof execute !== "function") {
        return [name, definition];
      }

      return [
        name,
        {
          ...definition,
          execute: async (args: unknown, context: unknown) => {
            const currentCount = (callCount.get(name) ?? 0) + 1;
            if (currentCount > maxCallsPerTool) {
              throw new Error(`Tool call limit reached for ${name}`);
            }

            const signature = `${name}:${JSON.stringify(args ?? {})}`;
            if (seenArgs.has(signature)) {
              throw new Error(`Duplicate tool call blocked for ${name}`);
            }

            callCount.set(name, currentCount);
            seenArgs.add(signature);

            return execute(args, context);
          },
        },
      ];
    }),
  );
}

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("chat");
  const startedAt = Date.now();

  // Apply AI route guard (auth + entitlements + rate limit)
  const guard = await guardAiRequest(req, 'chat', chatRateLimit)
  if (!guard.ok) return guard.response
  const { userId } = guard

  try {
    const lengthHeader = req.headers.get("content-length");
    const contentLength = lengthHeader ? Number(lengthHeader) : 0;

    if (Number.isFinite(contentLength) && contentLength > MAX_CHAT_BODY_BYTES) {
      return apiError(
        "PAYLOAD_TOO_LARGE",
        `Request body exceeds ${Math.round(MAX_CHAT_BODY_BYTES / 1024)}KB.`,
        413,
      );
    }

    const body = await req.json();
    
    // Apply prompt safety checks to user messages
    if (body.messages) {
      const sanitized = sanitizeUserMessages(body.messages)
      const safety = enforcePromptSafety(sanitized)
      if (!safety.safe) {
        return new Response(
          JSON.stringify(safety.response!.body),
          { 
            status: safety.response!.status,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      body.messages = safety.messages as typeof body.messages
    }

    const { messages, username, locale, timezone } = chatRequestSchema.parse(body);

    if (messages.length > MAX_CHAT_MESSAGES) {
      return apiError(
        "PAYLOAD_TOO_LARGE",
        `Too many messages. Maximum is ${MAX_CHAT_MESSAGES}.`,
        413,
      );
    }

    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const userMessages = messages.filter((msg) => msg.role === "user");
    const isFirstMessage = userMessages.length === 1;

    const latestText = extractLastUserText(messages);
    const intent = classifyIntent(latestText);
    const toolPolicy = getToolingPolicy(intent);

    const convertedMessages = await convertToModelMessages(
      messages as Parameters<typeof convertToModelMessages>[0],
    );
    const systemPrompt = buildSystemPrompt({
      locale,
      username,
      timezone,
      currentWeekStart,
      currentWeekEnd,
      previousWeekStart,
      previousWeekEnd,
      isFirstMessage,
    });

    const intentPrompt =
      toolPolicy.requiresTool
        ? `\n\nINTENT CLASSIFICATION: ${intent}\nRULE: You must call at least one relevant tool before giving the final response.`
        : `\n\nINTENT CLASSIFICATION: ${intent}\nRULE: Use tools only when they improve factual accuracy.`;
    const dataQualityPrompt =
      `\n\nDATA QUALITY RULE: If a tool output contains 'dataQualityWarning' or 'truncated: true', clearly disclose that the analysis may be incomplete.`;

    const availableTools = withToolGuards(availableChatTools);

    const scopedTools =
      toolPolicy.allowedToolNames === null
        ? availableTools
        : Object.fromEntries(
            Object.entries(availableTools).filter(([toolName]) =>
              toolPolicy.allowedToolNames?.includes(toolName as ChatToolName),
            ),
          );

    let toolCallsCount = 0;

    const result = streamText({
      model: getAiLanguageModel("chat"),
      messages: convertedMessages,
      system: `${systemPrompt}${intentPrompt}${dataQualityPrompt}`,
      temperature: policy.temperature,
      stopWhen: stepCountIs(policy.maxSteps),
      tools: scopedTools,
      toolChoice: toolPolicy.requiresTool ? "required" : "auto",
      onStepFinish: (step) => {
        const stepToolCalls = step.toolCalls?.length ?? 0;
        toolCallsCount += stepToolCalls;
      },
      onError: ({ error }) => {
        void logAiRequest({
          route: "/api/ai/chat",
          feature: "chat",
          model: policy.model,
          provider: policy.provider,
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCategory: categorizeAiError(error),
          errorCode: getAiErrorCode(error),
          toolCallsCount,
          sampleRate: 1,
        });
      },
      onFinish: (finalResult) => {
        void logAiRequest({
          route: "/api/ai/chat",
          feature: "chat",
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
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        logAiError("[Chat Route] UI Stream error", error, { userId });
        return "An error occurred during the chat response";
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError("BAD_REQUEST", "Malformed JSON request body", 400);
    }

    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_FAILED", "Invalid chat request payload", 400, {
        issues: error.errors,
      });
    }

    void logAiRequest({
      route: "/api/ai/chat",
      feature: "chat",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    logAiError("Error in chat route", error, { userId });
    return apiError("INTERNAL_ERROR", "Failed to process chat", 500);
  }
}

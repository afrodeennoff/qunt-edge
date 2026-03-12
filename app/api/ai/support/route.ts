import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  UIMessage,
} from "ai";
import { NextRequest } from "next/server";
import { askForEmailForm } from "./tools/ask-for-email-form";
import { z } from "zod/v3";
import { rateLimit } from "@/lib/rate-limit";
import { getAiPolicy } from "@/lib/ai/policy";
import { apiError } from "@/lib/api-response";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { getAiLanguageModelById, createCompletionWithRouter } from "@/lib/ai/client";
import { getRouterConfig } from "@/lib/ai/router/config";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import {
  estimateTokenCountFromMessages,
  getAiErrorCode,
  logAiError,
  logAiWarn,
  sanitizeAiError,
} from "@/lib/ai/error-utils";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const supportRateLimit = rateLimit({ limit: 12, window: 60_000, identifier: "ai-support" });
const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()).min(1),
  model: z.string().optional(),
  webSearch: z.boolean().optional().default(false),
});

const SUPPORT_MODEL_ALLOWLIST = new Set([
  "glm-4.7-flash",
  "gpt-4o-mini",
  "gpt-4.1-mini",
]);

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("chat");
  const startedAt = Date.now();
  let selectedModel = policy.model;

  // Apply AI route guard (auth + entitlements + rate limit)
  const guard = await guardAiRequest(req, 'support', supportRateLimit)
  if (!guard.ok) return guard.response
  const { userId } = guard

  try {
    const body = await req.json();
    const { messages, model, webSearch } = requestSchema.parse(body);
    selectedModel = model && SUPPORT_MODEL_ALLOWLIST.has(model) ? model : policy.model;
    const webSearchModel = process.env.AI_SUPPORT_WEBSEARCH_MODEL;
    const webSearchFallback = webSearch && !webSearchModel;
    const routerConfig = getRouterConfig();
    const isRouterUsable = routerConfig.enabled && Boolean(routerConfig.openrouter.apiKey);
    const hasDirectProvider = Boolean(process.env.OPENAI_API_KEY);

    if (!isRouterUsable && !hasDirectProvider) {
      return apiError("SERVICE_UNAVAILABLE", "Support AI service is not configured", 503);
    }

    // Remove first message if it's assistant message
    if (messages.length > 0 && messages[0].role === "assistant") {
      messages.shift();
    }

    const routerMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = messages.map((m) => {
      const validParts = m.parts?.filter(
        (p): p is { type: 'text'; text: string } => p?.type === 'text' && typeof p?.text === 'string'
      ) ?? [];
      return {
        role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
        content: validParts.map((p) => p.text).join('\n'),
      };
    });

    if (isRouterUsable) {
      try {
        const routerResult = await createCompletionWithRouter(
          'chat',
          userId,
          routerMessages,
          { temperature: 0.3 }
        );

        void logAiRequest({
          userId,
          route: "/api/ai/support",
          feature: "chat",
          model: routerResult.model,
          provider: routerResult.provider,
          usage: { totalTokens: estimateTokenCountFromMessages(routerMessages, routerResult.content) },
          latencyMs: Date.now() - startedAt,
          success: true,
          sampleRate: policy.logSampleRate,
          finishReason: "stop",
        });

        const stream = createUIMessageStream({
          execute: ({ writer }) => {
            const textId = `router-${Date.now()}`;
            writer.write({ type: "start" });
            writer.write({ type: "text-start", id: textId });
            writer.write({ type: "text-delta", id: textId, delta: routerResult.content });
            writer.write({ type: "text-end", id: textId });
            writer.write({ type: "finish", finishReason: "stop" });
          },
        });

        return createUIMessageStreamResponse({ stream });
      } catch (routerError) {
        logAiWarn("[Support] AI Router failed; falling back to direct provider", routerError, { userId });
        if (!hasDirectProvider) {
          throw routerError;
        }
      }
    }

    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: webSearch && webSearchModel ? getAiLanguageModelById(webSearchModel) : getAiLanguageModelById(selectedModel),
      system: `${webSearchFallback ? "[WEB_SEARCH_FALLBACK_ACTIVE] Web search is unavailable for this environment; answer without external browsing.\n\n" : ""}You are an AI chatbot support assistant for Qunt Edge, a trading journaling platform. Your role is to gather information and direct users to the appropriate support channels.

## CRITICAL LIMITATIONS
- **NO DOCUMENTATION ACCESS**: You do not have access to Qunt Edge documentation, user guides, or specific feature information
- **NO HALLUCINATION**: Never provide specific details about Qunt Edge features, interface elements, or usage instructions that you cannot verify
- **IMMEDIATE ESCALATION**: For any questions about how to use Qunt Edge, interface navigation, or feature explanations, immediately redirect to email support

## RESPONSE STRATEGY
1. **Context Gathering First**: Ask 1-2 clarifying questions to understand the user's specific issue before escalating
2. **Basic Troubleshooting Only**: Help with general technical issues (browser problems, login issues, etc.)
3. **Smart Escalation**: After gathering context, use askForEmailForm with a clear summary
4. **Honest Limitations**: Clearly state when you don't have access to specific information
5. **No Guessing**: Never provide information you're not certain about

## WHAT YOU CAN HELP WITH
- General technical troubleshooting (browser issues, connectivity problems)
- Basic account access problems (login, password reset)
- General questions about support process
- Confirming that you'll escalate their issue to the right team

## WHAT REQUIRES CONTEXT GATHERING + ESCALATION
- How to use specific Qunt Edge features
- Interface navigation questions
- Feature explanations or tutorials
- Account-specific data or settings questions
- Billing or subscription questions
- Any question about Qunt Edge functionality

**Process**: Ask 1-2 clarifying questions to understand the specific issue, then escalate with context.

## COMMUNICATION STYLE
- Always identify yourself as an AI chatbot at the start of conversations
- Be honest about your limitations and role as an information-gathering assistant
- Acknowledge their question and ask clarifying questions to understand the context
- Explain that you're gathering information to connect them with the right support person
- Use askForEmailForm after understanding their specific issue
- Be helpful but never guess or provide unverified information

## TOOL USAGE
- **askForEmailForm**: Use after gathering context for Qunt Edge-specific questions. Always provide a clear summary of the user's issue and the context you've gathered.

## CONTEXT GATHERING QUESTIONS
Ask 1-2 targeted questions to understand:
- What specific feature or functionality they're asking about
- What they're trying to accomplish
- Any error messages or unexpected behavior they're experiencing
- Their current situation or what led to the question

## ESCALATION CRITERIA
Use askForEmailForm after gathering context when:
- User asks "How do I..." questions about Qunt Edge
- User asks about specific features or interface elements
- User needs guidance on using the platform
- User asks about account-specific information
- Any question you cannot answer with certainty

## EXAMPLE FLOW
1. User: "How do I add a trade?"
2. You: "Hi! I'm an AI chatbot here to help gather information for our support team. I'd be happy to help you with adding trades. To make sure I connect you with the right support person, could you tell me:
   - Are you seeing any specific error messages when trying to add a trade?
   - What part of the process are you having trouble with?"
3. User: [provides context]
4. You: Use askForEmailForm with the gathered context

## OPENING MESSAGE TEMPLATE
When starting a conversation, always begin with:
"Hi! I'm an AI chatbot here to help gather information for our support team. I don't have access to Qunt Edge documentation, but I can help you with basic troubleshooting and connect you with the right support person. How can I help you today?"

Remember: Always be transparent about being an AI chatbot and your role in gathering information for the support team.`,
      messages: modelMessages,
      tools: {
        askForEmailForm,
      },
      temperature: 0.3,
      onFinish: (finalResult) => {
        void logAiRequest({
          userId,
          route: "/api/ai/support",
          feature: "chat",
          model: selectedModel,
          provider: policy.provider,
          usage: extractUsage(finalResult.usage),
          latencyMs: Date.now() - startedAt,
          finishReason: finalResult.finishReason ?? null,
          success: true,
          sampleRate: policy.logSampleRate,
        });
      },
      onError: ({ error }) => {
        void logAiRequest({
          userId,
          route: "/api/ai/support",
          feature: "chat",
          model: selectedModel,
          provider: policy.provider,
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCategory: categorizeAiError(error),
          errorCode: getAiErrorCode(error),
          sampleRate: 1,
        });
      },
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: false,
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return apiError("BAD_REQUEST", "Malformed JSON request body", 400);
    }

    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_FAILED", "Invalid support request payload", 400, {
        issues: error.errors,
      });
    }

    void logAiRequest({
      userId,
      route: "/api/ai/support",
      feature: "chat",
      model: selectedModel,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    const err = sanitizeAiError(error);
    logAiError("Support API Error", error, { userId });

    // Handle rate limit errors specifically
    if (err.statusCode === 429 || err.type === "rate_limit_exceeded") {
      return apiError(
        "RATE_LIMITED",
        "We are experiencing high demand. Please try again in a few minutes or contact support directly.",
        429,
        {
          type: "rate_limit_exceeded",
          retryAfter: 300,
        },
        { "Retry-After": "300" },
      );
    }

    // Handle other AI/API errors
    if (typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 500) {
      return apiError(
        "SERVICE_UNAVAILABLE",
        "Our AI service is temporarily unavailable. Please try again later or contact support directly.",
        503,
        { type: "service_unavailable" },
      );
    }

    // Handle server errors
    return apiError(
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again later or contact support.",
      500,
      { type: "internal_error" },
    );
  }
}

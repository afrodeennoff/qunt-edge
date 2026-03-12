import { convertToModelMessages, streamText, UIMessage } from "ai";
import { NextRequest } from "next/server";
import { askForEmailForm } from "./tools/ask-for-email-form";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod/v3";
import { rateLimit } from "@/lib/rate-limit";
import { getAiPolicy } from "@/lib/ai/policy";
import { apiError } from "@/lib/api-response";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { aiRouter, type RouterCompletionOptions } from "@/lib/ai/router";

const customOpenai = createOpenAI({
  baseURL: "https://api.z.ai/api/paas/v4",
  apiKey: process.env.OPENAI_API_KEY,
});

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
  // Apply AI route guard (auth + entitlements + rate limit + budget)
  const guard = await guardAiRequest(req, 'support', supportRateLimit)
  if (!guard.ok) return guard.response
  const { userId } = guard

  try {
    if (!process.env.OPENAI_API_KEY) {
      return apiError("SERVICE_UNAVAILABLE", "Support AI service is not configured", 503);
    }

    const body = await req.json();
    const { messages, model, webSearch } = requestSchema.parse(body);
    const policy = getAiPolicy("chat");
    const selectedModel = model && SUPPORT_MODEL_ALLOWLIST.has(model) ? model : policy.model;
    const webSearchModel = process.env.AI_SUPPORT_WEBSEARCH_MODEL;
    const webSearchFallback = webSearch && !webSearchModel;

    // Remove first message if it's assistant message
    if (messages.length > 0 && messages[0].role === "assistant") {
      messages.shift();
    }

    // Try AI Router if enabled
    let routerResult: string | undefined;
    try {
      // Extract text content from UIMessage parts
      const routerMessages = messages.map(m => ({
        role: m.role,
        content: m.parts
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map(p => p.text)
          .join('\n')
      }));

      const routerOptions: RouterCompletionOptions = {
        userId,
        feature: 'support',
        budgetLimit: 100, // Default budget limit for support
        messages: routerMessages,
        temperature: 0.3
      };
      const result = await aiRouter.createCompletion(routerOptions);
      routerResult = result.content;
    } catch (routerError) {
      console.warn('[Support] AI Router failed, falling back to direct API:', routerError);
    }

    // If router succeeded, return the result
    if (routerResult) {
      return new Response(JSON.stringify({ 
        choices: [{ message: { content: routerResult } }] 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: webSearch && webSearchModel ? customOpenai(webSearchModel) : customOpenai(selectedModel),
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

    const err = error as { statusCode?: number; type?: string };

    console.error("Support API Error:", error);

    // Handle rate limit errors specifically
    if (err?.statusCode === 429 || err?.type === "rate_limit_exceeded") {
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
    if (typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 500) {
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

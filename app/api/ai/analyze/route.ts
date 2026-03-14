import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { rateLimit } from "@/lib/rate-limit";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, logAiRequest } from "@/lib/ai/telemetry";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";
import { 
  unifiedSchema, 
  handleAccountsAnalysis, 
  handleInstrumentAnalysis, 
  handleTimeOfDayAnalysis 
} from "./handlers";

export const maxDuration = 300;

// Unified rate limiter combining all three analysis types
const unifiedAnalysisRateLimit = rateLimit({ 
  limit: 10, 
  window: 60_000, 
  identifier: "ai-analysis-unified" 
});

// Main unified route handler
export async function POST(req: NextRequest) {
  const policy = getAiPolicy("analysis");
  const startedAt = Date.now();

  // Apply AI route guard (auth + entitlements + rate limit)
  const guard = await guardAiRequest(req, "analysis", unifiedAnalysisRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    const body = await req.json();
    const validatedData = unifiedSchema.parse(body);

    // Type-based dispatch to handlers
    switch (validatedData.type) {
      case "accounts":
        return handleAccountsAnalysis(validatedData, policy, startedAt, userId, "/api/ai/analyze");
      case "instrument":
        return handleInstrumentAnalysis(validatedData, policy, startedAt, userId, "/api/ai/analyze");
      case "time-of-day":
        return handleTimeOfDayAnalysis(validatedData, policy, startedAt, userId, "/api/ai/analyze");
      default:
        return apiError("VALIDATION_FAILED", "Invalid analysis type", 400);
    }
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
      userId,
      route: "/api/ai/analyze",
      feature: "analysis",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    logAiError("Error in unified analysis route", error, { userId });
    return apiError("INTERNAL_ERROR", "Failed to process analysis", 500);
  }
}
import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { rateLimit } from "@/lib/rate-limit";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, logAiRequest } from "@/lib/ai/telemetry";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";

// Wrapper for time-of-day analysis - delegates to shared handler
const timeOfDayAnalysisRateLimit = rateLimit({ 
  limit: 10, 
  window: 60_000, 
  identifier: "ai-analysis-time-of-day" 
});

// Schema for time-of-day analysis (compatible with old API)
const timeOfDaySchema = z.object({
  username: z.string().optional(),
  locale: z.string().default("en"),
  timezone: z.string().default("UTC"),
});

export const maxDuration = 30;

// Import shared handler
import { handleTimeOfDayAnalysis } from "../../analyze/handlers";

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("analysis");
  const startedAt = Date.now();

  // Apply AI route guard (auth + entitlements + rate limit)
  const guard = await guardAiRequest(req, "analysis", timeOfDayAnalysisRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    const body = await req.json();
    const validatedData = timeOfDaySchema.parse(body);

    // Transform to unified format
    const unifiedData = {
      type: "time-of-day" as const,
      username: validatedData.username,
      locale: validatedData.locale,
      timezone: validatedData.timezone,
      currentTime: new Date().toISOString(),
    };

    // Delegate to shared handler
    return handleTimeOfDayAnalysis(unifiedData, policy, startedAt, userId, "/api/ai/analysis/time-of-day");
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
      route: "/api/ai/analysis/time-of-day",
      feature: "analysis",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    logAiError("Error in time of day analysis route", error, { userId });
    return apiError("INTERNAL_ERROR", "Failed to process time of day analysis", 500);
  }
}
import { NextRequest, NextResponse } from "next/server";
import {
  getTradovateToken,
  getTradovateTrades,
} from "@/app/[locale]/dashboard/components/import/tradovate/actions";
import { createRouteClient } from "@/lib/supabase/route-client";
import { z } from "zod";
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit";
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate";
import { apiError } from "@/lib/api-response";

const tradovateSyncRateLimit = rateLimit({ limit: 20, window: 60_000, identifier: "tradovate-sync" });
const tradovateSyncBodySchema = z.object({
  accountId: z.string().min(1),
});

async function requireSessionUser(request: Request) {
  const supabase = createRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const limit = await tradovateSyncRateLimit(request);
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      });
    }

    const { user, error } = await requireSessionUser(request);
    if (error || !user?.id) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const { accountId } = await parseJson(request, tradovateSyncBodySchema);

    const tokenResult = await getTradovateToken(accountId);
    if (tokenResult.error || !tokenResult.accessToken) {
      return apiError(
        "BAD_REQUEST",
        tokenResult.error || "Missing Tradovate access token",
        400,
      );
    }

    const syncResult = await getTradovateTrades(tokenResult.accessToken, { userId: user.id });
    if (syncResult.error) {
      // If it's just duplicate trades, return 200 with 0 saved
      if (syncResult.error === "DUPLICATE_TRADES") {
        return NextResponse.json({
          success: true,
          savedCount: 0,
          ordersCount: syncResult.ordersCount ?? 0,
          message: "DUPLICATE_TRADES",
        });
      }

      return apiError("BAD_REQUEST", syncResult.error, 400);
    }

    return NextResponse.json({
      success: true,
      savedCount: syncResult.savedCount ?? 0,
      ordersCount: syncResult.ordersCount ?? 0,
      message: "Sync completed",
    });
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error);
    if (validationResponse.status !== 500) return validationResponse;
    console.error("Error performing Tradovate sync:", error);
    return apiError("INTERNAL_ERROR", "Failed to perform Tradovate sync", 500, { requestId });
  }
}

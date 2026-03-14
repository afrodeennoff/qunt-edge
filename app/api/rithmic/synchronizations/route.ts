import { NextRequest, NextResponse } from "next/server";
import {
  getRithmicSynchronizations,
  setRithmicSynchronization,
  removeRithmicSynchronization,
} from "@/server/imports/rithmic-sync-actions";
import { createRouteClient } from "@/lib/supabase/route-client";
import { z } from "zod";
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit";
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate";
import { apiError } from "@/lib/api-response";

const rithmicSyncWriteRateLimit = rateLimit({ limit: 20, window: 60_000, identifier: "rithmic-sync-write" });
const rithmicSyncReadRateLimit = rateLimit({ limit: 120, window: 60_000, identifier: "rithmic-sync-read" });
const rithmicSyncWriteBodySchema = z.object({
  accountId: z.string().min(1),
}).strict();
const rithmicSyncDeleteBodySchema = z.object({
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

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const limit = await rithmicSyncReadRateLimit(request);
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

    const synchronizations = await getRithmicSynchronizations();
    return NextResponse.json({ success: true, data: synchronizations });
  } catch (error) {
    console.error("Error fetching Rithmic synchronizations:", error);
    return apiError(
      "INTERNAL_ERROR",
      "Failed to fetch synchronizations",
      500,
      { requestId }
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const limit = await rithmicSyncWriteRateLimit(request);
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

    const { accountId } = await parseJson(request, rithmicSyncWriteBodySchema);
    await setRithmicSynchronization({ accountId, service: "rithmic" });
    return NextResponse.json({
      success: true,
      message: "Synchronization updated successfully",
    });
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error);
    if (validationResponse.status !== 500) return validationResponse;
    console.error("Error setting Rithmic synchronization:", error);
    return apiError(
      "INTERNAL_ERROR",
      "Failed to update synchronization",
      500,
      { requestId }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const limit = await rithmicSyncWriteRateLimit(request);
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

    const { accountId } = await parseJson(request, rithmicSyncDeleteBodySchema);

    const result = await removeRithmicSynchronization(accountId);
    if (result.deletedCount === 0) {
      return apiError(
        "NOT_FOUND",
        "Synchronization not found",
        404,
        { requestId }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Synchronization removed successfully",
    });
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error);
    if (validationResponse.status !== 500) return validationResponse;
    console.error("Error deleting Rithmic synchronization:", error);
    return apiError(
      "INTERNAL_ERROR",
      "Failed to delete synchronization",
      500,
      { requestId }
    );
  }
}

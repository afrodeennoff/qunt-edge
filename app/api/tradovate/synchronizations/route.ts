import { NextRequest, NextResponse } from "next/server";
import {
  getTradovateSynchronizations,
  removeTradovateToken,
} from "@/app/[locale]/dashboard/components/import/tradovate/actions";
import { createRouteClient } from "@/lib/supabase/route-client";
import { z } from "zod";
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate";
import { apiError } from "@/lib/api-response";

const tradovateDeleteBodySchema = z.object({
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
  try {
    const { user, error } = await requireSessionUser(request);
    if (error || !user?.id) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const result = await getTradovateSynchronizations();
    if (result.error) {
      if (result.error === "User not authenticated") {
        return apiError("UNAUTHORIZED", result.error, 401);
      }
      return apiError("BAD_REQUEST", result.error, 400);
    }

    return NextResponse.json({
      success: true,
      data: result.synchronizations || [],
    });
  } catch (error) {
    console.error("Error fetching Tradovate synchronizations:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch Tradovate synchronizations", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const { user, error } = await requireSessionUser(request);
    if (error || !user?.id) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401);
    }

    const { accountId } = await parseJson(request, tradovateDeleteBodySchema);

    const result = await removeTradovateToken(accountId);
    if (result.error) {
      return apiError("BAD_REQUEST", result.error, 400);
    }

    if (!result.deletedCount) {
      return apiError("NOT_FOUND", "Synchronization not found", 404, { requestId });
    }

    return NextResponse.json({
      success: true,
      message: "Synchronization removed",
    });
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error);
    if (validationResponse.status !== 500) return validationResponse;
    console.error("Error deleting Tradovate synchronization:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete synchronization", 500, { requestId });
  }
}

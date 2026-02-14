import { NextRequest, NextResponse } from "next/server";
import {
  getTradovateToken,
  getTradovateTrades,
} from "@/app/[locale]/dashboard/components/import/tradovate/actions";
import { createRouteClient } from "@/lib/supabase/route-client";

async function requireSessionUser(request: Request) {
  const supabase = createRouteClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireSessionUser(request);
    if (error || !user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const accountId = body?.accountId as string | undefined;

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: "accountId is required" },
        { status: 400 }
      );
    }

    const tokenResult = await getTradovateToken(accountId);
    if (tokenResult.error || !tokenResult.accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: tokenResult.error || "Missing Tradovate access token",
        },
        { status: 400 }
      );
    }

    const syncResult = await getTradovateTrades(tokenResult.accessToken);
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

      return NextResponse.json(
        { success: false, message: syncResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      savedCount: syncResult.savedCount ?? 0,
      ordersCount: syncResult.ordersCount ?? 0,
      message: "Sync completed",
    });
  } catch (error) {
    console.error("Error performing Tradovate sync:", error);
    return NextResponse.json(
      { success: false, message: "Failed to perform Tradovate sync" },
      { status: 500 }
    );
  }
}

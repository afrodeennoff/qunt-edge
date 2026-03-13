"use client";

import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { clearReferralCode } from "@/lib/referral-storage";
import { DashboardSkeleton } from "./skeletons/dashboard-skeleton";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

type DashboardTab = "widgets" | "table" | "accounts" | "chart";

const TradeTableReview = dynamic(
  () => import("./tables/trade-table-review").then((m) => m.TradeTableReview),
);

const AccountsOverview = dynamic(
  () => import("./accounts/accounts-overview").then((m) => m.AccountsOverview),
);

const WidgetCanvas = dynamic(() => import("./widget-canvas"));

const ChartTheFuturePanel = dynamic(
  () => import("./chart-the-future-panel").then((m) => m.ChartTheFuturePanel),
);

export function DashboardTabShell({
  activeTab,
  checkoutSuccess,
}: {
  activeTab: DashboardTab;
  checkoutSuccess: boolean;
}) {
  useEffect(() => {
    if (checkoutSuccess) {
      clearReferralCode();
    }
  }, [checkoutSuccess]);

  // Use enhanced skeleton if feature flag is enabled
  const shouldUseEnhancedSkeleton = FEATURE_FLAGS.ENABLE_SKELETON_LOADING;

  return (
    <div className="relative w-full min-h-[calc(100dvh-64px)] px-4 py-4 sm:min-h-[calc(100vh-72px)] sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <Suspense fallback={shouldUseEnhancedSkeleton ? <DashboardSkeleton activeTab={activeTab} /> : null}>
        {activeTab === "table" ? <TradeTableReview /> : null}
        {activeTab === "accounts" ? <AccountsOverview size="large" surface="embedded" /> : null}
        {activeTab === "chart" ? <ChartTheFuturePanel /> : null}
        {activeTab === "widgets" ? <WidgetCanvas /> : null}
      </Suspense>
    </div>
  );
}

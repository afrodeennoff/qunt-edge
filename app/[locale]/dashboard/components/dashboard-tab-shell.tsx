"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

import { clearReferralCode } from "@/lib/referral-storage";
import { DashboardProvider } from "../dashboard-context";

type DashboardTab = "widgets" | "table" | "accounts" | "chart";

const TradeTableReview = dynamic(
  () => import("./tables/trade-table-review").then((m) => m.TradeTableReview),
  { loading: () => <TabSkeleton /> }
);

const AccountsOverview = dynamic(
  () => import("./accounts/accounts-overview").then((m) => m.AccountsOverview),
  { loading: () => <TabSkeleton /> }
);

const WidgetCanvas = dynamic(() => import("./widget-canvas"), {
  loading: () => <TabSkeleton />,
});

const ChartTheFuturePanel = dynamic(
  () => import("./chart-the-future-panel").then((m) => m.ChartTheFuturePanel),
  { loading: () => <TabSkeleton /> }
);

function TabSkeleton() {
  return (
    <div className="h-[calc(100dvh-156px)] w-full animate-pulse rounded-2xl border border-border/50 bg-muted/20" />
  );
}

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

  return (
    <div className="relative w-full min-h-[calc(100dvh-64px)] px-3 py-3 sm:min-h-[calc(100vh-72px)] sm:px-4 sm:py-4 lg:px-6 lg:py-5 xl:px-8">
      {activeTab === "table" ? <TradeTableReview /> : null}
      {activeTab === "accounts" ? <AccountsOverview size="large" surface="embedded" /> : null}
      {activeTab === "chart" ? <ChartTheFuturePanel /> : null}
      {activeTab === "widgets" ? (
        <DashboardProvider>
          <WidgetCanvas />
        </DashboardProvider>
      ) : null}
    </div>
  );
}

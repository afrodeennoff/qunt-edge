"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { clearReferralCode } from "@/lib/referral-storage";
import { TradesProvider } from "@/context/trades-context";
import { AccountsProvider } from "@/context/accounts-context";
import { FiltersProvider } from "@/context/filters-context";
import { Trade, Account, Group } from "@/lib/data-types";
import { DashboardLayoutWithWidgets } from "@/store/user-store";

type DashboardTab = "widgets" | "table" | "accounts" | "chart";

interface InitialData {
  trades: Trade[];
  stats: any;
  accounts: Account[];
  groups: Group[];
  dashboardLayout: DashboardLayoutWithWidgets;
}

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
  initialData,
}: {
  activeTab: DashboardTab;
  checkoutSuccess: boolean;
  initialData?: InitialData;
}) {
  useEffect(() => {
    if (checkoutSuccess) {
      clearReferralCode();
    }
  }, [checkoutSuccess]);

  return (
    <TradesProvider initialTrades={initialData?.trades || []} initialStats={initialData?.stats}>
      <AccountsProvider 
        initialAccounts={initialData?.accounts || []} 
        initialGroups={initialData?.groups || []}
      >
        <FiltersProvider>
          <div className="relative w-full min-h-[calc(100dvh-64px)] px-3 py-3 sm:min-h-[calc(100vh-72px)] sm:px-4 sm:py-4 lg:px-6 lg:py-5 xl:px-8">
            {activeTab === "table" ? <TradeTableReview /> : null}
            {activeTab === "accounts" ? <AccountsOverview size="large" surface="embedded" /> : null}
            {activeTab === "chart" ? <ChartTheFuturePanel /> : null}
            {activeTab === "widgets" ? <WidgetCanvas /> : null}
          </div>
        </FiltersProvider>
      </AccountsProvider>
    </TradesProvider>
  );
}

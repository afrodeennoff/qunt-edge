"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { clearReferralCode } from "@/lib/referral-storage";

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
  const pathname = usePathname();

  useEffect(() => {
    if (checkoutSuccess) {
      clearReferralCode();
    }
  }, [checkoutSuccess]);

  const tabs: { key: DashboardTab; label: string }[] = [
    { key: "widgets", label: "Overview" },
    { key: "table", label: "Trades" },
    { key: "accounts", label: "Accounts" },
    { key: "chart", label: "Chart" },
  ];

  return (
    <div className="relative w-full min-h-[calc(100dvh-64px)] px-2 pb-3 pt-2 sm:min-h-[calc(100vh-72px)] sm:px-4 sm:pb-5 sm:pt-2 lg:px-6 lg:pb-6 lg:pt-3">
      <nav aria-label="Dashboard sections" className="mb-3 flex flex-wrap items-center gap-2 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={`${pathname}?tab=${tab.key}`}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                  : "rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {activeTab === "table" ? <TradeTableReview /> : null}
      {activeTab === "accounts" ? <AccountsOverview size="large" surface="embedded" /> : null}
      {activeTab === "chart" ? <ChartTheFuturePanel /> : null}
      {activeTab === "widgets" ? <WidgetCanvas /> : null}
    </div>
  );
}

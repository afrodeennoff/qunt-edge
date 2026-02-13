"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TradeTableReview } from "./components/tables/trade-table-review";
import { AccountsOverview } from "./components/accounts/accounts-overview";
import WidgetCanvas from "./components/widget-canvas";
import { ChartTheFuturePanel } from "./components/chart-the-future-panel";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { clearReferralCode } from "@/lib/referral-storage";
import { useUserStore } from "@/store/user-store";


import { DataDebug } from "./components/data-debug";

export default function Home() {
  const searchParams = useSearchParams();
  const layout = useUserStore((state) => state.dashboardLayout);

  // Clear referral code after successful subscription
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      clearReferralCode();
    }
  }, [searchParams]);

  const requestedTab = searchParams.get("tab");
  const hasWidgets =
    (layout?.desktop?.length ?? 0) > 0 || (layout?.mobile?.length ?? 0) > 0;
  const activeTab = requestedTab || (hasWidgets ? "widgets" : "table");

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] px-3 pb-4 pt-2 sm:px-4 sm:pb-5 sm:pt-2 lg:px-6 lg:pb-6 lg:pt-3">
      <Tabs value={activeTab} className="w-full h-full relative z-10">
        <TabsContent
          value="table"
          className="mt-0 h-[calc(100vh-150px)] sm:h-[calc(100vh-160px)] lg:h-[calc(100vh-176px)] outline-hidden"
        >
          <TradeTableReview />
        </TabsContent>

        <TabsContent value="accounts" className="mt-0 outline-hidden">
          <AccountsOverview size="large" surface="embedded" />
        </TabsContent>

        <TabsContent value="chart" className="mt-0 outline-hidden">
          <ChartTheFuturePanel />
        </TabsContent>

        <TabsContent value="widgets" className="mt-0 outline-hidden">
          <WidgetCanvas />
        </TabsContent>
      </Tabs>
      <DataDebug />
    </div>
  );
}

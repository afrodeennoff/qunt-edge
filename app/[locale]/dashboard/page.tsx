"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TradeTableReview } from "./components/tables/trade-table-review";
import { AccountsOverview } from "./components/accounts/accounts-overview";
import WidgetCanvas from "./components/widget-canvas";
import { ChartTheFuturePanel } from "./components/chart-the-future-panel";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { clearReferralCode } from "@/lib/referral-storage";


export default function Home() {
  const searchParams = useSearchParams();

  // Clear referral code after successful subscription
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      clearReferralCode();
    }
  }, [searchParams]);

  const activeTab = searchParams.get("tab") || "widgets";

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] px-3 pb-4 pt-0 sm:px-4 sm:pb-4 sm:pt-0 lg:px-6 lg:pb-6 lg:pt-0">
      <Tabs value={activeTab} className="w-full h-full relative z-10">


        <TabsContent
          value="table"
          className="mt-0 h-[calc(100vh-140px)] sm:h-[calc(100vh-148px)] lg:h-[calc(100vh-160px)] p-2 sm:p-3"
        >
          <TradeTableReview />
        </TabsContent>

        <TabsContent value="accounts" className="mt-0 p-3 sm:p-4">
          <AccountsOverview size="large" />
        </TabsContent>

        <TabsContent value="chart" className="mt-0">
          <ChartTheFuturePanel />
        </TabsContent>

        <TabsContent value="widgets" className="mt-0 px-3 pb-4 pt-0 sm:px-4 sm:pb-4 sm:pt-0">
          <WidgetCanvas />
        </TabsContent>
      </Tabs>
    </div>
  );
}

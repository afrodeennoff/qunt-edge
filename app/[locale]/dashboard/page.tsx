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
    <div className="relative w-full min-h-[calc(100vh-72px)] p-3 sm:p-4 lg:p-6">
      <Tabs value={activeTab} className="w-full h-full relative z-10">


        <TabsContent value="table" className="mt-0 h-[calc(100vh-112px)] rounded-3xl border border-border/60 bg-card/75 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <div className="h-full w-full overflow-hidden rounded-2xl border border-border/70 bg-background/70">
            <TradeTableReview />
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-0 rounded-3xl border border-border/60 bg-card/75 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3 sm:p-4">
            <AccountsOverview size="large" />
          </div>
        </TabsContent>

        <TabsContent value="chart" className="mt-0">
          <ChartTheFuturePanel />
        </TabsContent>

        <TabsContent value="widgets" className="mt-0 rounded-3xl border border-border/60 bg-card/75 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3 sm:p-4">
            <WidgetCanvas />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

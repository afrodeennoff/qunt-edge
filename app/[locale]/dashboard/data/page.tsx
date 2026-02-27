'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataManagementCard } from "@/app/[locale]/dashboard/data/components/data-management/data-management-card"
import { useEffect } from "react"
import { TradeTableReview } from "../components/tables/trade-table-review"
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function DashboardPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <UnifiedPageShell density="compact">
      <div className="flex w-full flex-1 flex-col">
        <Tabs defaultValue="accounts" className="w-full space-y-4">
          <TabsList className="h-auto rounded-2xl border border-white/10 bg-black/40 p-1">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            {/* <TabsTrigger value="propfirm">Prop Firm</TabsTrigger> */}
          </TabsList>
          <TabsContent value="accounts" className="mt-0">
            <UnifiedSurface>
              <DataManagementCard />
            </UnifiedSurface>
          </TabsContent>
          <TabsContent value="trades" className="mt-0 h-[calc(100vh-var(--navbar-height)-var(--tabs-height)-16px)]">
            <UnifiedSurface className="h-full">
              <TradeTableReview />
            </UnifiedSurface>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedPageShell>
  )
}

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataManagementCard } from "@/app/[locale]/dashboard/data/components/data-management/data-management-card"
import { useEffect } from "react"
import { TradeTableReview } from "../components/tables/trade-table-review"

export default function DashboardPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative flex w-full min-h-screen px-3 pb-4 pt-2 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
      <div className="flex w-full flex-1 flex-col p-2 sm:p-3">
        <Tabs defaultValue="accounts" className="enterprise-shell w-full space-y-4 rounded-3xl p-3 sm:p-4">
          <TabsList className="h-auto rounded-2xl border border-white/15 bg-black/40 p-1">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            {/* <TabsTrigger value="propfirm">Prop Firm</TabsTrigger> */}
          </TabsList>
          <TabsContent value="accounts" className="mt-0">
            <DataManagementCard />
          </TabsContent>
          <TabsContent value="trades" className="mt-0 h-[calc(100vh-var(--navbar-height)-var(--tabs-height)-34px)]">
            <TradeTableReview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

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
    <div className="relative flex w-full min-h-screen px-3 pb-4 pt-0 sm:px-4 sm:pb-4 sm:pt-0 lg:px-6 lg:pb-6 lg:pt-0">
      <div className="flex w-full flex-1 flex-col p-4 sm:p-6">
        <Tabs defaultValue="accounts" className="w-full space-y-4">
          <TabsList className="h-auto rounded-2xl border border-border/70 bg-background/70 p-1">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            {/* <TabsTrigger value="propfirm">Prop Firm</TabsTrigger> */}
          </TabsList>
          <TabsContent value="accounts" className="mt-0">
            <DataManagementCard />
          </TabsContent>
          <TabsContent value="trades" className="mt-0 h-[calc(100vh-var(--navbar-height)-var(--tabs-height)-16px)]">
            <TradeTableReview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

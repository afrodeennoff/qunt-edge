"use client"

import { useEffect } from "react"
import { TradeTableReview } from "../components/tables/trade-table-review"

export default function DashboardStrategiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="mt-0 h-[calc(100vh-112px)] p-3 sm:p-4 lg:p-6">
      <div className="h-full w-full overflow-hidden rounded-3xl border border-border/60 bg-card/75 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-border/70 bg-background/70">
        <TradeTableReview />
        </div>
      </div>
    </div>
  )
}

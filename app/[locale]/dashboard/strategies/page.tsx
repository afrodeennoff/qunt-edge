"use client"

import { useEffect } from "react"
import { TradeTableReview } from "../components/tables/trade-table-review"

export default function DashboardStrategiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="page-shell mt-0 h-[calc(100vh-112px)]">
      <div className="h-full w-full overflow-hidden p-3 sm:p-4">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-border/70 bg-card/75">
        <TradeTableReview />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { TradeTableReview } from "../components/tables/trade-table-review"

export default function DashboardStrategiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="dashboard-shell mt-0 h-[calc(100vh-112px)]">
      <div className="h-full w-full overflow-hidden p-3 sm:p-4">
        <TradeTableReview />
      </div>
    </div>
  )
}

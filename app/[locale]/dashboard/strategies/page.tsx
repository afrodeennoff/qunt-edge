"use client"

import { useEffect } from "react"
import { TradeTableReview } from "../components/tables/trade-table-review"

export default function DashboardStrategiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="mt-0 h-[calc(100vh-112px)] px-3 pb-4 pt-0 sm:px-4 sm:pb-4 sm:pt-0 lg:px-6 lg:pb-6 lg:pt-0">
      <div className="h-full w-full overflow-hidden p-3 sm:p-4">
        <TradeTableReview />
      </div>
    </div>
  )
}

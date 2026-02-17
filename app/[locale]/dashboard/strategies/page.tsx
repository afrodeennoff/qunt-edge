"use client"

import { useEffect } from "react"
import { TradeTableReview } from "../components/tables/trade-table-review"

export default function DashboardStrategiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="mt-0 h-[calc(100vh-112px)] px-3 pb-4 pt-2 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
      <section className="enterprise-shell h-full w-full overflow-hidden rounded-3xl p-2 sm:p-3">
        <TradeTableReview />
      </section>
    </div>
  )
}

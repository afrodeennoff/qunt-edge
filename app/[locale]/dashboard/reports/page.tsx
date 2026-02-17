"use client"

import { useEffect } from "react"
import { AnalysisOverview } from "../components/analysis/analysis-overview"

export default function DashboardReportsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6">
      <section className="enterprise-shell rounded-3xl p-4 sm:p-6">
        <AnalysisOverview />
      </section>
    </div>
  )
}

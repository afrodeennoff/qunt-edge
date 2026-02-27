"use client"

import { useEffect } from "react"
import { AnalysisOverview } from "../components/analysis/analysis-overview"

export default function DashboardReportsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6">
      <section className="rounded-3xl border border-border/60 bg-card/75 p-4 shadow-sm backdrop-blur-sm sm:p-6">
        <AnalysisOverview />
      </section>
    </div>
  )
}

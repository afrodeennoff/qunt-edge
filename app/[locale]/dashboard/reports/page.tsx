"use client"

import { useEffect } from "react"
import { AnalysisOverview } from "../components/analysis/analysis-overview"

export default function DashboardReportsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="w-full space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="mb-8 rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">View your detailed trading analysis reports.</p>
      </div>
      <section className="rounded-3xl border border-border/60 bg-card/75 p-4 shadow-sm backdrop-blur-sm sm:p-6">
        <AnalysisOverview />
      </section>
    </div>
  )
}

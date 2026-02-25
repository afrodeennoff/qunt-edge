"use client"

import { useEffect } from "react"
import { AnalysisOverview } from "../components/analysis/analysis-overview"
import { UnifiedPageHeader, UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function DashboardReportsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <UnifiedPageShell className="py-4 sm:py-6">
      <UnifiedPageHeader
        eyebrow="Dashboard"
        title="Reports"
        description="View your detailed trading analysis reports."
      />
      <UnifiedSurface>
        <AnalysisOverview />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}

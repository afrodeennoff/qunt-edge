import { AnalysisOverview } from "../components/analysis/analysis-overview"
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function DashboardReportsPage() {
  return (
    <UnifiedPageShell density="compact">
      <UnifiedSurface>
        <AnalysisOverview />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}

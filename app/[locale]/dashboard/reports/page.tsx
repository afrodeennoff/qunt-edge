"use client"

import { useEffect } from "react"
import { Activity, DollarSign, ShieldAlert, Trophy } from "lucide-react"
import { AnalysisOverview } from "../components/analysis/analysis-overview"
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"
import { useAnalysisStore } from "@/store/analysis-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardReportsPage() {
  const accountPerformanceData = useAnalysisStore((state) => state.accountPerformanceData)
  const analysisResult = useAnalysisStore((state) => state.analysisResult)
  const lastUpdated = useAnalysisStore((state) => state.lastUpdated)

  const topAccount = accountPerformanceData?.bestPerformingAccount?.accountNumber
    || analysisResult?.dataSummary.bestAccount
    || "n/a"
  const portfolioRisk = accountPerformanceData?.portfolioRisk
    || analysisResult?.dataSummary.portfolioRisk
    || "n/a"
  const totalAccounts = accountPerformanceData?.accounts?.length || analysisResult?.dataSummary.totalAccounts || 0
  const totalPortfolioValue = accountPerformanceData?.totalPortfolioValue || analysisResult?.dataSummary.totalPortfolioValue || 0

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <UnifiedPageShell density="compact">
      <UnifiedSurface>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Reports Center</h1>
            <p className="text-sm text-muted-foreground">
              {lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleString()}` : "Run analysis to generate portfolio intelligence."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const section = document.getElementById("reports-analysis")
              section?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
          >
            Open Analysis
          </Button>
        </div>
      </UnifiedSurface>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-semibold">{totalAccounts}</p>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-semibold">${totalPortfolioValue.toLocaleString()}</p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Top Account</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-semibold">{topAccount}</p>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Risk Posture</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-2xl font-semibold capitalize">{portfolioRisk}</p>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <UnifiedSurface>
        <section id="reports-analysis">
          <AnalysisOverview />
        </section>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}

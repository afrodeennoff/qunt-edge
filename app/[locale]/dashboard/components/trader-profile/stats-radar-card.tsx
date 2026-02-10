"use client"

import { Card } from "@/components/ui/card"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"
import type { TraderStats } from "../../types/trader-profile"

export function StatsRadarCard({ stats }: { stats: TraderStats }) {
  const radarData = [
    { metric: "Trades", value: Math.min(100, stats.totalTrades) },
    { metric: "Risk Reward", value: Math.min(100, stats.serialTraderScore) },
    { metric: "Drawdown", value: Math.max(0, 100 - Math.min(100, stats.avgLoss)) },
    { metric: "Win Rate", value: Math.min(100, stats.winRate) },
    { metric: "Avg Return", value: Math.min(100, stats.avgReturn) },
  ]

  return (
    <Card className="border border-border/70 bg-[hsl(var(--qe-panel))]/95 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-ui-body text-muted-foreground">Compare with: average user</p>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--chart-grid) / 0.4)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Radar dataKey="value" stroke="hsl(var(--chart-6))" fill="hsl(var(--chart-6) / 0.24)" fillOpacity={1} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

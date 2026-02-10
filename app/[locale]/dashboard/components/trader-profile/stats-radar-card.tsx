"use client"

import { Card } from "@/components/ui/card"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"

const radarData = [
  { metric: "Trades", value: 82 },
  { metric: "Risk Reward", value: 69 },
  { metric: "Drawdown", value: 51 },
  { metric: "Win Rate", value: 77 },
  { metric: "Avg Return", value: 74 },
]

export function StatsRadarCard() {
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

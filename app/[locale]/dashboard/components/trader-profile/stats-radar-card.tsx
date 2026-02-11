"use client"

import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"
import type { TraderBenchmark, TraderStats } from "../../types/trader-profile"

function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.min(max, Math.max(min, value))
}

function scoreHigherBetter(value: number, other: number): number {
  const safeValue = Math.max(0, value)
  const safeOther = Math.max(0, other)
  const maxRef = Math.max(safeValue, safeOther, 1)
  return clamp((safeValue / maxRef) * 100)
}

function scoreLowerBetter(value: number, other: number): number {
  const safeValue = Math.max(0, value)
  const safeOther = Math.max(0, other)
  const maxRef = Math.max(safeValue, safeOther, 1)
  return clamp((1 - safeValue / maxRef) * 100)
}

function scoreWithNegatives(value: number, other: number): number {
  const minRef = Math.min(value, other, 0)
  const maxRef = Math.max(value, other, 1)
  if (maxRef === minRef) return 50
  return clamp(((value - minRef) / (maxRef - minRef)) * 100)
}

interface StatsRadarCardProps {
  stats: TraderStats
  benchmark: TraderBenchmark | null
  isBenchmarkLoading?: boolean
}

export function StatsRadarCard({ stats, benchmark, isBenchmarkLoading = false }: StatsRadarCardProps) {
  const benchmarkValues = {
    riskReward: benchmark?.riskReward ?? 0,
    drawdown: benchmark?.drawdown ?? 0,
    winRate: benchmark?.winRate ?? 0,
    avgReturn: benchmark?.avgReturn ?? 0,
  }

  const normalizedTrader = {
    riskReward: scoreHigherBetter(stats.riskReward, benchmarkValues.riskReward),
    drawdown: scoreLowerBetter(stats.drawdown, benchmarkValues.drawdown),
    winRate: scoreHigherBetter(stats.winRate, benchmarkValues.winRate),
    avgReturn: scoreWithNegatives(stats.avgReturn, benchmarkValues.avgReturn),
  }
  const normalizedBenchmark = {
    riskReward: scoreHigherBetter(benchmarkValues.riskReward, stats.riskReward),
    drawdown: scoreLowerBetter(benchmarkValues.drawdown, stats.drawdown),
    winRate: scoreHigherBetter(benchmarkValues.winRate, stats.winRate),
    avgReturn: scoreWithNegatives(benchmarkValues.avgReturn, stats.avgReturn),
  }

  const radarData = [
    { metric: "Risk Reward", trader: normalizedTrader.riskReward, average: normalizedBenchmark.riskReward },
    { metric: "Drawdown", trader: normalizedTrader.drawdown, average: normalizedBenchmark.drawdown },
    { metric: "Win Rate", trader: normalizedTrader.winRate, average: normalizedBenchmark.winRate },
    { metric: "Avg Return", trader: normalizedTrader.avgReturn, average: normalizedBenchmark.avgReturn },
  ]

  const comparisonDelta =
    radarData.reduce((sum, row) => sum + (row.trader - row.average), 0) / radarData.length

  return (
    <Card className="relative overflow-hidden border border-border/70 bg-[hsl(var(--qe-panel))]/95 p-4">
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-sky-500/10 blur-2xl" />
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-ui-micro uppercase tracking-[0.14em] text-muted-foreground">
            Compare with: average user
          </p>
          <p className="mt-1 text-ui-body font-semibold text-foreground">
            {comparisonDelta >= 0 ? "Above baseline" : "Below baseline"} ({comparisonDelta.toFixed(1)} pts)
          </p>
          {benchmark ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Based on {benchmark.sampleSize} users with trades
            </p>
          ) : null}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-ui-micro text-sky-200">
          <Sparkles className="size-3.5" />
          {isBenchmarkLoading ? "Loading benchmark..." : "Benchmark View"}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-ui-micro text-sky-100">
          You
        </span>
        <span className="rounded-full border border-zinc-500/40 bg-zinc-400/10 px-2.5 py-1 text-ui-micro text-zinc-200">
          Average user
        </span>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--chart-grid) / 0.4)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Radar
              dataKey="average"
              stroke="hsl(var(--muted-foreground) / 0.7)"
              fill="hsl(var(--muted-foreground) / 0.15)"
              fillOpacity={1}
            />
            <Radar dataKey="trader" stroke="hsl(var(--chart-6))" fill="hsl(var(--chart-6) / 0.3)" fillOpacity={1} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { Sparkles, TrendingUp, TrendingDown, ShieldAlert, Crosshair } from "lucide-react"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"

interface BenchmarkMetrics {
  riskReward: number
  drawdown: number
  winRate: number
  avgReturn: number
  sampleSize: number
}

interface TraderMetrics {
  riskReward: number
  drawdown: number
  winRate: number
  avgReturn: number
  totalTrades: number
  avgWin: number
  avgLoss: number
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function scoreHigherBetter(value: number, baseline: number) {
  const maxRef = Math.max(value, baseline, 1)
  return clamp((Math.max(0, value) / maxRef) * 100)
}

function scoreLowerBetter(value: number, baseline: number) {
  const maxRef = Math.max(value, baseline, 1)
  return clamp((1 - Math.max(0, value) / maxRef) * 100)
}

function scoreSigned(value: number, baseline: number) {
  const minRef = Math.min(value, baseline, 0)
  const maxRef = Math.max(value, baseline, 1)
  if (maxRef === minRef) return 50
  return clamp(((value - minRef) / (maxRef - minRef)) * 100)
}

function formatValue(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00"
}

export default function TraderProfilePage() {
  const { formattedTrades, isLoading } = useData()
  const user = useUserStore((state) => state.user)
  const supabaseUser = useUserStore((state) => state.supabaseUser)
  const [benchmark, setBenchmark] = useState<BenchmarkMetrics | null>(null)
  const [isBenchmarkLoading, setIsBenchmarkLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setIsBenchmarkLoading(true)
      try {
        const res = await fetch("/api/trader-profile/benchmark", { method: "GET", credentials: "include" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const payload = (await res.json()) as { benchmark?: BenchmarkMetrics }
        if (alive) setBenchmark(payload.benchmark ?? null)
      } catch (error) {
        console.error("[TraderProfile] failed to fetch benchmark", error)
        if (alive) setBenchmark(null)
      } finally {
        if (alive) setIsBenchmarkLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const profileName = useMemo(() => {
    return (
      supabaseUser?.user_metadata?.full_name ||
      supabaseUser?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      supabaseUser?.email?.split("@")[0] ||
      "Trader"
    )
  }, [supabaseUser?.email, supabaseUser?.user_metadata?.full_name, supabaseUser?.user_metadata?.name, user?.email])

  const metrics = useMemo<TraderMetrics>(() => {
    const trades = formattedTrades || []
    const pnlValues = trades.map((trade) => Number(trade.pnl || 0))
    const wins = pnlValues.filter((v) => v > 0)
    const losses = pnlValues.filter((v) => v < 0)
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
    const avgLossAbs = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0
    const decisiveTrades = wins.length + losses.length
    const winRate = decisiveTrades > 0 ? (wins.length / decisiveTrades) * 100 : 0
    const totalTrades = trades.length
    const cumulativePnl = pnlValues.reduce((a, b) => a + b, 0)
    const avgReturn = totalTrades > 0 ? cumulativePnl / totalTrades : 0

    const sorted = [...trades].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    )
    let runningNet = 0
    let peakNet = 0
    let maxDrawdown = 0
    for (const trade of sorted) {
      const net = Number(trade.pnl || 0) - Number(trade.commission || 0)
      runningNet += net
      peakNet = Math.max(peakNet, runningNet)
      maxDrawdown = Math.max(maxDrawdown, peakNet - runningNet)
    }

    return {
      riskReward: avgLossAbs > 0 ? avgWin / avgLossAbs : 0,
      drawdown: maxDrawdown,
      winRate,
      avgReturn,
      totalTrades,
      avgWin,
      avgLoss: avgLossAbs,
    }
  }, [formattedTrades])

  const compareData = useMemo(() => {
    const baseline = benchmark ?? { riskReward: 0, drawdown: 0, winRate: 0, avgReturn: 0, sampleSize: 0 }
    const traderScores = {
      riskReward: scoreHigherBetter(metrics.riskReward, baseline.riskReward),
      drawdown: scoreLowerBetter(metrics.drawdown, baseline.drawdown),
      winRate: scoreHigherBetter(metrics.winRate, baseline.winRate),
      avgReturn: scoreSigned(metrics.avgReturn, baseline.avgReturn),
    }
    const baselineScores = {
      riskReward: scoreHigherBetter(baseline.riskReward, metrics.riskReward),
      drawdown: scoreLowerBetter(baseline.drawdown, metrics.drawdown),
      winRate: scoreHigherBetter(baseline.winRate, metrics.winRate),
      avgReturn: scoreSigned(baseline.avgReturn, metrics.avgReturn),
    }

    const rows = [
      { metric: "Risk Reward", trader: traderScores.riskReward, baseline: baselineScores.riskReward },
      { metric: "Drawdown", trader: traderScores.drawdown, baseline: baselineScores.drawdown },
      { metric: "Win Rate", trader: traderScores.winRate, baseline: baselineScores.winRate },
      { metric: "Avg Return", trader: traderScores.avgReturn, baseline: baselineScores.avgReturn },
    ]

    const delta = rows.reduce((acc, row) => acc + (row.trader - row.baseline), 0) / rows.length
    return { rows, delta }
  }, [benchmark, metrics.avgReturn, metrics.drawdown, metrics.riskReward, metrics.winRate])

  const recentTrades = useMemo(() => {
    return (formattedTrades || []).slice(0, 8)
  }, [formattedTrades])

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] p-3 sm:p-4 lg:p-6">
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4">
          <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
            <p className="text-[11px] uppercase tracking-[0.16em] text-fg-muted">Trader Profile</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-fg-primary">{profileName}</h2>
            <p className="mt-2 text-sm text-fg-muted">
              {metrics.totalTrades} trades tracked
            </p>
            {isLoading ? <p className="mt-2 text-xs text-fg-muted">Loading trades...</p> : null}
          </Card>

          <Card className="border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-fg-primary">My Trades</p>
              <p className="text-xs text-fg-muted">Recent</p>
            </div>
            <div className="space-y-2">
              {recentTrades.length === 0 ? (
                <p className="text-sm text-fg-muted">No trades available yet.</p>
              ) : (
                recentTrades.map((trade) => {
                  const pnl = Number(trade.pnl || 0)
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-fg-primary">{trade.instrument || "N/A"}</p>
                        <p className="text-[11px] text-fg-muted">{new Date(trade.entryDate).toLocaleString()}</p>
                      </div>
                      <p className={`text-sm font-black ${pnl >= 0 ? "text-accent-teal" : "text-rose-500"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="relative overflow-hidden border border-white/10 bg-slate-950/70 p-4">
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-fg-muted">Compare with: average user</p>
                <p className="mt-1 text-sm font-semibold text-fg-primary">
                  {compareData.delta >= 0 ? "Above baseline" : "Below baseline"} ({compareData.delta.toFixed(1)} pts)
                </p>
                {benchmark ? (
                  <p className="mt-1 text-[11px] text-fg-muted">Based on {benchmark.sampleSize} users with trades</p>
                ) : null}
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                {isBenchmarkLoading ? "Loading..." : "Benchmark"}
              </div>
            </div>

            <div className="mb-3 flex gap-2">
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">You</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fg-muted">Average User</span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={compareData.rows}>
                  <PolarGrid stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Radar dataKey="baseline" stroke="hsl(var(--muted-foreground) / 0.7)" fill="hsl(var(--muted-foreground) / 0.15)" fillOpacity={1} />
                  <Radar dataKey="trader" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.3)" fillOpacity={1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border border-white/10 bg-black/25 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">Risk Reward</p>
              <p className="mt-1 flex items-center gap-1 text-2xl font-black text-fg-primary"><Crosshair className="h-4 w-4 text-cyan-300" />{formatValue(metrics.riskReward)}</p>
            </Card>
            <Card className="border border-white/10 bg-black/25 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">Drawdown</p>
              <p className="mt-1 flex items-center gap-1 text-2xl font-black text-rose-400"><ShieldAlert className="h-4 w-4" />{formatValue(metrics.drawdown)}</p>
            </Card>
            <Card className="border border-white/10 bg-black/25 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">Win Rate</p>
              <p className="mt-1 flex items-center gap-1 text-2xl font-black text-emerald-400"><TrendingUp className="h-4 w-4" />{formatValue(metrics.winRate)}%</p>
            </Card>
            <Card className="border border-white/10 bg-black/25 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">Avg Return</p>
              <p className={`mt-1 flex items-center gap-1 text-2xl font-black ${metrics.avgReturn >= 0 ? "text-accent-teal" : "text-rose-500"}`}>
                {metrics.avgReturn >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {formatValue(metrics.avgReturn)}
              </p>
            </Card>
          </div>

          <Card className="border border-white/10 bg-black/25 p-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg Win</p>
                <p className="mt-1 font-bold text-emerald-400">{formatValue(metrics.avgWin)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg Loss</p>
                <p className="mt-1 font-bold text-rose-400">{formatValue(metrics.avgLoss)}</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

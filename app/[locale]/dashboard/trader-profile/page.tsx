"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDot,
  Crosshair,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react"
import { TopNav } from "../components/top-nav"
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
  netPnl: number
  expectancy: number
  consistencyRate: number
  streakDirection: number
  streakCount: number
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

function formatSigned(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "0.00"
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`
}

function getTradeDay(dateValue: string | Date) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Invalid date"
  return date.toISOString().slice(0, 10)
}

function getStreak(values: number[]) {
  let direction = 0
  let count = 0
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index]
    if (value === 0) continue
    const currentDirection = value > 0 ? 1 : -1
    if (direction === 0) {
      direction = currentDirection
      count = 1
      continue
    }
    if (currentDirection === direction) {
      count += 1
      continue
    }
    break
  }
  return { direction, count }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "TR"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
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
    const sorted = [...trades].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    )
    const pnlValues = sorted.map((trade) => Number(trade.pnl || 0))
    const netValues = sorted.map((trade) => Number(trade.pnl || 0) - Number(trade.commission || 0))
    const wins = pnlValues.filter((v) => v > 0)
    const losses = pnlValues.filter((v) => v < 0)
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
    const avgLossAbs = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0
    const decisiveTrades = wins.length + losses.length
    const winRate = decisiveTrades > 0 ? (wins.length / decisiveTrades) * 100 : 0
    const totalTrades = trades.length
    const cumulativePnl = netValues.reduce((a, b) => a + b, 0)
    const avgReturn = totalTrades > 0 ? cumulativePnl / totalTrades : 0
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLossAbs

    let runningNet = 0
    let peakNet = 0
    let maxDrawdown = 0
    for (const net of netValues) {
      runningNet += net
      peakNet = Math.max(peakNet, runningNet)
      maxDrawdown = Math.max(maxDrawdown, peakNet - runningNet)
    }

    const dayPnl = new Map<string, number>()
    sorted.forEach((trade) => {
      const key = getTradeDay(trade.entryDate)
      const prev = dayPnl.get(key) ?? 0
      dayPnl.set(key, prev + Number(trade.pnl || 0))
    })
    const activeDays = [...dayPnl.values()]
    const positiveDays = activeDays.filter((value) => value > 0).length
    const consistencyRate = activeDays.length > 0 ? (positiveDays / activeDays.length) * 100 : 0
    const streak = getStreak(pnlValues)

    return {
      riskReward: avgLossAbs > 0 ? avgWin / avgLossAbs : 0,
      drawdown: maxDrawdown,
      winRate,
      avgReturn,
      totalTrades,
      avgWin,
      avgLoss: avgLossAbs,
      netPnl: cumulativePnl,
      expectancy,
      consistencyRate,
      streakDirection: streak.direction,
      streakCount: streak.count,
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

  const performanceBand = useMemo(() => {
    if (compareData.delta >= 18) return "Elite edge"
    if (compareData.delta >= 6) return "Strong edge"
    if (compareData.delta >= -6) return "Competitive"
    if (compareData.delta >= -18) return "Needs tuning"
    return "Rebuild phase"
  }, [compareData.delta])

  const metricGaps = useMemo(() => {
    return compareData.rows.map((row) => ({
      ...row,
      diff: row.trader - row.baseline,
      absDiff: Math.abs(row.trader - row.baseline),
    }))
  }, [compareData.rows])

  const recentTrades = useMemo(() => {
    return [...(formattedTrades || [])]
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 10)
  }, [formattedTrades])

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] overflow-hidden p-3 sm:p-4 lg:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-24 left-[-8%] h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-28 right-[-6%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-[36%] h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <TopNav title="Trader Profile" />

      <div className="relative grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4">
          <Card className="relative overflow-hidden border border-white/15 bg-[linear-gradient(130deg,rgba(8,35,41,0.95)_0%,rgba(5,12,25,0.9)_45%,rgba(6,17,28,0.95)_100%)] p-5 sm:p-6">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-cyan-300/20 bg-cyan-400/10 blur-2xl" />
            <div className="absolute bottom-0 right-0 h-20 w-40 bg-gradient-to-l from-cyan-300/10 to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-1 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Trader fingerprint
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-white/25 bg-white/10">
                  <AvatarImage src={supabaseUser?.user_metadata?.avatar_url || ""} alt={profileName} />
                  <AvatarFallback className="bg-cyan-500/20 text-sm font-bold text-cyan-100">
                    {getInitials(profileName)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{profileName}</h2>
              </div>
              <p className="mt-2 max-w-xl text-sm text-cyan-100/80">
                Live identity from your journal. We translate your trade behavior into an edge map so you can quickly
                spot what to double down on and what to repair.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/70">Band</p>
                  <p className="mt-1 text-sm font-bold text-white">{performanceBand}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/70">Trades tracked</p>
                  <p className="mt-1 text-sm font-bold text-white">{metrics.totalTrades}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/70">Current streak</p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {metrics.streakCount > 0
                      ? `${metrics.streakCount} ${metrics.streakDirection > 0 ? "wins" : "losses"}`
                      : "No streak"}
                  </p>
                </div>
              </div>

              {isLoading ? <p className="mt-3 text-xs text-cyan-100/70">Loading trades...</p> : null}
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-emerald-400/25 bg-emerald-500/10 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-200/80">Net PnL</p>
                  <p className="mt-2 text-2xl font-black text-emerald-100">{formatSigned(metrics.netPnl)}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-300" />
              </div>
            </Card>

            <Card className="border border-cyan-400/25 bg-cyan-500/10 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/80">Risk Reward</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatValue(metrics.riskReward)}</p>
                </div>
                <Target className="h-5 w-5 text-cyan-200" />
              </div>
            </Card>

            <Card className="border border-rose-400/25 bg-rose-500/10 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-rose-100/80">Max Drawdown</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatValue(metrics.drawdown)}</p>
                </div>
                <ShieldAlert className="h-5 w-5 text-rose-200" />
              </div>
            </Card>

            <Card className="border border-violet-400/25 bg-violet-500/10 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-violet-100/80">Win Rate</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatValue(metrics.winRate)}%</p>
                </div>
                <Trophy className="h-5 w-5 text-violet-200" />
              </div>
            </Card>
          </div>

          <Card className="border border-white/10 bg-black/25 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-fg-primary">Trade Feed</p>
              <p className="text-xs text-fg-muted">Last {recentTrades.length} executions</p>
            </div>
            <div className="space-y-2.5">
              {recentTrades.length === 0 ? (
                <p className="text-sm text-fg-muted">No trades available yet.</p>
              ) : (
                recentTrades.map((trade) => {
                  const pnl = Number(trade.pnl || 0)
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <CircleDot className={`h-3.5 w-3.5 ${pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`} />
                        <div>
                          <p className="text-sm font-semibold text-fg-primary">{trade.instrument || "N/A"}</p>
                          <p className="text-[11px] text-fg-muted">{new Date(trade.entryDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-black ${pnl >= 0 ? "text-accent-teal" : "text-rose-500"}`}>
                        {formatSigned(pnl)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-fg-muted">Edge map vs average user</p>
                <p className="mt-1 text-sm font-semibold text-fg-primary">
                  {compareData.delta >= 0 ? "Above baseline" : "Below baseline"} ({formatSigned(compareData.delta, 1)} pts)
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
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                You
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fg-muted">
                Average User
              </span>
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

          <Card className="border border-white/10 bg-black/25 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-fg-primary">Where you win or lose edge</p>
              <Crosshair className="h-4 w-4 text-fg-muted" />
            </div>
            <div className="space-y-3">
              {metricGaps.map((row) => {
                const better = row.diff >= 0
                return (
                  <div key={row.metric}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-fg-muted">{row.metric}</span>
                      <span className={better ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>
                        {better ? "+" : ""}
                        {row.diff.toFixed(1)} pts
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${better ? "bg-emerald-400" : "bg-rose-400"}`}
                        style={{ width: `${Math.max(6, Math.min(100, row.absDiff))}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="border border-white/10 bg-black/25 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-fg-primary">Execution quality</p>
              {metrics.expectancy >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-300" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-300" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg Win</p>
                <p className="mt-1 font-bold text-emerald-400">{formatValue(metrics.avgWin)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg Loss</p>
                <p className="mt-1 font-bold text-rose-400">{formatValue(metrics.avgLoss)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Expectancy</p>
                <p className={`mt-1 font-bold ${metrics.expectancy >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatSigned(metrics.expectancy)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Consistency</p>
                <p className="mt-1 font-bold text-cyan-200">{formatValue(metrics.consistencyRate)}%</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { ChevronDown, CircleDot } from "lucide-react"
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
  winningStreak: number
  sumGain: number
  breakEvenRate: number
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

function getWinningStreak(values: number[]) {
  let count = 0
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index]
    if (value > 0) {
      count += 1
      continue
    }
    break
  }
  return count
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
    const sumGain = wins.reduce((acc, value) => acc + value, 0)
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
    const winningStreak = getWinningStreak(pnlValues)
    const breakEvenRate = avgWin + avgLossAbs > 0 ? (avgLossAbs / (avgWin + avgLossAbs)) * 100 : 0

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
      winningStreak,
      sumGain,
      breakEvenRate,
    }
  }, [formattedTrades])

  const radarData = useMemo(() => {
    const baseline = benchmark ?? { riskReward: 0, drawdown: 0, winRate: 0, avgReturn: 0, sampleSize: 0 }
    const totalTradeBaseline = Math.max(20, baseline.sampleSize)
    return [
      { metric: "TOTAL TRADES", trader: scoreHigherBetter(metrics.totalTrades, totalTradeBaseline) },
      { metric: "RISK REWARD", trader: scoreHigherBetter(metrics.riskReward, baseline.riskReward) },
      { metric: "AVG. DRAWDOWN", trader: scoreLowerBetter(metrics.drawdown, baseline.drawdown) },
      { metric: "WIN RATE", trader: scoreHigherBetter(metrics.winRate, baseline.winRate) },
      { metric: "AVG RETURN", trader: scoreSigned(metrics.avgReturn, baseline.avgReturn) },
    ]
  }, [benchmark, metrics.avgReturn, metrics.drawdown, metrics.riskReward, metrics.totalTrades, metrics.winRate])

  const recentTrades = useMemo(() => {
    return [...(formattedTrades || [])]
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 6)
  }, [formattedTrades])

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] overflow-hidden p-3 sm:p-4 lg:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 left-[-8%] h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-28 right-[-6%] h-80 w-80 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <TopNav title="Trader Profile" />

      <div className="relative mt-4 grid gap-3 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-3">
          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-fg-muted">Trader profile</p>
            <p className="mt-2 text-3xl font-semibold text-fg-primary">{profileName}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Trades</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">{metrics.totalTrades}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Current Streak</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">
                  {metrics.winningStreak > 0 ? `${metrics.winningStreak} wins` : "No winning streak"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Net PnL</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">{formatSigned(metrics.netPnl)}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Risk Reward</p>
              <p className="mt-1 text-2xl font-semibold text-fg-primary">{formatValue(metrics.riskReward)}</p>
            </Card>
            <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Max Drawdown</p>
              <p className="mt-1 text-2xl font-semibold text-fg-primary">{formatValue(metrics.drawdown)}</p>
            </Card>
            <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Win Rate</p>
              <p className="mt-1 text-2xl font-semibold text-fg-primary">{formatValue(metrics.winRate)}%</p>
            </Card>
            <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Expectancy</p>
              <p className="mt-1 text-2xl font-semibold text-fg-primary">{formatSigned(metrics.expectancy)}</p>
            </Card>
          </div>

          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-fg-primary">Trade Feed</p>
              <p className="text-xs text-fg-muted">Last {recentTrades.length} trades</p>
            </div>
            {isLoading ? <p className="mb-2 text-xs text-fg-muted">Loading trades...</p> : null}
            <div className="space-y-2">
              {recentTrades.length === 0 ? (
                <p className="text-sm text-fg-muted">No trades available yet.</p>
              ) : (
                recentTrades.map((trade) => {
                  const pnl = Number(trade.pnl || 0)
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`} />
                        <div>
                          <p className="text-sm font-semibold text-fg-primary">{trade.instrument || "N/A"}</p>
                          <p className="text-[11px] text-fg-muted">{new Date(trade.entryDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold ${pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {formatSigned(pnl)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </section>

        <aside className="mx-auto w-full max-w-[430px] space-y-2.5 xl:max-w-none">
          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3.5">
            <div className="flex items-center justify-between text-sm text-fg-muted">
              <span className="inline-flex items-center gap-1">
                Compare with: average user
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px]">{isBenchmarkLoading ? "Loading..." : "Live"}</span>
            </div>
            <div className="mt-2.5 rounded-xl border border-white/10 bg-[hsl(var(--qe-surface-2))] p-2.5">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border) / 0.45)" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
                    />
                    <Radar dataKey="trader" stroke="hsl(var(--foreground) / 0.85)" fill="hsl(var(--foreground) / 0.2)" fillOpacity={1} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg. Win</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatValue(metrics.avgWin)}%</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg. Loss</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatValue(metrics.avgLoss)}%</p>
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg. Return</p>
              <p className="mt-1 text-4xl font-semibold text-fg-primary">{formatValue(Math.abs(metrics.avgReturn))}%</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white/30" style={{ width: `${Math.min(100, Math.max(8, metrics.consistencyRate))}%` }} />
            </div>
          </Card>

          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-fg-muted">Win Rate</p>
            <p className="mt-1 text-4xl font-semibold text-fg-primary">{formatValue(metrics.winRate)}%</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white/40" style={{ width: `${Math.min(100, Math.max(8, metrics.winRate))}%` }} />
            </div>
          </Card>

          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Break Even Rate</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatValue(metrics.breakEvenRate)}%</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Sum Gain</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatValue(metrics.sumGain)}%</p>
              </div>
            </div>
          </Card>

          <Card className="border border-white/10 bg-[hsl(var(--qe-surface-1))] p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-fg-muted">Execution Quality</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg Win</p>
                <p className="mt-1 text-sm font-semibold text-fg-primary">{formatValue(metrics.avgWin)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg Loss</p>
                <p className="mt-1 text-sm font-semibold text-fg-primary">{formatValue(metrics.avgLoss)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Expectancy</p>
                <p className="mt-1 text-sm font-semibold text-fg-primary">{formatSigned(metrics.expectancy)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-2))] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Win Rate</p>
                <p className="mt-1 text-sm font-semibold text-fg-primary">{formatValue(metrics.winRate)}%</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

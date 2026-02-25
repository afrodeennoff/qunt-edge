"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { CalendarIcon, ChevronDown, CircleDot, Zap } from "lucide-react"
import { endOfDay, format, startOfDay, subDays, subMonths, subYears } from "date-fns"
import type { DateRange, DayButtonProps } from "react-day-picker"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"
import { UnifiedPageShell } from "@/components/layout/unified-page-shell"

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
  netPnl: number
  consistencyRate: number
  winningStreak: number
  sumGain: number
  breakEvenRate: number
}

type DateFilterPreset = "last_week" | "last_month" | "last_3_months" | "last_6_months" | "last_year" | "custom"

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

function formatCapitalCompact(value: number) {
  if (!Number.isFinite(value)) return "0"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`
  return `${sign}${abs.toFixed(0)}`
}

function formatPnlCell(value: number) {
  if (!Number.isFinite(value)) return "0"
  // Compact but always signed for quick scanning inside day cells.
  if (value === 0) return "0"
  const sign = value > 0 ? "+" : "-"
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`
  return `${sign}${abs.toFixed(0)}`
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

function isDateWithinRange(value: Date, range?: DateRange) {
  const from = range?.from ? startOfDay(range.from) : undefined
  const to = range?.to ? endOfDay(range.to) : undefined
  if (from && value < from) return false
  if (to && value > to) return false
  return true
}

export default function TraderProfilePage() {
  const { formattedTrades, isLoading, accounts } = useData()
  const user = useUserStore((state) => state.user)
  const supabaseUser = useUserStore((state) => state.supabaseUser)
  const [benchmark, setBenchmark] = useState<BenchmarkMetrics | null>(null)
  const [isBenchmarkLoading, setIsBenchmarkLoading] = useState(true)
  const [dateFilterPreset, setDateFilterPreset] = useState<DateFilterPreset>("last_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | undefined>(undefined)
  const [tradeFeedPage, setTradeFeedPage] = useState(1)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setIsBenchmarkLoading(true)
      try {
        const res = await fetch("/api/trader-profile/benchmark", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })
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
    const timer = window.setInterval(load, 30_000)
    return () => {
      alive = false
      window.clearInterval(timer)
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

  const profileAvatar = useMemo(() => {
    const avatar = supabaseUser?.user_metadata?.avatar_url
    return typeof avatar === "string" && avatar.length > 0 ? avatar : null
  }, [supabaseUser?.user_metadata?.avatar_url])

  const profileInitials = useMemo(() => {
    const parts = profileName
      .split(" ")
      .map((value: string) => value.trim())

      .filter(Boolean)
      .slice(0, 2)
    if (parts.length === 0) return "TR"
    return parts.map((part: string) => part[0]?.toUpperCase() ?? "").join("") || "TR"

  }, [profileName])

  const activeDateRange = useMemo<DateRange | undefined>(() => {
    const now = new Date()
    switch (dateFilterPreset) {
      case "last_week":
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) }
      case "last_month":
        return { from: startOfDay(subMonths(now, 1)), to: endOfDay(now) }
      case "last_3_months":
        return { from: startOfDay(subMonths(now, 3)), to: endOfDay(now) }
      case "last_6_months":
        return { from: startOfDay(subMonths(now, 6)), to: endOfDay(now) }
      case "last_year":
        return { from: startOfDay(subYears(now, 1)), to: endOfDay(now) }
      case "custom":
        return customDateRange
      default:
        return undefined
    }
  }, [customDateRange, dateFilterPreset])

  const filteredTrades = useMemo(() => {
    const trades = formattedTrades || []
    const from = activeDateRange?.from ? startOfDay(activeDateRange.from) : undefined
    const to = activeDateRange?.to ? endOfDay(activeDateRange.to) : undefined
    if (!from && !to) return trades
    return trades.filter((trade) => {
      const entry = new Date(trade.entryDate)
      if (Number.isNaN(entry.getTime())) return false
      if (from && entry < from) return false
      if (to && entry > to) return false
      return true
    })
  }, [activeDateRange?.from, activeDateRange?.to, formattedTrades])

  const dateFilterLabel = useMemo(() => {
    if (dateFilterPreset !== "custom") return null
    if (customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, "MMM d, yyyy")} - ${format(customDateRange.to, "MMM d, yyyy")}`
    }
    if (customDateRange?.from) {
      return format(customDateRange.from, "MMM d, yyyy")
    }
    return "Pick date range"
  }, [customDateRange?.from, customDateRange?.to, dateFilterPreset])

  const metrics = useMemo<TraderMetrics>(() => {
    const trades = filteredTrades || []
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
      netPnl: cumulativePnl,
      consistencyRate,
      winningStreak,
      sumGain,
      breakEvenRate,
    }
  }, [filteredTrades])

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

  const closedTrades = useMemo(() => {
    return [...(filteredTrades || [])]
      .filter((trade) => {
        const closeDate = (trade as { closeDate?: string | Date | null }).closeDate
        if (!closeDate) return false
        const parsed = new Date(closeDate)
        return !Number.isNaN(parsed.getTime())
      })
      .sort((a, b) => {
        const closeA = new Date((a as { closeDate?: string | Date | null }).closeDate as string | Date).getTime()
        const closeB = new Date((b as { closeDate?: string | Date | null }).closeDate as string | Date).getTime()
        return closeB - closeA
      })
  }, [filteredTrades])

  const tradesPerPage = 5
  const tradeFeedTotalPages = Math.max(1, Math.ceil(closedTrades.length / tradesPerPage))
  const paginatedClosedTrades = useMemo(() => {
    const start = (tradeFeedPage - 1) * tradesPerPage
    return closedTrades.slice(start, start + tradesPerPage)
  }, [closedTrades, tradeFeedPage])

  const totalWithdrawAllAccounts = useMemo(() => {
    return (accounts || []).reduce((accountSum, account) => {
      const accountWithdraw = (account.payouts || [])
        .filter((payout) => {
          if (payout.status !== "PAID") return false
          const payoutDate = new Date(payout.date)
          if (Number.isNaN(payoutDate.getTime())) return false
          return isDateWithinRange(payoutDate, activeDateRange)
        })
        .reduce((withdrawSum, payout) => withdrawSum + Number(payout.amount || 0), 0)
      return accountSum + accountWithdraw
    }, 0)
  }, [accounts, activeDateRange])

  const totalCapitalAllAccounts = useMemo(() => {
    const openingCapital = (accounts || []).reduce((sum, account) => sum + Number(account.startingBalance || 0), 0)
    const filteredTradingPnl = (filteredTrades || []).reduce(
      (sum, trade) => sum + Number(trade.pnl || 0) - Number(trade.commission || 0),
      0,
    )
    return openingCapital + filteredTradingPnl - totalWithdrawAllAccounts
  }, [accounts, filteredTrades, totalWithdrawAllAccounts])

  const activeAccountsCount = useMemo(() => {
    return (accounts || []).filter((account) => Boolean(account.number)).length
  }, [accounts])

  const tradeCalendarDays = useMemo(() => {
    const byDay = new Map<string, Date>()
      ; (filteredTrades || []).forEach((trade) => {
        const date = new Date(trade.entryDate)
        if (Number.isNaN(date.getTime())) return
        const key = date.toISOString().slice(0, 10)
        if (!byDay.has(key)) byDay.set(key, new Date(date.getFullYear(), date.getMonth(), date.getDate()))
      })
    return Array.from(byDay.values()).sort((a, b) => a.getTime() - b.getTime())
  }, [filteredTrades])

  const tradePnlByDay = useMemo(() => {
    const map = new Map<string, number>()
      ; (filteredTrades || []).forEach((trade) => {
        const date = new Date(trade.entryDate)
        if (Number.isNaN(date.getTime())) return
        const key = date.toISOString().slice(0, 10)
        const prev = map.get(key) ?? 0
        const net = Number(trade.pnl || 0) - Number(trade.commission || 0)
        map.set(key, prev + net)
      })
    return map
  }, [filteredTrades])

  const positivePnlDays = useMemo(() => {
    return tradeCalendarDays.filter((day) => {
      const key = day.toISOString().slice(0, 10)
      return (tradePnlByDay.get(key) ?? 0) > 0
    })
  }, [tradeCalendarDays, tradePnlByDay])

  const negativePnlDays = useMemo(() => {
    return tradeCalendarDays.filter((day) => {
      const key = day.toISOString().slice(0, 10)
      return (tradePnlByDay.get(key) ?? 0) < 0
    })
  }, [tradeCalendarDays, tradePnlByDay])

  const latestTradeDay = tradeCalendarDays.length > 0 ? tradeCalendarDays[tradeCalendarDays.length - 1] : undefined
  const winRateGuidePercent = Math.min(30, Math.max(25, 100 - metrics.winRate))
  const selectedPnl = useMemo(() => {
    const target = selectedCalendarDay ?? latestTradeDay
    if (!target) return 0
    const key = target.toISOString().slice(0, 10)
    return tradePnlByDay.get(key) ?? 0
  }, [latestTradeDay, selectedCalendarDay, tradePnlByDay])

  useEffect(() => {
    // Keep the selection stable and in-range when the date filter changes.
    const hasSelection = Boolean(selectedCalendarDay)
    const selectionInRange = selectedCalendarDay ? isDateWithinRange(selectedCalendarDay, activeDateRange) : false
    if ((!hasSelection || !selectionInRange) && latestTradeDay) {
      setSelectedCalendarDay(latestTradeDay)
    }
  }, [activeDateRange, latestTradeDay, selectedCalendarDay])

  useEffect(() => {
    setTradeFeedPage(1)
  }, [dateFilterPreset, customDateRange?.from, customDateRange?.to, closedTrades.length])

  return (
    <UnifiedPageShell widthClassName="max-w-[1600px]" density="compact">
      <div className="mx-auto grid w-full gap-3 sm:gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-3 sm:space-y-4">
          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border border-white/10 bg-white/5 shadow-xl ring-2 ring-white/5 transition-transform duration-500 hover:scale-105 hover:ring-primary/30">
                <AvatarImage src={profileAvatar ?? undefined} alt={`${profileName} avatar`} />
                <AvatarFallback className="bg-white/10 text-sm font-semibold text-fg-primary">
                  {profileInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[2.25rem] font-bold leading-tight text-white">{profileName}</p>
                <p className="mt-1 text-sm text-fg-muted">{activeAccountsCount} active accounts</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg-primary">
                    <Zap className="h-3 w-3" />
                    Trader Profile
                  </span>
                  <span className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg-primary">
                    Total Trades {metrics.totalTrades}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg-primary">
                    Withdraw {formatValue(totalWithdrawAllAccounts, 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/35 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Trades</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">{metrics.totalTrades}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Current Streak</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">
                  {metrics.winningStreak > 0 ? `${metrics.winningStreak} wins` : "No winning streak"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Net PnL</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">{formatSigned(metrics.netPnl)}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-2">
            <Card className="border border-white/10 bg-black/40 p-2.5 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Risk Reward</p>
              <p className="mt-1 text-2xl font-semibold text-fg-primary">{formatValue(metrics.riskReward)}</p>
            </Card>
            <Card className="border border-white/10 bg-black/40 p-2.5 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Max Drawdown</p>
              <p className="mt-1 text-2xl font-semibold text-fg-primary">{formatValue(metrics.drawdown)}</p>
            </Card>
          </div>

          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="mb-2 rounded-lg border border-white/10 bg-black/35 p-2.5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Date Filter</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    value={dateFilterPreset}
                    onValueChange={(value: DateFilterPreset) => setDateFilterPreset(value)}
                  >
                    <SelectTrigger className="h-9 w-full border-white/15 bg-[hsl(var(--qe-surface-1))] text-xs text-fg-primary sm:w-[210px]">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                      <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 justify-start border-white/15 bg-[hsl(var(--qe-surface-1))] text-xs text-fg-primary hover:bg-white/10"
                      >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {dateFilterLabel ?? "Custom Range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-white/15 bg-[hsl(var(--qe-surface-1))] p-2" align="start">
                      <Calendar
                        mode="range"
                        selected={customDateRange}
                        onSelect={setCustomDateRange}
                        numberOfMonths={2}
                        className="p-0"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-fg-primary">PnL Calendar</p>
              <div className="flex items-center gap-3 text-xs text-fg-muted">
                <span>{tradeCalendarDays.length} active days</span>
                {activeDateRange?.from ? (
                  <span className="hidden sm:inline">
                    {format(activeDateRange.from, "MMM d")}{" "}
                    {activeDateRange?.to ? `- ${format(activeDateRange.to, "MMM d")}` : ""}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/35 p-1.5">
              <Calendar
                mode="single"
                selected={selectedCalendarDay ?? latestTradeDay}
                onSelect={setSelectedCalendarDay}
                defaultMonth={selectedCalendarDay ?? latestTradeDay}
                modifiers={{
                  positive: positivePnlDays,
                  negative: negativePnlDays,
                }}
                modifiersClassNames={{
                  positive: "bg-emerald-400/20 text-emerald-100",
                  negative: "bg-rose-400/20 text-rose-100",
                }}
                className="w-full p-0"
                classNames={{
                  months: "flex flex-col gap-2",
                  month: "space-y-2",
                  weekday: "w-10 text-center text-[0.75rem] font-medium text-fg-muted",
                  day: "relative h-10 w-10 overflow-hidden rounded-md p-0 text-center align-middle",
                  day_button:
                    "h-10 w-10 rounded-md p-0 font-normal text-fg-primary hover:bg-white/10 aria-selected:bg-white/15 aria-selected:text-fg-primary",
                }}
                components={{
                  DayButton: ({ day, className, ...buttonProps }: DayButtonProps) => {
                    const date = day.date
                    const displayMonth = day.displayMonth
                    if (date.getMonth() !== displayMonth.getMonth()) {
                      return (
                        <button
                          type="button"
                          {...buttonProps}
                          className={className}
                        >
                          <span className="text-[11px] text-fg-muted">{format(date, "d")}</span>
                        </button>
                      )
                    }
                    const key = date.toISOString().slice(0, 10)
                    const pnl = tradePnlByDay.get(key) ?? 0
                    const hasTrade = tradePnlByDay.has(key)
                    const tint =
                      pnl > 0 ? "text-emerald-200" : pnl < 0 ? "text-rose-200" : hasTrade ? "text-fg-primary" : "text-fg-muted"

                    return (
                      <button
                        type="button"
                        {...buttonProps}
                        className={className}
                      >
                        <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
                          <span className="text-[11px] leading-none">{format(date, "d")}</span>
                          <span className={`text-[9px] font-semibold leading-none ${tint}`}>
                            {hasTrade ? formatPnlCell(pnl) : ""}
                          </span>
                        </div>
                      </button>
                    )
                  },
                }}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 px-1 text-[11px] text-fg-muted">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400/50" />
                  Profit
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-400/50" />
                  Loss
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  No trades
                </span>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-white/10 bg-black/35 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs text-fg-muted">Selected Day</p>
                <p className="truncate text-xs font-semibold text-fg-primary">
                  {selectedCalendarDay ? format(selectedCalendarDay, "EEE, MMM d") : latestTradeDay ? format(latestTradeDay, "EEE, MMM d") : "—"}
                </p>
              </div>
              <p className={`text-sm font-semibold ${selectedPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {formatSigned(selectedPnl)}
              </p>
            </div>
          </Card>

          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-fg-primary">Trade Feed</p>
              <p className="text-xs text-fg-muted">
                Closed trades {closedTrades.length === 0 ? "0" : `${(tradeFeedPage - 1) * tradesPerPage + 1}-${Math.min(tradeFeedPage * tradesPerPage, closedTrades.length)}`} of {closedTrades.length}
              </p>
            </div>
            {isLoading ? <p className="mb-2 text-xs text-fg-muted">Loading trades...</p> : null}
            <div className="space-y-1.5">
              {paginatedClosedTrades.length === 0 ? (
                <p className="text-sm text-fg-muted">No closed trades in this range.</p>
              ) : (
                paginatedClosedTrades.map((trade) => {
                  const pnl = Number(trade.pnl || 0)
                  const closeDate = (trade as { closeDate?: string | Date | null }).closeDate
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-black/35 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`} />
                        <div>
                          <p className="text-sm font-semibold text-fg-primary">{trade.instrument || "N/A"}</p>
                          <p className="text-[11px] text-fg-muted">
                            Closed {closeDate ? new Date(closeDate).toLocaleString() : new Date(trade.entryDate).toLocaleString()}
                          </p>
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
            {closedTrades.length > tradesPerPage ? (
              <div className="mt-3 rounded-lg border border-white/10 bg-black/35 px-1.5 py-1">
                <Pagination className="justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          setTradeFeedPage((current) => Math.max(1, current - 1))
                        }}
                        className={tradeFeedPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive size="default" className="min-w-20">
                        {tradeFeedPage} / {tradeFeedTotalPages}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          setTradeFeedPage((current) => Math.min(tradeFeedTotalPages, current + 1))
                        }}
                        className={tradeFeedPage >= tradeFeedTotalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null}
          </Card>
        </section>

        <aside className="mx-auto w-full max-w-[430px] space-y-2 xl:max-w-none">
          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-fg-muted">
              <span className="inline-flex items-center gap-1">
                Compare with: average user
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px]">{isBenchmarkLoading ? "Loading..." : "Live"}</span>
            </div>
            <div className="mt-2.5 rounded-xl border border-white/10 bg-black/35 p-2.5">
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

          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Capital</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatCapitalCompact(totalCapitalAllAccounts)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Withdraw</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatCapitalCompact(totalWithdrawAllAccounts)}</p>
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-white/10 bg-black/35 p-3">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Avg. Return</p>
              <p className="mt-1 text-4xl font-semibold text-fg-primary">{formatValue(Math.abs(metrics.avgReturn))}%</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white/30" style={{ width: `${Math.min(100, Math.max(8, metrics.consistencyRate))}%` }} />
            </div>
          </Card>

          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-fg-muted">Win Rate</p>
            <p className="mt-1 text-4xl font-semibold text-fg-primary">{formatValue(metrics.winRate)}%</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white/35" style={{ width: `${Math.min(100, Math.max(8, metrics.winRate))}%` }} />
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white/20" style={{ width: `${winRateGuidePercent}%` }} />
              </div>
            </div>
          </Card>

          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Trades</p>
              <span className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-primary">
                Serial Trader
              </span>
            </div>
            <p className="mt-1 text-4xl font-semibold text-fg-primary">{metrics.totalTrades}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white/35" style={{ width: `${Math.min(100, Math.max(8, metrics.totalTrades))}%` }} />
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white/20" style={{ width: `${Math.min(100, Math.max(8, 100 - Math.min(100, metrics.totalTrades)))}%` }} />
              </div>
            </div>
          </Card>

          <Card className="border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Break Even Rate</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatValue(metrics.breakEvenRate)}%</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Sum Gain</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatValue(metrics.sumGain)}%</p>
              </div>
            </div>
          </Card>

          <button
            type="button"
            className="w-full rounded-lg border border-white/10 bg-[hsl(var(--qe-surface-1))] py-3 text-sm font-semibold text-fg-primary transition-colors hover:bg-[hsl(var(--qe-surface-2))]"
          >
            Show All Stats
          </button>
        </aside>
      </div>
    </UnifiedPageShell>
  )
}

"use client"

import { useData } from "@/context/data-provider"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingDown, TrendingUp, Target, Zap } from "lucide-react"
import { startOfDay, isWithinInterval, endOfDay, parseISO } from "date-fns"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
})

type PnLSummaryProps = {
  className?: string
}

export function PnLSummary({ className }: PnLSummaryProps) {
  const { calendarData, statistics } = useData()

  const stats = useMemo(() => {
    const now = new Date()
    const daily = { pnl: 0, wins: 0, total: 0 }
    const startDay = startOfDay(now)
    const endDay = endOfDay(now)

    Object.entries(calendarData ?? {}).forEach(([dateStr, data]) => {
      const dayData = data as unknown as { pnl?: number; trades?: Array<{ pnl?: number }> }
      const date = parseISO(dateStr)
      if (!isWithinInterval(date, { start: startDay, end: endDay })) return

      daily.pnl += dayData.pnl ?? 0
      for (const trade of dayData.trades ?? []) {
        daily.total += 1
        if ((trade.pnl || 0) > 0) {
          daily.wins += 1
        }
      }
    })

    const winRate = daily.total > 0 ? Math.round((daily.wins / daily.total) * 100) : 0
    return { daily, winRate }
  }, [calendarData])

  const isPositive = stats.daily.pnl >= 0
  const longTermWinRate = typeof statistics?.winRate === "number" ? Math.round(statistics.winRate) : null

  const summaryItems: Array<{
    label: string
    value: string
    icon: LucideIcon
    accent?: string
  }> = [
      {
        label: "Today's PnL",
        value: currencyFormatter.format(stats.daily.pnl),
        icon: isPositive ? TrendingUp : TrendingDown,
        accent: isPositive ? "metric-positive" : "metric-negative",
      },
      {
        label: "Win Rate",
        value: `${stats.winRate}%`,
        icon: Target,
      },
      {
        label: "Trades",
        value: stats.daily.total.toString(),
        icon: Zap,
      },
      {
        label: "Avg. Daily",
        value: longTermWinRate !== null ? `${longTermWinRate}%` : "—",
        icon: TrendingUp,
      },
    ]

  return (
    <div
      aria-live="polite"
      aria-label="Daily PnL quick summary"
      className={cn(
        "grid w-full grid-cols-2 gap-4 liquid-panel p-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 shadow-2xl sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {summaryItems.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5 min-w-[100px] group">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
            {item.label}
          </span>
          <div className="flex items-center gap-2">
            <item.icon
              className={cn("h-4 w-4 flex-shrink-0 transition-all group-hover:scale-110", item.accent ?? "text-white/60")}
            />
            <span className={cn("text-[16px] leading-none font-terminal", item.accent ?? "text-white/80")}>{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

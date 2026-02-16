'use client'

import React, { useMemo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import MobileCalendarPnl from "./mobile-calendar";
import DesktopCalendarPnl from "./desktop-calendar";
import { useData } from "@/context/data-provider";
import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import { Activity, CalendarDays, TrendingDown, TrendingUp } from "lucide-react";

export default function CalendarPnl() {
  const { calendarData } = useData()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const t = useI18n()

  const stats = useMemo(() => {
    const entries = Object.values(calendarData ?? {})
    const activeDays = entries.filter((entry) => entry.trades.length > 0).length
    const greenDays = entries.filter((entry) => entry.pnl > 0).length
    const redDays = entries.filter((entry) => entry.pnl < 0).length
    const totalPnl = entries.reduce((sum, entry) => sum + entry.pnl, 0)

    return { activeDays, greenDays, redDays, totalPnl }
  }, [calendarData])

  const statCards = [
    {
      label: t("calendar.charts.trades"),
      value: stats.activeDays,
      icon: CalendarDays,
    },
    {
      label: t("calendar.charts.weeklyMaxProfit"),
      value: stats.greenDays,
      icon: TrendingUp,
    },
    {
      label: t("calendar.charts.weeklyMaxDrawdown"),
      value: stats.redDays,
      icon: TrendingDown,
    },
  ]

  return (
    <section className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/12 bg-[linear-gradient(155deg,rgba(255,255,255,0.12)_0%,rgba(9,9,11,0.97)_38%,rgba(9,9,11,1)_100%)] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <header className="border-b border-white/10 px-4 pb-3 pt-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Performance Calendar</p>
              <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">Calendar</h3>
            </div>
            <div className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
              stats.totalPnl >= 0
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/70"
            )}>
              <Activity className="h-3.5 w-3.5" />
              <span className="font-medium">{stats.totalPnl >= 0 ? "+" : "-"}${Math.abs(stats.totalPnl).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            {statCards.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-2 sm:px-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">{item.label}</span>
                  <item.icon className="h-3.5 w-3.5 text-white/70" />
                </div>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="min-h-0 flex-1 p-2 sm:p-3">
          <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-black/35 backdrop-blur-sm">
            {isMobile ? (
              <MobileCalendarPnl calendarData={calendarData} />
            ) : (
              <DesktopCalendarPnl calendarData={calendarData} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

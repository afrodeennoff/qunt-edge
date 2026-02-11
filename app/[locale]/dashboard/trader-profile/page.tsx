"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardTopNav } from "../components/top-nav"
import { ProfileHero } from "../components/trader-profile/profile-hero"
import { TradeFeed } from "../components/trader-profile/trade-feed"
import { StatsRadarCard } from "../components/trader-profile/stats-radar-card"
import { StatsMetricStack } from "../components/trader-profile/stats-metric-stack"
import { StatsProgressCard } from "../components/trader-profile/stats-progress-card"
import type { TraderBenchmark, TraderProfile, TradeItem, TraderStats } from "../types/trader-profile"
import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"

export default function TraderProfilePage() {
  const { formattedTrades, accounts, statistics, isLoading } = useData()
  const user = useUserStore((state) => state.user)
  const supabaseUser = useUserStore((state) => state.supabaseUser)
  const [benchmark, setBenchmark] = useState<TraderBenchmark | null>(null)
  const [isBenchmarkLoading, setIsBenchmarkLoading] = useState(true)

  const trades = useMemo<TradeItem[]>(() => {
    return (formattedTrades || []).slice(0, 20).map((trade) => {
      const ratio = trade.commission && trade.commission > 0 ? Math.abs(trade.pnl / trade.commission) : 0
      return {
        id: trade.id,
        symbol: trade.instrument || "N/A",
        date: new Date(trade.entryDate).toLocaleString(),
        risk: Math.abs(trade.pnl) > 500 ? "High" : Math.abs(trade.pnl) > 100 ? "Medium" : "Low",
        ratio: Number.isFinite(ratio) ? Number(ratio.toFixed(2)) : 0,
        pnl: Number(trade.pnl || 0),
        status: trade.closeDate ? "CLOSED" : "OPEN",
      }
    })
  }, [formattedTrades])

  const stats = useMemo<TraderStats>(() => {
    const pnlValues = (formattedTrades || []).map((trade) => Number(trade.pnl || 0))
    const wins = pnlValues.filter((value) => value > 0)
    const losses = pnlValues.filter((value) => value < 0)
    const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
    const avgLossAbs = losses.length ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0
    const riskReward = avgLossAbs > 0 ? avgWin / avgLossAbs : 0
    const breakEvenRate =
      statistics.nbTrades > 0 ? (statistics.nbBe / statistics.nbTrades) * 100 : 0
    const serialTraderScore = Math.min(
      100,
      Math.round((statistics.winRate || 0) * 0.6 + (statistics.profitFactor || 0) * 12),
    )
    const sortedTrades = [...(formattedTrades || [])].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    )
    let runningPnl = 0
    let peakPnl = 0
    let maxDrawdown = 0
    for (const trade of sortedTrades) {
      const netPnl = Number(trade.pnl || 0) - Number(trade.commission || 0)
      runningPnl += netPnl
      peakPnl = Math.max(peakPnl, runningPnl)
      maxDrawdown = Math.max(maxDrawdown, peakPnl - runningPnl)
    }

    return {
      avgWin: Number(avgWin.toFixed(2)),
      avgLoss: Number(avgLossAbs.toFixed(2)),
      avgReturn:
        statistics.nbTrades > 0
          ? Number(((statistics.cumulativePnl || 0) / statistics.nbTrades).toFixed(2))
          : 0,
      winRate: Number((statistics.winRate || 0).toFixed(2)),
      riskReward: Number(riskReward.toFixed(2)),
      drawdown: Number(maxDrawdown.toFixed(2)),
      totalTrades: statistics.nbTrades || 0,
      breakEvenRate: Number(breakEvenRate.toFixed(2)),
      sumGain: Number((statistics.cumulativePnl || 0).toFixed(2)),
      serialTraderScore,
    }
  }, [formattedTrades, statistics])

  useEffect(() => {
    let active = true
    const loadBenchmark = async () => {
      setIsBenchmarkLoading(true)
      try {
        const response = await fetch("/api/trader-profile/benchmark", {
          method: "GET",
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error(`Benchmark request failed: ${response.status}`)
        }
        const payload = (await response.json()) as { benchmark?: TraderBenchmark }
        if (active) {
          setBenchmark(payload.benchmark ?? null)
        }
      } catch (error) {
        console.error("[TraderProfile] failed to load benchmark", error)
        if (active) {
          setBenchmark(null)
        }
      } finally {
        if (active) {
          setIsBenchmarkLoading(false)
        }
      }
    }

    loadBenchmark()
    return () => {
      active = false
    }
  }, [])

  const profile = useMemo<TraderProfile>(() => {
    const name =
      supabaseUser?.user_metadata?.full_name ||
      supabaseUser?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      supabaseUser?.email?.split("@")[0] ||
      "Trader"
    return {
      name,
      linkedAccounts: accounts?.length || 0,
      totalTrades: statistics.nbTrades || 0,
      tier: (statistics.winRate || 0) >= 60 ? "TOP TIER" : "ACTIVE",
      style: (statistics.profitFactor || 0) >= 1.5 ? "SERIAL TRADER" : "DISCIPLINED",
      avatar:
        supabaseUser?.user_metadata?.avatar_url ||
        "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=200&q=80",
    }
  }, [accounts?.length, statistics.nbTrades, statistics.profitFactor, statistics.winRate, supabaseUser?.email, supabaseUser?.user_metadata?.avatar_url, supabaseUser?.user_metadata?.full_name, supabaseUser?.user_metadata?.name, user?.email])

  return (
    <div className="dashboard-shell">
      <div className="section-stack p-3 sm:p-4 lg:p-5">
        <DashboardTopNav
          title="Trader Profile"
          showTitle={false}
          showNavLinks={false}
          showUserProfile={false}
        />

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <section className="space-y-4">
            <ProfileHero profile={profile} />
            {isLoading ? (
              <div className="surface-frame text-ui-body text-muted-foreground">
                Loading user trades...
              </div>
            ) : null}
            <TradeFeed trades={trades} />
          </section>

          <aside className="space-y-4">
            <StatsRadarCard stats={stats} benchmark={benchmark} isBenchmarkLoading={isBenchmarkLoading} />
            <StatsMetricStack stats={stats} />
            <StatsProgressCard stats={stats} />
          </aside>
        </div>
      </div>
    </div>
  )
}

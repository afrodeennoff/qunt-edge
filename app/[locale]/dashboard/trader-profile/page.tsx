"use client"

import { DashboardTopNav } from "../components/top-nav"
import { ProfileHero } from "../components/trader-profile/profile-hero"
import { TradeFeed } from "../components/trader-profile/trade-feed"
import { StatsRadarCard } from "../components/trader-profile/stats-radar-card"
import { StatsMetricStack } from "../components/trader-profile/stats-metric-stack"
import { StatsProgressCard } from "../components/trader-profile/stats-progress-card"
import type { TraderProfile, TradeItem, TraderStats } from "../types/trader-profile"

const profile: TraderProfile = {
  name: "glitchspx",
  subscribers: 59,
  tier: "TOP 8",
  style: "SERIAL TRADER",
  avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=200&q=80",
}

const trades: TradeItem[] = [
  {
    id: "msft",
    symbol: "MSFT",
    date: "7/17/25 22c @1.97",
    risk: "Degen",
    ratio: 0.63,
    pnlPct: 10,
    status: "OPEN",
  },
  {
    id: "aapl",
    symbol: "AAPL",
    date: "7/13/25 19c @1.91",
    risk: "Degen",
    ratio: 0.71,
    pnlPct: -10,
    status: "OPEN",
  },
  {
    id: "nvda",
    symbol: "NVDA",
    date: "6/30/25 28c @1.84",
    risk: "Degen",
    ratio: 0.69,
    pnlPct: 10,
    status: "OPEN",
  },
]

const stats: TraderStats = {
  avgWin: 80.21,
  avgLoss: 15.94,
  avgReturn: 29.98,
  winRate: 68.75,
  totalTrades: 80,
  breakEvenRate: 50.94,
  sumGain: 2451.7,
  serialTraderScore: 88,
}

export default function TraderProfilePage() {
  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] p-3 sm:p-4 lg:p-6">
      <div className="rounded-[28px] border border-border/70 bg-[hsl(var(--qe-surface-0))]/95 p-3 shadow-sm backdrop-blur-sm sm:p-4 lg:p-5">
        <DashboardTopNav title="Trader Profile" />

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <section className="space-y-4">
            <ProfileHero profile={profile} />
            <TradeFeed trades={trades} />
          </section>

          <aside className="space-y-4">
            <StatsRadarCard />
            <StatsMetricStack stats={stats} />
            <StatsProgressCard stats={stats} />
          </aside>
        </div>
      </div>
    </div>
  )
}

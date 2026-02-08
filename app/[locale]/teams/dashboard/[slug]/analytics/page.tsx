'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, Target, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getTeamAnalyticsDataAction } from '../../../actions/analytics'
import { useUserStore } from '@/store/user-store'

type TeamMemberPerformance = {
  userId: string
  email: string
  totalPnL: number
  winRate: number
  totalTrades: number
}

type TeamChartPoint = {
  date: string
  dailyPnL: number
  cumulativePnL: number
}

type TeamAnalytics = {
  winRate?: number
  totalTrades?: number
  profitFactor?: number
  totalPnL?: number
}

type AnalyticsData = {
  analytics: TeamAnalytics
  membersPerformance: TeamMemberPerformance[]
  chartData: TeamChartPoint[]
}

function formatCurrency(value: number): string {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length || !label) {
    return null
  }

  const value = payload[0]?.value ?? 0

  return (
    <div className="rounded-xl border border-border/70 bg-popover/95 p-3 shadow-lg backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <p className={cn('mt-1 text-sm font-black', value >= 0 ? 'text-primary' : 'text-destructive')}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

export default function TeamAnalyticsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { user } = useUserStore()

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!slug || !user?.id) {
        return
      }

      setLoading(true)
      try {
        const result = await getTeamAnalyticsDataAction(slug, user.id)
        if (result.success && result.data) {
          setData(result.data as AnalyticsData)
        }
      } catch (error) {
        console.error('Failed to fetch team analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, user?.id])

  const summary = useMemo(() => {
    return {
      totalPnL: data?.analytics?.totalPnL ?? data?.chartData?.at(-1)?.cumulativePnL ?? 0,
      winRate: data?.analytics?.winRate ?? 0,
      trades: data?.analytics?.totalTrades ?? 0,
      profitFactor: data?.analytics?.profitFactor ?? 0,
    }
  }, [data])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-2xl border border-border/70 bg-card/70" />
        <div className="h-80 animate-pulse rounded-2xl border border-border/70 bg-card/70" />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BarChart3 className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Team Intelligence</p>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Monitor collective performance and individual consistency to improve team execution quality.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Total PnL</CardDescription>
            <CardTitle className={cn('text-xl', summary.totalPnL >= 0 ? 'text-primary' : 'text-destructive')}>
              {formatCurrency(summary.totalPnL)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-xl">{summary.winRate.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Total Trades</CardDescription>
            <CardTitle className="text-xl">{summary.trades}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Profit Factor</CardDescription>
            <CardTitle className="text-xl">{summary.profitFactor.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="border-border/70 bg-card/70 xl:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg">Cumulative Equity</CardTitle>
            <CardDescription>Rolling team performance over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] sm:h-[380px]">
            {data?.chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="teamPnlFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulativePnL"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#teamPnlFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No equity data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Member Breakdown</CardTitle>
            <CardDescription>Per-trader contribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.membersPerformance?.length ? (
              data.membersPerformance.slice(0, 8).map((member) => (
                <div key={member.userId} className="rounded-xl border border-border/70 bg-background/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{member.email.split('@')[0]}</p>
                    <p className={cn('text-sm font-black', member.totalPnL >= 0 ? 'text-primary' : 'text-destructive')}>
                      {formatCurrency(member.totalPnL)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {member.winRate.toFixed(1)}%
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {member.totalTrades} trades
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No member activity data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Review traders with low win-rate but high trade frequency first. This usually reveals process drift before it becomes a drawdown event.
        </CardContent>
      </Card>
    </section>
  )
}

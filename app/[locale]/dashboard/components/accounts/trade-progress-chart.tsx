'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { useMemo } from "react"
import { Account } from "@/lib/data-types"
import { useTradesStore } from "@/store/trades-store"

// Add interface for event type
interface ChartEvent {
  date: Date
  amount: number
  isPayout: boolean
  isReset?: boolean
  payoutStatus?: string
}

interface ChartDataPoint {
  tradeIndex: number
  date: string
  balance: number
  drawdownLevel: number
  highestBalance: number
  target: number
  pnl: number
  isPayout?: boolean
  isReset?: boolean
  payoutStatus?: string
  payoutAmount: number
}

interface TradeProgressChartProps {
  account: Account
  className?: string
}

export function TradeProgressChart({
  account,
  className
}: TradeProgressChartProps) {
  const t = useI18n()

  // Prefer filtered trades from account (buffer-aware), fallback to store
  const allTrades = useTradesStore(state => state.trades)
  const trades = useMemo(() => {
    if (account.trades && account.trades.length > 0) return account.trades
    return allTrades.filter(trade => trade.accountNumber === account.number)
  }, [allTrades, account.trades, account.number])

  const chartConfig = {
    balance: {
      label: t('propFirm.chart.balance'),
      color: "white",
    },
    drawdown: {
      label: t('propFirm.chart.drawdownLevel'),
      color: "rgba(255,255,255,0.3)",
    },
    target: {
      label: t('propFirm.chart.profitTarget'),
      color: "rgba(255,255,255,0.15)",
    },
    payout: {
      label: t('propFirm.chart.payout'),
      color: "rgba(255,255,255,0.5)",
    }
  }

  // Extract account properties
  const {
    startingBalance,
    drawdownThreshold,
    profitTarget,
    trailingDrawdown = false,
    trailingStopProfit,
    payouts = [],
    resetDate
  } = account

  // Create combined events array with trades, payouts, and resets
  const allEvents: ChartEvent[] = [
    ...trades.map(trade => ({
      date: new Date(trade.entryDate),
      amount: Number(trade.pnl) - Number(trade.commission || 0),
      isPayout: false,
      isReset: false
    })),
    ...payouts.map(payout => ({
      date: new Date(payout.date),
      amount: ['PENDING', 'VALIDATED', 'PAID'].includes(payout.status) ? -payout.amount : 0,
      isPayout: true,
      isReset: false,
      payoutStatus: payout.status
    })),
    ...(resetDate ? [{
      date: new Date(resetDate),
      amount: 0, // Reset doesn't change balance directly, it sets it to starting balance
      isPayout: false,
      isReset: true
    }] : [])
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Process events to create chart data
  const chartData = allEvents.reduce((acc, event, index) => {
    let balance: number
    let highestBalance: number

    if (event.isReset) {
      // Reset the balance to starting balance
      balance = startingBalance
      highestBalance = startingBalance
    } else {
      const prevBalance = index > 0 ? acc[index - 1].balance : startingBalance
      balance = prevBalance + event.amount

      // Calculate highest balance up to this point
      const previousHighest = index > 0 ? acc[index - 1].highestBalance : startingBalance
      highestBalance = event.isPayout ? previousHighest : Math.max(previousHighest, balance)
    }

    // Calculate drawdown level based on trailing or fixed drawdown
    let drawdownLevel
    if (trailingDrawdown) {
      const profitMade = Math.max(0, highestBalance - startingBalance)

      // If we've hit trailing stop profit, lock the drawdown to that level
      if (trailingStopProfit && profitMade >= trailingStopProfit) {
        drawdownLevel = (startingBalance + trailingStopProfit) - drawdownThreshold
      } else {
        // Otherwise, drawdown level trails the highest balance
        drawdownLevel = highestBalance - drawdownThreshold
      }
    } else {
      // Fixed drawdown - always relative to starting balance
      drawdownLevel = startingBalance - drawdownThreshold
    }

    return [...acc, {
      tradeIndex: index + 1,
      date: event.date.toLocaleDateString(),
      balance,
      drawdownLevel,
      highestBalance,
      target: startingBalance + profitTarget,
      pnl: event.isReset ? 0 : (event.isPayout ? 0 : event.amount),
      isPayout: event.isPayout,
      isReset: event.isReset,
      payoutStatus: event.payoutStatus,
      payoutAmount: event.isPayout ? -event.amount : 0
    }]
  }, [] as ChartDataPoint[])

  const getPayoutColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'rgba(255,255,255,0.4)'
      case 'VALIDATED': return 'rgba(255,255,255,0.7)'
      case 'REFUSED': return 'rgba(255,255,255,0.2)'
      case 'PAID': return 'rgba(255,255,255,1)'
      default: return 'rgba(255,255,255,0.4)'
    }
  }

  const renderDot = (props: any) => {
    const { cx, cy, payload, index } = props
    if (typeof cx !== 'number' || typeof cy !== 'number') {
      return <circle key={`dot-${index}-empty`} cx={cx} cy={cy} r={0} fill="none" />
    }

    if (payload?.isReset) {
      return (
        <circle
          key={`dot-${index}-reset`}
          cx={cx}
          cy={cy}
          r={5}
          fill="white"
          stroke="black"
          strokeWidth={2}
        />
      )
    }

    if (payload?.isPayout) {
      return (
        <circle
          key={`dot-${index}-payout`}
          cx={cx}
          cy={cy}
          r={4}
          fill={getPayoutColor(payload.payoutStatus || '')}
          stroke="black"
          strokeWidth={1}
        />
      )
    }

    return <circle key={`dot-${index}-empty`} cx={cx} cy={cy} r={0} fill="none" />
  }

  return (
    <div data-chart-surface="modern" className="w-full space-y-2">
      <ChartContainer
        config={chartConfig}
        className={cn("h-[200px] w-full", className)}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="tradeIndex"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={false}
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={[
                  (dataMin: number) => Math.floor(Math.min(dataMin, startingBalance - drawdownThreshold) / 1000) * 1000,
                  (dataMax: number) => Math.ceil(Math.max(dataMax, startingBalance + profitTarget) / 1000) * 1000
                ]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataPoint;
                    return (
                      <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl text-[10px] space-y-2 min-w-[140px]">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <span className="font-black text-white">TRADE #{data.tradeIndex}</span>
                          <span className="text-white/40">{data.date}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-white/40 uppercase font-bold tracking-wider">Balance</span>
                            <span className="text-white font-black">${data.balance.toLocaleString()}</span>
                          </div>
                          {!data.isPayout && !data.isReset && (
                            <div className="flex justify-between items-center">
                              <span className="text-white/40 uppercase font-bold tracking-wider">Net P/L</span>
                              <span className={cn(
                                "font-black",
                                data.pnl >= 0 ? "metric-positive" : "metric-negative"
                              )}>
                                {data.pnl >= 0 ? '+' : ''}{data.pnl.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 pt-1 border-t border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-white/20 uppercase font-bold tracking-wider">Drawdown</span>
                            <span className="text-white/60 font-medium">${data.drawdownLevel.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/20 uppercase font-bold tracking-wider">ATH</span>
                            <span className="text-white/60 font-medium">${data.highestBalance.toLocaleString()}</span>
                          </div>
                        </div>
                        {data.isReset && (
                          <div className="mt-1 pt-1 border-t border-white/10 metric-negative font-black uppercase text-center tracking-widest">
                            {t('propFirm.chart.accountReset')}
                          </div>
                        )}
                        {data.isPayout && data.payoutStatus && (
                          <div className="mt-1 pt-1 border-t border-white/10">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-black uppercase tracking-wider">Payout</span>
                              <span className="text-white font-black">${data.payoutAmount.toLocaleString()}</span>
                            </div>
                            <div className="text-[8px] text-white/40 uppercase text-right tracking-widest">
                              {data.payoutStatus}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name={t('propFirm.chart.balance')}
                stroke={chartConfig.balance.color}
                strokeWidth={2}
                dot={renderDot}
                isAnimationActive={true}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="drawdownLevel"
                name={t('propFirm.chart.drawdownLevel')}
                stroke={chartConfig.drawdown.color}
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                name={t('propFirm.chart.profitTarget')}
                stroke={chartConfig.target.color}
                strokeWidth={1.5}
                strokeDasharray="6 6"
                dot={false}
              />
              <ReferenceLine
                y={startingBalance}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="2 2"
                label={{
                  value: t('propFirm.chart.startingBalance'),
                  position: "insideBottomRight",
                  fill: "rgba(255,255,255,0.2)",
                  fontSize: 9,
                  fontWeight: 'bold',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">{t('propFirm.chart.noTrades')}</p>
          </div>
        )}
      </ChartContainer>
    </div>
  )
} 

"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ChartSurface } from "@/components/ui/chart-surface"
import { useDashboardStats } from "@/context/data-provider"
import { cn } from "@/lib/utils"
import { WidgetSize } from '@/app/[locale]/dashboard/types/dashboard'
import { Info } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useI18n } from "@/locales/client"

interface TradeDistributionProps {
  size?: WidgetSize
}

interface ChartDataPoint {
  name: string
  value: number
  color: string
  count: number
  total: number
}

interface TooltipPayload {
  payload: ChartDataPoint
}

interface TooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

export default React.memo(function TradeDistributionChart({ size = 'medium' }: TradeDistributionProps) {
  const { statistics: { nbWin, nbLoss, nbBe, nbTrades } } = useDashboardStats()
  const t = useI18n()
  const hasData = nbTrades > 0

  const chartData = React.useMemo(() => {
    if (!nbTrades) return []

    const toPercent = (value: number, total: number) => {
      if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0
      return Number(((value / total) * 100).toFixed(2))
    }

    const winRate = toPercent(nbWin, nbTrades)
    const lossRate = toPercent(nbLoss, nbTrades)
    const beRate = Number((100 - winRate - lossRate).toFixed(2))

    return [
      { name: `WINNING TRADES (${nbWin}/${nbTrades})`, value: winRate, color: 'hsl(var(--chart-1))', count: nbWin, total: nbTrades },
      { name: `BREAKEVEN TRADES (${nbBe}/${nbTrades})`, value: beRate, color: 'hsl(var(--chart-5))', count: nbBe, total: nbTrades },
      { name: `LOSING TRADES (${nbLoss}/${nbTrades})`, value: lossRate, color: 'hsl(var(--chart-6))', count: nbLoss, total: nbTrades },
    ]
  }, [nbWin, nbLoss, nbBe, nbTrades])

  const pieLayout = React.useMemo(() => {
    if (size === 'small') {
      return { innerRadius: '58%', outerRadius: '82%', cy: '50%' }
    }
    if (size === 'large' || size === 'extra-large') {
      return { innerRadius: '63%', outerRadius: '92%', cy: '50%' }
    }
    return { innerRadius: '61%', outerRadius: '90%', cy: '50%' }
  }, [size])

  const renderTooltip = React.useCallback(({ active, payload }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0]?.payload
    if (!data) return null

    return (
      <div className="bg-card/96 backdrop-blur-xl p-3 border border-border/55 rounded-lg shadow-2xl min-w-[140px]">
        <div className="flex flex-col mb-1 border-b border-border/55 pb-1">
          <span className="text-[8px] uppercase text-muted-foreground/70 font-black tracking-widest">
            {t('tradeDistribution.tooltip.type')}
          </span>
          <span className="font-black text-foreground text-[11px] uppercase tracking-widest">
            {data.name}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] uppercase text-muted-foreground/70 font-black tracking-widest">
            {t('tradeDistribution.tooltip.percentage')}
          </span>
          <span className={cn('font-black text-sm tabular-nums', data.count > 0 ? 'text-foreground' : 'text-muted-foreground/55')}>
            {data.value.toFixed(2)}%
          </span>
        </div>
      </div>
    )
  }, [t])

  return (
    <ChartSurface>
      <div
        className={cn(
          'flex flex-col items-stretch space-y-0 border-b border-border/55 shrink-0',
          size === 'small' ? 'p-2 h-10 justify-center' : 'p-3 sm:p-3.5 h-12 justify-center'
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'line-clamp-1 font-bold tracking-tight text-foreground',
                size === 'small' ? 'text-sm' : 'text-base'
              )}
            >
              {t('tradeDistribution.title')}
            </span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info
                    className={cn(
                      'text-muted-foreground/70 hover:text-foreground transition-colors cursor-help',
                      size === 'small' ? 'h-3.5 w-3.5' : 'h-4 w-4'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t('tradeDistribution.description')}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 min-h-0',
          size === 'small' ? 'p-1.5' : 'p-2 sm:p-3'
        )}
      >
        <div className="w-full h-full min-h-0">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy={pieLayout.cy}
                  innerRadius={pieLayout.innerRadius}
                  outerRadius={pieLayout.outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="transparent"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={entry.color === 'hsl(var(--chart-1))' ? 0.95 : 1}
                      className={cn(
                        "transition-all duration-300 ease-in-out hover:fill-opacity-100",
                        entry.color === "hsl(var(--chart-1))" ? "chart-positive-emphasis" : "chart-negative-muted"
                      )}
                    />
                  ))}
                  <text x="50%" y={pieLayout.cy} textAnchor="middle" dominantBaseline="central">
                    <tspan x="50%" dy="-0.1em" className="fill-white font-black text-2xl chart-positive-emphasis">
                      {chartData[0].value.toFixed(0)}%
                    </tspan>
                    <tspan x="50%" dy="1.35em" className="fill-white/55 text-[10px] uppercase font-black tracking-[0.16em]">
                      WIN RATE
                    </tspan>
                  </text>
                </Pie>
                <Tooltip content={renderTooltip as any} cursor={{ fill: 'transparent' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-fg-muted">
              {t("widgets.emptyState") ?? "No trades yet."}
            </div>
          )}
        </div>
      </div>
    </ChartSurface>
  );
})

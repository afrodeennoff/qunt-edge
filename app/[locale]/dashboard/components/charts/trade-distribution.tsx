"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ChartSurface } from "@/components/ui/chart-surface"
import { useData } from "@/context/data-provider"
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

export default function TradeDistributionChart({ size = 'medium' }: TradeDistributionProps) {
  const { statistics: { nbWin, nbLoss, nbBe, nbTrades } } = useData()
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
      { name: t('tradeDistribution.winWithCount', { count: nbWin, total: nbTrades }), value: winRate, color: '#f1f1f2', count: nbWin, total: nbTrades },
      { name: t('tradeDistribution.breakevenWithCount', { count: nbBe, total: nbTrades }), value: beRate, color: '#4d4f56', count: nbBe, total: nbTrades },
      { name: t('tradeDistribution.lossWithCount', { count: nbLoss, total: nbTrades }), value: lossRate, color: '#767982', count: nbLoss, total: nbTrades },
    ]
  }, [nbWin, nbLoss, nbBe, nbTrades, t])

  const pieLayout = React.useMemo(() => {
    if (size === 'small') {
      return { innerRadius: '58%', outerRadius: '82%', cy: '42%' }
    }
    if (size === 'large' || size === 'extra-large') {
      return { innerRadius: '63%', outerRadius: '92%', cy: '43%' }
    }
    return { innerRadius: '61%', outerRadius: '90%', cy: '43%' }
  }, [size])

  const renderTooltip = React.useCallback(({ active, payload }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0]?.payload
    if (!data) return null

    return (
      <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[140px]">
        <div className="flex flex-col mb-1 border-b border-white/5 pb-1">
          <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
            {t('tradeDistribution.tooltip.type')}
          </span>
          <span className="font-black text-white text-[11px] uppercase tracking-widest">
            {data.name}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
            {t('tradeDistribution.tooltip.percentage')}
          </span>
          <span className={cn('font-black text-sm tabular-nums', data.count > 0 ? 'text-white' : 'text-white/45')}>
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
          'flex flex-col items-stretch space-y-0 border-b border-white/5 shrink-0',
          size === 'small' ? 'p-2 h-10 justify-center' : 'p-3 sm:p-3.5 h-12 justify-center'
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'line-clamp-1 font-bold tracking-tight text-white',
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
                      'text-white/20 hover:text-white transition-colors cursor-help',
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
          size === 'small' ? 'p-1' : 'p-1 sm:p-2'
        )}
      >
        <div className="w-full h-full flex min-h-0 flex-col">
          {hasData ? (
            <>
              <div className="min-h-0 flex-1">
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
                      stroke="rgba(0,0,0,0)"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={entry.color === '#f1f1f2' ? 0.95 : 1}
                          className={cn(
                            "transition-all duration-300 ease-in-out hover:fill-opacity-100",
                            entry.color === "#f1f1f2" ? "chart-positive-emphasis" : "chart-negative-muted"
                          )}
                        />
                      ))}
                      <text x="50%" y={pieLayout.cy} textAnchor="middle" dominantBaseline="central">
                        <tspan x="50%" dy="-0.2em" className="fill-white/10 text-[10px] uppercase font-black tracking-[0.2em]">WinRate</tspan>
                        <tspan x="50%" dy="1.2em" className="fill-white font-black text-lg chart-positive-emphasis">{chartData[0].value}%</tspan>
                      </text>
                    </Pie>
                    <Tooltip content={renderTooltip as any} cursor={{ fill: 'transparent' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col items-center gap-2 pb-0.5 pt-1">
                {chartData.map((entry) => (
                  <div
                    key={entry.name}
                    className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase font-black tracking-[0.08em]"
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-white/58">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-fg-muted">
              {t("widgets.emptyState") ?? "No trades yet."}
            </div>
          )}
        </div>
      </div>
    </ChartSurface>
  )
}

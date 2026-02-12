"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from "recharts"
import type { Props } from 'recharts/types/component/Label'
import type { PolarViewBox } from 'recharts/types/util/types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  name: string;
  value: number;
  color: string;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
}

export default function TradeDistributionChart({ size = 'medium' }: TradeDistributionProps) {
  const { statistics: { nbWin, nbLoss, nbBe, nbTrades } } = useData()
  const t = useI18n()
  const hasData = nbTrades > 0

  const chartData = React.useMemo(() => {

    // Safety check for nbTrades
    if (!nbTrades) return []

    const winRate = Number((nbWin / nbTrades * 100).toFixed(2))
    const lossRate = Number((nbLoss / nbTrades * 100).toFixed(2))
    // Explicitly handle float precision issues
    const beRate = Number((100 - winRate - lossRate).toFixed(2))

    return [
      { name: t('tradeDistribution.winWithCount', { count: nbWin, total: nbTrades }), value: winRate, color: 'white', count: nbWin },
      { name: t('tradeDistribution.breakevenWithCount', { count: nbBe, total: nbTrades }), value: beRate, color: 'rgba(255,255,255,0.1)', count: nbBe },
      { name: t('tradeDistribution.lossWithCount', { count: nbLoss, total: nbTrades }), value: lossRate, color: 'rgba(255,255,255,0.3)', count: nbLoss }
    ]
  }, [nbWin, nbLoss, nbBe, nbTrades, t])

  const renderColorfulLegendText = (value: string, entry: any) => {
    return <span className="text-[9px] uppercase font-black tracking-widest text-white/40">{value}</span>;
  }

  const pieLayout = React.useMemo(() => {
    if (size === "small") {
      return { innerRadius: "50%", outerRadius: "74%", cy: "46%", legendPaddingTop: 0 };
    }
    if (size === "large" || size === "extra-large") {
      return { innerRadius: "60%", outerRadius: "88%", cy: "45%", legendPaddingTop: 4 };
    }
    return { innerRadius: "56%", outerRadius: "84%", cy: "45%", legendPaddingTop: 6 };
  }, [size]);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            <span className={cn(
              "font-black text-sm tabular-nums",
              data.color === 'white' ? "text-white" : "text-white/40"
            )}>
              {data.value.toFixed(2)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div data-chart-surface="modern" className="h-full flex flex-col bg-transparent">
      <div
        className={cn(
          "flex flex-col items-stretch space-y-0 border-b border-white/5 shrink-0",
          size === "small" ? "p-2 h-10 justify-center" : "p-3 sm:p-3.5 h-12 justify-center"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-white uppercase tracking-widest",
                size === "small" ? "text-sm" : "text-base"
              )}
            >
              {t('tradeDistribution.title')}
            </span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info
                    className={cn(
                      "text-white/20 hover:text-white transition-colors cursor-help",
                      size === "small" ? "h-3.5 w-3.5" : "h-4 w-4"
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
          "flex-1 min-h-0",
          size === 'small' ? "p-1" : "p-2 sm:p-3"
        )}
      >
        <div className="w-full h-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy={pieLayout.cy}
                  innerRadius={pieLayout.innerRadius}
                  outerRadius={pieLayout.outerRadius}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={entry.color === 'white' ? 0.8 : 0.4}
                      className="transition-all duration-300 ease-in-out hover:fill-opacity-100"
                    />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox }: any) => {
                      if (!viewBox || !viewBox.cx || !viewBox.cy) return null;
                      const { cx, cy } = viewBox;
                      const centerText = Math.round(chartData[0].value) + "%";

                      return (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          <tspan x={cx} dy="-0.2em" className="fill-white/10 text-[10px] uppercase font-black tracking-[0.2em]">WinRate</tspan>
                          <tspan x={cx} dy="1.2em" className="fill-white font-black text-lg">{centerText}</tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconSize={6}
                  iconType="circle"
                  formatter={renderColorfulLegendText}
                  wrapperStyle={{
                    paddingTop: pieLayout.legendPaddingTop,
                    paddingBottom: 0
                  }}
                  layout="horizontal"
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'transparent' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-fg-muted">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

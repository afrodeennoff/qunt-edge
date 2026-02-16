"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { ChartConfig } from "@/components/ui/chart";
import { useData } from "@/context/data-provider";
import { cn, toFiniteNumber } from "@/lib/utils";
import { hasPositiveFiniteByKey } from "@/lib/chart-guards";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { useTickDetailsStore } from "@/store/tick-details-store";

interface TickDistributionProps {
  size?: WidgetSize;
}

interface ChartDataPoint {
  ticks: string;
  tickNumber: number;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
  label?: string;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "white",
  },
} satisfies ChartConfig;

const formatCount = (value: number) => {
  if (value>= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

export default function TickDistributionChart({
  size = "medium",
}: TickDistributionProps) {
  const { formattedTrades: trades, tickFilter, setTickFilter } = useData();
  const tickDetails = useTickDetailsStore((state) => state.tickDetails);
  const t = useI18n();

  const chartData = React.useMemo(() => {
    if (!trades.length) return [];

    // Create a map to store tick counts
    const tickCounts: Record<number, number> = {};

    // Count trades for each tick value
    trades.forEach((trade) => {
      if (!trade.instrument) return;

      // Fix ticker matching logic - sort by length descending to match longer tickers first
      // This prevents "ES" from matching "MES" trades
      const matchingTicker = Object.keys(tickDetails)
        .sort((a, b) => b.length - a.length) // Sort by length descending
        .find((ticker) => trade.instrument.includes(ticker));

      // Use tickValue (monetary value per tick) instead of tickSize (minimum price increment)
      const tickValue = toFiniteNumber(
        matchingTicker ? tickDetails[matchingTicker]?.tickValue : 1,
        1,
      );
      if (tickValue === 0) return;

      const quantity = toFiniteNumber(trade.quantity, 0);
      if (quantity === 0) return;

      // Calculate PnL per contract first
      const pnlPerContract = toFiniteNumber(trade.pnl, 0) / quantity;
      if (!Number.isFinite(pnlPerContract)) return;

      const ticksRaw = pnlPerContract / tickValue;
      if (!Number.isFinite(ticksRaw)) return;
      const ticks = Math.round(ticksRaw);
      tickCounts[ticks] = (tickCounts[ticks] || 0) + 1;
    });

    // Convert the tick counts to sorted chart data
    return Object.entries(tickCounts)
      .map(([tick, count]) => {
        const tickNumber = toFiniteNumber(tick, Number.NaN);
        if (!Number.isFinite(tickNumber)) return null;
        return {
          ticks: tickNumber === 0 ? "0" : tickNumber> 0 ? `+${tickNumber}` : `${tickNumber}`,
          tickNumber,
          count: toFiniteNumber(count, 0),
        };
      })
      .filter((entry): entry is ChartDataPoint => Boolean(entry))
      .sort((a, b) => a.tickNumber - b.tickNumber);
  }, [trades, tickDetails]);
  const hasData = hasPositiveFiniteByKey(chartData, "count");

  const handleBarClick = (data: any) => {
    if (!data || !trades.length) return;
    const clickedTicks = data.ticks;
    if (tickFilter.value === clickedTicks) {
      setTickFilter({ value: null });
    } else {
      setTickFilter({ value: clickedTicks });
    }
  };

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[140px]">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("tickDistribution.tooltip.ticks")}</span>
            <span className="font-black text-white text-[11px] uppercase tracking-widest">{data.ticks}</span>
          </div>
          <div className="flex justify-between items-center pt-1.5">
            <span className="text-white/40 text-[9px] font-black uppercase tracking-wider">{t("tickDistribution.tooltip.trades")}</span>
            <span className="font-black text-white text-[11px] tabular-nums">
              {data.count}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartSurface>
      <div
        className={cn(
          "flex flex-col items-stretch space-y-0 border-b border-white/5 shrink-0",
          size === "small" ? "p-2 h-10 justify-center" : "p-3 sm:p-3.5 h-12 justify-center",
        )}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-white uppercase tracking-widest",
                size === "small" ? "text-sm" : "text-base",
              )}>
              {t("tickDistribution.title")}
            </span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info
                    className={cn(
                      "text-white/20 hover:text-white transition-colors cursor-help",
                      size === "small" ? "h-3.5 w-3.5" : "h-4 w-4",
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t("tickDistribution.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          {tickFilter.value && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[9px] uppercase font-black tracking-widest text-white/40 hover:text-white hover:bg-white/5"
              onClick={() => setTickFilter({ value: null })}>
              {t("tickDistribution.clearFilter")}
            </Button>
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          size === "small" ? "p-1" : "p-2 sm:p-3",
        )}>
        <div className={cn("w-full h-full")}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={
                  size === "small"
                    ? { left: 0, right: 0, top: 4, bottom: 8 }
                    : { left: 0, right: 0, top: 8, bottom: 8 }
                }
                onClick={(e) =>
                  e?.activePayload && handleBarClick(e.activePayload[0].payload)
                }>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="text-border dark:opacity-[0.1] opacity-[0.2]"
                  vertical={false}
                />
                <XAxis
                  dataKey="ticks"
                  tickLine={false}
                  axisLine={false}
                  height={size === "small" ? 20 : 24}
                  tickMargin={size === "small" ? 4 : 8}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={size === "small" ? 8 : 4}
                          textAnchor="middle"
                          fill="var(--fg-muted)"
                          fontSize={size === "small" ? 9 : 10}
                          transform={
                            size === "small" ? "rotate(-45)" : "rotate(0)"
                          }>
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                  interval={0}
                  allowDataOverflow={true}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickMargin={4}
                  tickFormatter={formatCount}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar
                  dataKey="count"
                  radius={[2, 2, 2, 2]}
                  maxBarSize={size === "small" ? 25 : 40}
                  className="transition-all duration-300 ease-in-out"
                  cursor="pointer">
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.ticks}`}
                      fill={entry.tickNumber>= 0 ? "white" : "#52525B"}
                      fillOpacity={
                        tickFilter.value === entry.ticks
                          ? 1
                          : tickFilter.value
                            ? 0.3
                            : 1
                      }
                      stroke="none"
                      className={cn(
                        "hover:brightness-110 transition-all duration-300",
                        entry.tickNumber>= 0 ? "chart-positive-emphasis" : "chart-negative-muted"
                      )}
                    />
                  ))}
                </Bar>
              </BarChart>
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
}

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
import { ChartConfig } from "@/components/ui/chart";
import { useData } from "@/context/data-provider";
import { cn } from "@/lib/utils";
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
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig;

const formatCount = (value: number) => {
  if (value >= 1000) {
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
      // Fix ticker matching logic - sort by length descending to match longer tickers first
      // This prevents "ES" from matching "MES" trades
      const matchingTicker = Object.keys(tickDetails)
        .sort((a, b) => b.length - a.length) // Sort by length descending
        .find((ticker) => trade.instrument.includes(ticker));

      // Use tickValue (monetary value per tick) instead of tickSize (minimum price increment)
      const tickValue = matchingTicker
        ? tickDetails[matchingTicker].tickValue
        : 1;

      // Calculate PnL per contract first
      const pnlPerContract = Number(trade.pnl) / Number(trade.quantity);
      const ticks = Math.round(pnlPerContract / Number(tickValue));
      tickCounts[ticks] = (tickCounts[ticks] || 0) + 1;
    });

    // Convert the tick counts to sorted chart data
    return Object.entries(tickCounts)
      .map(([tick, count]) => ({
        ticks: tick === "0" ? "0" : Number(tick) > 0 ? `+${tick}` : `${tick}`,
        count,
      }))
      .sort(
        (a, b) =>
          Number(a.ticks.replace("+", "")) - Number(b.ticks.replace("+", "")),
      );
  }, [trades, tickDetails]);
  const hasData = chartData.some((entry) => entry.count > 0);

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
        <div className="bg-background/90 backdrop-blur-md p-3 border border-white/10 rounded-lg shadow-xl">
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("tickDistribution.tooltip.ticks")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {data.ticks}{" "}
              {parseInt(data.ticks) !== 1
                ? t("tickDistribution.tooltip.ticks_plural")
                : t("tickDistribution.tooltip.tick")}
            </span>
          </div>
          <div className="flex flex-col pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("tickDistribution.tooltip.trades")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {data.count}{" "}
              {data.count !== 1
                ? t("tickDistribution.tooltip.trades_plural")
                : t("tickDistribution.tooltip.trade")}
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
          size === "small" ? "p-2 h-10 justify-center" : "p-3 sm:p-4 h-14 justify-center",
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === "small" ? "text-sm" : "text-base",
              )}
            >
              {t("tickDistribution.title")}
            </span>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info
                    className={cn(
                      "text-fg-muted hover:text-fg-primary transition-colors cursor-help",
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
              className="h-6 px-2 text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => setTickFilter({ value: null })}
            >
              {t("tickDistribution.clearFilter")}
            </Button>
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          size === "small" ? "p-1" : "p-2 sm:p-4",
        )}
      >
        <div className={cn("w-full h-full")}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={
                  size === "small"
                    ? { left: 0, right: 0, top: 4, bottom: 20 }
                    : { left: 0, right: 0, top: 8, bottom: 24 }
                }
                onClick={(e) =>
                  e?.activePayload && handleBarClick(e.activePayload[0].payload)
                }
              >
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
                          }
                        >
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
                  cursor="pointer"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.ticks}`}
                      fill={parseInt(entry.ticks) >= 0 ? "rgb(var(--accent-teal-rgb))" : "rgb(var(--rose-500-rgb))"}
                      opacity={
                        tickFilter.value === entry.ticks
                          ? 1
                          : tickFilter.value
                            ? 0.3
                            : 0.8
                      }
                      className="hover:opacity-100"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-fg-muted">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

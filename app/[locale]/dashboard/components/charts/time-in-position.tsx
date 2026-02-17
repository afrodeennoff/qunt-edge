"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { ChartConfig } from "@/components/ui/chart";
import { useData } from "@/context/data-provider";
import { Trade } from "@/lib/data-types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";
import { formatInTimeZone } from "date-fns-tz";

interface TimeInPositionChartProps {
  size?: WidgetSize;
}

const chartConfig = {
  avgTimeInPosition: {
    label: "Average Time in Position",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

export default function TimeInPositionChart({
  size = "medium",
}: TimeInPositionChartProps) {
  const { formattedTrades: trades } = useData();
  const t = useI18n();

  const chartData = React.useMemo(() => {
    const hourlyData: { [hour: string]: { totalTime: number; count: number } } =
      {};

    // Initialize hourly data for all 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i.toString()] = { totalTime: 0, count: 0 };
    }

    // Sum up time in position and count trades for each hour in UTC
    trades.forEach((trade: Trade) => {
      const hour = formatInTimeZone(new Date(trade.entryDate), "UTC", "H");
      hourlyData[hour].totalTime += Number(trade.timeInPosition) / 60; // Convert seconds to minutes
      hourlyData[hour].count++;
    });

    // Convert to array format for Recharts and calculate average time in position
    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgTimeInPosition: data.count > 0 ? data.totalTime / data.count : 0,
        tradeCount: data.count,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [trades]);

  const maxTradeCount = Math.max(...chartData.map((data) => data.tradeCount));
  const hasData = chartData.some((data) => data.tradeCount > 0);

  const getColor = (count: number) => {
    const intensity = Math.max(0.2, count / maxTradeCount);
    return `hsl(var(--chart-8) / ${intensity})`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/90 backdrop-blur-md p-3 border border-white/10 rounded-lg shadow-xl">
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("timeInPosition.tooltip.time")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {`${label}:00 - ${(label + 1) % 24}:00`}
            </span>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("timeInPosition.tooltip.averageDuration")}
            </span>
            <span className={cn("font-bold text-xs", data.avgTimeInPosition > 0 ? "metric-positive" : "metric-negative")}>
              {formatTime(data.avgTimeInPosition)}
            </span>
          </div>
          <div className="flex flex-col pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("timeInPosition.tooltip.trades")}
            </span>
            <span className={cn("font-bold text-xs", data.tradeCount > 0 ? "metric-positive" : "metric-negative")}>
              {data.tradeCount}{" "}
              {data.tradeCount !== 1
                ? t("timeInPosition.tooltip.trades_plural")
                : t("timeInPosition.tooltip.trade")}
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
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CardTitle
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === "small" ? "text-sm" : "text-base",
              )}
            >
              {t("timeInPosition.title")}
            </CardTitle>
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
                  <p className="text-xs">{t("timeInPosition.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          size === "small" ? "px-0.5 pt-0.5 pb-0" : "px-1 pt-1 pb-0 sm:px-2 sm:pt-2 sm:pb-0",
        )}
      >
        <div className={cn("w-full h-full")}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={
                  size === "small"
                    ? { left: 0, right: 0, top: 4, bottom: 6 }
                    : { left: 0, right: 0, top: 6, bottom: 10 }
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="text-border dark:opacity-[0.1] opacity-[0.2]"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  height={size === "small" ? 16 : 18}
                  tickMargin={size === "small" ? 0 : 2}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                  tickFormatter={(value) => `${value}h`}
                  ticks={
                    size === "small"
                      ? [0, 6, 12, 18]
                      : [0, 3, 6, 9, 12, 15, 18, 21]
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickMargin={4}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                  tickFormatter={formatTime}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar
                  dataKey="avgTimeInPosition"
                  radius={[2, 2, 2, 2]}
                  maxBarSize={size === "small" ? 25 : 40}
                  className="transition-all duration-300 ease-in-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="white"
                      fillOpacity={entry.tradeCount > 0 ? 0.9 : 0.15}
                      className={cn(
                        "hover:fill-opacity-100 transition-all duration-300",
                        entry.tradeCount > 0 ? "chart-positive-emphasis" : "chart-negative-muted"
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

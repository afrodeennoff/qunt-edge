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
import { Button } from "@/components/ui/button";
import { useUserStore } from "../../../../../store/user-store";

interface TimeOfDayTradeChartProps {
  size?: WidgetSize;
}

const chartConfig = {
  avgPnl: {
    label: "Average P/L",
    color: "hsl(var(--chart-loss))",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function TimeOfDayTradeChart({
  size = "medium",
}: TimeOfDayTradeChartProps) {
  const { formattedTrades: trades, hourFilter, setHourFilter } = useData();
  const timezone = useUserStore((state) => state.timezone);
  const [activeHour, setActiveHour] = React.useState<number | null>(null);
  const t = useI18n();

  const handleClick = React.useCallback(() => {
    if (activeHour === null) return;
    if (hourFilter.hour === activeHour) {
      setHourFilter({ hour: null });
    } else {
      setHourFilter({ hour: activeHour });
    }
  }, [activeHour, hourFilter.hour, setHourFilter]);

  const chartData = React.useMemo(() => {
    const hourlyData: { [hour: string]: { totalPnl: number; count: number } } =
      {};

    // Initialize hourly data for all 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i.toString()] = { totalPnl: 0, count: 0 };
    }

    // Sum up PNL and count trades for each hour in user's timezone
    trades.forEach((trade: Trade) => {
      const hour = formatInTimeZone(new Date(trade.entryDate), timezone, "H");
      hourlyData[hour].totalPnl += Number(trade.pnl);
      hourlyData[hour].count++;
    });

    // Convert to array format for Recharts and calculate average PNL
    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgPnl: data.count > 0 ? data.totalPnl / data.count : 0,
        tradeCount: data.count,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [trades, timezone]);

  const maxTradeCount = Math.max(...chartData.map((data) => data.tradeCount));
  const maxPnL = Math.max(...chartData.map((data) => data.avgPnl));
  const minPnL = Math.min(...chartData.map((data) => data.avgPnl));
  const hasData = chartData.some((data) => data.tradeCount > 0);

  const getColor = (count: number) => {
    const intensity = Math.max(0.2, count / maxTradeCount);
    return `hsl(var(--chart-4) / ${intensity})`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    React.useEffect(() => {
      if (active && payload && payload.length) {
        setActiveHour(payload[0].payload.hour);
      } else {
        setActiveHour(null);
      }
    }, [active, payload]);

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/90 backdrop-blur-md p-3 border border-white/10 rounded-lg shadow-xl">
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("pnlTime.tooltip.time")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {`${label}:00 - ${(label + 1) % 24}:00`}
            </span>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("pnlTime.tooltip.averagePnl")}
            </span>
            <span className={cn(
              "font-black text-sm",
              data.avgPnl >= 0 ? "text-accent-teal" : "text-rose-500"
            )}>{formatCurrency(data.avgPnl)}</span>
          </div>
          <div className="flex flex-col pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("pnlTime.tooltip.trades")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {data.tradeCount}{" "}
              {data.tradeCount === 1
                ? t("pnlTime.tooltip.trade")
                : t("pnlTime.tooltip.trades_plural")}
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
              {t("pnlTime.title")}
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
                  <p className="text-xs">{t("pnlTime.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          {hourFilter.hour !== null && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => setHourFilter({ hour: null })}
            >
              {t("pnlTime.clearFilter")}
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
        <div className="w-full h-full cursor-pointer" onClick={handleClick}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={
                  size === "small"
                    ? { left: 0, right: 0, top: 4, bottom: 0 }
                    : { left: 0, right: 0, top: 8, bottom: 0 }
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
                  height={size === "small" ? 20 : 24}
                  tickMargin={size === "small" ? 4 : 8}
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar
                  dataKey="avgPnl"
                  radius={[2, 2, 2, 2]}
                  maxBarSize={size === "small" ? 25 : 40}
                  className="transition-all duration-300 ease-in-out"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.hour}`}
                      fill={entry.avgPnl >= 0 ? "rgb(var(--accent-teal-rgb))" : "rgb(var(--rose-500-rgb))"}
                      fillOpacity={
                        hourFilter.hour === entry.hour
                          ? 1
                          : hourFilter.hour !== null
                            ? 0.3
                            : 0.8
                      }
                      stroke={entry.avgPnl >= 0 ? "rgb(var(--accent-teal-rgb))" : "rgb(var(--rose-500-rgb))"}
                      strokeOpacity={
                        hourFilter.hour === entry.hour
                          ? 1
                          : hourFilter.hour !== null
                            ? 0.3
                            : 1
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

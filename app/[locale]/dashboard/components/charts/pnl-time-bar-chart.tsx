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
import { cn, toFiniteNumber } from "@/lib/utils";
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
    color: "white",
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
      hourlyData[hour].totalPnl += toFiniteNumber(trade.pnl, 0);
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

  const hasData = chartData.some((data) => data.tradeCount > 0);

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
      const hourLabel = toFiniteNumber(label, 0);
      return (
        <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[140px]">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlTime.tooltip.time")}</span>
            <span className="font-black text-white text-[11px] uppercase tracking-widest">{`${hourLabel}:00 - ${(hourLabel + 1) % 24}:00`}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[9px] font-black uppercase tracking-wider">{t("pnlTime.tooltip.averagePnl")}</span>
              <span className={cn(
                "font-black text-[13px] tabular-nums",
                data.avgPnl >= 0 ? "metric-positive" : "metric-negative"
              )}>{formatCurrency(data.avgPnl)}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlTime.tooltip.trades")}</span>
              <span className="font-black text-white/60 text-[10px]">
                {data.tradeCount}
              </span>
            </div>
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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-white uppercase tracking-widest",
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
                      "text-white/20 hover:text-white transition-colors cursor-help",
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
              className="h-6 px-2 text-[9px] uppercase font-black tracking-widest text-white/40 hover:text-white hover:bg-white/5"
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
          size === "small" ? "p-1" : "p-2 sm:p-3",
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
                      fill={entry.avgPnl >= 0 ? "white" : "#52525B"}
                      fillOpacity={
                        hourFilter.hour === entry.hour
                          ? 1
                          : hourFilter.hour !== null
                            ? 0.3
                            : 1
                      }
                      stroke="none"
                      className={cn(
                        "hover:brightness-110 transition-all duration-300",
                        entry.avgPnl >= 0 ? "chart-positive-emphasis" : "chart-negative-muted"
                      )}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/20">
              {t("widgets.emptyState") ?? "No trades yet."}
            </div>
          )}
        </div>
      </div>
    </ChartSurface>
  );
}

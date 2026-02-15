"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useData } from "@/context/data-provider";
import { cn, toFiniteNumber } from "@/lib/utils";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n, useCurrentLocale } from "@/locales/client";
import { formatInTimeZone } from "date-fns-tz";
import { fr, enUS } from "date-fns/locale";
import { useUserStore } from "@/store/user-store";

interface PNLChartProps {
  size?: WidgetSize;
}

interface ChartDataPoint {
  date: string;
  pnl: number;
  shortNumber: number;
  longNumber: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
  label?: string;
}

const chartConfig = {
  pnl: {
    label: "Daily P/L",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return `${value < 0 ? "-" : ""}$${(absValue / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${value < 0 ? "-" : ""}$${(absValue / 1000).toFixed(1)}k`;
  }
  return `${value < 0 ? "-" : ""}$${absValue.toFixed(0)}`;
};

const positiveColor = "white";
const negativeColor = "rgba(255,255,255,0.15)";

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { timezone } = useUserStore();
  const dateLocale = locale === "fr" ? fr : enUS;

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date + "T00:00:00Z");
    return (
      <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[140px]">
        <p className="font-black text-white/40 text-[10px] uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
          {formatInTimeZone(date, timezone, "MMM d, yyyy", {
            locale: dateLocale,
          })}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnl.tooltip.pnl")}</span>
          <span className={cn("font-black text-sm tabular-nums", data.pnl >= 0 ? "metric-positive" : "metric-negative")}>
            {formatCurrency(data.pnl)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 pt-2 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-white/20 font-black tracking-wider">{t("pnl.tooltip.longTrades")}</span>
            <span className="text-[11px] font-black text-white/60">{data.longNumber}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[8px] uppercase text-white/20 font-black tracking-wider">{t("pnl.tooltip.shortTrades")}</span>
            <span className="text-[11px] font-black text-white/60">{data.shortNumber}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PNLChart({ size = "medium" }: PNLChartProps) {
  const { calendarData } = useData();
  const t = useI18n();
  const locale = useCurrentLocale();
  const { timezone } = useUserStore();
  const dateLocale = locale === "fr" ? fr : enUS;

  const chartData = React.useMemo(
    () =>
      Object.entries(calendarData)
        .map(([date, values]) => ({
          date,
          pnl: toFiniteNumber(values.pnl, 0),
          shortNumber: toFiniteNumber(values.shortNumber, 0),
          longNumber: toFiniteNumber(values.longNumber, 0),
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [calendarData],
  );
  const hasData = chartData.some(
    (entry) => (entry.shortNumber || 0) + (entry.longNumber || 0) > 0,
  );

  const getChartMargins = () => {
    switch (size) {
      case "small":
        return { left: 0, right: 0, top: 4, bottom: 8 };
      case "medium":
      case "large":
      default:
        return { left: 0, right: 0, top: 8, bottom: 8 };
    }
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
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === "small" ? "text-sm" : "text-base",
              )}
            >
              {t("pnl.title")}
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
                  <p className="text-xs">{t("pnl.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          size === "small" ? "p-1" : "p-2 sm:p-3",
        )}
      >
        <div className={cn("w-full h-full")}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <BarChart data={chartData} margin={getChartMargins()}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="text-border dark:opacity-[0.1] opacity-[0.2]"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  height={size === "small" ? 20 : 24}
                  tickMargin={size === "small" ? 4 : 8}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                  minTickGap={size === "small" ? 30 : 50}
                  tickFormatter={(value) => {
                    const date = new Date(value + "T00:00:00Z");
                    return formatInTimeZone(date, timezone, "MMM d", {
                      locale: dateLocale,
                    });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tickMargin={4}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar
                  dataKey="pnl"
                  radius={[2, 2, 2, 2]}
                  maxBarSize={size === "small" ? 25 : 40}
                  className="transition-all duration-300 ease-in-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? "white" : "#52525B"}
                      fillOpacity={1}
                      stroke="none"
                      className={cn(
                        "hover:brightness-110 transition-all duration-300",
                        entry.pnl >= 0 ? "chart-positive-emphasis" : "chart-negative-muted"
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

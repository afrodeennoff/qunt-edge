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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useData } from "@/context/data-provider";
import { Trade } from "@/lib/data-types";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";
import { formatInTimeZone } from "date-fns-tz";
import { cn, toFiniteNumber } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContractQuantityChartProps {
  size?: WidgetSize;
}

const chartConfig = {
  totalQuantity: {
    label: "Total Number of Contracts",
    color: "white",
  },
} satisfies ChartConfig;

export default function ContractQuantityChart({
  size = "medium",
}: ContractQuantityChartProps) {
  const { formattedTrades: trades } = useData();
  const t = useI18n();

  const chartData = React.useMemo(() => {
    const hourlyData: {
      [hour: string]: { totalQuantity: number; count: number };
    } = {};

    // Initialize hourly data for all 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i.toString()] = { totalQuantity: 0, count: 0 };
    }

    // Sum up quantities for each hour in UTC
    trades.forEach((trade: Trade) => {
      const entryDate = new Date(trade.entryDate);
      if (Number.isNaN(entryDate.getTime())) return;

      const hour = formatInTimeZone(entryDate, "UTC", "H");
      if (!(hour in hourlyData)) return;

      const quantity = toFiniteNumber(trade.quantity, 0);
      if (!Number.isFinite(quantity)) return;

      hourlyData[hour].totalQuantity += quantity;
      hourlyData[hour].count++;
    });

    // Convert to array format for Recharts
    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: toFiniteNumber(hour, 0),
        totalQuantity: toFiniteNumber(data.totalQuantity, 0),
        tradeCount: data.count,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [trades]);

  const hasData = chartData.some(
    (data) =>
      Number.isFinite(data.tradeCount) &&
      data.tradeCount> 0 &&
      Number.isFinite(data.totalQuantity),
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[140px]">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("contracts.tooltip.time")}</span>
            <span className="font-black text-white text-[11px] uppercase tracking-widest">{`${toFiniteNumber(label, 0)}:00 - ${(toFiniteNumber(label, 0) + 1) % 24}:00`}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[9px] font-black uppercase tracking-wider">{t("contracts.tooltip.totalContracts")}</span>
              <span className="font-black text-white text-[11px] tabular-nums">{data.totalQuantity}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("contracts.tooltip.numberOfTrades")}</span>
              <span className="font-black text-white/60 text-[11px]">
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
        )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CardTitle
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-white uppercase tracking-widest",
                size === "small" ? "text-sm" : "text-base",
              )}>
              {t("contracts.title")}
            </CardTitle>
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
                  <p className="text-xs">{t("contracts.description")}</p>
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
                }>
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
                  tickFormatter={(value: number) => `${toFiniteNumber(value, 0)}h`}
                  ticks={
                    size === "small"
                      ? [0, 6, 12, 18]
                      : [0, 3, 6, 9, 12, 15, 18, 21]
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  tickMargin={4}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                  tickFormatter={(value: number) => toFiniteNumber(value, 0).toFixed(0)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar
                  dataKey="totalQuantity"
                  radius={[2, 2, 2, 2]}
                  maxBarSize={size === "small" ? 25 : 40}
                  className="transition-all duration-300 ease-in-out">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="white"
                      fillOpacity={0.4}
                      stroke="white"
                      strokeOpacity={0.2}
                      strokeWidth={1}
                      className="hover:fill-opacity-100 transition-all duration-300"
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

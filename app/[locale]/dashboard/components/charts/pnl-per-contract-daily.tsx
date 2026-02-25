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
  ReferenceLine,
} from "recharts";
import { CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { useDashboardStats, useDashboardTrades } from "@/context/data-provider";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";
import { usePnLPerContractDailyStore } from "@/store/pnl-per-contract-daily-store";
import { formatInTimeZone } from "date-fns-tz";
import { fr, enUS } from "date-fns/locale";
import { useUserStore } from "@/store/user-store";
import { useCurrentLocale } from "@/locales/client";

interface PnLPerContractDailyChartProps {
  size?: WidgetSize;
}

type DailyInstrumentSummary = {
  trades: Array<{
    pnl?: number | string | null;
    commission?: number | string | null;
    quantity?: number | string | null;
  }>;
  totalPnl: number;
  totalContracts: number;
  winCount: number;
}

type ChartDatum = {
  date: string;
  averagePnl: number;
  totalPnl: number;
  tradeCount: number;
  winCount: number;
  totalContracts: number;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const formatWinRate = (wins: number, total: number) => {
  if (!Number.isFinite(wins) || !Number.isFinite(total) || total <= 0) return "0.0"
  return ((wins / total) * 100).toFixed(1)
}

export default function PnLPerContractDailyChart({
  size = "medium",
}: PnLPerContractDailyChartProps) {
  const { formattedTrades: trades } = useDashboardStats();
  const { isLoading } = useDashboardTrades();
  const { timezone } = useUserStore();
  const { config, setSelectedInstrument } = usePnLPerContractDailyStore();
  const t = useI18n();
  const locale = useCurrentLocale();
  const dateLocale = locale === "fr" ? fr : enUS;

  // Get unique instruments from trades
  const availableInstruments = React.useMemo(() => {
    const instruments = Array.from(
      new Set(trades.map((trade) => trade.instrument).filter(Boolean)),
    );
    return instruments.sort();
  }, [trades]);

  // Set default instrument if none selected and instruments are available
  React.useEffect(() => {
    if (!config.selectedInstrument && availableInstruments.length > 0) {
      setSelectedInstrument(availableInstruments[0]);
    }
  }, [config.selectedInstrument, availableInstruments, setSelectedInstrument]);

  const chartData = React.useMemo(() => {
    if (!config.selectedInstrument) return [];

    // Filter trades for selected instrument
    const instrumentTrades = trades.filter(
      (trade) => trade.instrument === config.selectedInstrument,
    );

    // Group trades by date
    const dateGroups = instrumentTrades.reduce(
      (acc, trade) => {
        const entryDate = new Date(trade.entryDate);
        const dateKey = formatInTimeZone(entryDate, timezone, "yyyy-MM-dd");

        if (!acc[dateKey]) {
          acc[dateKey] = {
            trades: [],
            totalPnl: 0,
            totalContracts: 0,
            winCount: 0,
          };
        }

        const netPnl = Number(trade.pnl) - Number(trade.commission || 0);
        acc[dateKey].trades.push(trade);
        acc[dateKey].totalPnl += netPnl;
        acc[dateKey].totalContracts += Number(trade.quantity);
        if (netPnl > 0) {
          acc[dateKey].winCount++;
        }

        return acc;
      },
      {} as Record<string, DailyInstrumentSummary>,
    );

    // Convert to chart data format and sort by date
    return Object.entries(dateGroups)
      .map(([date, data]) => ({
        date,
        averagePnl:
          data.totalContracts > 0 ? data.totalPnl / data.totalContracts : 0,
        totalPnl: data.totalPnl,
        tradeCount: data.trades.length,
        winCount: data.winCount,
        totalContracts: data.totalContracts,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trades, config.selectedInstrument, timezone]);

  const maxPnL = Math.max(...chartData.map((d) => d.averagePnl));
  const minPnL = Math.min(...chartData.map((d) => d.averagePnl));
  const renderTooltip = React.useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as ChartDatum | undefined;
      if (!data) return null;
      return (
        <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[160px]">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContractDaily.tooltip.date")}</span>
            <span className="font-black text-white/60 text-[10px] uppercase tracking-widest">{data.date}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContractDaily.tooltip.averagePnl")}</span>
              <span className={cn(
                "font-black text-[13px] tabular-nums",
                data.averagePnl >= 0 ? "metric-positive" : "metric-negative"
              )}>{formatCurrency(data.averagePnl)}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContractDaily.tooltip.totalPnl")}</span>
              <span className="font-black text-white/60 text-[10px]">
                {formatCurrency(data.totalPnl)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContractDaily.tooltip.trades")}</span>
              <span className="font-black text-white/60 text-[10px]">
                {data.tradeCount} ({formatWinRate(data.winCount, data.tradeCount)}% WR)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContractDaily.tooltip.totalContracts")}</span>
              <span className="font-black text-white/60 text-[10px]">
                {data.totalContracts}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }, [t]);

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
                "line-clamp-1 font-bold tracking-tight text-white uppercase tracking-widest",
                size === "small" ? "text-sm" : "text-base",
              )}
            >
              {t("pnlPerContractDaily.title")}
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
                  <p className="text-xs">{t("pnlPerContractDaily.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={config.selectedInstrument}
              onValueChange={setSelectedInstrument}
            >
              <SelectTrigger
                className={cn(
                  "w-[120px]",
                  size === "small" ? "h-6 text-[9px]" : "h-8 text-[10px]",
                  "bg-white/[0.03] border-white/10 text-white font-black uppercase tracking-widest"
                )}
              >
                <SelectValue
                  placeholder={t("pnlPerContractDaily.selectInstrument")}
                />
              </SelectTrigger>
              <SelectContent className="bg-black/95 backdrop-blur-xl border-white/10">
                {availableInstruments.map((instrument) => (
                  <SelectItem key={instrument} value={instrument} className="text-[10px] font-black uppercase tracking-widest text-white/60 focus:text-white">
                    {instrument}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {isLoading ? (
            (() => {
              const loadingMockData = [
                {
                  date: "2024-12-02",
                  averagePnl: 12.444999999999999,
                  totalPnl: 99.55999999999999,
                  tradeCount: 8,
                  winCount: 2,
                  totalContracts: 8,
                },
                // ... (truncated for brevity, keep existing mock data if needed or simplify) ...
                {
                  date: "2024-12-03",
                  averagePnl: 59.32,
                  totalPnl: 237.28,
                  tradeCount: 4,
                  winCount: 4,
                  totalContracts: 4,
                },
                {
                  date: "2024-12-11",
                  averagePnl: 28.069999999999997,
                  totalPnl: 224.55999999999997,
                  tradeCount: 8,
                  winCount: 4,
                  totalContracts: 8,
                },
              ];
              const maxP = Math.max(
                ...loadingMockData.map((d) => d.averagePnl),
              );
              const minP = Math.min(
                ...loadingMockData.map((d) => d.averagePnl),
              );
              const domainMin = Math.min(minP * 1.1, 0);
              const domainMax = Math.max(maxP * 1.1, 0);
              const margin =
                size === "small"
                  ? { left: 0, right: 0, top: 4, bottom: 20 }
                  : { left: 0, right: 0, top: 8, bottom: 24 };
              return (
                <div className={cn("w-full h-full animate-pulse relative")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={loadingMockData} margin={margin}>
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
                        tick={false}
                        minTickGap={size === "small" ? 30 : 50}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={60}
                        tickMargin={4}
                        tick={false}
                        domain={[domainMin, domainMax]}
                      />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                      <Bar
                        dataKey="averagePnl"
                        radius={[2, 2, 2, 2]}
                        maxBarSize={size === "small" ? 25 : 40}
                        className="transition-none"
                        fill="rgba(255,255,255,0.05)"
                      >
                        {loadingMockData.map((_, index) => (
                          <Cell
                            key={`skeleton-cell-${index}`}
                            fill="rgba(255,255,255,0.05)"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={
                  size === "small"
                    ? { left: 0, right: 0, top: 4, bottom: 20 }
                    : { left: 0, right: 0, top: 8, bottom: 24 }
                }
              >
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
                    const date = new Date(value);
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  domain={[
                    Math.min(minPnL * 1.1, 0),
                    Math.max(maxPnL * 1.1, 0),
                  ]}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Tooltip
                  content={renderTooltip}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar
                  dataKey="averagePnl"
                  radius={[2, 2, 2, 2]}
                  maxBarSize={size === "small" ? 25 : 40}
                  className="transition-all duration-300 ease-in-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.averagePnl >= 0 ? "white" : "white"}
                      stroke={entry.averagePnl >= 0 ? "white" : "white"}
                      strokeOpacity={entry.averagePnl >= 0 ? 0.42 : 0.06}
                      fillOpacity={entry.averagePnl >= 0 ? 0.98 : 0.22}
                      className={cn(
                        "hover:fill-opacity-100 transition-all duration-300",
                        entry.averagePnl >= 0 ? "chart-positive-emphasis" : "chart-negative-muted"
                      )}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 text-[10px] font-black uppercase tracking-widest">
              {config.selectedInstrument
                ? t("pnlPerContractDaily.noData")
                : t("pnlPerContractDaily.selectInstrument")}
            </div>
          )}
        </div>
      </div>
    </ChartSurface>
  );
}

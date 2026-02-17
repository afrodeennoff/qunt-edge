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
import { useData } from "@/context/data-provider";
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

interface PnLPerContractChartProps {
  size?: WidgetSize;
}

type InstrumentSummary = {
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
  instrument: string;
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

export default function PnLPerContractChart({
  size = "medium",
}: PnLPerContractChartProps) {
  const { formattedTrades: trades } = useData();
  const t = useI18n();

  const chartData = React.useMemo(() => {
    // Group trades by instrument
    const instrumentGroups = trades.reduce(
      (acc, trade) => {
        const instrument = trade.instrument || "Unknown";
        const netPnl = Number(trade.pnl) - Number(trade.commission || 0); // Calculate net PnL (gross PnL - commission)

        if (!acc[instrument]) {
          acc[instrument] = {
            trades: [],
            totalPnl: 0,
            totalContracts: 0,
            winCount: 0,
          };
        }
        acc[instrument].trades.push(trade);
        acc[instrument].totalPnl += netPnl;
        acc[instrument].totalContracts += Number(trade.quantity);
        if (netPnl > 0) {
          acc[instrument].winCount++;
        }
        return acc;
      },
      {} as Record<string, InstrumentSummary>,
    );

    // Convert to chart data format
    return Object.entries(instrumentGroups)
      .map(([instrument, data]) => ({
        instrument,
        averagePnl:
          data.totalContracts > 0 ? data.totalPnl / data.totalContracts : 0,
        totalPnl: data.totalPnl,
        tradeCount: data.trades.length,
        winCount: data.winCount,
        totalContracts: data.totalContracts,
      }))
      .sort((a, b) => b.averagePnl - a.averagePnl); // Sort by average PnL descending
  }, [trades]);

  const maxPnL = Math.max(...chartData.map((d) => d.averagePnl));
  const minPnL = Math.min(...chartData.map((d) => d.averagePnl));
  const hasData = chartData.some((d) => d.tradeCount > 0);
  const renderTooltip = React.useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as ChartDatum | undefined;
      if (!data) return null;
      return (
        <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[150px]">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">Instrument</span>
            <span className="font-black text-white text-[11px] uppercase tracking-widest">{data.instrument}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContract.tooltip.averagePnl")}</span>
              <span className={cn(
                "font-black text-[13px] tabular-nums",
                data.averagePnl >= 0 ? "metric-positive" : "metric-negative"
              )}>{formatCurrency(data.averagePnl)}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContract.tooltip.totalPnl")}</span>
              <span className="font-black text-white/60 text-[11px]">
                {formatCurrency(data.totalPnl)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContract.tooltip.trades")}</span>
              <span className="font-black text-white/60 text-[11px]">
                {data.tradeCount} ({formatWinRate(data.winCount, data.tradeCount)}% WR)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlPerContract.tooltip.totalContracts")}</span>
              <span className="font-black text-white/60 text-[11px]">
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
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === "small" ? "text-sm" : "text-base",
              )}
            >
              {t("pnlPerContract.title")}
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
                  <p className="text-xs">{t("pnlPerContract.description")}</p>
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
                    ? { left: 0, right: 0, top: 4, bottom: 12 }
                    : { left: 0, right: 0, top: 6, bottom: 16 }
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="text-border dark:opacity-[0.1] opacity-[0.2]"
                  vertical={false}
                />
                <XAxis
                  dataKey="instrument"
                  tickLine={false}
                  axisLine={false}
                  height={size === "small" ? 18 : 22}
                  tickMargin={size === "small" ? 2 : 6}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                  angle={size === "small" ? -45 : -45}
                  textAnchor="end"
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
                  domain={[Math.min(minPnL * 1.1, 0), Math.max(maxPnL * 1.1, 0)]}
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
                      fill="white"
                      fillOpacity={entry.averagePnl >= 0 ? 0.98 : 0.22}
                      stroke="white"
                      strokeOpacity={entry.averagePnl >= 0 ? 0.42 : 0.06}
                      strokeWidth={1}
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
            <div className="h-full w-full flex items-center justify-center text-xs text-fg-muted">
              {t("widgets.emptyState") ?? "No trades yet."}
            </div>
          )}
        </div>
      </div>
    </ChartSurface>
  );
}

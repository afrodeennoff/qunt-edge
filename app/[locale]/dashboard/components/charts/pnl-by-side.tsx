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
import { ChartSurface } from "@/components/ui/chart-surface";
import { useDashboardStats } from "@/context/data-provider";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";

interface PnLBySideChartProps {
  size?: WidgetSize;
}

type ChartDatum = {
  side: string;
  pnl: number;
  tradeCount: number;
  winCount: number;
  isAverage: boolean;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const formatWinRate = (wins: number, total: number) => {
  if (!Number.isFinite(wins) || !Number.isFinite(total) || total <= 0) return "0.0"
  return ((wins / total) * 100).toFixed(1)
}

export default function PnLBySideChart({
  size = "medium",
}: PnLBySideChartProps) {
  const { formattedTrades: trades } = useDashboardStats();
  const [showAverage, setShowAverage] = React.useState(true);
  const t = useI18n();

  const chartData = React.useMemo(() => {
    const longTrades = trades.filter(
      (trade) => trade.side?.toLowerCase() === "long",
    );
    const shortTrades = trades.filter(
      (trade) => trade.side?.toLowerCase() === "short",
    );

    const longPnL = longTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0);
    const shortPnL = shortTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0);

    const longWins = longTrades.filter((trade) => Number(trade.pnl) > 0).length;
    const shortWins = shortTrades.filter((trade) => Number(trade.pnl) > 0).length;

    return [
      {
        side: "Long",
        pnl: showAverage
          ? longTrades.length > 0
            ? longPnL / longTrades.length
            : 0
          : longPnL,
        tradeCount: longTrades.length,
        winCount: longWins,
        isAverage: showAverage,
      },
      {
        side: "Short",
        pnl: showAverage
          ? shortTrades.length > 0
            ? shortPnL / shortTrades.length
            : 0
          : shortPnL,
        tradeCount: shortTrades.length,
        winCount: shortWins,
        isAverage: showAverage,
      },
    ];
  }, [trades, showAverage]);

  const maxPnL = Math.max(...chartData.map((d) => d.pnl));
  const minPnL = Math.min(...chartData.map((d) => d.pnl));
  const hasData = chartData.some((d) => d.tradeCount > 0);
  const renderTooltip = React.useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as ChartDatum | undefined;
      if (!data) return null;
      return (
        <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[140px]">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
            <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlBySide.tooltip.side")}</span>
            <span className="font-black text-white text-[11px] uppercase tracking-widest">{data.side}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[9px] font-black uppercase tracking-wider">
                {data.isAverage ? t("pnlBySide.tooltip.averageTotal") : "Total"} P/L
              </span>
              <span className={cn(
                "font-black text-[13px] tabular-nums",
                data.pnl >= 0 ? "metric-positive" : "metric-negative"
              )}>{formatCurrency(data.pnl)}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlBySide.tooltip.winRate")}</span>
              <span className="font-black text-white/60 text-[11px]">
                {formatWinRate(data.winCount, data.tradeCount)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-wider">{t("pnlBySide.tooltip.trades")}</span>
              <span className="font-black text-white/60 text-[11px]">
                {data.tradeCount}
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
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === "small" ? "text-sm" : "text-base",
              )}
            >
              {t("pnlBySide.title")}
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
                  <p className="text-xs">{t("pnlBySide.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-wider text-fg-muted",
              )}
            >
              {t("pnlBySide.toggle.showAverage")}
            </span>
            <Switch
              checked={showAverage}
              onCheckedChange={setShowAverage}
              className="data-[state=checked]:bg-white"
            />
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
                  dataKey="side"
                  tickLine={false}
                  axisLine={false}
                  height={size === "small" ? 20 : 24}
                  tickMargin={size === "small" ? 4 : 8}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
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
                  domain={[Math.min(minPnL * 1.1, 0), Math.max(maxPnL * 1.1, 0)]}
                />
                <ReferenceLine y={0} stroke="hsl(var(--foreground) / 0.35)" />
                <Tooltip
                  content={renderTooltip}
                  cursor={{ fill: 'hsl(var(--foreground) / 0.35)' }}
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
                      fill="hsl(var(--foreground))"
                      fillOpacity={entry.pnl >= 0 ? 0.98 : 0.22}
                      stroke="hsl(var(--foreground))"
                      strokeOpacity={entry.pnl >= 0 ? 0.42 : 0.06}
                      strokeWidth={1}
                      className={cn(
                        "hover:fill-opacity-100 transition-all duration-300",
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

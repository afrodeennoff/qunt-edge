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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { useData } from "@/context/data-provider";
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

const chartConfig = {
  pnl: {
    label: "P/L",
    color: "hsl(var(--chart-loss))",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function PnLBySideChart({
  size = "medium",
}: PnLBySideChartProps) {
  const { formattedTrades: trades } = useData();
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
  const absMax = Math.max(Math.abs(maxPnL), Math.abs(minPnL));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/90 backdrop-blur-md p-3 border border-white/10 rounded-lg shadow-xl">
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("pnlBySide.tooltip.side")}
            </span>
            <span className="font-bold text-fg-primary text-xs">{data.side}</span>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {data.isAverage ? t("pnlBySide.tooltip.averageTotal") : "Total"}{" "}
              P/L
            </span>
            <span className={cn(
              "font-black text-sm",
              data.pnl >= 0 ? "text-white" : "text-fg-muted"
            )}>{formatCurrency(data.pnl)}</span>
          </div>
          <div className="flex flex-col pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("pnlBySide.tooltip.winRate")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {((data.winCount / data.tradeCount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col pt-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("pnlBySide.tooltip.trades")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {data.tradeCount} {t("pnlBySide.tooltip.trades")} ({data.winCount}{" "}
              {data.winCount === 1
                ? t("pnlBySide.tooltip.wins")
                : t("pnlBySide.tooltip.wins_plural")}
              )
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
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
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
                      fill={entry.pnl >= 0 ? "rgb(var(--accent-teal-rgb))" : "rgb(var(--rose-500-rgb))"}
                      stroke={entry.pnl >= 0 ? "rgb(var(--accent-teal-rgb))" : "rgb(var(--rose-500-rgb))"}
                      strokeOpacity={1}
                      fillOpacity={0.8}
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

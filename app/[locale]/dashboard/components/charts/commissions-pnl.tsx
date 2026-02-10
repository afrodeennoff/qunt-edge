"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Label,
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
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useI18n } from "@/locales/client";

interface CommissionsPnLChartProps {
  size?: WidgetSize;
}


const chartConfig = {
  pnl: {
    label: "Net P/L",
    color: "hsl(var(--chart-win))",
  },
  commissions: {
    label: "Commissions",
    color: "hsl(var(--chart-loss))",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function CommissionsPnLChart({
  size = "medium",
}: CommissionsPnLChartProps) {
  const { formattedTrades: trades } = useData();
  const t = useI18n();


  const chartData = React.useMemo(() => {
    const totalPnL = trades.reduce((sum, trade) => sum + Number(trade.pnl), 0);
    const totalCommissions = trades.reduce(
      (sum, trade) => sum + Number(trade.commission),
      0,
    );
    const total = Math.abs(totalPnL) + Math.abs(totalCommissions);
    const pnlPercent = total > 0 ? Number(((Math.abs(totalPnL) / total) * 100).toFixed(2)) : 0;
    const commPercent = total > 0 ? Number(((Math.abs(totalCommissions) / total) * 100).toFixed(2)) : 0;
    return [
      {
        name: t("commissions.legend.netPnl"),
        value: pnlPercent,
        color: chartConfig.pnl.color,
        raw: totalPnL,
      },
      {
        name: t("commissions.legend.commissions"),
        value: commPercent,
        color: chartConfig.commissions.color,
        raw: totalCommissions,
      },
    ];
  }, [trades, t]);
  const hasData = chartData.some((item) => item.value > 0);


  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip-surface">
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("commissions.tooltip.type")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {data.name}
            </span>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("commissions.tooltip.amount")}
            </span>
            <span className={cn(
              "font-bold text-sm",
              data.raw >= 0 ? "text-accent-teal" : "text-rose-500"
            )}>{formatCurrency(data.raw)}</span>
          </div>
          <div className="flex flex-col pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("commissions.tooltip.percentage")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {data.value.toFixed(2)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };


  const renderColorfulLegendText = (value: string, entry: any) => {
    return <span className="text-[10px] font-medium text-fg-muted uppercase tracking-wider">{value}</span>;
  };


  // Pie radii for consistency with trade-distribution
  const getInnerRadius = () => (size === 'small' ? 40 : 60);
  const getOuterRadius = () => (size === 'small' ? 60 : 80);

  return (
    <div data-chart-surface="modern" className="h-full flex flex-col bg-transparent">
      <div
        className={cn(
          "flex flex-col items-stretch space-y-0 border-b border-white/5 shrink-0",
          size === 'small' ? "p-2 h-10 justify-center" : "p-3 sm:p-4 h-14 justify-center"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <CardTitle
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === 'small' ? "text-sm" : "text-base"
              )}
            >
              {t("commissions.title")}
            </CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className={cn(
                    "text-fg-muted hover:text-fg-primary transition-colors cursor-help",
                    size === 'small' ? "h-3.5 w-3.5" : "h-4 w-4"
                  )} />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t("commissions.tooltip.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          size === 'small' ? "p-1" : "p-2 sm:p-4"
        )}
      >
        <div className="w-full h-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={getInnerRadius()}
                  outerRadius={getOuterRadius()}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  startAngle={90}
                  endAngle={-270}
                  stroke="rgba(0,0,0,0)"
                  strokeWidth={1}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === t("commissions.legend.netPnl") ? "rgb(var(--accent-teal-rgb))" : "rgb(var(--rose-500-rgb))"}
                      className="transition-all duration-300 ease-in-out hover:opacity-100 opacity-80"
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconSize={8}
                  iconType="circle"
                  formatter={renderColorfulLegendText}
                  wrapperStyle={{
                    paddingTop: size === 'small' ? 0 : 16
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
              </PieChart>
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

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
    color: "white",
  },
  commissions: {
    label: "Commissions",
    color: "rgba(255,255,255,0.2)",
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
        <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[140px]">
          <div className="flex flex-col mb-2 border-b border-white/5 pb-1">
            <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
              {t("commissions.tooltip.type")}
            </span>
            <span className="font-black text-white text-[11px] uppercase tracking-widest">
              {data.name}
            </span>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
              {t("commissions.tooltip.amount")}
            </span>
            <span className={cn(
              "font-black text-sm",
              data.raw >= 0 ? "text-white" : "text-white/40"
            )}>{formatCurrency(data.raw)}</span>
          </div>
          <div className="flex flex-col pt-2 border-t border-white/5">
            <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
              {t("commissions.tooltip.percentage")}
            </span>
            <span className="font-black text-white/60 text-[11px]">
              {data.value.toFixed(2)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderColorfulLegendText = (value: string, entry: any) => {
    return <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{value}</span>;
  };


  // Scale pie by widget size to avoid large dead space in taller cards.
  const pieLayout = React.useMemo(() => {
    if (size === "small") {
      return { innerRadius: "48%", outerRadius: "72%", cy: "46%", legendPaddingTop: 0 };
    }
    if (size === "large" || size === "extra-large") {
      return { innerRadius: "60%", outerRadius: "88%", cy: "45%", legendPaddingTop: 4 };
    }
    return { innerRadius: "56%", outerRadius: "84%", cy: "45%", legendPaddingTop: 6 };
  }, [size]);

  return (
    <div data-chart-surface="modern" className="h-full flex flex-col bg-transparent">
      <div
        className={cn(
          "flex flex-col items-stretch space-y-0 border-b border-white/5 shrink-0",
          size === 'small' ? "p-2 h-10 justify-center" : "p-3 sm:p-3.5 h-12 justify-center"
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
          size === 'small' ? "p-1" : "p-2 sm:p-3"
        )}
      >
        <div className="w-full h-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy={pieLayout.cy}
                  innerRadius={pieLayout.innerRadius}
                  outerRadius={pieLayout.outerRadius}
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
                      fill={entry.name === t("commissions.legend.netPnl") ? "white" : "rgba(255,255,255,0.2)"}
                      fillOpacity={entry.name === t("commissions.legend.netPnl") ? 0.8 : 0.4}
                      className="transition-all duration-300 ease-in-out hover:fill-opacity-100"
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
                    paddingTop: pieLayout.legendPaddingTop,
                    paddingBottom: 0
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

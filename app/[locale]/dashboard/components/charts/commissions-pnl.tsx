"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";
import { ChartConfig } from "@/components/ui/chart";
import { useData } from "@/context/data-provider";
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

interface CommissionsPnLChartProps {
  size?: WidgetSize;
}

function CommissionsTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; raw: number } }>;
}) {
  const t = useI18n();
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
            data.raw >= 0 ? "metric-positive" : "metric-negative"
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
    const totalPnL = trades.reduce((sum, trade) => sum + toFiniteNumber(trade.pnl, 0), 0);
    const totalCommissions = trades.reduce(
      (sum, trade) => sum + toFiniteNumber(trade.commission, 0),
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


  // Keep donut visually centered and larger to avoid dead space.
  const pieLayout = React.useMemo(() => {
    if (size === "small") {
      return { innerRadius: "56%", outerRadius: "92%", cy: "50%" };
    }
    if (size === "large" || size === "extra-large") {
      return { innerRadius: "64%", outerRadius: "96%", cy: "50%" };
    }
    return { innerRadius: "62%", outerRadius: "95%", cy: "50%" };
  }, [size]);

  return (
    <ChartSurface>
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
          size === 'small' ? "p-0.5" : "p-1"
        )}
      >
        <div className="w-full h-full flex min-h-0 flex-col">
          {hasData ? (
            <>
              <div className="min-h-0 flex-1">
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
                          fill={entry.name === t("commissions.legend.netPnl") ? "white" : "#52525B"}
                          fillOpacity={1}
                          stroke="none"
                          className={cn(
                            "hover:brightness-110 transition-all duration-300",
                            entry.name === t("commissions.legend.netPnl") ? "chart-positive-emphasis" : "chart-negative-muted"
                          )}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CommissionsTooltip />}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col items-center gap-3 pb-1 pt-2">
                <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase font-black tracking-[0.08em] text-white/58">
                  <span className="h-3 w-3 rounded-full bg-white" />
                  {t("commissions.legend.netPnl")}
                </span>
                <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase font-black tracking-[0.08em] text-white/58">
                  <span className="h-3 w-3 rounded-full bg-[#52525B]" />
                  {t("commissions.legend.commissions")}
                </span>
              </div>
            </>
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

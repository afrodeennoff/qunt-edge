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
import { translateWeekdayPnL } from "@/lib/translation-utils";
import { Button } from "@/components/ui/button";

const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday = 0, Saturday = 6

interface WeekdayPNLChartProps {
  size?: WidgetSize;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const chartConfig = {
  pnl: {
    label: "PnL",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function WeekdayPNLChart({
  size = "medium",
}: WeekdayPNLChartProps) {
  const { calendarData, weekdayFilter, setWeekdayFilter } = useData();
  const [darkMode, setDarkMode] = React.useState(false);
  const [activeDay, setActiveDay] = React.useState<number | null>(null);
  const t = useI18n();

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setDarkMode(isDarkMode);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const weekdayData = React.useMemo(() => {
    const weekdayTotals = daysOfWeek.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { total: 0, count: 0 },
      }),
      {} as Record<number, { total: number; count: number }>,
    );

    Object.entries(calendarData).forEach(([date, entry]) => {
      const dayOfWeek = new Date(date).getUTCDay();
      weekdayTotals[dayOfWeek].total += entry.pnl;
      weekdayTotals[dayOfWeek].count += 1;
    });

    return daysOfWeek.map((day) => ({
      day,
      pnl:
        weekdayTotals[day].count > 0
          ? weekdayTotals[day].total / weekdayTotals[day].count
          : 0,
      tradeCount: weekdayTotals[day].count,
    }));
  }, [calendarData]);

  const maxPnL = Math.max(...weekdayData.map((d) => d.pnl));
  const minPnL = Math.min(...weekdayData.map((d) => d.pnl));
  const hasData = weekdayData.some((d) => d.tradeCount > 0);

  const getColor = (value: number) => {
    const ratio = Math.abs((value - minPnL) / (maxPnL - minPnL));
    const baseColorVar = value >= 0 ? "--chart-win" : "--chart-loss";
    const intensity = darkMode
      ? Math.max(0.3, ratio) // Higher minimum intensity in dark mode
      : Math.max(0.2, ratio); // Lower minimum intensity in light mode
    return `hsl(var(${baseColorVar}) / ${intensity})`;
  };

  const handleClick = React.useCallback(() => {
    if (activeDay === null) return;
    const currentDays = weekdayFilter.days || [];
    if (currentDays.includes(activeDay)) {
      // Remove day from filter
      setWeekdayFilter({ days: currentDays.filter(d => d !== activeDay) });
    } else {
      // Add day to filter
      setWeekdayFilter({ days: [...currentDays, activeDay] });
    }
  }, [activeDay, weekdayFilter.days, setWeekdayFilter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    React.useEffect(() => {
      if (active && payload && payload.length) {
        setActiveDay(payload[0].payload.day);
      } else {
        setActiveDay(null);
      }
    }, [active, payload]);

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/90 backdrop-blur-md p-3 border border-white/10 rounded-lg shadow-xl">
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("weekdayPnl.tooltip.day")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {translateWeekdayPnL(t, data.day)}
            </span>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("weekdayPnl.tooltip.averagePnl")}
            </span>
            <span className={cn(
              "font-black text-sm",
              data.pnl >= 0 ? "metric-positive" : "metric-negative"
            )}>{formatCurrency(data.pnl)}</span>
          </div>
          <div className="flex flex-col pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase text-fg-muted font-bold tracking-wider">
              {t("weekdayPnl.tooltip.trades")}
            </span>
            <span className="font-bold text-fg-primary text-xs">
              {data.tradeCount}{" "}
              {data.tradeCount !== 1
                ? t("weekdayPnl.tooltip.trades_plural")
                : t("weekdayPnl.tooltip.trade")}
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
          size === "small" ? "p-2 h-10 justify-center" : "p-3 sm:p-3.5 h-12 justify-center",
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-fg-primary",
                size === "small" ? "text-sm" : "text-base",
              )}
            >
              {t("weekdayPnl.title")}
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
                  <p className="text-xs">{t("weekdayPnl.description")}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          {weekdayFilter.days && weekdayFilter.days.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] uppercase font-bold tracking-wider text-fg-muted hover:text-white hover:bg-white/10"
              onClick={() => setWeekdayFilter({ days: [] })}
            >
              {t("weekdayPnl.clearFilter")}
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
                data={weekdayData}
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
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  height={size === "small" ? 20 : 24}
                  tickMargin={size === "small" ? 4 : 8}
                  tick={{
                    fontSize: size === "small" ? 9 : 10,
                    fill: "var(--fg-muted)",
                  }}
                  tickFormatter={(value) => {
                    const dayName = translateWeekdayPnL(t, value);
                    return size === "small" ? dayName.slice(0, 3) : dayName;
                  }}
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
                  dataKey="pnl"
                  radius={[2, 2, 2, 2]}
                  maxBarSize={size === "small" ? 25 : 40}
                  className="transition-all duration-300 ease-in-out"
                >
                  {weekdayData.map((entry) => (
                    <Cell
                      key={`cell-${entry.day}`}
                      fill="white"
                      fillOpacity={
                        weekdayFilter.days && weekdayFilter.days.length > 0 && !weekdayFilter.days.includes(entry.day)
                          ? 0.3
                          : (entry.pnl >= 0 ? 0.98 : 0.22)
                      }
                      stroke="white"
                      strokeOpacity={
                        weekdayFilter.days && weekdayFilter.days.length > 0 && !weekdayFilter.days.includes(entry.day)
                          ? 0.3
                          : (entry.pnl >= 0 ? 0.42 : 0.06)
                      }
                      className={cn(
                        "hover:opacity-100",
                        entry.pnl >= 0 ? "chart-positive-emphasis" : "chart-negative-muted"
                      )}
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

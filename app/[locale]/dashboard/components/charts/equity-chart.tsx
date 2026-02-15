"use client";

import * as React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  TooltipProps,
  ReferenceLine,
} from "recharts";
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { fr, enUS } from "date-fns/locale";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn, toFiniteNumber } from "@/lib/utils";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSurface } from "@/components/ui/chart-surface";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

import { useData } from "@/context/data-provider";
import { useI18n } from "@/locales/client";
import { useCurrentLocale } from "@/locales/client";
import { useUserStore } from "@/store/user-store";
import { useEquityChartStore } from "@/store/equity-chart-store";
import { Payout as PrismaPayout } from "@/prisma/generated/prisma";
import { AccountSelectionPopover } from "./account-selection-popover";
import { getEquityChartDataAction } from "@/server/equity-chart";
import { usePathname } from "next/navigation";
import { hasFiniteKeyPrefix } from "@/lib/chart-guards";

interface EquityChartProps {
  size?: WidgetSize;
}

interface ChartDataPoint {
  date: string;
  [key: `equity_${string}`]: number | undefined;
  equity?: number;
  dailyPnL?: number | undefined;
  dailyCommissions?: number | undefined;
  netPnL?: number | undefined;
  [key: `payout_${string}`]: boolean;
  [key: `reset_${string}`]: boolean;
  [key: `payoutStatus_${string}`]: string;
  [key: `payoutAmount_${string}`]: number;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function getChartColorByIndex(index: number): string {
  const paletteVars = [
    "rgba(255,255,255,0.8)",
    "rgba(255,255,255,0.6)",
    "rgba(255,255,255,0.4)",
    "rgba(255,255,255,0.2)",
    "rgba(255,255,255,0.7)",
    "rgba(255,255,255,0.5)",
    "rgba(255,255,255,0.3)",
    "rgba(255,255,255,0.1)",
  ];
  return paletteVars[index % paletteVars.length];
}

function generateAccountColor(accountNumber: string): string {
  let hash = 0;
  for (let i = 0; i < accountNumber.length; i++) {
    const char = accountNumber.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % 8;
  return getChartColorByIndex(index);
}

function createAccountColorMap(accountNumbers: string[]): Map<string, string> {
  return new Map(
    accountNumbers.map((accountNumber) => [
      accountNumber,
      generateAccountColor(accountNumber),
    ])
  );
}

const getPayoutColors = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        fg: "rgba(255,255,255,0.4)",
        bg: "rgba(255,255,255,0.05)",
      };
    case "VALIDATED":
      return { fg: "white", bg: "rgba(255,255,255,0.1)" };
    case "REFUSED":
      return {
        fg: "rgba(255,255,255,0.2)",
        bg: "rgba(255,255,255,0.02)",
      };
    case "PAID":
      return { fg: "white", bg: "rgba(255,255,255,0.2)" };
    default:
      return {
        fg: "rgba(255,255,255,0.4)",
        bg: "rgba(255,255,255,0.05)",
      };
  }
};

const renderDot = (props: any) => {
  const { cx, cy, payload, index, dataKey } = props;
  if (typeof cx !== "number" || typeof cy !== "number") {
    return (
      <circle key={`dot-${index}-empty`} cx={cx} cy={cy} r={0} fill="none" />
    );
  }

  const accountNumber = dataKey?.replace("equity_", "");

  if (dataKey === "equity") {
    const resetAccounts = Object.keys(payload).filter(
      (key) => key.startsWith("reset_") && payload[key]
    );
    if (resetAccounts.length > 0) {
      return (
        <circle
          key={`dot-${index}-reset`}
          cx={cx}
          cy={cy}
          r={5}
          fill="white"
          fillOpacity={0.2}
          stroke="white"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
      );
    }

    const payoutAccounts = Object.keys(payload).filter(
      (key) => key.startsWith("payout_") && payload[key]
    );
    if (payoutAccounts.length > 0) {
      const accountNumber = payoutAccounts[0].replace("payout_", "");
      const status = payload[`payoutStatus_${accountNumber}`] || "";
      const { fg } = getPayoutColors(status);
      return (
        <circle
          key={`dot-${index}-payout`}
          cx={cx}
          cy={cy}
          r={4}
          fill={fg}
          stroke="hsl(var(--background))"
          strokeWidth={1}
        />
      );
    }
  } else if (accountNumber) {
    const hasReset = payload[`reset_${accountNumber}`];
    const hasPayout = payload[`payout_${accountNumber}`];

    if (hasReset) {
      return (
        <circle
          key={`dot-${index}-reset-${accountNumber}`}
          cx={cx}
          cy={cy}
          r={5}
          fill="hsl(var(--destructive))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
      );
    }

    if (hasPayout) {
      const status = payload[`payoutStatus_${accountNumber}`] || "";
      const { fg } = getPayoutColors(status);
      return (
        <circle
          key={`dot-${index}-payout-${accountNumber}`}
          cx={cx}
          cy={cy}
          r={4}
          fill={fg}
          stroke="hsl(var(--background))"
          strokeWidth={1}
        />
      );
    }
  }

  return (
    <circle key={`dot-${index}-empty`} cx={cx} cy={cy} r={0} fill="none" />
  );
};

const OptimizedTooltip = React.memo(
  ({
    active,
    payload,
    data,
    showIndividual,
    size,
    accountColorMap,
    t,
    onHover,
    dateLocale,
    isSharedView,
  }: {
    active?: boolean;
    payload?: any[];
    data?: ChartDataPoint;
    showIndividual: boolean;
    size: WidgetSize;
    accountColorMap: Map<string, string>;
    t: any;
    onHover?: (data: ChartDataPoint | null) => void;
    dateLocale: any;
    isSharedView?: boolean;
  }) => {
    const effectiveShowIndividual = isSharedView ? false : showIndividual;

    React.useEffect(() => {
      if (onHover && effectiveShowIndividual) {
        onHover(active && data ? data : null);
      }
    }, [active, data, onHover, effectiveShowIndividual]);

    if (effectiveShowIndividual) return null;

    if (!active || !payload || !payload.length || !data) return null;

    if (isSharedView) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-xs">
          <div className="grid gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {t("equity.tooltip.date")}
              </span>
              <span className="font-bold text-muted-foreground">
                {format(new Date(data.date), "MMM d, yyyy", {
                  locale: dateLocale,
                })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {t("equity.tooltip.totalEquity")}
              </span>
              <span className="font-bold text-foreground">
                {formatCurrency(data.equity || 0)}
              </span>
            </div>
          </div>
        </div>
      );
    }

    const resetAccounts: string[] = [];
    const payoutAccounts: Array<{
      account: string;
      amount: number;
      status: string;
    }> = [];

    Object.keys(data).forEach((key) => {
      if (key.startsWith("reset_") && data[key as keyof ChartDataPoint]) {
        const accountNumber = key.replace("reset_", "");
        resetAccounts.push(accountNumber);
      }
      if (key.startsWith("payout_") && data[key as keyof ChartDataPoint]) {
        const accountNumber = key.replace("payout_", "");
        const amount =
          (data[
            `payoutAmount_${accountNumber}` as keyof ChartDataPoint
          ] as number) || 0;
        const status =
          (data[
            `payoutStatus_${accountNumber}` as keyof ChartDataPoint
          ] as string) || "";
        payoutAccounts.push({ account: accountNumber, amount, status });
      }
    });

    return (
      <div className="bg-black/90 backdrop-blur-xl p-3 border border-white/10 rounded-lg shadow-2xl min-w-[160px]">
        <div className="grid gap-2">
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
              {t("equity.tooltip.date")}
            </span>
            <span className="font-black text-white/60 text-[10px] uppercase tracking-widest">
              {format(new Date(data.date), "MMM d, yyyy", {
                locale: dateLocale,
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[8px] uppercase text-white/40 font-black tracking-widest">
              {t("equity.tooltip.totalEquity")}
            </span>
            <span className={cn(
              "font-black text-sm tabular-nums",
              (data.equity || 0) >= 0 ? "metric-positive" : "metric-negative"
            )}>
              {formatCurrency(data.equity || 0)}
            </span>
          </div>

          {resetAccounts.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/5">
              <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
                {t("equity.tooltip.resets")}
              </span>
              <div className="space-y-1">
                {resetAccounts.map((account) => (
                  <div key={account} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          accountColorMap.get(account) ||
                          generateAccountColor(account),
                      }}
                    />
                    <span className="text-[10px] font-black metric-negative uppercase tracking-widest leading-none">
                      {account}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {payoutAccounts.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/5">
              <span className="text-[8px] uppercase text-white/20 font-black tracking-widest">
                {t("equity.tooltip.payouts")}
              </span>
              <div className="space-y-1">
                {payoutAccounts.map(({ account, amount, status }) => (
                  <div key={account} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            accountColorMap.get(account) ||
                            generateAccountColor(account),
                        }}
                      />
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">
                        {account}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white tabular-nums">
                        {formatCurrency(amount)}
                      </span>
                      <span
                        className="text-[7px] px-1 py-0.5 rounded font-black uppercase tracking-widest"
                        style={{
                          backgroundColor: getPayoutColors(status).bg,
                          color: getPayoutColors(status).fg,
                        }}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
OptimizedTooltip.displayName = "OptimizedTooltip";

const AccountsLegend = React.memo(
  ({
    accountNumbers,
    accountColorMap,
    selectedAccounts,
    chartData,
    hoveredData,
    onToggleAccount,
    t,
    dateLocale,
  }: {
    accountNumbers: string[];
    accountColorMap: Map<string, string>;
    selectedAccounts: Set<string>;
    chartData: ChartDataPoint[];
    hoveredData: ChartDataPoint | null;
    onToggleAccount: (accountNumber: string) => void;
    t: any;
    dateLocale: any;
  }) => {
    if (!accountNumbers.length) return null;

    const displayData = hoveredData || chartData[chartData.length - 1];
    const latestData = chartData[chartData.length - 1];
    const isHovered = !!hoveredData;

    const accountsWithEquity = accountNumbers
      .filter((acc) => selectedAccounts.has(acc))
      .map((acc) => ({
        accountNumber: acc,
        equity:
          (displayData?.[`equity_${acc}` as keyof ChartDataPoint] as number) ||
          0,
        latestEquity:
          (latestData?.[`equity_${acc}` as keyof ChartDataPoint] as number) ||
          0,
        color: accountColorMap.get(acc) || generateAccountColor(acc),
        hasPayout:
          (displayData?.[`payout_${acc}` as keyof ChartDataPoint] as boolean) ||
          false,
        hasReset:
          (displayData?.[`reset_${acc}` as keyof ChartDataPoint] as boolean) ||
          false,
        payoutStatus:
          (displayData?.[
            `payoutStatus_${acc}` as keyof ChartDataPoint
          ] as string) || "",
        payoutAmount:
          (displayData?.[
            `payoutAmount_${acc}` as keyof ChartDataPoint
          ] as number) || 0,
      }))
      .sort((a, b) => b.latestEquity - a.latestEquity);

    return (
      <div className="border-t pt-2 mt-2 h-[88px] flex flex-col">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t("equity.legend.title")}
              {isHovered && displayData && (
                <span className="ml-2 text-xs text-primary">
                  -{" "}
                  {format(new Date(displayData.date), "MMM d, yyyy", {
                    locale: dateLocale,
                  })}
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              ({accountsWithEquity.length} {t("equity.legend.accounts")})
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="z-9999 max-w-xs">
                  <p className="text-xs">
                    {t("equity.legend.maxAccountsInfo")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <AccountSelectionPopover
            accountNumbers={accountNumbers}
            selectedAccounts={Array.from(selectedAccounts)}
            onToggleAccount={onToggleAccount}
            t={t}
          />
        </div>
        <div className="flex gap-3 overflow-x-auto max-w-full flex-1 scrollbar-hide">
          <div className="flex gap-3 min-w-max">
            {accountsWithEquity
              .slice(0, 20)
              .map(
                ({
                  accountNumber,
                  equity,
                  color,
                  hasPayout,
                  hasReset,
                  payoutStatus,
                  payoutAmount,
                }) => (
                  <div
                    key={accountNumber}
                    className="flex items-center gap-1.5 shrink-0"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex flex-col h-[50px] justify-start">
                      <span className="text-xs font-medium text-foreground leading-tight">
                        {accountNumber}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {formatCurrency(equity)}
                      </span>
                      <div className="min-h-3.5 flex flex-col">
                        {hasPayout && (
                          <span
                            className="text-xs leading-tight"
                            style={{ color: getPayoutColors(payoutStatus).fg }}
                          >
                            {t("equity.legend.payout")}:{" "}
                            {formatCurrency(payoutAmount)}
                          </span>
                        )}
                        {hasReset && (
                          <span className="text-xs leading-tight metric-negative">
                            {t("equity.legend.reset")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            {accountsWithEquity.length > 20 && (
              <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground h-[50px]">
                +{accountsWithEquity.length - 20} more
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
AccountsLegend.displayName = "AccountsLegend";

export default function EquityChart({ size = "medium" }: EquityChartProps) {
  const pathname = usePathname();
  const isTeamView = pathname.includes("teams");
  const {
    instruments,
    accountNumbers,
    dateRange,
    pnlRange,
    tickRange,
    timeRange,
    tickFilter,
    weekdayFilter,
    hourFilter,
    tagFilter,
    isSharedView,
    formattedTrades,
  } = useData();
  const accounts = useUserStore((state) => state.accounts);
  const timezone = useUserStore((state) => state.timezone);
  const {
    config,
    setShowIndividual: setShowIndividualConfig,
    setSelectedAccountsToDisplay,
    toggleAccountSelection,
  } = useEquityChartStore();
  let showIndividual = config.showIndividual;
  if (isTeamView) {
    showIndividual = false;
  }
  const [hoveredData, setHoveredData] = React.useState<ChartDataPoint | null>(
    null
  );
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableAccountNumbers, setAvailableAccountNumbers] = React.useState<
    string[]
  >([]);

  const throttledSetHoveredData = React.useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout | null = null;
      return (data: ChartDataPoint | null) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setHoveredData(data), 16);
      };
    }, []),
    []
  );
  const yAxisRef = React.useRef<any>(null);
  const t = useI18n();
  const locale = useCurrentLocale();
  const dateLocale = locale === "fr" ? fr : enUS;

  const handleToggleAccount = React.useCallback(
    (accountNumber: string) => {
      toggleAccountSelection(accountNumber);
    },
    [toggleAccountSelection]
  );

  React.useEffect(() => {
    if (availableAccountNumbers.length === 0) return;

    const validSelection =
      config.selectedAccountsToDisplay?.filter((acc) =>
        availableAccountNumbers.includes(acc)
      ) || [];

    if (validSelection.length === 0) {
      setSelectedAccountsToDisplay(availableAccountNumbers);
    } else if (
      validSelection.length !== config.selectedAccountsToDisplay?.length
    ) {
      setSelectedAccountsToDisplay(validSelection);
    }
  }, [
    config.selectedAccountsToDisplay,
    availableAccountNumbers,
    setSelectedAccountsToDisplay,
  ]);

  const selectedAccounts = React.useMemo(
    () => new Set(config.selectedAccountsToDisplay || []),
    [config.selectedAccountsToDisplay]
  );

  const accountColorMap = React.useMemo(
    () => createAccountColorMap(availableAccountNumbers),
    [availableAccountNumbers]
  );

  const sanitizeChartData = React.useCallback((input: ChartDataPoint[]): ChartDataPoint[] => {
    return input
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const parsedDate = new Date(row.date);
        if (Number.isNaN(parsedDate.getTime())) return null;

        const normalized: ChartDataPoint = {
          date: formatInTimeZone(parsedDate, timezone, "yyyy-MM-dd"),
        } as ChartDataPoint;
        const normalizedRecord = normalized as unknown as Record<string, unknown>;

        for (const [key, value] of Object.entries(row)) {
          if (key === "date") continue;

          if (key.startsWith("payout_") || key.startsWith("reset_")) {
            normalizedRecord[key] = Boolean(value);
            continue;
          }

          if (key.startsWith("payoutStatus_")) {
            normalizedRecord[key] = typeof value === "string" ? value : "";
            continue;
          }

          normalizedRecord[key] = toFiniteNumber(value, 0);
        }

        normalized.equity = toFiniteNumber(
          normalizedRecord.equity,
          0
        );

        return normalized;
      })
      .filter((row): row is ChartDataPoint => Boolean(row));
  }, [timezone]);

  const computeClientSideData = React.useCallback(() => {
    if (!formattedTrades || formattedTrades.length === 0) {
      return {
        chartData: [],
        accountNumbers: [],
      };
    }

    const validTrades = formattedTrades.filter((trade) => {
      const timestamp = new Date(trade.entryDate).getTime();
      return Number.isFinite(timestamp);
    });

    if (validTrades.length === 0) {
      return {
        chartData: [],
        accountNumbers: [],
      };
    }

    const sortedTrades = [...validTrades].sort(
      (a, b) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );

    const dates = sortedTrades.map((t) =>
      formatInTimeZone(new Date(t.entryDate), timezone, "yyyy-MM-dd")
    );
    const startDate = dates.reduce((min, date) => (date < min ? date : min));
    const endDate = dates.reduce((max, date) => (date > max ? date : max));

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    end.setDate(end.getDate() + 1);

    const allDates = eachDayOfInterval({ start, end });

    const tradesMap = new Map<string, typeof sortedTrades>();
    sortedTrades.forEach((trade) => {
      const dateKey = formatInTimeZone(
        new Date(trade.entryDate),
        timezone,
        "yyyy-MM-dd"
      );
      if (!tradesMap.has(dateKey)) {
        tradesMap.set(dateKey, []);
      }
      tradesMap.get(dateKey)!.push(trade);
    });

    let cumulativeEquity = 0;
    const chartData: ChartDataPoint[] = [];

    allDates.forEach((date) => {
      const dateKey = formatInTimeZone(date, timezone, "yyyy-MM-dd");
      const dayTrades = tradesMap.get(dateKey) || [];

      dayTrades.forEach((trade) => {
        cumulativeEquity +=
          toFiniteNumber(trade.pnl, 0) - toFiniteNumber(trade.commission, 0);
      });

      chartData.push({
        date: dateKey,
        equity: toFiniteNumber(cumulativeEquity, 0),
      });
    });

    const uniqueAccountNumbers = Array.from(
      new Set(sortedTrades.map((trade) => trade.accountNumber))
    );

    return {
      chartData,
      accountNumbers: uniqueAccountNumbers,
    };
  }, [formattedTrades, timezone]);

  React.useEffect(() => {
    const isMock = formattedTrades?.length > 0 && formattedTrades[0].id.startsWith("mock-");

    if (isSharedView || isTeamView || isMock) {
      setIsLoading(true);
      try {
        const { chartData: computedData, accountNumbers: accNumbers } =
          computeClientSideData();
        setChartData(sanitizeChartData(computedData));
        setAvailableAccountNumbers(accNumbers);
      } catch (error) {
        console.error(
          "Failed to compute client-side equity chart data:",
          error
        );
        setChartData([]);
        setAvailableAccountNumbers([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const result = await getEquityChartDataAction({
          instruments,
          accountNumbers,
          dateRange:
            dateRange && dateRange.from && dateRange.to
              ? {
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString(),
              }
              : undefined,
          pnlRange,
          tickRange,
          timeRange,
          tickFilter,
          weekdayFilter,
          hourFilter,
          tagFilter,
          timezone,
          showIndividual,
          maxAccounts: 8,
          dataSampling: config.dataSampling,
          selectedAccounts: Array.from(selectedAccounts),
        });
        setChartData(sanitizeChartData(result.chartData));
        setAvailableAccountNumbers(result.accountNumbers);
      } catch (error) {
        console.error("Failed to fetch equity chart data:", error);
        setChartData([]);
        setAvailableAccountNumbers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, [
    isSharedView,
    computeClientSideData,
    instruments,
    accountNumbers,
    dateRange,
    accounts,
    pnlRange,
    tickRange,
    timeRange,
    tickFilter,
    weekdayFilter,
    hourFilter,
    tagFilter,
    timezone,
    showIndividual,
    config.dataSampling,
    selectedAccounts,
    sanitizeChartData,
  ]);

  const chartConfig = React.useMemo(() => {
    if (!showIndividual || isSharedView || isTeamView) {
      return {
        equity: {
          label: "Total Equity",
          color: "white",
        },
      } as ChartConfig;
    }

    const maxAccounts = 8;
    const accountsToShow = Array.from(selectedAccounts).slice(0, maxAccounts);
    return accountsToShow.reduce((acc, accountNumber) => {
      acc[`equity_${accountNumber}`] = {
        label: `Account ${accountNumber}`,
        color:
          accountColorMap.get(accountNumber) ||
          generateAccountColor(accountNumber),
      };
      return acc;
    }, {} as ChartConfig);
  }, [
    selectedAccounts,
    showIndividual,
    accountColorMap,
    isSharedView,
    isTeamView,
  ]);

  const chartLines = React.useMemo(() => {
    if (!showIndividual || isSharedView) {
      return (
        <Line
          type="monotone"
          dataKey="equity"
          strokeWidth={2}
          dot={renderDot}
          isAnimationActive={false}
          activeDot={{ r: 3, style: { fill: "white" } }}
          stroke="white"
          connectNulls={false}
        />
      );
    }

    const maxAccounts = 8;
    const accountsToShow = Array.from(selectedAccounts).slice(0, maxAccounts);
    return accountsToShow.map((accountNumber) => {
      const color =
        accountColorMap.get(accountNumber) ||
        generateAccountColor(accountNumber);
      return (
        <Line
          key={accountNumber}
          type="linear"
          dataKey={`equity_${accountNumber}`}
          strokeWidth={1.5}
          dot={renderDot}
          isAnimationActive={false}
          activeDot={{ r: 3, style: { fill: color } }}
          stroke={color}
          connectNulls={false}
        />
      );
    });
  }, [selectedAccounts, showIndividual, accountColorMap, isSharedView]);
  const hasData =
    hasFiniteKeyPrefix(chartData, "equity_") ||
    chartData.some((row) =>
      Number.isFinite(
        toFiniteNumber((row as unknown as Record<string, unknown>).equity, Number.NaN),
      ),
    );

  return (
    <ChartSurface>
      <div
        className={cn(
          "flex flex-col items-stretch space-y-0 border-b border-white/5 shrink-0",
          size === "small" ? "p-2 h-10 justify-center" : "p-3 sm:p-3.5 h-12 justify-center"
        )}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "line-clamp-1 font-bold tracking-tight text-white uppercase tracking-widest",
                size === "small" ? "text-sm" : "text-base"
              )}
            >
              {t("equity.title")}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    className={cn(
                      "text-white/20 hover:text-white transition-colors cursor-help",
                      size === "small" ? "h-3.5 w-3.5" : "h-4 w-4"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t("equity.description")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!isSharedView && !isTeamView && (
            <div className="flex items-center space-x-2">
              <Switch
                id="view-mode"
                checked={showIndividual}
                onCheckedChange={setShowIndividualConfig}
                className="shrink-0 scale-75"
              />
              <Label htmlFor="view-mode" className="text-xs text-fg-secondary cursor-pointer">
                {t("equity.toggle.individual")}
              </Label>
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0",
          size === "small" ? "p-1" : "p-2 sm:p-3"
        )}
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-fg-muted text-sm animate-pulse">
                  {t("equity.loading")}
                </div>
              </div>
            ) : hasData ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={
                      size === "small"
                        ? { left: 0, right: 0, top: 4, bottom: 0 }
                        : { left: 0, right: 0, top: 10, bottom: 0 }
                    }
                    onMouseLeave={() => setHoveredData(null)}
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
                      minTickGap={30}
                      tick={{
                        fontSize: size === "small" ? 9 : 10,
                        fill: "var(--fg-muted)",
                      }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        if (Number.isNaN(date.getTime())) return "";
                        return format(date, "MMM d", { locale: dateLocale });
                      }}
                    />
                    <YAxis
                      ref={yAxisRef}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tickMargin={4}
                      tick={{
                        fontSize: size === "small" ? 9 : 10,
                        fill: "var(--fg-muted)",
                      }}
                      tickFormatter={(value) => `$${(toFiniteNumber(value, 0) / 1000).toFixed(1)}k`}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="white"
                      strokeDasharray="3 3"
                      strokeOpacity={0.1}
                    />
                    <ChartTooltip
                      content={({
                        active,
                        payload,
                      }: TooltipProps<number, string>) => (
                        <OptimizedTooltip
                          active={active}
                          payload={payload}
                          data={payload?.[0]?.payload as ChartDataPoint}
                          showIndividual={showIndividual}
                          size={size}
                          accountColorMap={accountColorMap}
                          t={t}
                          onHover={throttledSetHoveredData}
                          dateLocale={dateLocale}
                          isSharedView={isSharedView}
                        />
                      )}
                    />
                    {chartLines}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-fg-muted text-xs">
                {t("widgets.emptyState") ?? "No trades yet."}
              </div>
            )}
          </div>

          {showIndividual &&
            !isSharedView &&
            !isTeamView &&
            size !== "small" && (
              <AccountsLegend
                accountNumbers={availableAccountNumbers}
                accountColorMap={accountColorMap}
                selectedAccounts={selectedAccounts}
                chartData={chartData}
                hoveredData={hoveredData}
                onToggleAccount={handleToggleAccount}
                t={t}
                dateLocale={dateLocale}
              />
            )}
        </div>
      </div>
    </ChartSurface>
  );
}

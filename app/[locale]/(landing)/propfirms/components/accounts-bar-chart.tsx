"use client"

import * as React from "react"
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface AccountsBarChartProps {
  data: Array<{
    propfirmName: string
    accountsCount: number
    sizedAccountsCount: number
    totalAccountValue: number
    paidAmount: number
    pendingAmount: number
    refusedAmount: number
    sizeBreakdown: string
  }>
  chartTitle: string
  legendLabels: {
    registeredAccounts: string
    sizedAccounts: string
    totalAccountValue: string
    paid: string
    pending: string
    refused: string
  }
}

const chartConfig = {
  paidAmount: {
    label: "Paid",
    color: "hsl(var(--chart-1) / 0.70)",
  },
  pendingAmount: {
    label: "Pending",
    color: "hsl(var(--chart-2) / 0.38)",
  },
  refusedAmount: {
    label: "Refused",
    color: "hsl(var(--chart-3) / 0.26)",
  },
  totalAccountValue: {
    label: "Total Account Value",
    color: "hsl(var(--chart-1))",
  },
  accountsCount: {
    label: "Registered Accounts",
    color: "hsl(var(--chart-2))",
  },
  sizedAccountsCount: {
    label: "Sized Accounts",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  notation: "compact",
})

export function AccountsBarChart({
  data,
  chartTitle,
  legendLabels,
}: AccountsBarChartProps) {
  const [showZeroFirms, setShowZeroFirms] = React.useState(false)
  // Minimal default: show the "shape" first (value + registered), let users add layers as needed.
  const [showPayoutBars, setShowPayoutBars] = React.useState(false)
  const [showAccountValue, setShowAccountValue] = React.useState(true)
  const [showRegistered, setShowRegistered] = React.useState(true)
  const [showSized, setShowSized] = React.useState(false)

  // Sort by total account value then account count to emphasize firms with the most exposure.
  const sortedData = React.useMemo(
    () => [...data].sort((a, b) => b.totalAccountValue - a.totalAccountValue || b.accountsCount - a.accountsCount),
    [data]
  )

  const visibleData = React.useMemo(() => {
    const nonZero = sortedData.filter((row) => {
      const anyMoney = row.totalAccountValue > 0 || row.paidAmount > 0 || row.pendingAmount > 0 || row.refusedAmount > 0
      const anyCounts = row.accountsCount > 0 || row.sizedAccountsCount > 0
      return anyMoney || anyCounts
    })

    const base = showZeroFirms ? sortedData : nonZero
    // Keep the chart readable; the grid below has the full list anyway.
    return base.slice(0, 14)
  }, [showZeroFirms, sortedData])

  const hasAnyCounts = React.useMemo(
    () => visibleData.some((d) => d.accountsCount > 0 || d.sizedAccountsCount > 0),
    [visibleData]
  )
  const hasAnyMoney = React.useMemo(
    () => visibleData.some((d) => d.totalAccountValue > 0 || d.paidAmount > 0 || d.pendingAmount > 0 || d.refusedAmount > 0),
    [visibleData]
  )

  return (
    <Card data-chart-surface="modern">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{chartTitle}</CardTitle>
          <p className="text-xs text-white/60">Minimal view. Add layers if you need more detail.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="mono"
            size="sm"
            aria-pressed={showPayoutBars}
            onClick={() => setShowPayoutBars((v) => !v)}
            className={cn(
              "h-7 px-2 text-[11px] tracking-wide",
              !showPayoutBars && "opacity-55"
            )}
          >
            Payouts
          </Button>
          <Button
            type="button"
            variant="mono"
            size="sm"
            aria-pressed={showAccountValue}
            onClick={() => setShowAccountValue((v) => !v)}
            className={cn(
              "h-7 px-2 text-[11px] tracking-wide",
              !showAccountValue && "opacity-55"
            )}
          >
            Value
          </Button>
          <Button
            type="button"
            variant="mono"
            size="sm"
            aria-pressed={showRegistered}
            onClick={() => setShowRegistered((v) => !v)}
            className={cn(
              "h-7 px-2 text-[11px] tracking-wide",
              !showRegistered && "opacity-55"
            )}
          >
            Reg
          </Button>
          <Button
            type="button"
            variant="mono"
            size="sm"
            aria-pressed={showSized}
            onClick={() => setShowSized((v) => !v)}
            className={cn(
              "h-7 px-2 text-[11px] tracking-wide",
              !showSized && "opacity-55"
            )}
          >
            Sized
          </Button>
          <Button
            type="button"
            variant="mono"
            size="sm"
            aria-pressed={showZeroFirms}
            onClick={() => setShowZeroFirms((v) => !v)}
            className={cn(
              "h-7 px-2 text-[11px] tracking-wide",
              !showZeroFirms && "opacity-55"
            )}
          >
            {showZeroFirms ? "Zeros: On" : "Zeros: Off"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <ComposedChart
            data={visibleData}
            margin={{ left: 0, right: 8, top: 10, bottom: 40 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 10"
              opacity={0.32}
              className="stroke-muted"
            />
            <XAxis
              dataKey="propfirmName"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              angle={-35}
              textAnchor="end"
              height={86}
              minTickGap={14}
              interval="preserveStartEnd"
              tickFormatter={(value: string) => (value.length > 12 ? `${value.slice(0, 12)}…` : value)}
              tick={{
                fontSize: 11,
                fill: "currentColor",
              }}
            />
            <YAxis
              yAxisId="amounts"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={66}
              hide={!hasAnyMoney}
              allowDecimals={false}
              domain={[
                0,
                (dataMax: number) => {
                  if (!Number.isFinite(dataMax) || dataMax <= 0) return 1
                  // Round up to a nicer boundary so the chart doesn't feel cramped.
                  const pow = Math.pow(10, Math.max(0, String(Math.floor(dataMax)).length - 2))
                  return Math.ceil(dataMax / pow) * pow
                },
              ]}
              tick={{
                fontSize: 11,
                fill: "currentColor",
              }}
              tickFormatter={(value) => compactCurrency.format(value)}
            />
            <YAxis
              yAxisId="counts"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={44}
              hide={!hasAnyCounts}
              allowDecimals={false}
              domain={[
                0,
                (dataMax: number) => {
                  if (!Number.isFinite(dataMax) || dataMax <= 0) return 1
                  return Math.max(1, Math.ceil(dataMax))
                },
              ]}
              tick={{
                fontSize: 11,
                fill: "currentColor",
              }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => <span className="font-semibold text-white">{String(label)}</span>}
                  formatter={(value, name, item) => {
                    const key = String(name)
                    if (key === "totalAccountValue" || key === "paidAmount" || key === "pendingAmount" || key === "refusedAmount") {
                      const labelMap: Record<string, string> = {
                        totalAccountValue: legendLabels.totalAccountValue,
                        paidAmount: legendLabels.paid,
                        pendingAmount: legendLabels.pending,
                        refusedAmount: legendLabels.refused,
                      }
                      return [compactCurrency.format(Number(value)), labelMap[key]]
                    }

                    if (key === "accountsCount") {
                      return [Number(value).toLocaleString(), legendLabels.registeredAccounts]
                    }

                    if (key === "sizedAccountsCount") {
                      const breakdown = item?.payload?.sizeBreakdown
                      return [
                        `${Number(value).toLocaleString()}${breakdown ? ` • ${breakdown}` : ""}`,
                        legendLabels.sizedAccounts,
                      ]
                    }

                    return [String(value), key]
                  }}
                />
              }
            />
            {showPayoutBars ? (
              <>
                <Bar
                  yAxisId="amounts"
                  dataKey="refusedAmount"
                  stackId="payouts"
                  fill="var(--color-refusedAmount)"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  yAxisId="amounts"
                  dataKey="pendingAmount"
                  stackId="payouts"
                  fill="var(--color-pendingAmount)"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  yAxisId="amounts"
                  dataKey="paidAmount"
                  stackId="payouts"
                  fill="var(--color-paidAmount)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                />
              </>
            ) : null}
            {showAccountValue ? (
              <Line
                yAxisId="amounts"
                type="monotone"
                dataKey="totalAccountValue"
                stroke="var(--color-totalAccountValue)"
                strokeWidth={3}
                strokeLinecap="round"
                dot={false}
                activeDot={{ r: 5 }}
              />
            ) : null}
            {showRegistered ? (
              <Line
                yAxisId="counts"
                type="monotone"
                dataKey="accountsCount"
                stroke="var(--color-accountsCount)"
                strokeWidth={2.75}
                strokeDasharray="10 6"
                strokeLinecap="round"
                dot={false}
                activeDot={{ r: 4.5 }}
              />
            ) : null}
            {showSized ? (
              <Line
                yAxisId="counts"
                type="monotone"
                dataKey="sizedAccountsCount"
                stroke="var(--color-sizedAccountsCount)"
                strokeWidth={2.25}
                strokeDasharray="3 5"
                strokeLinecap="round"
                dot={false}
                activeDot={{ r: 4 }}
              />
            ) : null}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

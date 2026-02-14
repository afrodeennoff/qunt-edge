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
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

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
    color: "hsl(var(--chart-4))",
  },
  pendingAmount: {
    label: "Pending",
    color: "hsl(var(--chart-5))",
  },
  refusedAmount: {
    label: "Refused",
    color: "hsl(var(--chart-3))",
  },
  totalAccountValue: {
    label: "Total Account Value",
    color: "#ef4444",
  },
  accountsCount: {
    label: "Registered Accounts",
    color: "#3b82f6",
  },
  sizedAccountsCount: {
    label: "Sized Accounts",
    color: "#facc15",
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
  // Sort by total account value then account count to emphasize firms with the most exposure.
  const sortedData = React.useMemo(
    () => [...data].sort((a, b) => b.totalAccountValue - a.totalAccountValue || b.accountsCount - a.accountsCount),
    [data]
  )

  return (
    <Card data-chart-surface="modern">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ComposedChart
            data={sortedData}
            margin={{ left: 0, right: 8, top: 8, bottom: 40 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="propfirmName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{
                fontSize: 12,
                fill: "currentColor",
              }}
            />
            <YAxis
              yAxisId="amounts"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={72}
              tick={{
                fontSize: 12,
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
              width={52}
              tick={{
                fontSize: 12,
                fill: "currentColor",
              }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
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
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              yAxisId="amounts"
              dataKey="refusedAmount"
              stackId="payouts"
              fill="var(--color-refusedAmount)"
              radius={[0, 0, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              yAxisId="amounts"
              dataKey="pendingAmount"
              stackId="payouts"
              fill="var(--color-pendingAmount)"
              radius={[0, 0, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              yAxisId="amounts"
              dataKey="paidAmount"
              stackId="payouts"
              fill="var(--color-paidAmount)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
            <Line
              yAxisId="amounts"
              type="monotone"
              dataKey="totalAccountValue"
              stroke="var(--color-totalAccountValue)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0, fill: "var(--color-totalAccountValue)" }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="counts"
              type="monotone"
              dataKey="accountsCount"
              stroke="var(--color-accountsCount)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0, fill: "var(--color-accountsCount)" }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="counts"
              type="monotone"
              dataKey="sizedAccountsCount"
              stroke="var(--color-sizedAccountsCount)"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 3.5, strokeWidth: 0, fill: "var(--color-sizedAccountsCount)" }}
              activeDot={{ r: 4.5 }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

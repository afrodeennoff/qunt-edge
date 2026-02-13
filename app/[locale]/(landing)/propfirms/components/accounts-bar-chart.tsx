"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

interface AccountsBarChartProps {
  data: Array<{
    propfirmName: string
    accountsCount: number
  }>
  chartTitle: string
  registeredAccountsLabel: string
}

const chartConfig = {
  accountsCount: {
    label: "Accounts",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function AccountsBarChart({
  data,
  chartTitle,
  registeredAccountsLabel
}: AccountsBarChartProps) {
  // Sort data by accounts count descending for better visualization
  const sortedData = React.useMemo(
    () => [...data].sort((a, b) => b.accountsCount - a.accountsCount),
    [data]
  )

  return (
    <Card data-chart-surface="modern">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
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
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tick={{
                fontSize: 12,
                fill: "currentColor",
              }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    `${value} ${registeredAccountsLabel}`,
                  ]}
                />
              }
            />
            <Bar
              dataKey="accountsCount"
              fill="var(--color-accountsCount)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

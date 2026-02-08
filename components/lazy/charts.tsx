'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

export const EquityChart = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/equity-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>

export const PnLBarChart = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/pnl-bar-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>

export const WeekdayPnL = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/weekday-pnl'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>

export const TimeRangePerformance = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/time-range-performance'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>

export const TradeDistribution = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/trade-distribution'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>

export const PnLBySide = dynamic(
  () => import('@/app/[locale]/dashboard/components/charts/pnl-by-side'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
) as ComponentType<any>

function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

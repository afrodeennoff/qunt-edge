import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WidgetType, WidgetSize } from "../types/dashboard"
import { LazyWidgetRenderer } from "../components/lazy-widget"

export type WidgetPriority = "immediate" | "near" | "deferred"

export interface WidgetConfig {
  type: WidgetType
  defaultSize: WidgetSize
  allowedSizes: WidgetSize[]
  category: "charts" | "statistics" | "tables" | "other"
  requiresFullWidth?: boolean
  minWidth?: number
  minHeight?: number
  previewHeight?: number
}

type WidgetRenderOptions = {
  priority?: WidgetPriority
}

const widgetTitles: Record<WidgetType, string> = {
  weekdayPnlChart: "Weekday PnL",
  pnlChart: "PnL Chart",
  tradingViewChart: "TradingView Live Chart",
  timeOfDayChart: "Time of Day",
  timeInPositionChart: "Time in Position",
  equityChart: "Equity Chart",
  pnlBySideChart: "PnL by Side",
  pnlPerContractChart: "PnL per Contract",
  pnlPerContractDailyChart: "Daily PnL/Contract",
  tickDistribution: "Tick Distribution",
  dailyTickTarget: "Daily Tick Target",
  commissionsPnl: "Commissions",
  calendarWidget: "Calendar",
  averagePositionTime: "Avg Position Time",
  cumulativePnl: "Cumulative PnL",
  longShortPerformance: "Long/Short",
  tradePerformance: "Trade Performance",
  winningStreak: "Winning Streak",
  profitFactor: "Profit Factor",
  statisticsWidget: "Statistics",
  tradeTableReview: "Trade Table",
  chatWidget: "AI Assistant",
  tradeDistribution: "Trade Distribution",
  propFirm: "Accounts",
  timeRangePerformance: "Time Range Performance",
  tagWidget: "Tags",
  riskRewardRatio: "Risk Reward",
  mindsetWidget: "Mindset",
  tradingScore: "Trading Score",
  expectancy: "Expectancy",
  riskMetrics: "Risk Metrics",
}

function PreviewSkeleton({ title }: { title: string }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted/80" />
        <div className="h-24 w-full animate-pulse rounded bg-muted/60" />
      </CardContent>
    </Card>
  )
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetConfig> = {
  tradingViewChart: {
    type: "tradingViewChart",
    defaultSize: "large",
    allowedSizes: ["small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  weekdayPnlChart: {
    type: "weekdayPnlChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  pnlChart: {
    type: "pnlChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  timeOfDayChart: {
    type: "timeOfDayChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  timeInPositionChart: {
    type: "timeInPositionChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  equityChart: {
    type: "equityChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  pnlBySideChart: {
    type: "pnlBySideChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  pnlPerContractChart: {
    type: "pnlPerContractChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  pnlPerContractDailyChart: {
    type: "pnlPerContractDailyChart",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  tickDistribution: {
    type: "tickDistribution",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  commissionsPnl: {
    type: "commissionsPnl",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  tradeDistribution: {
    type: "tradeDistribution",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  averagePositionTime: {
    type: "averagePositionTime",
    defaultSize: "tiny",
    allowedSizes: ["tiny"],
    category: "statistics",
    previewHeight: 100,
  },
  cumulativePnl: {
    type: "cumulativePnl",
    defaultSize: "tiny",
    allowedSizes: ["tiny"],
    category: "statistics",
    previewHeight: 100,
  },
  longShortPerformance: {
    type: "longShortPerformance",
    defaultSize: "tiny",
    allowedSizes: ["tiny"],
    category: "statistics",
    previewHeight: 100,
  },
  tradePerformance: {
    type: "tradePerformance",
    defaultSize: "tiny",
    allowedSizes: ["tiny"],
    category: "statistics",
    previewHeight: 100,
  },
  winningStreak: {
    type: "winningStreak",
    defaultSize: "tiny",
    allowedSizes: ["tiny"],
    category: "statistics",
    previewHeight: 100,
  },
  profitFactor: {
    type: "profitFactor",
    defaultSize: "tiny",
    allowedSizes: ["tiny"],
    category: "statistics",
    previewHeight: 100,
  },
  dailyTickTarget: {
    type: "dailyTickTarget",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  statisticsWidget: {
    type: "statisticsWidget",
    defaultSize: "medium",
    allowedSizes: ["medium"],
    category: "statistics",
    previewHeight: 100,
  },
  chatWidget: {
    type: "chatWidget",
    defaultSize: "large",
    allowedSizes: ["large"],
    category: "other",
    previewHeight: 300,
  },
  calendarWidget: {
    type: "calendarWidget",
    defaultSize: "large",
    allowedSizes: ["large", "extra-large"],
    category: "other",
    previewHeight: 500,
  },
  tradeTableReview: {
    type: "tradeTableReview",
    defaultSize: "extra-large",
    allowedSizes: ["large", "extra-large"],
    category: "tables",
    requiresFullWidth: true,
    previewHeight: 300,
  },
  propFirm: {
    type: "propFirm",
    defaultSize: "extra-large",
    allowedSizes: ["medium", "large", "extra-large"],
    category: "tables",
    previewHeight: 300,
  },
  timeRangePerformance: {
    type: "timeRangePerformance",
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large", "extra-large"],
    category: "charts",
    previewHeight: 300,
  },
  mindsetWidget: {
    type: "mindsetWidget",
    defaultSize: "large",
    allowedSizes: ["extra-large", "large"],
    category: "other",
    previewHeight: 300,
  },
  tagWidget: {
    type: "tagWidget",
    defaultSize: "small",
    allowedSizes: ["small", "medium", "large"],
    category: "other",
    previewHeight: 300,
  },
  riskRewardRatio: {
    type: "riskRewardRatio",
    defaultSize: "tiny",
    allowedSizes: ["tiny"],
    category: "statistics",
    previewHeight: 100,
  },
  tradingScore: {
    type: "tradingScore",
    defaultSize: "medium",
    allowedSizes: ["medium"],
    category: "statistics",
    previewHeight: 300,
  },
  expectancy: {
    type: "expectancy",
    defaultSize: "medium",
    allowedSizes: ["medium"],
    category: "statistics",
    previewHeight: 300,
  },
  riskMetrics: {
    type: "riskMetrics",
    defaultSize: "medium",
    allowedSizes: ["medium", "large"],
    category: "statistics",
    previewHeight: 300,
  },
}

export function getWidgetsByCategory(category: WidgetConfig["category"]) {
  return Object.values(WIDGET_REGISTRY).filter((widget) => widget.category === category)
}

export function isValidWidgetSize(type: WidgetType, size: WidgetSize): boolean {
  return WIDGET_REGISTRY[type].allowedSizes.includes(size)
}

export function getDefaultWidgetSize(type: WidgetType): WidgetSize {
  return WIDGET_REGISTRY[type].defaultSize
}

export function requiresFullWidth(type: WidgetType): boolean {
  return WIDGET_REGISTRY[type].requiresFullWidth ?? false
}

export function getWidgetComponent(type: WidgetType, size: WidgetSize, options?: WidgetRenderOptions): React.JSX.Element {
  return <LazyWidgetRenderer type={type} size={size} priority={options?.priority ?? "immediate"} />
}

export function getWidgetPreview(type: WidgetType): React.JSX.Element {
  return <PreviewSkeleton title={widgetTitles[type]} />
}

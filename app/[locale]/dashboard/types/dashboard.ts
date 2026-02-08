export type WidgetType =
  | 'equityChart'
  | 'tradingViewChart'
  | 'pnlChart'
  | 'timeOfDayChart'
  | 'timeInPositionChart'
  | 'weekdayPnlChart'
  | 'pnlBySideChart'
  | 'pnlPerContractChart'
  | 'pnlPerContractDailyChart'
  | 'tickDistribution'
  | 'dailyTickTarget'
  | 'commissionsPnl'
  | 'calendarWidget'
  | 'averagePositionTime'
  | 'cumulativePnl'
  | 'longShortPerformance'
  | 'tradePerformance'
  | 'winningStreak'
  | 'profitFactor'
  | 'statisticsWidget'
  | 'tradeTableReview'
  | 'chatWidget'
  | 'tradeDistribution'
  | 'propFirm'
  | 'timeRangePerformance'
  | 'tagWidget'
  | 'riskRewardRatio'
  | 'mindsetWidget'
  | 'tradingScore'
  | 'expectancy'
  | 'riskMetrics'
export type WidgetSize = 'tiny' | 'small' | 'small-long' | 'medium' | 'large' | 'extra-large'

export interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

export interface Widget extends LayoutItem {
  type: WidgetType
  size: WidgetSize
  static?: boolean
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  updatedAt?: string | number | Date | null
}

export interface Layouts {
  desktop: Widget[]
  mobile: Widget[]
}

export interface LayoutState {
  layouts: Layouts
  activeLayout: 'desktop' | 'mobile'
} 

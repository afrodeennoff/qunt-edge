import { WidgetSize, WidgetType } from "../types/dashboard";

export type WidgetMetadata = {
  defaultSize: WidgetSize;
  allowedSizes: WidgetSize[];
  requiresFullWidth?: boolean;
};

export const WIDGET_METADATA: Record<WidgetType, WidgetMetadata> = {
  smartInsights: { defaultSize: "medium", allowedSizes: ["small", "medium", "large"] },
  weekdayPnlChart: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  pnlChart: { defaultSize: "medium", allowedSizes: ["small", "small-long", "medium", "large"] },
  timeOfDayChart: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  timeInPositionChart: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  equityChart: { defaultSize: "medium", allowedSizes: ["small", "small-long", "medium", "large"] },
  pnlBySideChart: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  pnlPerContractChart: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  pnlPerContractDailyChart: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  tickDistribution: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  commissionsPnl: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  tradeDistribution: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  averagePositionTime: { defaultSize: "tiny", allowedSizes: ["tiny"] },
  cumulativePnl: { defaultSize: "tiny", allowedSizes: ["tiny"] },
  longShortPerformance: { defaultSize: "tiny", allowedSizes: ["tiny"] },
  tradePerformance: { defaultSize: "tiny", allowedSizes: ["tiny"] },
  winningStreak: { defaultSize: "tiny", allowedSizes: ["tiny"] },
  profitFactor: { defaultSize: "tiny", allowedSizes: ["tiny"] },
  dailyTickTarget: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  statisticsWidget: { defaultSize: "medium", allowedSizes: ["medium"] },
  chatWidget: { defaultSize: "large", allowedSizes: ["large"] },
  calendarWidget: { defaultSize: "large", allowedSizes: ["large", "extra-large"] },
  tradeTableReview: {
    defaultSize: "extra-large",
    allowedSizes: ["large", "extra-large"],
    requiresFullWidth: true,
  },
  propFirm: { defaultSize: "extra-large", allowedSizes: ["medium", "large", "extra-large"] },
  propFirmCatalogue: {
    defaultSize: "medium",
    allowedSizes: ["small", "medium", "large", "extra-large"],
  },
  timeRangePerformance: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
  mindsetWidget: { defaultSize: "large", allowedSizes: ["extra-large", "large"] },
  tagWidget: { defaultSize: "small", allowedSizes: ["small", "medium", "large"] },
  riskRewardRatio: { defaultSize: "tiny", allowedSizes: ["tiny"] },
  tradingScore: { defaultSize: "small", allowedSizes: ["small", "small-long", "medium"] },
  expectancy: { defaultSize: "small", allowedSizes: ["small", "small-long", "medium"] },
  riskMetrics: {
    defaultSize: "medium",
    allowedSizes: ["small", "small-long", "medium", "large"],
  },
};

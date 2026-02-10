"use client"

import { DashboardTopNav } from "./top-nav"
import { ChartPanel } from "./chart-future/chart-panel"
import { AssistantPanel } from "./chart-future/assistant-panel"

export function ChartTheFuturePanel() {
  return (
    <div className="rounded-[28px] border border-border/70 bg-[hsl(var(--qe-surface-0))]/95 p-3 shadow-sm backdrop-blur-sm sm:p-4 lg:p-5">
      <DashboardTopNav title="Chart the Future" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
        <ChartPanel />
        <AssistantPanel />
      </div>
    </div>
  )
}

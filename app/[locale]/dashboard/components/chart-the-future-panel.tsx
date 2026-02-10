"use client"

import { DashboardTopNav } from "./top-nav"
import { ChartPanel } from "./chart-future/chart-panel"
import { AssistantPanel } from "./chart-future/assistant-panel"

export function ChartTheFuturePanel() {
  return (
    <div className="p-3 sm:p-4 lg:p-5">
      <DashboardTopNav title="Chart the Future" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
        <ChartPanel />
        <AssistantPanel />
      </div>
    </div>
  )
}

"use client"

import type { DashboardDataState } from "@/context/data-provider"
import { useDashboardTrades } from "@/context/data-provider"

export type TradesProviderState = DashboardDataState

export function useTradesProvider(): TradesProviderState {
  return useDashboardTrades()
}

"use client"

import type { DashboardDerivedState } from "@/context/data-provider"
import { useDashboardStats } from "@/context/data-provider"

export type DerivedProviderState = DashboardDerivedState

export function useDerivedProvider(): DerivedProviderState {
  return useDashboardStats()
}

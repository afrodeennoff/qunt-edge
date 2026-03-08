"use client"

import type { DashboardFiltersState } from "@/context/data-provider"
import { useDashboardFilters } from "@/context/data-provider"

export type FiltersProviderState = DashboardFiltersState

export function useFiltersProvider(): FiltersProviderState {
  return useDashboardFilters()
}

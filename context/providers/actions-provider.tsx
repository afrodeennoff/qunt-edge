"use client"

import type { DashboardActions } from "@/context/data-provider"
import { useDashboardActions } from "@/context/data-provider"

export type ActionsProviderState = DashboardActions

export function useActionsProvider(): ActionsProviderState {
  return useDashboardActions()
}

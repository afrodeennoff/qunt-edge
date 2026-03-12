"use client"

import React, { createContext, useContext, useMemo } from "react"
import type { DashboardActions } from "@/context/data-provider"
import { useDashboardActions } from "@/context/data-provider"

const DataActionsContext = createContext<DashboardActions | undefined>(undefined)

export function DataActionsProvider({ children }: { children: React.ReactNode }) {
  const actions = useDashboardActions()
  const value = useMemo(() => actions, [actions])

  return <DataActionsContext.Provider value={value}>{children}</DataActionsContext.Provider>
}

export function useDataActions() {
  const context = useContext(DataActionsContext)
  if (!context) {
    throw new Error("useDataActions must be used within a DataActionsProvider")
  }
  return context
}

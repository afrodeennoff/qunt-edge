"use client"

import React, { createContext, useContext, useMemo } from "react"
import type { DashboardDerivedState } from "@/context/data-provider"
import { useDashboardStats } from "@/context/data-provider"
import type { Trade } from "@/lib/data-types"

const DataDerivedContext = createContext<DashboardDerivedState | undefined>(undefined)
const DataFormattedTradesContext = createContext<Trade[] | undefined>(undefined)

export function DataDerivedProvider({ children }: { children: React.ReactNode }) {
  const derived = useDashboardStats()

  const derivedValue = useMemo(
    () => ({
      formattedTrades: derived.formattedTrades,
      statistics: derived.statistics,
      calendarData: derived.calendarData,
    }),
    [derived.formattedTrades, derived.statistics, derived.calendarData],
  )

  return (
    <DataDerivedContext.Provider value={derivedValue}>
      <DataFormattedTradesContext.Provider value={derivedValue.formattedTrades}>
        {children}
      </DataFormattedTradesContext.Provider>
    </DataDerivedContext.Provider>
  )
}

export function useDataDerived() {
  const context = useContext(DataDerivedContext)
  if (!context) {
    throw new Error("useDataDerived must be used within a DataDerivedProvider")
  }
  return context
}

export function useDataFormattedTrades() {
  const context = useContext(DataFormattedTradesContext)
  if (!context) {
    throw new Error("useDataFormattedTrades must be used within a DataDerivedProvider")
  }
  return context
}

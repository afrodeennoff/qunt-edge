"use client"

import React, { createContext, useContext, useMemo } from "react"

import { type DataContextType, useData } from "@/context/data-provider"

type TradesContextValue = Pick<
  DataContextType,
  | "trades"
  | "formattedTrades"
  | "statistics"
  | "calendarData"
  | "refreshTrades"
  | "refreshTradesOnly"
  | "refreshAllData"
  | "updateTrades"
  | "deleteTrades"
  | "groupTrades"
  | "ungroupTrades"
  | "getTradeImages"
>

const TradesContext = createContext<TradesContextValue | undefined>(undefined)

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const data = useData()

  const value = useMemo<TradesContextValue>(
    () => ({
      trades: data.trades,
      formattedTrades: data.formattedTrades,
      statistics: data.statistics,
      calendarData: data.calendarData,
      refreshTrades: data.refreshTrades,
      refreshTradesOnly: data.refreshTradesOnly,
      refreshAllData: data.refreshAllData,
      updateTrades: data.updateTrades,
      deleteTrades: data.deleteTrades,
      groupTrades: data.groupTrades,
      ungroupTrades: data.ungroupTrades,
      getTradeImages: data.getTradeImages,
    }),
    [
      data.trades,
      data.formattedTrades,
      data.statistics,
      data.calendarData,
      data.refreshTrades,
      data.refreshTradesOnly,
      data.refreshAllData,
      data.updateTrades,
      data.deleteTrades,
      data.groupTrades,
      data.ungroupTrades,
      data.getTradeImages,
    ]
  )

  return <TradesContext.Provider value={value}>{children}</TradesContext.Provider>
}

export function useTradesData() {
  const context = useContext(TradesContext)
  if (!context) {
    throw new Error("useTradesData must be used within TradesProvider")
  }
  return context
}

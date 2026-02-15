"use client"

import React, { createContext, useContext, useMemo } from "react"

import { type DataContextType, useData } from "@/context/data-provider"

type FiltersContextValue = Pick<
  DataContextType,
  | "instruments"
  | "setInstruments"
  | "accountNumbers"
  | "setAccountNumbers"
  | "dateRange"
  | "setDateRange"
  | "tickRange"
  | "setTickRange"
  | "pnlRange"
  | "setPnlRange"
  | "timeRange"
  | "setTimeRange"
  | "tickFilter"
  | "setTickFilter"
  | "weekdayFilter"
  | "setWeekdayFilter"
  | "hourFilter"
  | "setHourFilter"
  | "tagFilter"
  | "setTagFilter"
>

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined)

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const data = useData()

  const value = useMemo<FiltersContextValue>(
    () => ({
      instruments: data.instruments,
      setInstruments: data.setInstruments,
      accountNumbers: data.accountNumbers,
      setAccountNumbers: data.setAccountNumbers,
      dateRange: data.dateRange,
      setDateRange: data.setDateRange,
      tickRange: data.tickRange,
      setTickRange: data.setTickRange,
      pnlRange: data.pnlRange,
      setPnlRange: data.setPnlRange,
      timeRange: data.timeRange,
      setTimeRange: data.setTimeRange,
      tickFilter: data.tickFilter,
      setTickFilter: data.setTickFilter,
      weekdayFilter: data.weekdayFilter,
      setWeekdayFilter: data.setWeekdayFilter,
      hourFilter: data.hourFilter,
      setHourFilter: data.setHourFilter,
      tagFilter: data.tagFilter,
      setTagFilter: data.setTagFilter,
    }),
    [
      data.instruments,
      data.setInstruments,
      data.accountNumbers,
      data.setAccountNumbers,
      data.dateRange,
      data.setDateRange,
      data.tickRange,
      data.setTickRange,
      data.pnlRange,
      data.setPnlRange,
      data.timeRange,
      data.setTimeRange,
      data.tickFilter,
      data.setTickFilter,
      data.weekdayFilter,
      data.setWeekdayFilter,
      data.hourFilter,
      data.setHourFilter,
      data.tagFilter,
      data.setTagFilter,
    ]
  )

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFiltersData() {
  const context = useContext(FiltersContext)
  if (!context) {
    throw new Error("useFiltersData must be used within FiltersProvider")
  }
  return context
}

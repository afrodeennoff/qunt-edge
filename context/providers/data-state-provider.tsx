"use client"

import React, { createContext, useContext, useMemo } from "react"
import type { DashboardFiltersState } from "@/context/data-provider"
import {
  useDashboardAccountsList,
  useDashboardFilters,
  useDashboardIsLoading,
  useDashboardIsMobile,
  useDashboardIsRevalidating,
  useDashboardIsSharedView,
  useDashboardTradeItems,
} from "@/context/data-provider"
import type { Account, Trade } from "@/lib/data-types"

interface DataUiState {
  isLoading: boolean
  isRevalidating: boolean
  isMobile: boolean
  isSharedView: boolean
}

const DataUiStateContext = createContext<DataUiState | undefined>(undefined)
const DataTradesContext = createContext<Trade[] | undefined>(undefined)
const DataAccountsContext = createContext<Account[] | undefined>(undefined)
const DataFiltersContext = createContext<DashboardFiltersState | undefined>(undefined)

export function DataStateProvider({ children }: { children: React.ReactNode }) {
  const isLoading = useDashboardIsLoading()
  const isRevalidating = useDashboardIsRevalidating()
  const isMobile = useDashboardIsMobile()
  const isSharedView = useDashboardIsSharedView()
  const trades = useDashboardTradeItems()
  const accounts = useDashboardAccountsList()
  const filters = useDashboardFilters()

  const uiStateValue = useMemo<DataUiState>(
    () => ({
      isLoading,
      isRevalidating,
      isMobile,
      isSharedView,
    }),
    [isLoading, isRevalidating, isMobile, isSharedView],
  )

  return (
    <DataUiStateContext.Provider value={uiStateValue}>
      <DataTradesContext.Provider value={trades}>
        <DataAccountsContext.Provider value={accounts}>
          <DataFiltersContext.Provider value={filters}>{children}</DataFiltersContext.Provider>
        </DataAccountsContext.Provider>
      </DataTradesContext.Provider>
    </DataUiStateContext.Provider>
  )
}

function useDataUiState() {
  const context = useContext(DataUiStateContext)
  if (!context) {
    throw new Error("useDataUiState must be used within a DataStateProvider")
  }
  return context
}

export function useDataIsLoading() {
  return useDataUiState().isLoading
}

export function useDataIsRevalidating() {
  return useDataUiState().isRevalidating
}

export function useDataIsMobile() {
  return useDataUiState().isMobile
}

export function useDataIsSharedView() {
  return useDataUiState().isSharedView
}

export function useDataTradeItems() {
  const context = useContext(DataTradesContext)
  if (!context) {
    throw new Error("useDataTradeItems must be used within a DataStateProvider")
  }
  return context
}

export function useDataAccountsList() {
  const context = useContext(DataAccountsContext)
  if (!context) {
    throw new Error("useDataAccountsList must be used within a DataStateProvider")
  }
  return context
}

export function useDataFilters() {
  const context = useContext(DataFiltersContext)
  if (!context) {
    throw new Error("useDataFilters must be used within a DataStateProvider")
  }
  return context
}

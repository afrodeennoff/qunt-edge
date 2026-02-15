"use client"

import React, { createContext, useContext, useMemo } from "react"

import { type DataContextType, useData } from "@/context/data-provider"

type SubscriptionContextValue = Pick<
  DataContextType,
  | "isLoading"
  | "isSharedView"
  | "isPlusUser"
  | "isFirstConnection"
  | "setIsFirstConnection"
  | "changeIsFirstConnection"
  | "sharedParams"
  | "setSharedParams"
>

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const data = useData()

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      isLoading: data.isLoading,
      isSharedView: data.isSharedView,
      isPlusUser: data.isPlusUser,
      isFirstConnection: data.isFirstConnection,
      setIsFirstConnection: data.setIsFirstConnection,
      changeIsFirstConnection: data.changeIsFirstConnection,
      sharedParams: data.sharedParams,
      setSharedParams: data.setSharedParams,
    }),
    [
      data.isLoading,
      data.isSharedView,
      data.isPlusUser,
      data.isFirstConnection,
      data.setIsFirstConnection,
      data.changeIsFirstConnection,
      data.sharedParams,
      data.setSharedParams,
    ]
  )

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  )
}

export function useSubscriptionData() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscriptionData must be used within SubscriptionProvider")
  }
  return context
}

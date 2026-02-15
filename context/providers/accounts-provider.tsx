"use client"

import React, { createContext, useContext, useMemo } from "react"

import { type DataContextType, useData } from "@/context/data-provider"

type AccountsContextValue = Pick<
  DataContextType,
  | "accounts"
  | "refreshUserDataOnly"
  | "saveAccount"
  | "deleteAccount"
  | "saveGroup"
  | "renameGroup"
  | "deleteGroup"
  | "moveAccountToGroup"
  | "moveAccountsToGroup"
  | "savePayout"
  | "deletePayout"
>

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined)

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const data = useData()

  const value = useMemo<AccountsContextValue>(
    () => ({
      accounts: data.accounts,
      refreshUserDataOnly: data.refreshUserDataOnly,
      saveAccount: data.saveAccount,
      deleteAccount: data.deleteAccount,
      saveGroup: data.saveGroup,
      renameGroup: data.renameGroup,
      deleteGroup: data.deleteGroup,
      moveAccountToGroup: data.moveAccountToGroup,
      moveAccountsToGroup: data.moveAccountsToGroup,
      savePayout: data.savePayout,
      deletePayout: data.deletePayout,
    }),
    [
      data.accounts,
      data.refreshUserDataOnly,
      data.saveAccount,
      data.deleteAccount,
      data.saveGroup,
      data.renameGroup,
      data.deleteGroup,
      data.moveAccountToGroup,
      data.moveAccountsToGroup,
      data.savePayout,
      data.deletePayout,
    ]
  )

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>
}

export function useAccountsData() {
  const context = useContext(AccountsContext)
  if (!context) {
    throw new Error("useAccountsData must be used within AccountsProvider")
  }
  return context
}

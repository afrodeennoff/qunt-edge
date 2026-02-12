import { create } from 'zustand'
import { Account } from '@/prisma/generated/prisma'
import { Trade } from '@/lib/data-types'

interface TradingDomainState {
  trades: Trade[]
  accounts: Account[]
  setTrades: (trades: Trade[]) => void
  setAccounts: (accounts: Account[]) => void
  updateAccount: (accountNumber: string, updates: Partial<Account>) => void
  deleteAccount: (accountNumber: string) => void
  addAccount: (account: Account) => void
}

export const useTradingDomainStore = create<TradingDomainState>()((set) => ({
  trades: [],
  accounts: [],
  setTrades: (trades) => set({ trades }),
  setAccounts: (accounts) => set({ accounts }),
  updateAccount: (accountNumber, updates) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.number === accountNumber
          ? { ...account, ...updates }
          : account
      ),
    })),
  deleteAccount: (accountNumber) =>
    set((state) => ({
      accounts: state.accounts.filter(
        (account) => account.number !== accountNumber
      ),
    })),
  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, account],
    })),
}))

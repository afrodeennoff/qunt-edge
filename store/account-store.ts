import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Account } from "@/prisma/generated/prisma"
import { useTradingDomainStore } from "./trading-domain-store"

interface AccountStore {
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
  updateAccount: (accountNumber: string, updates: Partial<Account>) => void
  deleteAccount: (accountNumber: string) => void
  addAccount: (account: Account) => void
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      accounts: useTradingDomainStore.getState().accounts,
      setAccounts: (accounts) => {
        useTradingDomainStore.getState().setAccounts(accounts)
        set({ accounts })
      },
      updateAccount: (accountNumber, updates) => {
        useTradingDomainStore.getState().updateAccount(accountNumber, updates)
        set({ accounts: useTradingDomainStore.getState().accounts })
      },
      deleteAccount: (accountNumber) => {
        useTradingDomainStore.getState().deleteAccount(accountNumber)
        set({ accounts: useTradingDomainStore.getState().accounts })
      },
      addAccount: (account) => {
        useTradingDomainStore.getState().addAccount(account)
        set({ accounts: useTradingDomainStore.getState().accounts })
      },
    }),
    {
      name: "accounts-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

useTradingDomainStore.subscribe((state) => {
  if (useAccountStore.getState().accounts !== state.accounts) {
    useAccountStore.setState({ accounts: state.accounts })
  }
})

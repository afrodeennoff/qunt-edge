import { create } from 'zustand'
import { Trade } from '@/lib/data-types'
import { StoreApi, UseBoundStore } from 'zustand'
import { useTradingDomainStore } from './trading-domain-store'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ; (store.use as Record<string, unknown>)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

interface TradesState {
  // Trades data
  trades: Trade[]
  setTrades: (trades: Trade[]) => void
}

const tradesStoreBase = create<TradesState>()((set) => ({
  trades: useTradingDomainStore.getState().trades,
  setTrades: (trades: Trade[]) => {
    useTradingDomainStore.getState().setTrades(trades)
    set({ trades })
  },
}))

useTradingDomainStore.subscribe((state) => {
  const currentTrades = tradesStoreBase.getState().trades
  if (currentTrades !== state.trades) {
    tradesStoreBase.setState({ trades: state.trades })
  }
})

export const useTradesStore = createSelectors(tradesStoreBase) as UseBoundStore<StoreApi<TradesState>>

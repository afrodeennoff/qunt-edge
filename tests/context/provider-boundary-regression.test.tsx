// @vitest-environment jsdom

import React, { memo } from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

const mockDataState = vi.hoisted(() => {
  type MockState = {
    isLoading: boolean
    isRevalidating: boolean
    isMobile: boolean
    isSharedView: boolean
    trades: Array<{ id: string }>
    accounts: Array<{ id: string }>
    filters: {
      instruments: string[]
      setInstruments: (next: string[]) => void
      accountNumbers: string[]
      setAccountNumbers: (next: string[]) => void
      dateRange: undefined
      setDateRange: () => void
      tickRange: { min: undefined; max: undefined }
      setTickRange: () => void
      pnlRange: { min: undefined; max: undefined }
      setPnlRange: () => void
      timeRange: { range: null }
      setTimeRange: () => void
      tickFilter: { value: null }
      setTickFilter: () => void
      weekdayFilter: { days: number[] }
      setWeekdayFilter: () => void
      hourFilter: { hour: null }
      setHourFilter: () => void
      tagFilter: { tags: string[] }
      setTagFilter: () => void
    }
    derived: {
      formattedTrades: Array<{ id: string }>
      statistics: { totalTrades: number }
      calendarData: Record<string, unknown>
    }
    actions: {
      refreshAllData: () => Promise<void>
      isPlusUser: () => boolean
    }
  }

  let state: MockState = {
    isLoading: false,
    isRevalidating: false,
    isMobile: false,
    isSharedView: false,
    trades: [],
    accounts: [],
    filters: {
      instruments: [],
      setInstruments: () => {},
      accountNumbers: [],
      setAccountNumbers: () => {},
      dateRange: undefined,
      setDateRange: () => {},
      tickRange: { min: undefined, max: undefined },
      setTickRange: () => {},
      pnlRange: { min: undefined, max: undefined },
      setPnlRange: () => {},
      timeRange: { range: null },
      setTimeRange: () => {},
      tickFilter: { value: null },
      setTickFilter: () => {},
      weekdayFilter: { days: [] },
      setWeekdayFilter: () => {},
      hourFilter: { hour: null },
      setHourFilter: () => {},
      tagFilter: { tags: [] },
      setTagFilter: () => {},
    },
    derived: {
      formattedTrades: [],
      statistics: { totalTrades: 0 },
      calendarData: {},
    },
    actions: {
      refreshAllData: async () => {},
      isPlusUser: () => false,
    },
  }

  const listeners = new Set<() => void>()

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    patch: (next: Partial<MockState>) => {
      state = { ...state, ...next }
      listeners.forEach((listener) => listener())
    },
    reset: () => {
      state = {
        ...state,
        isLoading: false,
        isRevalidating: false,
        isMobile: false,
        isSharedView: false,
        trades: [],
        accounts: [],
        derived: {
          formattedTrades: [],
          statistics: { totalTrades: 0 },
          calendarData: {},
        },
      }
      listeners.forEach((listener) => listener())
    },
  }
})

vi.mock("@/context/data-provider", async () => {
  const React = await import("react")

  const select = <T,>(selector: (state: ReturnType<typeof mockDataState.getState>) => T) =>
    React.useSyncExternalStore(
      mockDataState.subscribe,
      () => selector(mockDataState.getState()),
      () => selector(mockDataState.getState()),
    )

  return {
    useDashboardIsLoading: () => select((state) => state.isLoading),
    useDashboardIsRevalidating: () => select((state) => state.isRevalidating),
    useDashboardIsMobile: () => select((state) => state.isMobile),
    useDashboardIsSharedView: () => select((state) => state.isSharedView),
    useDashboardTradeItems: () => select((state) => state.trades),
    useDashboardAccountsList: () => select((state) => state.accounts),
    useDashboardFilters: () => select((state) => state.filters),
    useDashboardStats: () => select((state) => state.derived),
    useDashboardActions: () => select((state) => state.actions),
  }
})

import { DataActionsProvider, useDataActions } from "@/context/providers/data-actions-provider"
import {
  DataDerivedProvider,
  useDataFormattedTrades,
} from "@/context/providers/data-derived-provider"
import { DataStateProvider, useDataIsLoading } from "@/context/providers/data-state-provider"

const renderCounts = {
  state: 0,
  actions: 0,
  derived: 0,
}

const StateConsumer = memo(function StateConsumer() {
  renderCounts.state += 1
  const isLoading = useDataIsLoading()
  return <div data-testid="state-consumer">{String(isLoading)}</div>
})

const ActionsConsumer = memo(function ActionsConsumer() {
  renderCounts.actions += 1
  const { isPlusUser } = useDataActions()
  return <div data-testid="actions-consumer">{String(isPlusUser())}</div>
})

const DerivedConsumer = memo(function DerivedConsumer() {
  renderCounts.derived += 1
  const formattedTrades = useDataFormattedTrades()
  return <div data-testid="derived-consumer">{formattedTrades.length}</div>
})

function TestHarness() {
  return (
    <DataStateProvider>
      <DataDerivedProvider>
        <DataActionsProvider>
          <StateConsumer />
          <ActionsConsumer />
          <DerivedConsumer />
        </DataActionsProvider>
      </DataDerivedProvider>
    </DataStateProvider>
  )
}

describe("provider boundary regression", () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount()
      })
    }

    container?.remove()
    container = null
    root = null

    renderCounts.state = 0
    renderCounts.actions = 0
    renderCounts.derived = 0
    mockDataState.reset()
  })

  it("does not rerender unrelated consumers for isolated updates", async () => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<TestHarness />)
    })

    expect(renderCounts.state).toBe(1)
    expect(renderCounts.actions).toBe(1)
    expect(renderCounts.derived).toBe(1)

    await act(async () => {
      mockDataState.patch({ isLoading: true })
    })

    expect(renderCounts.state).toBe(2)
    expect(renderCounts.actions).toBe(1)
    expect(renderCounts.derived).toBe(1)

    await act(async () => {
      mockDataState.patch({
        derived: {
          formattedTrades: [{ id: "trade-1" }],
          statistics: { totalTrades: 1 },
          calendarData: {},
        },
      })
    })

    expect(renderCounts.state).toBe(2)
    expect(renderCounts.actions).toBe(1)
    expect(renderCounts.derived).toBe(2)
  })
})

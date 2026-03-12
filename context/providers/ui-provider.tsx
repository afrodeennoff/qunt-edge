"use client"

import {
  useDashboardIsLoading,
  useDashboardIsMobile,
  useDashboardIsRevalidating,
  useDashboardIsSharedView,
} from "@/context/data-provider"

export interface UiProviderState {
  isLoading: boolean
  isRevalidating: boolean
  isMobile: boolean
  isSharedView: boolean
}

export function useUiProvider(): UiProviderState {
  return {
    isLoading: useDashboardIsLoading(),
    isRevalidating: useDashboardIsRevalidating(),
    isMobile: useDashboardIsMobile(),
    isSharedView: useDashboardIsSharedView(),
  }
}

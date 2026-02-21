'use client'

import React, { lazy, ComponentType, Suspense, ReactNode, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface LazyComponentOptions {
  fallback?: ReactNode
  ssr?: boolean
  loadingComponent?: ComponentType
  errorComponent?: ComponentType<{ error: Error }>
}

export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentOptions = {}
): ComponentType<T> {
  const {
    fallback = <div className="animate-pulse bg-muted h-32 w-full" />,
    ssr: _ssr = false,
    loadingComponent,
    errorComponent
  } = options

  const LazyComponent = lazy(() => importFn())
  const LoadingComponent = loadingComponent

  const WrappedComponent = (props: T) => (
    <Suspense fallback={LoadingComponent ? <LoadingComponent /> : fallback}>
      <ErrorBoundary errorComponent={errorComponent}>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  )

  WrappedComponent.displayName = 'LazyComponent'
  
  return WrappedComponent as ComponentType<T>
}

export function createDynamicComponent<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentOptions = {}
): ComponentType<T> {
  const {
    loadingComponent,
    ssr = false
  } = options
  const LoadingComponent = loadingComponent

  return dynamic(() => importFn(), {
    ssr,
    loading: LoadingComponent
      ? () => <LoadingComponent />
      : () => <div className="animate-pulse bg-muted h-32 w-full" />
  }) as ComponentType<T>
}

class ComponentRegistry {
  private registry: Map<string, () => Promise<any>> = new Map()
  private loadedComponents: Map<string, ComponentType<any>> = new Map()

  register(key: string, importFn: () => Promise<any>) {
    this.registry.set(key, importFn)
  }

  async preload(key: string): Promise<ComponentType<any> | null> {
    if (this.loadedComponents.has(key)) {
      return this.loadedComponents.get(key)!
    }

    const importFn = this.registry.get(key)
    if (!importFn) {
      console.warn(`Component "${key}" not found in registry`)
      return null
    }

    try {
      const module = await importFn()
      const component = module.default
      this.loadedComponents.set(key, component)
      return component
    } catch (error) {
      console.error(`Failed to preload component "${key}":`, error)
      return null
    }
  }

  get<T extends object>(
    key: string,
    options: LazyComponentOptions = {}
  ): ComponentType<T> | null {
    const importFn = this.registry.get(key)
    if (!importFn) {
      console.warn(`Component "${key}" not found in registry`)
      return null
    }

    return createLazyComponent<T>(importFn, options)
  }

  clear() {
    this.registry.clear()
    this.loadedComponents.clear()
  }
}

export const componentRegistry = new ComponentRegistry()

export function preloadComponent(key: string): Promise<ComponentType<any> | null> {
  return componentRegistry.preload(key)
}

export function usePreloadComponents(keys: string[]) {
  useEffect(() => {
    const promises = keys.map(key => componentRegistry.preload(key))
    Promise.allSettled(promises)
  }, keys)
}

export function createChunkPreloader() {
  const preload = (importFn: () => Promise<any>, priority: 'high' | 'low' = 'low') => {
    if (priority === 'high') {
      return importFn()
    }

    if (typeof requestIdleCallback !== 'undefined') {
      return requestIdleCallback(() => importFn())
    } else {
      return setTimeout(() => importFn(), 0)
    }
  }

  const preloadAll = (importFns: Array<() => Promise<any>>) => {
    return Promise.allSettled(importFns.map(fn => preload(fn)))
  }

  return { preload, preloadAll }
}

export const chunkPreloader = createChunkPreloader()

const chartChunks = {
  loadCharts: () => import('recharts'),
  loadD3: () => import('d3'),
  loadEquityChart: () => import('@/components/lazy/charts'),
  loadPnLChart: () => import('@/components/lazy/charts')
}

const editorChunks = {
  loadTipTap: () => import('@/components/tiptap-editor')
}

const dataChunks = {
  loadTradeTable: () => import('@/app/[locale]/dashboard/components/tables/trade-table-review'),
  loadAccountsTable: () => import('@/app/[locale]/dashboard/components/accounts/accounts-table-view')
}

export function preloadCharts() {
  return chunkPreloader.preload(chartChunks.loadCharts, 'high')
}

export function preloadEditor() {
  return chunkPreloader.preload(editorChunks.loadTipTap, 'low')
}

export function preloadDataComponents() {
  return chunkPreloader.preloadAll([
    dataChunks.loadTradeTable,
    dataChunks.loadAccountsTable
  ])
}

export async function preloadCriticalDashboardChunks() {
  await Promise.allSettled([
    chunkPreloader.preload(chartChunks.loadEquityChart, 'high'),
    chunkPreloader.preload(chartChunks.loadPnLChart, 'high')
  ])
}

interface ErrorBoundaryProps {
  children: ReactNode
  errorComponent?: ComponentType<{ error: Error }>
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.props.errorComponent) {
      const ErrorComponent = this.props.errorComponent
      return <ErrorComponent error={this.state.error!} />
    }

    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8 text-destructive">
          Failed to load component
        </div>
      )
    }

    return this.props.children
  }
}

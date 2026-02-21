'use client'

import React, { memo, useMemo, forwardRef, useCallback } from 'react'
import { usePerformanceOptimization } from './render-optimization'

export interface OptimizedComponentProps {
  enableMemo?: boolean
  disableOptimization?: boolean
}

export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P & OptimizedComponentProps> {
  const WrappedComponent = memo(
    forwardRef<any, P & OptimizedComponentProps>((props, ref) => {
      const { enableMemo = true, disableOptimization = false, ...rest } = props
      const name = componentName || Component.displayName || Component.name || 'Component'

      if (!disableOptimization) {
        const { isLowPerformance } = usePerformanceOptimization(name)
        
        if (isLowPerformance && !enableMemo) {
          console.warn(`⚠️ Low performance mode active for ${name}`)
        }
      }

      return <Component ref={ref} {...(rest as P)} />
    })
  )

  WrappedComponent.displayName = `Optimized(${Component.displayName || Component.name || 'Component'})`
  
  return WrappedComponent as unknown as React.ComponentType<P & OptimizedComponentProps>
}

export const OptimizedFragment = memo(({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
})

export function createMemoizedComponent<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.ComponentType<P> {
  const MemoizedComponent = memo(Component, areEqual)
  
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name || 'Component'})`
  
  return MemoizedComponent
}

export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useMemo(() => callback, deps) as T
}

export function useOptimizedMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps)
}

interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string | number
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  className?: string
}

export function OptimizedVirtualList<T>({
  items,
  renderItem,
  keyExtractor,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  className = ''
}: OptimizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleEnd)
  }, [items, visibleStart, visibleEnd])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleStart * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item, visibleStart + index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface OptimizedGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string | number
  columns: number
  itemHeight: number
  containerHeight: number
  className?: string
}

export function OptimizedVirtualGrid<T>({
  items,
  renderItem,
  keyExtractor,
  columns,
  itemHeight,
  containerHeight,
  className = ''
}: OptimizedGridProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const rowHeight = itemHeight
  const rowsPerPage = Math.ceil(containerHeight / rowHeight)
  const itemsPerRow = columns

  const totalRows = Math.ceil(items.length / itemsPerRow)
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight))
  const endRow = Math.min(totalRows, startRow + rowsPerPage + 2)

  const visibleItems = useMemo(() => {
    const start = startRow * itemsPerRow
    const end = Math.min(items.length, endRow * itemsPerRow)
    return items.slice(start, end)
  }, [items, startRow, endRow, itemsPerRow])

  const totalHeight = totalRows * rowHeight
  const offsetY = startRow * rowHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem' }}>
            {visibleItems.map((item, arrayIndex) => {
              const actualIndex = items.indexOf(item)
              return (
                <div key={keyExtractor(item, actualIndex)}>
                  {renderItem(item, actualIndex)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

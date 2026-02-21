'use client'

import React, { useRef, useCallback, useState, useEffect, memo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'

interface VirtualTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  className?: string
  rowHeight?: number
  maxHeight?: number
  estimateRowHeight?: (index: number) => number
  onRowClick?: (row: Row<TData>) => void
  onRowDoubleClick?: (row: Row<TData>) => void
  overscan?: number
}

export function OptimizedVirtualTable<TData, TValue>({
  data,
  columns,
  className,
  rowHeight = 50,
  maxHeight = 600,
  estimateRowHeight,
  onRowClick,
  onRowDoubleClick,
  overscan = 5
}: VirtualTableProps<TData, TValue>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(maxHeight)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height || maxHeight)
        }
      })
      
      observer.observe(containerRef.current)
      
      return () => observer.disconnect()
    }
  }, [maxHeight])

  const getItemHeight = useCallback((index: number) => {
    return estimateRowHeight ? estimateRowHeight(index) : rowHeight
  }, [rowHeight, estimateRowHeight])

  const calculateOffsets = useCallback(() => {
    let offsetY = 0
    const offsets: number[] = []
    
    for (let i = 0; i < rows.length; i++) {
      offsets.push(offsetY)
      offsetY += getItemHeight(i)
    }
    
    return { offsets, totalHeight: offsetY }
  }, [rows.length, getItemHeight])

  const { offsets, totalHeight } = calculateOffsets()

  const visibleStart = (() => {
    let start = 0
    let accumulatedHeight = 0
    
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] >= scrollTop - overscan * rowHeight) {
        start = Math.max(0, i - overscan)
        break
      }
      accumulatedHeight = offsets[i]
    }
    
    return start
  })()

  const visibleEnd = (() => {
    let end = rows.length
    const viewportBottom = scrollTop + containerHeight + overscan * rowHeight
    
    for (let i = visibleStart; i < offsets.length; i++) {
      if (offsets[i] > viewportBottom) {
        end = Math.min(rows.length, i + overscan)
        break
      }
    }
    
    return end
  })()

  const visibleRows = rows.slice(visibleStart, visibleEnd)

  const MemoizedRow = memo(({ row, index, offset }: { row: Row<TData>; index: number; offset: number }) => {
    const itemHeight = getItemHeight(visibleStart + index)
    
    return (
      <div
        className={cn(
          'flex items-center border-b transition-colors hover:bg-muted/50',
          onRowClick && 'cursor-pointer'
        )}
        style={{
          height: `${itemHeight}px`,
          transform: `translateY(${offset}px)`
        }}
        onClick={() => onRowClick?.(row)}
        onDoubleClick={() => onRowDoubleClick?.(row)}
      >
        {row.getVisibleCells().map((cell) => (
          <div
            key={cell.id}
            className='px-4 py-2'
            style={{ width: cell.column.getSize() }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ))}
      </div>
    )
  })

  MemoizedRow.displayName = 'MemoizedRow'

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      style={{ maxHeight: `${maxHeight}px` }}
      onScroll={handleScroll}
    >
      <div
        className='relative'
        style={{ height: `${totalHeight}px` }}
      >
        <div className='sticky top-0 z-10 bg-background border-b'>
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className='flex'>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className='px-4 py-3 font-medium text-sm'
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className='relative'>
          {visibleRows.map((row, index) => (
            <MemoizedRow
              key={row.id}
              row={row}
              index={index}
              offset={offsets[visibleStart + index]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useRef, useEffect, useState } from 'react'

export class DOMOptimizer {
  private static instance: DOMOptimizer
  private readBatch: (() => void)[] = []
  private writeBatch: (() => void)[] = []
  private isReading = false
  private isWriting = false
  private rafId: number | null = null

  static getInstance(): DOMOptimizer {
    if (!this.instance) {
      this.instance = new DOMOptimizer()
    }
    return this.instance
  }

  read(fn: () => void) {
    this.readBatch.push(fn)
    this.scheduleFlush()
  }

  write(fn: () => void) {
    this.writeBatch.push(fn)
    this.scheduleFlush()
  }

  private scheduleFlush() {
    if (this.rafId !== null) return

    this.rafId = requestAnimationFrame(() => {
      this.flushReads()
      
      requestAnimationFrame(() => {
        this.flushWrites()
        this.rafId = null
      })
    })
  }

  private flushReads() {
    if (this.readBatch.length === 0) return

    this.isReading = true
    const reads = this.readBatch.splice(0)
    
    try {
      reads.forEach(read => read())
    } finally {
      this.isReading = false
    }
  }

  private flushWrites() {
    if (this.writeBatch.length === 0) return

    this.isWriting = true
    const writes = this.writeBatch.splice(0)
    
    try {
      writes.forEach(write => write())
    } finally {
      this.isWriting = false
    }
  }

  measureLayout(element: HTMLElement): DOMRect {
    let rect: DOMRect | null = null

    this.read(() => {
      rect = element.getBoundingClientRect()
    })

    return rect!
  }

  batchUpdate(updates: Array<() => void>) {
    this.write(() => {
      updates.forEach(update => update())
    })
  }

  clear() {
    this.readBatch = []
    this.writeBatch = []
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
}

export const domOptimizer = DOMOptimizer.getInstance()

export function useDOMOptimizer() {
  const optimizerRef = useRef(domOptimizer)

  useEffect(() => {
    return () => {
      optimizerRef.current.clear()
    }
  }, [])

  return {
    read: useCallback((fn: () => void) => {
      optimizerRef.current.read(fn)
    }, []),
    
    write: useCallback((fn: () => void) => {
      optimizerRef.current.write(fn)
    }, []),
    
    batchUpdate: useCallback((updates: Array<() => void>) => {
      optimizerRef.current.batchUpdate(updates)
    }, []),
    
    measureLayout: useCallback((element: HTMLElement) => {
      return optimizerRef.current.measureLayout(element)
    }, [])
  }
}

export function useLayoutScheduling() {
  const measure = useCallback((fn: () => void) => {
    domOptimizer.read(fn)
  }, [])

  const mutate = useCallback((fn: () => void) => {
    domOptimizer.write(fn)
  }, [])

  return { measure, mutate }
}

export function reduceReflows(element: HTMLElement, callback: () => void) {
  domOptimizer.read(() => {
    const rect = element.getBoundingClientRect()
    
    domOptimizer.write(() => {
      callback()
    })
  })
}

export function batchDOMUpdates(updates: Array<() => void>) {
  domOptimizer.batchUpdate(updates)
}

export function useOptimizedElementSize() {
  const ref = useRef<HTMLElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const measureSize = useCallback(() => {
    if (ref.current) {
      domOptimizer.read(() => {
        const rect = ref.current!.getBoundingClientRect()
        setSize({ width: rect.width, height: rect.height })
      })
    }
  }, [])

  useEffect(() => {
    measureSize()
    
    let resizeObserver: ResizeObserver | null = null
    
    if (ref.current) {
      resizeObserver = new ResizeObserver(() => {
        measureSize()
      })
      
      resizeObserver.observe(ref.current)
    }

    return () => {
      resizeObserver?.disconnect()
    }
  }, [measureSize])

  return { ref, size }
}

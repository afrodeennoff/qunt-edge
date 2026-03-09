import { useEffect, useRef, useCallback } from 'react'
import { DashboardLayout } from '@/prisma/generated/prisma'
import { createAutoSaveService, AutoSaveService } from '@/lib/auto-save-service'
import { logger } from '@/lib/logger'

type SaveFunction = (layout: DashboardLayout) => Promise<{ success: boolean; error?: string }>

interface UseAutoSaveOptions {
  saveFunction: SaveFunction
  enabled?: boolean
  debounceMs?: number
  maxRetries?: number
  onSaved?: (duration: number) => void
  onError?: (error: Error) => void
  onSaveStart?: () => void
}

export function useAutoSave({
  saveFunction,
  enabled = true,
  debounceMs = 2000,
  maxRetries = 5,
  onSaved,
  onError,
  onSaveStart,
}: UseAutoSaveOptions) {
  const serviceRef = useRef<AutoSaveService | null>(null)
  const lastLayoutRef = useRef<DashboardLayout | null>(null)
  const isInitializedRef = useRef(false)

  if (!serviceRef.current && enabled) {
    serviceRef.current = createAutoSaveService(saveFunction, {
      debounceMs,
      maxRetries,
      enableOfflineSupport: true,
    })

    serviceRef.current.on('onStart', () => {
      logger.debug('[useAutoSave] Save started')
      onSaveStart?.()
    })

    serviceRef.current.on('onSuccess', (_request, duration) => {
      logger.info('[useAutoSave] Save successful', { duration })
      onSaved?.(duration)
    })

    serviceRef.current.on('onError', (_request, error) => {
      logger.error('[useAutoSave] Save failed', { error: error.message })
      onError?.(error)
    })

    serviceRef.current.on('onOffline', () => {
      logger.warn('[useAutoSave] Offline detected')
    })

    serviceRef.current.on('onOnline', () => {
      logger.info('[useAutoSave] Online detected, processing queue')
    })

    isInitializedRef.current = true
  }

  const triggerSave = useCallback(
    (layout: DashboardLayout, priority: 'low' | 'normal' | 'high' = 'normal') => {
      if (!enabled || !serviceRef.current) {
        logger.debug('[useAutoSave] Save skipped', { enabled, hasService: !!serviceRef.current })
        return
      }

      const layoutHash = JSON.stringify(layout)
      
      if (lastLayoutRef.current && layoutHash === JSON.stringify(lastLayoutRef.current)) {
        logger.debug('[useAutoSave] Layout unchanged, skipping save')
        return
      }

      lastLayoutRef.current = layout
      serviceRef.current.trigger(layout, priority)
    },
    [enabled]
  )

  const flushPending = useCallback(async () => {
    if (!enabled || !serviceRef.current) return
    await serviceRef.current.flush()
  }, [enabled])

  const cancelPending = useCallback(() => {
    if (!enabled || !serviceRef.current) return
    serviceRef.current.cancelPendingSave()
  }, [enabled])

  const hasPendingSave = useCallback(() => {
    if (!enabled || !serviceRef.current) return false
    return serviceRef.current.hasPendingSave()
  }, [enabled])

  const getSaveHistory = useCallback(() => {
    if (!enabled || !serviceRef.current) return new Map()
    return serviceRef.current.getSaveHistory()
  }, [enabled])

  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        logger.info('[useAutoSave] Cleaning up auto-save service')
        serviceRef.current.dispose()
        serviceRef.current = null
        isInitializedRef.current = false
      }
    }
  }, [])

  return {
    triggerSave,
    flushPending,
    cancelPending,
    hasPendingSave,
    getSaveHistory,
    isInitialized: isInitializedRef.current,
  }
}

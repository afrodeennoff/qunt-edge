import { DashboardLayout } from "@/prisma/generated/prisma"
import { DashboardLayoutWithWidgets, type Widget } from "@/store/user-store"
import type { Prisma } from "@/prisma/generated/prisma"

export interface StorageResult {
  success: boolean
  source: 'database' | 'local' | 'cache'
  error?: string
  timestamp: number
}

export interface StorageMetadata {
  lastSaved: number
  lastSynced: number
  version: number
  checksum: string
}

const STORAGE_KEY_PREFIX = 'widget_layout_'
const METADATA_KEY = 'widget_metadata_'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000
const SYNC_DEBOUNCE_MS = 500

function generateChecksum(layout: DashboardLayoutWithWidgets): string {
  const str = JSON.stringify(layout)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

class WidgetStorageService {
  private savePromises = new Map<string, Promise<any>>()
  private retryTimers = new Map<string, NodeJS.Timeout>()
  private saveQueue = new Map<string, DashboardLayoutWithWidgets>()
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline())
      window.addEventListener('offline', () => this.handleOffline())
    }
  }

  private handleOnline() {
    this.isOnline = true
    this.processQueue()
  }

  private handleOffline() {
    this.isOnline = false
  }

  private getStorageKey(userId: string): string {
    return `${STORAGE_KEY_PREFIX}${userId}`
  }

  private getMetadataKey(userId: string): string {
    return `${METADATA_KEY}${userId}`
  }

  private saveToLocalStorage(userId: string, layout: DashboardLayoutWithWidgets): boolean {
    try {
      const key = this.getStorageKey(userId)
      const metadata: StorageMetadata = {
        lastSaved: Date.now(),
        lastSynced: Date.now(),
        version: 1,
        checksum: generateChecksum(layout)
      }

      localStorage.setItem(key, JSON.stringify(layout))
      localStorage.setItem(this.getMetadataKey(userId), JSON.stringify(metadata))
      return true
    } catch (error) {
      console.error('[WidgetStorageService] Local storage save failed:', error)
      
      try {
        sessionStorage.setItem(this.getStorageKey(userId), JSON.stringify(layout))
        return true
      } catch (sessionError) {
        console.error('[WidgetStorageService] Session storage save also failed:', sessionError)
        return false
      }
    }
  }

  private loadFromLocalStorage(userId: string): DashboardLayoutWithWidgets | null {
    try {
      const key = this.getStorageKey(userId)
      const data = localStorage.getItem(key)
      
      if (data) {
        return JSON.parse(data) as DashboardLayoutWithWidgets
      }
      
      const sessionData = sessionStorage.getItem(this.getStorageKey(userId))
      if (sessionData) {
        return JSON.parse(sessionData) as DashboardLayoutWithWidgets
      }
      
      return null
    } catch (error) {
      console.error('[WidgetStorageService] Local storage load failed:', error)
      return null
    }
  }

  private async saveToDatabase(
    userId: string,
    layout: DashboardLayoutWithWidgets
  ): Promise<StorageResult> {
    try {
      const { saveDashboardLayoutAction } = await import('@/server/database')
      const prismaLayout = this.toPrismaLayout(layout)
      const result = await saveDashboardLayoutAction(prismaLayout)
      
      if (result.success) {
        this.saveToLocalStorage(userId, layout)
        return {
          success: true,
          source: 'database',
          timestamp: Date.now()
        }
      }
      
      throw new Error(result.error || 'Database save failed')
    } catch (error) {
      console.error('[WidgetStorageService] Database save failed:', error)
      
      const localSaveSuccess = this.saveToLocalStorage(userId, layout)
      if (localSaveSuccess) {
        return {
          success: true,
          source: 'local',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        }
      }
      
      return {
        success: false,
        source: 'local',
        error: error instanceof Error ? error.message : 'Failed to save to both database and local storage',
        timestamp: Date.now()
      }
    }
  }

  private toPrismaLayout(layout: DashboardLayoutWithWidgets): DashboardLayout {
    return {
      ...layout,
      desktop: layout.desktop as unknown as Prisma.JsonArray,
      mobile: layout.mobile as unknown as Prisma.JsonArray,
      version: layout.version || 1,
      checksum: null,
      deviceId: null,
    }
  }

  async saveWithRetry(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    retryCount = 0
  ): Promise<StorageResult> {
    if (!this.isOnline) {
      console.log('[WidgetStorageService] Offline - saving to local storage')
      const saved = this.saveToLocalStorage(userId, layout)
      return {
        success: saved,
        source: 'local',
        error: saved ? undefined : 'Device is offline and local storage failed',
        timestamp: Date.now()
      }
    }

    const existingPromise = this.savePromises.get(userId)
    if (existingPromise) {
      await existingPromise
    }

    const savePromise = this.performSave(userId, layout, retryCount)
    this.savePromises.set(userId, savePromise)

    try {
      const result = await savePromise
      return result
    } finally {
      this.savePromises.delete(userId)
    }
  }

  private async performSave(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    retryCount: number
  ): Promise<StorageResult> {
    try {
      const result = await this.saveToDatabase(userId, layout)
      
      if (!result.success && retryCount < MAX_RETRIES) {
        console.log(`[WidgetStorageService] Retry ${retryCount + 1}/${MAX_RETRIES}`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
        return this.performSave(userId, layout, retryCount + 1)
      }
      
      return result
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`[WidgetStorageService] Retry ${retryCount + 1}/${MAX_RETRIES} after error`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
        return this.performSave(userId, layout, retryCount + 1)
      }
      
      const localSaveSuccess = this.saveToLocalStorage(userId, layout)
      return {
        success: localSaveSuccess,
        source: 'local',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  private debounceTimers = new Map<string, NodeJS.Timeout>()

  saveDebounced(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    callback?: (result: StorageResult) => void
  ): void {
    this.saveQueue.set(userId, layout)
    
    const existingTimer = this.debounceTimers.get(userId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(async () => {
      const queuedLayout = this.saveQueue.get(userId)
      if (queuedLayout) {
        const result = await this.saveWithRetry(userId, queuedLayout)
        callback?.(result)
      }
      this.saveQueue.delete(userId)
      this.debounceTimers.delete(userId)
    }, SYNC_DEBOUNCE_MS)

    this.debounceTimers.set(userId, timer)
  }

  private async processQueue() {
    for (const [userId, layout] of this.saveQueue.entries()) {
      await this.saveWithRetry(userId, layout)
    }
  }

  async load(userId: string): Promise<DashboardLayoutWithWidgets | null> {
    try {
      const { getDashboardLayout } = await import('@/server/user-data')
      const dbLayout = await getDashboardLayout(userId)
      
      if (dbLayout) {
        const layout = {
          ...dbLayout,
          desktop: dbLayout.desktop as unknown as Widget[],
          mobile: dbLayout.mobile as unknown as Widget[]
        }
        this.saveToLocalStorage(userId, layout)
        return layout
      }
      
      const localLayout = this.loadFromLocalStorage(userId)
      if (localLayout) {
        console.log('[WidgetStorageService] Loaded from local storage fallback')
        return localLayout
      }
      
      return null
    } catch (error) {
      console.error('[WidgetStorageService] Load from database failed, trying local:', error)
      return this.loadFromLocalStorage(userId)
    }
  }

  async sync(userId: string): Promise<StorageResult> {
    const localLayout = this.loadFromLocalStorage(userId)
    
    if (!localLayout) {
      return {
        success: false,
        source: 'local',
        error: 'No local data to sync',
        timestamp: Date.now()
      }
    }

    return this.saveWithRetry(userId, localLayout)
  }

  clearLocal(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId))
      localStorage.removeItem(this.getMetadataKey(userId))
      sessionStorage.removeItem(this.getStorageKey(userId))
    } catch (error) {
      console.error('[WidgetStorageService] Clear local storage failed:', error)
    }
  }

  getMetadata(userId: string): StorageMetadata | null {
    try {
      const data = localStorage.getItem(this.getMetadataKey(userId))
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  hasLocalData(userId: string): boolean {
    return !!this.loadFromLocalStorage(userId)
  }
}

export const widgetStorageService = new WidgetStorageService()

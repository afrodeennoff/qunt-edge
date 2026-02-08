import { DashboardLayoutWithWidgets, Widget } from '@/store/user-store'
import { widgetStorageService, StorageResult } from './widget-storage-service'
import { optimisticWidgetManager, WidgetLayoutChange } from './widget-optimistic-updates'
import { widgetConflictResolver, ConflictResolution } from './widget-conflict-resolution'
import { widgetVersionService, LayoutVersion } from './widget-version-service'
import { widgetValidator, ValidationResult } from './widget-validator'
import { widgetEncryptionService } from './widget-encryption'
import { toast } from 'sonner'

export interface PersistenceConfig {
  autoSave: boolean
  autoSaveDelay: number
  enableVersioning: boolean
  enableConflictResolution: boolean
  enableEncryption: boolean
  maxVersions: number
}

export interface SaveResult {
  success: boolean
  source: 'database' | 'local' | 'cache'
  version?: number
  error?: string
}

class WidgetPersistenceManager {
  private config: PersistenceConfig
  private saveDebounceTimer: NodeJS.Timeout | null = null
  private pendingSave: DashboardLayoutWithWidgets | null = null
  private lastKnownLayout: DashboardLayoutWithWidgets | null = null
  private currentLayoutId: string | null = null

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = {
      autoSave: true,
      autoSaveDelay: 2000,
      enableVersioning: true,
      enableConflictResolution: true,
      enableEncryption: false,
      maxVersions: 50,
      ...config
    }
  }

  async saveLayout(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    options: {
      immediate?: boolean
      description?: string
      changeType?: 'manual' | 'auto' | 'migration' | 'conflict_resolution'
    } = {}
  ): Promise<SaveResult> {
    try {
      console.log('[WidgetPersistenceManager] Starting save process...')

      const validation = widgetValidator.validateLayout(layout.desktop)
      if (!validation.valid) {
        console.error('[WidgetPersistenceManager] Validation failed:', validation.errors)
        return {
          success: false,
          source: 'local',
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        }
      }

      if (this.config.enableConflictResolution) {
        const conflictDetected = await this.detectAndResolveConflict(userId, layout)
        if (conflictDetected) {
          toast.info('Conflicts detected and merged', {
            description: 'Your changes have been merged with the latest version'
          })
        }
      }

      if (options.immediate) {
        return this.performSave(userId, layout, options.description, options.changeType)
      }

      this.pendingSave = layout
      
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer)
      }

      return new Promise((resolve) => {
        this.saveDebounceTimer = setTimeout(async () => {
          const result = await this.performSave(userId, layout, options.description, options.changeType)
          this.pendingSave = null
          resolve(result)
        }, this.config.autoSaveDelay)
      })
    } catch (error) {
      console.error('[WidgetPersistenceManager] Save failed:', error)
      return {
        success: false,
        source: 'local',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async performSave(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    description?: string,
    changeType: 'manual' | 'auto' | 'migration' | 'conflict_resolution' = 'manual'
  ): Promise<SaveResult> {
    try {
      console.log('[WidgetPersistenceManager] Performing save...')

      const checksum = widgetVersionService.generateChecksum(layout)
      const deviceId = widgetVersionService['getOrCreateDeviceId']()

      let processedLayout = layout
      if (this.config.enableEncryption) {
        processedLayout = widgetEncryptionService.encryptLayoutData(layout)
      }

      const storageResult = await widgetStorageService.saveWithRetry(userId, processedLayout)

      if (!storageResult.success) {
        throw new Error(storageResult.error || 'Save failed')
      }

      let version = layout.version || 1
      if (this.config.enableVersioning && storageResult.source === 'database') {
        const changes = widgetVersionService.compareVersions(this.lastKnownLayout || layout, layout)
        const autoDescription = description || widgetVersionService.generateDescription(changes)

        try {
          await widgetVersionService.saveVersionToDatabase(
            this.currentLayoutId || userId,
            {
              desktop: processedLayout.desktop,
              mobile: processedLayout.mobile,
              version: (this.lastKnownLayout?.version || 0) + 1,
              checksum,
              description: autoDescription,
              deviceId,
              changeType
            }
          )
          version = (this.lastKnownLayout?.version || 0) + 1
        } catch (versionError) {
          console.warn('[WidgetPersistenceManager] Version save failed (non-critical):', versionError)
        }
      }

      this.lastKnownLayout = { ...layout, version }

      if (storageResult.source === 'database') {
        toast.success('Layout saved', {
          description: `Version ${version} saved successfully`
        })
      } else {
        toast.info('Saved locally', {
          description: 'Changes saved locally. Will sync when connection is restored.'
        })
      }

      return {
        success: true,
        source: storageResult.source,
        version
      }
    } catch (error) {
      console.error('[WidgetPersistenceManager] Perform save failed:', error)
      
      const localSaveSuccess = widgetStorageService['saveToLocalStorage'](userId, layout)
      
      toast.error('Save failed', {
        description: error instanceof Error ? error.message : 'Failed to save layout'
      })

      return {
        success: localSaveSuccess,
        source: 'local',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async loadLayout(userId: string): Promise<DashboardLayoutWithWidgets | null> {
    try {
      console.log('[WidgetPersistenceManager] Loading layout...')

      const layout = await widgetStorageService.load(userId)

      if (!layout) {
        console.warn('[WidgetPersistenceManager] No layout found')
        return null
      }

      if (this.config.enableEncryption) {
        try {
          const decryptedLayout = widgetEncryptionService.decryptLayoutData(layout)
          this.lastKnownLayout = decryptedLayout
          return decryptedLayout
        } catch (decryptError) {
          console.error('[WidgetPersistenceManager] Decryption failed:', decryptError)
          this.lastKnownLayout = layout
          return layout
        }
      }

      const validation = widgetValidator.validateLayout(layout.desktop)
      if (!validation.valid) {
        console.warn('[WidgetPersistenceManager] Loaded invalid layout, sanitizing...')
        layout.desktop = widgetValidator.sanitizeLayout(layout.desktop)
        layout.mobile = widgetValidator.sanitizeLayout(layout.mobile)
      }

      this.lastKnownLayout = layout
      return layout
    } catch (error) {
      console.error('[WidgetPersistenceManager] Load failed:', error)
      return null
    }
  }

  private async detectAndResolveConflict(
    userId: string,
    currentLayout: DashboardLayoutWithWidgets
  ): Promise<boolean> {
    if (!this.config.enableConflictResolution) return false

    try {
      const remoteLayout = await widgetStorageService.load(userId)
      if (!remoteLayout) return false

      const hasConflict = widgetConflictResolver.detectConflict(
        currentLayout,
        remoteLayout,
        this.lastKnownLayout ? {
          localVersion: this.lastKnownLayout.version || 1,
          remoteVersion: remoteLayout.version || 1,
          lastModified: new Date(this.lastKnownLayout.updatedAt).getTime(),
          deviceId: widgetVersionService['getOrCreateDeviceId']()
        } : undefined,
        {
          localVersion: remoteLayout.version || 1,
          remoteVersion: remoteLayout.version || 1,
          lastModified: new Date(remoteLayout.updatedAt || Date.now()).getTime(),
          deviceId: 'unknown'
        }
      )

      if (hasConflict) {
        const resolution = widgetConflictResolver.suggestResolution(
          currentLayout,
          remoteLayout,
          this.lastKnownLayout ? {
            localVersion: this.lastKnownLayout.version || 1,
            remoteVersion: remoteLayout.version || 1,
            lastModified: new Date(this.lastKnownLayout.updatedAt).getTime(),
            deviceId: widgetVersionService['getOrCreateDeviceId']()
          } : undefined,
          {
            localVersion: remoteLayout.version || 1,
            remoteVersion: remoteLayout.version || 1,
            lastModified: new Date(remoteLayout.updatedAt || Date.now()).getTime(),
            deviceId: 'unknown'
          }
        )

        const mergedLayout = widgetConflictResolver.resolveConflict(
          currentLayout,
          remoteLayout,
          resolution.strategy
        )

        Object.assign(currentLayout, mergedLayout)
        return true
      }

      return false
    } catch (error) {
      console.error('[WidgetPersistenceManager] Conflict detection failed:', error)
      return false
    }
  }

  async executeOptimisticUpdate<T>(
    userId: string,
    operation: () => Promise<T>,
    change: WidgetLayoutChange,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T> {
    const previousLayout = this.lastKnownLayout ? { ...this.lastKnownLayout } : null

    return optimisticWidgetManager.executeOptimisticUpdate(
      operation,
      change,
      {
        onSuccess: (result) => {
          if (onSuccess) onSuccess(result)
        },
        onError: (error) => {
          if (onError) onError(error)
          if (previousLayout) {
            this.lastKnownLayout = previousLayout
          }
        },
        rollback: () => {
          if (previousLayout) {
            this.lastKnownLayout = previousLayout
          }
        }
      }
    )
  }

  async rollbackToVersion(versionNumber: number): Promise<DashboardLayoutWithWidgets | null> {
    if (!this.currentLayoutId) {
      throw new Error('No layout ID set')
    }

    const layout = await widgetVersionService.rollbackToVersion(this.currentLayoutId, versionNumber)
    
    if (layout) {
      this.lastKnownLayout = layout
      toast.success(`Rolled back to version ${versionNumber}`)
    } else {
      toast.error('Rollback failed', {
        description: `Could not rollback to version ${versionNumber}`
      })
    }

    return layout
  }

  async getVersionHistory(limit = 20): Promise<LayoutVersion[]> {
    if (!this.currentLayoutId) {
      return []
    }

    return widgetVersionService.getVersionHistory(this.currentLayoutId, limit)
  }

  async sync(userId: string): Promise<SaveResult> {
    console.log('[WidgetPersistenceManager] Syncing...')

    const result = await widgetStorageService.sync(userId)

    if (result.success) {
      toast.success('Synced successfully', {
        description: 'Your changes have been synced to the cloud'
      })
    } else {
      toast.error('Sync failed', {
        description: result.error || 'Failed to sync changes'
      })
    }

    return result
  }

  clearPendingSave(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer)
      this.saveDebounceTimer = null
    }
    this.pendingSave = null
  }

  hasPendingSave(): boolean {
    return !!this.pendingSave
  }

  async flushPendingSave(userId: string): Promise<SaveResult | null> {
    if (!this.pendingSave) return null

    const layoutToSave = this.pendingSave
    this.clearPendingSave()

    return this.performSave(userId, layoutToSave, 'Flushed pending auto-save', 'auto')
  }

  setLayoutId(layoutId: string): void {
    this.currentLayoutId = layoutId
  }

  getConfig(): PersistenceConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  getLastKnownLayout(): DashboardLayoutWithWidgets | null {
    return this.lastKnownLayout ? { ...this.lastKnownLayout } : null
  }
}

export const widgetPersistenceManager = new WidgetPersistenceManager()

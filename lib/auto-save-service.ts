import { DashboardLayout } from '@/prisma/generated/prisma'
import { logger } from '@/lib/logger'

interface SaveRequest {
  layout: DashboardLayout
  timestamp: number
  retryCount: number
  priority: 'low' | 'normal' | 'high'
}

interface AutoSaveConfig {
  debounceMs: number
  maxRetries: number
  retryBaseDelay: number
  retryMaxDelay: number
  queueMaxSize: number
  enableOfflineSupport: boolean
}

interface AutoSaveEvents {
  onStart?: (request: SaveRequest) => void
  onSuccess?: (request: SaveRequest, duration: number) => void
  onError?: (request: SaveRequest, error: Error) => void
  onRetry?: (request: SaveRequest, attempt: number) => void
  onOffline?: () => void
  onOnline?: () => void
}

type SaveFunction = (layout: DashboardLayout) => Promise<{ success: boolean; error?: string }>

const DEFAULT_CONFIG: AutoSaveConfig = {
  debounceMs: 2000,
  maxRetries: 5,
  retryBaseDelay: 1000,
  retryMaxDelay: 30000,
  queueMaxSize: 10,
  enableOfflineSupport: true,
}

export class AutoSaveService {
  private config: AutoSaveConfig
  private saveFunction: SaveFunction
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private currentRequest: SaveRequest | null = null
  private isSaving = false
  private isDisposed = false
  private eventHandlers: AutoSaveEvents = {}
  private saveHistory: Map<string, number> = new Map()
  private conflictDetected = false
  
  constructor(
    saveFunction: SaveFunction,
    config: Partial<AutoSaveConfig> = {}
  ) {
    this.saveFunction = saveFunction
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.setupOfflineListeners()
  }

  on<EventName extends keyof AutoSaveEvents>(
    event: EventName,
    handler: AutoSaveEvents[EventName]
  ): void {
    this.eventHandlers[event] = handler
  }

  off<EventName extends keyof AutoSaveEvents>(event: EventName): void {
    delete this.eventHandlers[event]
  }

  private emit<EventName extends keyof AutoSaveEvents>(
    event: EventName,
    ...args: Parameters<NonNullable<AutoSaveEvents[EventName]>>
  ): void {
    const handler = this.eventHandlers[event]
    if (handler) {
      (handler as any)(...args)
    }
  }

  trigger(layout: DashboardLayout, priority: SaveRequest['priority'] = 'normal'): void {
    if (this.isDisposed) {
      logger.warn('[AutoSave] Service disposed, ignoring save request')
      return
    }

    const request: SaveRequest = {
      layout,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
    }
    this.currentRequest = request

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    const debounceTime = priority === 'high' ? 100 : this.config.debounceMs

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null
      void this.executeSave(request)
    }, debounceTime)

    logger.debug('[AutoSave] Save scheduled', {
      priority,
      debounceTime,
      timestamp: request.timestamp,
    })
  }

  async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    const request = this.currentRequest
    if (request && !this.isSaving) {
      await this.executeSave(request)
    }
  }

  private async executeSave(request: SaveRequest): Promise<void> {
    if (this.isSaving) {
      logger.debug('[AutoSave] Save already in progress, queuing request')
      this.currentRequest = request
      return
    }

    if (!this.isOnline()) {
      logger.warn('[AutoSave] Offline, queuing save request')
      this.emit('onOffline')
      OfflineQueueManager.getInstance().enqueue(request)
      return
    }

    this.isSaving = true
    this.currentRequest = request
    const startTime = Date.now()

    this.emit('onStart', request)

    try {
      const result = await this.performSaveWithRetry(request)

      if (result.success) {
        const duration = Date.now() - startTime
        this.emit('onSuccess', request, duration)
        
        this.saveHistory.set(JSON.stringify(request.layout), Date.now())
        
        if (this.saveHistory.size > 100) {
          const oldestKey = this.saveHistory.keys().next().value
          if (oldestKey !== undefined) {
            this.saveHistory.delete(oldestKey)
          }
        }

        logger.info('[AutoSave] Layout saved successfully', {
          duration,
          priority: request.priority,
          retryCount: request.retryCount,
        })
      } else {
        throw new Error(result.error || 'Save failed')
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.emit('onError', request, err)
      logger.error('[AutoSave] Save failed', { error: err, request })
      
      if (this.config.enableOfflineSupport && !this.isOnline()) {
        OfflineQueueManager.getInstance().enqueue(request)
      }
    } finally {
      this.isSaving = false
      this.currentRequest = null
    }
  }

  private async performSaveWithRetry(request: SaveRequest): Promise<{ success: boolean; error?: string }> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        logger.debug('[AutoSave] Save attempt', {
          attempt: attempt + 1,
          maxRetries: this.config.maxRetries + 1,
        })

        const result = await this.saveFunction(request.layout)
        if (!result || typeof result.success !== 'boolean') {
          throw new Error('Save function returned an invalid response')
        }

        if (result.success) {
          return result
        }

        lastError = new Error(result.error || 'Save failed without error message')

        if (attempt < this.config.maxRetries) {
          this.emit('onRetry', request, attempt + 1)
          const delay = this.calculateRetryDelay(attempt)
          logger.debug('[AutoSave] Retrying after delay', { delay, attempt: attempt + 1 })
          await this.sleep(delay)
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < this.config.maxRetries && this.shouldRetry(lastError)) {
          this.emit('onRetry', request, attempt + 1)
          const delay = this.calculateRetryDelay(attempt)
          logger.debug('[AutoSave] Retrying after error', {
            delay,
            attempt: attempt + 1,
            error: lastError.message,
          })
          await this.sleep(delay)
        } else {
          throw lastError
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
    }
  }

  private calculateRetryDelay(attempt: number): number {
    return Math.min(
      this.config.retryBaseDelay * Math.pow(2, attempt),
      this.config.retryMaxDelay
    )
  }

  private shouldRetry(error: Error): boolean {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /fetch/i,
      /connection/i,
      /invalid response/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /5\d\d/, // Server errors
    ]

    return retryablePatterns.some(pattern => pattern.test(error.message))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') return true
    return navigator.onLine
  }

  private setupOfflineListeners(): void {
    if (!this.config.enableOfflineSupport) {
      return
    }

    const eventTarget = (typeof window !== 'undefined' && window) as (Window & typeof globalThis) | undefined
    if (!eventTarget || typeof eventTarget.addEventListener !== 'function') {
      return
    }

    const handleOnline = () => {
      logger.info('[AutoSave] Connection restored')
      this.emit('onOnline')
      this.processOfflineQueue()
    }

    const handleOffline = () => {
      logger.warn('[AutoSave] Connection lost')
      this.emit('onOffline')
    }

    eventTarget.addEventListener('online', handleOnline)
    eventTarget.addEventListener('offline', handleOffline)

    this.cleanup = () => {
      eventTarget.removeEventListener('online', handleOnline)
      eventTarget.removeEventListener('offline', handleOffline)
    }
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = OfflineQueueManager.getInstance()
    const requests = await queue.getAll()

    logger.info('[AutoSave] Processing offline queue', { count: requests.length })

    for (const request of requests) {
      if (!this.isOnline()) break

      try {
        await this.executeSave(request)
        await queue.dequeue(request.timestamp)
      } catch (error) {
        logger.error('[AutoSave] Failed to process queued save', { error, request })
      }
    }
  }

  hasPendingSave(): boolean {
    return this.currentRequest !== null || this.debounceTimer !== null
  }

  getSaveHistory(): Map<string, number> {
    return new Map(this.saveHistory)
  }

  cancelPendingSave(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
      logger.debug('[AutoSave] Pending save cancelled')
    }
    this.currentRequest = null
  }

  cleanup: () => void = () => {}

  dispose(): void {
    if (this.isDisposed) return

    this.cancelPendingSave()
    this.cleanup()
    this.saveHistory.clear()
    this.isDisposed = true

    logger.info('[AutoSave] Service disposed')
  }
}

export class OfflineQueueManager {
  private static instance: OfflineQueueManager
  private queueKey = 'autosave-offline-queue'
  private memoryQueue: SaveRequest[] = []

  static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager()
    }
    return OfflineQueueManager.instance
  }

  async enqueue(request: SaveRequest): Promise<void> {
    try {
      const queue = await this.getQueue()
      
      if (queue.length >= DEFAULT_CONFIG.queueMaxSize) {
        queue.shift()
        logger.warn('[AutoSave] Queue full, removed oldest request')
      }

      queue.push(request)
      await this.saveQueue(queue)

      logger.info('[AutoSave] Request enqueued', {
        queueSize: queue.length,
        priority: request.priority,
      })
    } catch (error) {
      logger.error('[AutoSave] Failed to enqueue request', { error })
    }
  }

  async dequeue(timestamp: number): Promise<void> {
    try {
      const queue = await this.getQueue()
      const filtered = queue.filter(r => r.timestamp !== timestamp)
      await this.saveQueue(filtered)
    } catch (error) {
      logger.error('[AutoSave] Failed to dequeue request', { error })
    }
  }

  async getAll(): Promise<SaveRequest[]> {
    try {
      return await this.getQueue()
    } catch (error) {
      logger.error('[AutoSave] Failed to get queue', { error })
      return []
    }
  }

  async clear(): Promise<void> {
    try {
      const storage = this.getStorage()
      if (storage) {
        storage.removeItem(this.queueKey)
      } else {
        this.memoryQueue = []
      }
      logger.info('[AutoSave] Offline queue cleared')
    } catch (error) {
      logger.error('[AutoSave] Failed to clear queue', { error })
    }
  }

  private async getQueue(): Promise<SaveRequest[]> {
    const storage = this.getStorage()
    if (!storage) {
      return [...this.memoryQueue]
    }

    const data = storage.getItem(this.queueKey)
    if (!data) return []

    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  private async saveQueue(queue: SaveRequest[]): Promise<void> {
    const storage = this.getStorage()
    if (storage) {
      storage.setItem(this.queueKey, JSON.stringify(queue))
      return
    }
    this.memoryQueue = [...queue]
  }

  private getStorage(): Storage | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage
    }
    return null
  }
}

export function createAutoSaveService(
  saveFunction: SaveFunction,
  config?: Partial<AutoSaveConfig>
): AutoSaveService {
  return new AutoSaveService(saveFunction, config)
}

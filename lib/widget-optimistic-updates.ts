import { DashboardLayoutWithWidgets, Widget } from "@/store/user-store"
import { toast } from "sonner"

export interface OptimisticUpdate<T> {
  id: string
  type: 'add' | 'remove' | 'update' | 'move'
  timestamp: number
  previousState: T | null
  newState: T
  isPending: boolean
  error: string | null
}

export class OptimisticUpdateManager {
  private updates = new Map<string, OptimisticUpdate<any>>()
  private rollbackStack = new Map<string, any[]>()

  createUpdate<T>(
    id: string,
    type: OptimisticUpdate<T>['type'],
    previousState: T | null,
    newState: T
  ): OptimisticUpdate<T> {
    const update: OptimisticUpdate<T> = {
      id,
      type,
      timestamp: Date.now(),
      previousState,
      newState,
      isPending: true,
      error: null
    }

    this.updates.set(id, update)
    return update
  }

  markSuccess(id: string): void {
    const update = this.updates.get(id)
    if (update) {
      update.isPending = false
      this.updates.set(id, update)
      
      setTimeout(() => {
        this.updates.delete(id)
      }, 5000)
    }
  }

  markFailed(id: string, error: string): void {
    const update = this.updates.get(id)
    if (update) {
      update.isPending = false
      update.error = error
      this.updates.set(id, update)
    }
  }

  getPendingUpdates(): OptimisticUpdate<any>[] {
    return Array.from(this.updates.values()).filter(u => u.isPending)
  }

  hasPendingUpdates(): boolean {
    return Array.from(this.updates.values()).some(u => u.isPending)
  }

  getRollbackState(id: string): any {
    const update = this.updates.get(id)
    return update?.previousState
  }

  clearUpdate(id: string): void {
    this.updates.delete(id)
  }

  clearAll(): void {
    this.updates.clear()
  }
}

export interface WidgetLayoutChange {
  type: 'add' | 'remove' | 'move' | 'resize' | 'typeChange'
  widgetId?: string
  widget?: Widget
  layout?: Widget[]
  previousLayout?: Widget[]
}

export class OptimisticWidgetManager extends OptimisticUpdateManager {
  private applyCallbacks = new Set<(change: WidgetLayoutChange) => void>()
  private rollbackCallbacks = new Set<(change: WidgetLayoutChange) => void>()

  onApply(callback: (change: WidgetLayoutChange) => void): () => void {
    this.applyCallbacks.add(callback)
    return () => this.applyCallbacks.delete(callback)
  }

  onRollback(callback: (change: WidgetLayoutChange) => void): () => void {
    this.rollbackCallbacks.add(callback)
    return () => this.rollbackCallbacks.delete(callback)
  }

  async executeOptimisticUpdate<T>(
    operation: () => Promise<T>,
    change: WidgetLayoutChange,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      rollback?: () => void
      errorMessage?: string
      successMessage?: string
    }
  ): Promise<T> {
    const updateId = `update_${Date.now()}_${Math.random()}`
    
    this.applyCallbacks.forEach(cb => cb(change))
    
    try {
      const result = await operation()
      this.markSuccess(updateId)
      
      options?.onSuccess?.(result)
      
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
      
      return result
    } catch (error) {
      this.markFailed(updateId, error instanceof Error ? error.message : 'Unknown error')
      
      this.rollbackCallbacks.forEach(cb => cb(change))
      options?.rollback?.()
      
      options?.onError?.(error as Error)
      
      if (options?.errorMessage) {
        toast.error(options.errorMessage, {
          description: error instanceof Error ? error.message : 'An error occurred'
        })
      }
      
      throw error
    }
  }

  async executeBatchOptimisticUpdate<T>(
    operations: Array<() => Promise<T>>,
    changes: WidgetLayoutChange[],
    options?: {
      onSuccess?: (results: T[]) => void
      onError?: (errors: Error[]) => void
      rollback?: () => void
      errorMessage?: string
    }
  ): Promise<T[]> {
    const updateId = `batch_update_${Date.now()}_${Math.random()}`
    
    changes.forEach(change => {
      this.applyCallbacks.forEach(cb => cb(change))
    })
    
    try {
      const results = await Promise.all(operations.map(operation => operation()))
      this.markSuccess(updateId)
      
      options?.onSuccess?.(results)
      
      return results
    } catch (error) {
      this.markFailed(updateId, error instanceof Error ? error.message : 'Unknown error')
      
      changes.forEach(change => {
        this.rollbackCallbacks.forEach(cb => cb(change))
      })
      options?.rollback?.()
      
      const errors = Array.isArray(error) ? error : [error]
      options?.onError?.(errors as Error[])
      
      if (options?.errorMessage) {
        toast.error(options.errorMessage, {
          description: errors.map(e => e instanceof Error ? e.message : 'Unknown error').join(', ')
        })
      }
      
      throw error
    }
  }
}

export const optimisticWidgetManager = new OptimisticWidgetManager()

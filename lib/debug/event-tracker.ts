'use client'

interface EventListenerInfo {
  target: string
  type: string
  handler: string
  timestamp: number
  component: string
}

class EventListenerTracker {
  private listeners: Map<string, EventListenerInfo[]> = new Map()
  private originalAddEventListener: typeof EventTarget.prototype.addEventListener | null = null
  private originalRemoveEventListener: typeof EventTarget.prototype.removeEventListener | null = null
  private isEnabled = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.originalAddEventListener = EventTarget.prototype.addEventListener
      this.originalRemoveEventListener = EventTarget.prototype.removeEventListener
    }
  }

  enable() {
    if (this.isEnabled || typeof window === 'undefined') return
    if (!this.originalAddEventListener || !this.originalRemoveEventListener) return
    this.isEnabled = true

    const listeners = this.listeners
    const getCurrentComponent = this.getCurrentComponent.bind(this)
    const originalAddEventListener = this.originalAddEventListener
    const originalRemoveEventListener = this.originalRemoveEventListener

    EventTarget.prototype.addEventListener = function(
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions
    ) {
      const component = getCurrentComponent()
      const info: EventListenerInfo = {
        target: this.constructor.name,
        type,
        handler: listener.toString(),
        timestamp: Date.now(),
        component,
      }

      const key = `${component}-${this.constructor.name}-${type}`
      if (!listeners.has(key)) {
        listeners.set(key, [])
      }
      listeners.get(key)!.push(info)

      return originalAddEventListener.call(this, type, listener, options)
    }

    EventTarget.prototype.removeEventListener = function(
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: EventListenerOptions
    ) {
      const component = getCurrentComponent()
      const key = `${component}-${this.constructor.name}-${type}`
      
      const activeListeners = listeners.get(key)
      if (activeListeners) {
        const index = activeListeners.findIndex(
          l => l.handler === listener.toString() && l.type === type
        )
        if (index !== -1) {
          activeListeners.splice(index, 1)
        }
      }

      return originalRemoveEventListener.call(this, type, listener, options)
    }
  }

  disable() {
    if (!this.isEnabled) return
    this.isEnabled = false

    if (this.originalAddEventListener) {
      EventTarget.prototype.addEventListener = this.originalAddEventListener
    }
    if (this.originalRemoveEventListener) {
      EventTarget.prototype.removeEventListener = this.originalRemoveEventListener
    }
  }

  private getCurrentComponent(): string {
    const stack = new Error().stack
    if (!stack) return 'Unknown'
    
    const lines = stack.split('\n')
    for (const line of lines) {
      if (line.includes('.tsx') || line.includes('.jsx')) {
        const match = line.match(/(\w+\.tsx)/)
        return match ? match[1] : 'Unknown'
      }
    }
    return 'Unknown'
  }

  getListeners(component?: string): EventListenerInfo[] {
    const allListeners = Array.from(this.listeners.values()).flat()
    if (component) {
      return allListeners.filter(l => l.component === component)
    }
    return allListeners
  }

  getActiveListeners(): EventListenerInfo[] {
    return Array.from(this.listeners.values()).flat()
  }

  printReport() {
    console.group('🔍 Event Listener Tracker Report')
    const listeners = this.getActiveListeners()
    
    console.info(`Total active listeners: ${listeners.length}`)
    
    const byComponent = listeners.reduce((acc, l) => {
      acc[l.component] = (acc[l.component] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.table(
      Object.entries(byComponent).map(([component, count]) => ({
        Component: component,
        'Listener Count': count,
      }))
    )

    const byType = listeners.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.info('Listeners by type:', byType)
    
    console.groupEnd()
  }

  clear() {
    this.listeners.clear()
  }
}

export const eventListenerTracker = new EventListenerTracker()

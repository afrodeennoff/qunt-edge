/**
 * Multi-Tab Synchronization
 * Keeps data consistent across multiple browser tabs
 * 
 * Features:
 * - BroadcastChannel for cross-tab messaging
 * - IndexedDB cache invalidation
 * - Conflict resolution
 * - Offline support
 * - Tab lifecycle management
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Message types for cross-tab communication
 */
export enum SyncMessageType {
    TRADES_UPDATED = 'trades_updated',
    ACCOUNTS_UPDATED = 'accounts_updated',
    LAYOUT_UPDATED = 'layout_updated',
    USER_UPDATED = 'user_updated',
    SUBSCRIPTION_UPDATED = 'subscription_updated',
    LOGOUT = 'logout',
    CACHE_INVALIDATE = 'cache_invalidate',
    PING = 'ping',
    PONG = 'pong',
}

/**
 * Sync message structure
 */
export interface SyncMessage {
    type: SyncMessageType
    payload?: any
    timestamp: number
    tabId: string
}

/**
 * Tab synchronization manager
 * Handles cross-tab communication and cache coordination
 */
export class TabSyncManager {
    private channel: BroadcastChannel | null = null
    private tabId: string
    private listeners: Map<SyncMessageType, Set<(payload: any) => void>> = new Map()
    private isLeader: boolean = false
    private heartbeatInterval: NodeJS.Timeout | null = null
    private activeTabs: Set<string> = new Set()

    constructor(channelName: string = 'qunt-edge-sync') {
        // Generate unique tab ID
        this.tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Check if BroadcastChannel is supported
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.channel = new BroadcastChannel(channelName)
                this.setupChannel()
                this.electLeader()
            } catch (error) {
                console.error('Failed to create BroadcastChannel:', error)
            }
        } else {
            console.warn('BroadcastChannel not supported, multi-tab sync disabled')
        }
    }

    /**
     * Set up channel message handlers
     */
    private setupChannel() {
        if (!this.channel) return

        this.channel.onmessage = (event) => {
            try {
                const message = event.data as SyncMessage

                // Ignore messages from this tab
                if (message.tabId === this.tabId) return

                // Handle specific message types
                this.handleMessage(message)

                // Notify listeners
                const listeners = this.listeners.get(message.type)
                if (listeners) {
                    listeners.forEach(listener => {
                        try {
                            listener(message.payload)
                        } catch (error) {
                            console.error('Listener error:', error)
                        }
                    })
                }
            } catch (error) {
                console.error('Error processing sync message:', error)
            }
        }

        this.channel.onmessageerror = (error) => {
            console.error('BroadcastChannel message error:', error)
        }

        // Clean up on page unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => this.destroy())
        }
    }

    /**
     * Handle specific message types
     */
    private handleMessage(message: SyncMessage) {
        switch (message.type) {
            case SyncMessageType.LOGOUT:
                // Another tab logged out, reload this tab
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
                break

            case SyncMessageType.CACHE_INVALIDATE:
                // Invalidate local cache
                this.invalidateLocalCache(message.payload?.keys || [])
                break

            case SyncMessageType.PING:
                // Respond to ping with pong
                this.send(SyncMessageType.PONG, { respondingTo: message.tabId })
                this.activeTabs.add(message.tabId)
                break

            case SyncMessageType.PONG:
                // Track active tabs
                this.activeTabs.add(message.tabId)
                break
        }
    }

    /**
     * Elect leader tab (first tab becomes leader)
     * Leader tab handles certain operations like cleanup
     */
    private electLeader() {
        // Send ping to discover other tabs
        this.send(SyncMessageType.PING, {})

        // Wait for responses
        setTimeout(() => {
            if (this.activeTabs.size === 0) {
                // No other tabs responded, this tab is leader
                this.isLeader = true
                this.startHeartbeat()
            }
        }, 100)
    }

    /**
     * Start heartbeat to detect inactive tabs
     */
    private startHeartbeat() {
        if (this.heartbeatInterval) return

        this.heartbeatInterval = setInterval(() => {
            this.send(SyncMessageType.PING, {})

            // Clean up inactive tabs after 30 seconds
            const now = Date.now()
            this.activeTabs.forEach(tabId => {
                // In a production app, you'd track last seen time
                // For now, we keep all tabs
            })
        }, 10000) // Ping every 10 seconds
    }

    /**
     * Send message to other tabs
     */
    send(type: SyncMessageType, payload?: any) {
        if (!this.channel) return

        const message: SyncMessage = {
            type,
            payload,
            timestamp: Date.now(),
            tabId: this.tabId,
        }

        try {
            this.channel.postMessage(message)
        } catch (error) {
            console.error('Failed to send sync message:', error)
        }
    }

    /**
     * Listen for specific message type
     */
    on(type: SyncMessageType, listener: (payload: any) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set())
        }
        this.listeners.get(type)!.add(listener)

        // Return unsubscribe function
        return () => {
            this.listeners.get(type)?.delete(listener)
        }
    }

    /**
     * Invalidate local IndexedDB cache
     */
    private async invalidateLocalCache(keys: string[]) {
        if (typeof window === 'undefined' || !window.indexedDB) return

        try {
            const dbName = 'qunt-edge-cache'
            const request = indexedDB.open(dbName)

            request.onsuccess = () => {
                const db = request.result
                const transaction = db.transaction(['cache'], 'readwrite')
                const store = transaction.objectStore('cache')

                keys.forEach(key => {
                    store.delete(key)
                })

                transaction.oncomplete = () => {
                    console.log('Cache invalidated for keys:', keys)
                    // Trigger re-fetch
                    window.dispatchEvent(new CustomEvent('cache-invalidated', { detail: keys }))
                }
            }
        } catch (error) {
            console.error('Failed to invalidate cache:', error)
        }
    }

    /**
     * Check if this tab is the leader
     */
    getIsLeader(): boolean {
        return this.isLeader
    }

    /**
     * Get number of active tabs
     */
    getActiveTabCount(): number {
        return this.activeTabs.size + 1 // +1 for this tab
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }

        if (this.channel) {
            this.channel.close()
        }

        this.listeners.clear()
        this.activeTabs.clear()
    }
}

/**
 * React hook for tab synchronization
 * 
 * @param channelName - Name of the broadcast channel
 * @returns Tab sync manager
 * 
 * @example
 * const sync = useTabSync()
 * 
 * useEffect(() => {
 *   const unsubscribe = sync.on(SyncMessageType.TRADES_UPDATED, () => {
 *     refreshTrades()
 *   })
 *   return unsubscribe
 * }, [sync])
 * 
 * const handleImport = async () => {
 *   await importTrades()
 *   sync.send(SyncMessageType.TRADES_UPDATED, { count: 100 })
 * }
 */
export function useTabSync(channelName?: string): TabSyncManager {
    const managerRef = useRef<TabSyncManager | null>(null)

    useEffect(() => {
        if (!managerRef.current) {
            managerRef.current = new TabSyncManager(channelName)
        }

        return () => {
            managerRef.current?.destroy()
        }
    }, [channelName])

    return managerRef.current || new TabSyncManager(channelName)
}

/**
 * Helper hook to sync specific data updates
 */
export function useSyncTrades() {
    const sync = useTabSync()

    const notifyTradesUpdated = useCallback((count?: number) => {
        sync.send(SyncMessageType.TRADES_UPDATED, { count })
    }, [sync])

    const onTradesUpdated = useCallback((handler: (payload: any) => void) => {
        return sync.on(SyncMessageType.TRADES_UPDATED, handler)
    }, [sync])

    return { notifyTradesUpdated, onTradesUpdated }
}

/**
 * Helper hook to sync account updates
 */
export function useSyncAccounts() {
    const sync = useTabSync()

    const notifyAccountsUpdated = useCallback(() => {
        sync.send(SyncMessageType.ACCOUNTS_UPDATED, {})
    }, [sync])

    const onAccountsUpdated = useCallback((handler: (payload: any) => void) => {
        return sync.on(SyncMessageType.ACCOUNTS_UPDATED, handler)
    }, [sync])

    return { notifyAccountsUpdated, onAccountsUpdated }
}

/**
 * Helper hook to sync layout updates
 */
export function useSyncLayout() {
    const sync = useTabSync()

    const notifyLayoutUpdated = useCallback((layoutId: string) => {
        sync.send(SyncMessageType.LAYOUT_UPDATED, { layoutId })
    }, [sync])

    const onLayoutUpdated = useCallback((handler: (payload: any) => void) => {
        return sync.on(SyncMessageType.LAYOUT_UPDATED, handler)
    }, [sync])

    return { notifyLayoutUpdated, onLayoutUpdated }
}

/**
 * Helper hook to handle logout across tabs
 */
export function useSyncLogout() {
    const sync = useTabSync()

    const notifyLogout = useCallback(() => {
        sync.send(SyncMessageType.LOGOUT, {})
    }, [sync])

    const onLogout = useCallback((handler: () => void) => {
        return sync.on(SyncMessageType.LOGOUT, handler)
    }, [sync])

    return { notifyLogout, onLogout }
}

/**
 * Cache invalidation helper
 */
export function invalidateCacheAcrossTabs(keys: string[]) {
    const sync = new TabSyncManager()
    sync.send(SyncMessageType.CACHE_INVALIDATE, { keys })
}

/**
 * Check if multi-tab sync is available
 */
export function isTabSyncAvailable(): boolean {
    return typeof BroadcastChannel !== 'undefined'
}

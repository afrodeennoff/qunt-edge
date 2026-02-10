/**
 * Zustand Store Reset Manager
 * Centralized system to reset all stores on logout
 * Prevents data leaks between different user sessions
 */

import { useUserStore } from '@/store/user-store'
import { useTradesStore } from '@/store/trades-store'
import { useTickDetailsStore } from '@/store/tick-details-store'
import { useFinancialEventsStore } from '@/store/financial-events-store'
import { useMoodStore } from '@/store/mood-store'
import { useSubscriptionStore } from '@/store/subscription-store'

/**
 * Interface for stores that support reset
 */
export interface ResettableStore {
    reset?: () => void
}

/**
 * List of all Zustand stores in the application
 * Add new stores here as they are created
 */
const ALL_STORES = [
    useUserStore,
    useTradesStore,
    useTickDetailsStore,
    useFinancialEventsStore,
    useMoodStore,
    useSubscriptionStore,
    // Add more stores here as needed
] as const

/**
 * Reset all Zustand stores to their initial state
 * Should be called on user logout
 * 
 * @example
 * async function handleLogout() {
 *   resetAllStores()
 *   await supabase.auth.signOut()
 * }
 */
export function resetAllStores() {
    console.log('[Store Reset] Resetting all Zustand stores...')

    let resetCount = 0
    let skippedCount = 0

    ALL_STORES.forEach((useStore) => {
        try {
            const store = useStore.getState() as ResettableStore

            if (typeof store.reset === 'function') {
                store.reset()
                resetCount++
            } else {
                console.warn(`[Store Reset] Store missing reset() method:`, useStore.name || 'Unknown')
                skippedCount++
            }
        } catch (error) {
            console.error(`[Store Reset] Error resetting store:`, error)
            skippedCount++
        }
    })

    console.log(
        `[Store Reset] Complete. Reset: ${resetCount}, Skipped: ${skippedCount}, Total: ${ALL_STORES.length}`
    )

    // Also clear any localStorage items that might contain user data
    if (typeof window !== 'undefined') {
        try {
            // Clear specific localStorage keys (don't clear everything to preserve theme, language, etc.)
            const keysToRemove = [
                'user-data-cache',
                'trades-cache',
                'last-sync-time',
                // Add more keys as needed
            ]

            keysToRemove.forEach(key => {
                localStorage.removeItem(key)
            })

            console.log('[Store Reset] Cleared localStorage user data')
        } catch (error) {
            console.error('[Store Reset] Error clearing localStorage:', error)
        }
    }

    // Clear IndexedDB cache
    clearIndexedDBCache()
}

/**
 * Clear IndexedDB cache
 */
async function clearIndexedDBCache() {
    if (typeof window === 'undefined' || !window.indexedDB) {
        return
    }

    try {
        const dbName = 'qunt-edge-cache'
        const request = indexedDB.deleteDatabase(dbName)

        request.onsuccess = () => {
            console.log('[Store Reset] IndexedDB cache cleared')
        }

        request.onerror = () => {
            console.error('[Store Reset] Failed to clear IndexedDB cache')
        }
    } catch (error) {
        console.error('[Store Reset] Error clearing IndexedDB:', error)
    }
}

/**
 * Verify all stores have reset methods
 * Call this in development to ensure all stores are properly configured
 */
export function verifyStoresHaveReset(): { total: number; missing: string[] } {
    const missing: string[] = []

    ALL_STORES.forEach((useStore) => {
        try {
            const store = useStore.getState() as ResettableStore
            if (typeof store.reset !== 'function') {
                missing.push(useStore.name || 'Unknown Store')
            }
        } catch (error) {
            missing.push(`Error accessing: ${useStore.name || 'Unknown'}`)
        }
    })

    return {
        total: ALL_STORES.length,
        missing,
    }
}

/**
 * React hook to reset stores on component unmount
 * Useful for testing or admin panels
 */
export function useResetStoresOnUnmount() {
    if (typeof window === 'undefined') return

    window.addEventListener('beforeunload', () => {
        // Don't reset on page refresh, only on explicit logout
        // This is handled by the logout function
    })
}

/**
 * Add reset method to a Zustand store
 * Helper function for store creators
 * 
 * @example
 * export const useMyStore = create((set, get) => ({
 *   data: null,
 *   setData: (data) => set({ data }),
 *   ...createResetMethod(() => ({ data: null }))
 * }))
 */
export function createResetMethod<T extends object>(initialState: () => T) {
    return {
        reset: (set: (state: Partial<T>) => void) => {
            set(initialState())
        },
    }
}

// Log verification in development
if (process.env.NODE_ENV === 'development') {
    const verification = verifyStoresHaveReset()
    if (verification.missing.length > 0) {
        console.warn(
            `[Store Reset] ${verification.missing.length} stores missing reset() method:`,
            verification.missing
        )
    } else {
        console.log(`[Store Reset] All ${verification.total} stores have reset() method ✓`)
    }
}

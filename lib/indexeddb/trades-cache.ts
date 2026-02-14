import { Account as PrismaAccount, Group as PrismaGroup, Tag, FinancialEvent, Mood, Subscription, User, TickDetails } from "@/prisma/generated/prisma"
import { Trade, Account, Group } from "@/lib/data-types"

const DB_NAME = "qunt-edge-cache"
const DB_VERSION = 2 // Incremented version to add new stores
const STORES = {
  TRADES: "trades",
  ACCOUNTS: "accounts",
  GROUPS: "groups",
  USER_DATA: "user_data",
  METRICS: "metrics"
} as const

const KEY_PREFIX = "cache:"

type CacheEntry<T> = {
  updatedAt: number
  data: T
}

const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined"
const OPEN_DB_TIMEOUT_MS = 1200

async function openDb(): Promise<IDBDatabase | null> {
  if (!isBrowser) return null

  // IndexedDB can hang or error on some mobile browsers (notably iOS Safari private mode).
  // Cache is strictly optional: if we can't open quickly, fall back to server/network.
  return await new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    const timeout = setTimeout(() => resolve(null), OPEN_DB_TIMEOUT_MS)

    request.onupgradeneeded = (event) => {
      const db = request.result
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName)
        }
      })
    }

    request.onblocked = () => {
      clearTimeout(timeout)
      resolve(null)
    }

    request.onsuccess = () => {
      clearTimeout(timeout)
      resolve(request.result)
    }

    request.onerror = () => {
      clearTimeout(timeout)
      resolve(null)
    }
  })
}

// Generic Storage
async function getCache<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDb()
  if (!db) return null

  return await new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, "readonly")
      const store = tx.objectStore(storeName)
      const request = store.get(`${KEY_PREFIX}${key}`)

      request.onsuccess = () => {
        const value = request.result as CacheEntry<T> | undefined
        resolve(value?.data ?? null)
      }
      request.onerror = () => reject(request.error)
    } catch (e) {
      resolve(null)
    }
  })
}

async function setCache<T>(storeName: string, key: string, data: T): Promise<void> {
  const db = await openDb()
  if (!db) return

  await new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      store.put({ updatedAt: Date.now(), data } satisfies CacheEntry<T>, `${KEY_PREFIX}${key}`)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    } catch (e) {
      reject(e)
    }
  })
}

async function clearStore(storeName: string, key: string): Promise<void> {
  const db = await openDb()
  if (!db) return

  await new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      store.delete(`${KEY_PREFIX}${key}`)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    } catch (e) {
      reject(e)
    }
  })
}

// Trades
export const getTradesCache = (userId: string) => getCache<Trade[]>(STORES.TRADES, userId)
export const setTradesCache = (userId: string, trades: Trade[]) => setCache(STORES.TRADES, userId, trades)
export const clearTradesCache = (userId: string) => clearStore(STORES.TRADES, userId)

// Accounts
export const getAccountsCache = (userId: string) => getCache<any[]>(STORES.ACCOUNTS, userId)
export const setAccountsCache = (userId: string, accounts: any[]) => setCache(STORES.ACCOUNTS, userId, accounts)

// Groups
export const getGroupsCache = (userId: string) => getCache<any[]>(STORES.GROUPS, userId)
export const setGroupsCache = (userId: string, groups: any[]) => setCache(STORES.GROUPS, userId, groups)

// All User Data (Full Object)
export interface FullUserDataCache {
  userData: User | null;
  subscription: Subscription | null;
  tickDetails: TickDetails[];
  tags: Tag[];
  accounts: Account[];
  groups: Group[];
  financialEvents: FinancialEvent[];
  moodHistory: Mood[];
}

export const getUserDataCache = (userId: string) => getCache<FullUserDataCache>(STORES.USER_DATA, userId)
export const setUserDataCache = (userId: string, data: FullUserDataCache) => setCache(STORES.USER_DATA, userId, data)

export async function clearAllCache(userId: string): Promise<void> {
  await Promise.all([
    clearTradesCache(userId),
    clearStore(STORES.ACCOUNTS, userId),
    clearStore(STORES.GROUPS, userId),
    clearStore(STORES.USER_DATA, userId),
    clearStore(STORES.METRICS, userId),
  ])
}

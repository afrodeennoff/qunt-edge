import { vi } from 'vitest'

vi.mock('server-only', () => ({}))

const eventTarget = new EventTarget()

if (typeof (globalThis as { window?: unknown }).window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      addEventListener: eventTarget.addEventListener.bind(eventTarget),
      removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
      dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
    },
    writable: true,
    configurable: true,
  })
}

const localStorageStore = new Map<string, string>()
const localStorageShim: Storage = {
  get length() {
    return localStorageStore.size
  },
  clear() {
    localStorageStore.clear()
  },
  getItem(key: string) {
    return localStorageStore.has(key) ? localStorageStore.get(key)! : null
  },
  key(index: number) {
    return Array.from(localStorageStore.keys())[index] ?? null
  },
  removeItem(key: string) {
    localStorageStore.delete(key)
  },
  setItem(key: string, value: string) {
    localStorageStore.set(key, String(value))
  },
}

if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageShim,
    writable: true,
    configurable: true,
  })
}

// Polyfill navigator if it doesn't exist
if (typeof navigator === 'undefined') {
  vi.stubGlobal('navigator', {
    onLine: true,
    userAgent: 'node',
  })
} else {
  // If it exists but we need to control onLine
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true,
    configurable: true,
  })
}

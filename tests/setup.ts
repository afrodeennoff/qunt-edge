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

if (typeof (globalThis as { navigator?: unknown }).navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      onLine: true,
    },
    writable: true,
    configurable: true,
  })
} else {
  // If it already exists, ensure onLine is configurable/writable for tests
  try {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    })
  } catch (e) {
    // Ignore if property is non-configurable (e.g. in some browser envs)
  }
}

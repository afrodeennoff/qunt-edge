type AsyncOperation<T> = () => Promise<T>

const schemaMismatchCooldowns = new Map<string, number>()

const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000

export function isPrismaSchemaMismatchError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  const message = (maybeError.message ?? '').toLowerCase()

  return (
    maybeError.code === 'P2022' ||
    message.includes('does not exist in the current database') ||
    message.includes('column') && message.includes('does not exist')
  )
}

export function isPrismaOperationCoolingDown(key: string): boolean {
  const blockedUntil = schemaMismatchCooldowns.get(key)
  if (!blockedUntil) return false

  const now = Date.now()
  if (now >= blockedUntil) {
    schemaMismatchCooldowns.delete(key)
    return false
  }

  return true
}

export function markPrismaOperationSchemaMismatch(
  key: string,
  cooldownMs = DEFAULT_COOLDOWN_MS
): void {
  schemaMismatchCooldowns.set(key, Date.now() + cooldownMs)
}

export async function withPrismaSchemaMismatchFallback<T>(
  key: string,
  operation: AsyncOperation<T>,
  fallbackValue: T,
  cooldownMs = DEFAULT_COOLDOWN_MS
): Promise<T> {
  if (isPrismaOperationCoolingDown(key)) {
    return fallbackValue
  }

  try {
    return await operation()
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) {
      markPrismaOperationSchemaMismatch(key, cooldownMs)
      console.warn(`[PrismaGuard] Schema mismatch in '${key}', serving fallback for ${cooldownMs}ms`)
      return fallbackValue
    }

    throw error
  }
}

export type SharedVisibilityRecord = {
  isPublic: boolean
  expiresAt: Date | null
}

export function isSharedAccessible(shared: SharedVisibilityRecord | null | undefined, now = new Date()): boolean {
  if (!shared) return false
  if (!shared.isPublic) return false
  if (shared.expiresAt && shared.expiresAt <= now) return false
  return true
}

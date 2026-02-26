import { describe, expect, it } from 'vitest'
import { isSharedAccessible } from '@/lib/security/shared-access'

describe('shared visibility guard', () => {
  const now = new Date('2026-02-25T12:00:00.000Z')

  it('denies missing or private shares', () => {
    expect(isSharedAccessible(null, now)).toBe(false)
    expect(isSharedAccessible({ isPublic: false, expiresAt: null }, now)).toBe(false)
  })

  it('denies expired shares', () => {
    expect(
      isSharedAccessible({ isPublic: true, expiresAt: new Date('2026-02-25T11:59:59.000Z') }, now)
    ).toBe(false)
  })

  it('allows active public shares', () => {
    expect(isSharedAccessible({ isPublic: true, expiresAt: null }, now)).toBe(true)
    expect(
      isSharedAccessible({ isPublic: true, expiresAt: new Date('2026-02-25T12:10:00.000Z') }, now)
    ).toBe(true)
  })
})

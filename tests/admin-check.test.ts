import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAdmin, createClient } from '@/server/auth'

// Mock the whole module but keep isAdmin original logic where possible
// We specifically need to mock createClient because it uses cookies() which fails in test env
vi.mock('@/server/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/server/auth')>()
  return {
    ...actual,
    createClient: vi.fn(),
  }
})

describe('isAdmin', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Clear relevant env vars
    delete process.env.ADMIN_USER_ID
    delete process.env.ALLOWED_ADMIN_USER_ID
    delete process.env.ADMIN_EMAIL_DOMAINS
  })

  it('returns false if no user is authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await isAdmin()
    expect(result).toBe(false)
  })

  it('returns true if user ID matches ADMIN_USER_ID', async () => {
    process.env.ADMIN_USER_ID = 'admin-123'
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-123' } }, error: null })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await isAdmin()
    expect(result).toBe(true)
  })

  it('returns true if user ID matches ALLOWED_ADMIN_USER_ID', async () => {
    process.env.ALLOWED_ADMIN_USER_ID = 'admin-456'
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-456' } }, error: null })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await isAdmin()
    expect(result).toBe(true)
  })

  it('returns true if user email matches ADMIN_EMAIL_DOMAINS', async () => {
    process.env.ADMIN_EMAIL_DOMAINS = 'qunt-edge.com,example.com'
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@qunt-edge.com' } },
          error: null
        })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await isAdmin()
    expect(result).toBe(true)
  })

  it('returns true if user email matches ADMIN_EMAIL_DOMAINS with @ prefix', async () => {
    process.env.ADMIN_EMAIL_DOMAINS = '@qunt-edge.com'
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@qunt-edge.com' } },
          error: null
        })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await isAdmin()
    expect(result).toBe(true)
  })

  it('returns false if user ID and email do not match admin criteria', async () => {
    process.env.ADMIN_USER_ID = 'admin-123'
    process.env.ADMIN_EMAIL_DOMAINS = 'admin.com'
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'user@gmail.com' } },
          error: null
        })
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await isAdmin()
    expect(result).toBe(false)
  })

  it('returns false if getUser throws error', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error('Auth error'))
      }
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await isAdmin()
    expect(result).toBe(false)
  })
})

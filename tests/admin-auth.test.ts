import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validateAdmin } from '../lib/admin-auth'
import { NextResponse } from 'next/server'

// Use vi.hoisted to define variables used in mocks
const { mockGetUser, mockCreateClient } = vi.hoisted(() => {
  const mockGetUser = vi.fn()
  const mockCreateClient = vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  })
  return { mockGetUser, mockCreateClient }
})

vi.mock('@/server/auth', () => ({
  createClient: mockCreateClient,
}))

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, status: init?.status })),
  },
}))

describe('validateAdmin', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks() // Use clearAllMocks instead of resetAllMocks to keep implementations
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
    })
    process.env = { ...originalEnv }
    process.env.ADMIN_EMAIL_DOMAINS = 'example.com,admin.org'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await validateAdmin()

    expect(result.user).toBeNull()
    expect(result.error).toEqual({
      body: { error: 'Unauthorized' },
      status: 401,
    })
  })

  it('should return 401 if user has no email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } })

    const result = await validateAdmin()

    expect(result.user).toBeNull()
    expect(result.error).toEqual({
      body: { error: 'Unauthorized' },
      status: 401,
    })
  })

  it('should return 403 if user email domain is not in allowed list', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: '123', email: 'user@gmail.com' } }
    })

    const result = await validateAdmin()

    expect(result.user).toBeNull()
    expect(result.error).toEqual({
      body: { error: 'Forbidden' },
      status: 403,
    })
  })

  it('should return user if email domain is allowed', async () => {
    const mockUser = { id: '123', email: 'admin@example.com' }
    mockGetUser.mockResolvedValue({
      data: { user: mockUser }
    })

    const result = await validateAdmin()

    expect(result.user).toEqual(mockUser)
    expect(result.error).toBeNull()
  })

  it('should handle multiple domains and verify correct domain match', async () => {
    const mockUser = { id: '123', email: 'super@admin.org' }
    mockGetUser.mockResolvedValue({
      data: { user: mockUser }
    })

    const result = await validateAdmin()

    expect(result.user).toEqual(mockUser)
    expect(result.error).toBeNull()
  })

  it('should be case insensitive', async () => {
      const mockUser = { id: '123', email: 'super@ADMIN.org' }
      mockGetUser.mockResolvedValue({
        data: { user: mockUser }
      })

      const result = await validateAdmin()

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
  })

  it('should default to forbidden if env var is missing', async () => {
    delete process.env.ADMIN_EMAIL_DOMAINS
    const mockUser = { id: '123', email: 'admin@example.com' }
    mockGetUser.mockResolvedValue({
      data: { user: mockUser }
    })

    const result = await validateAdmin()

    expect(result.user).toBeNull()
    expect(result.error).toEqual({
      body: { error: 'Forbidden' },
      status: 403,
    })
  })
})

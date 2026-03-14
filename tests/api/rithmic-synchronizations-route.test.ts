import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUserMock,
  setRithmicSynchronizationMock,
  removeRithmicSynchronizationMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  setRithmicSynchronizationMock: vi.fn(),
  removeRithmicSynchronizationMock: vi.fn(),
}))

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: vi.fn(() => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}))

vi.mock("@/app/[locale]/dashboard/components/import/rithmic/sync/actions", () => ({
  getRithmicSynchronizations: vi.fn(),
  setRithmicSynchronization: setRithmicSynchronizationMock,
  removeRithmicSynchronization: removeRithmicSynchronizationMock,
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => vi.fn(async () => ({ success: true, limit: 120, remaining: 119, resetTime: 0 }))),
  createRateLimitResponse: vi.fn(),
}))

describe("POST /api/rithmic/synchronizations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: { id: "auth-user-1" } }, error: null })
    setRithmicSynchronizationMock.mockResolvedValue(undefined)
  })

  it("accepts only strict payload and maps to allowed DTO", async () => {
    const { POST } = await import("@/app/api/rithmic/synchronizations/route")
    const response = await POST(
      new Request("http://localhost/api/rithmic/synchronizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: "ACC-1" }),
      }) as never
    )

    expect(response.status).toBe(200)
    expect(setRithmicSynchronizationMock).toHaveBeenCalledWith({
      accountId: "ACC-1",
      service: "rithmic",
    })
  })

  it("rejects mass-assignment fields in payload", async () => {
    const { POST } = await import("@/app/api/rithmic/synchronizations/route")
    const response = await POST(
      new Request("http://localhost/api/rithmic/synchronizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: "ACC-1", userId: "evil-user", token: "x" }),
      }) as never
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "VALIDATION_FAILED",
      },
    })
    expect(setRithmicSynchronizationMock).not.toHaveBeenCalled()
  })
})

describe("DELETE /api/rithmic/synchronizations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserMock.mockResolvedValue({ data: { user: { id: "auth-user-1" } }, error: null })
  })

  it("removes the owned synchronization", async () => {
    removeRithmicSynchronizationMock.mockResolvedValue({ deletedCount: 1 })
    const { DELETE } = await import("@/app/api/rithmic/synchronizations/route")
    const response = await DELETE(
      new Request("http://localhost/api/rithmic/synchronizations", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ accountId: "ACC-1" }),
      }) as never
    )

    expect(response.status).toBe(200)
    expect(removeRithmicSynchronizationMock).toHaveBeenCalledWith("ACC-1")
  })

  it("returns 404 when the synchronization does not belong to the user", async () => {
    removeRithmicSynchronizationMock.mockResolvedValue({ deletedCount: 0 })
    const { DELETE } = await import("@/app/api/rithmic/synchronizations/route")
    const response = await DELETE(
      new Request("http://localhost/api/rithmic/synchronizations", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ accountId: "ACC-1" }),
      }) as never
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "NOT_FOUND",
        message: "Synchronization not found",
      },
    })
    expect(removeRithmicSynchronizationMock).toHaveBeenCalledWith("ACC-1")
  })

  it("rejects unauthenticated requests", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null })
    const { DELETE } = await import("@/app/api/rithmic/synchronizations/route")
    const response = await DELETE(
      new Request("http://localhost/api/rithmic/synchronizations", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ accountId: "ACC-1" }),
      }) as never
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
    })
    expect(removeRithmicSynchronizationMock).not.toHaveBeenCalled()
  })
})

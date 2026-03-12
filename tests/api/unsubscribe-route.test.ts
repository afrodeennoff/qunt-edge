import { beforeEach, describe, expect, it, vi } from "vitest"

const { upsert, verifyUnsubscribeToken } = vi.hoisted(() => ({
  upsert: vi.fn(),
  verifyUnsubscribeToken: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    newsletter: {
      upsert,
    },
  },
}))

vi.mock("@/lib/unsubscribe-token", () => ({
  verifyUnsubscribeToken,
}))

import { GET } from "@/app/api/email/unsubscribe/route"

describe("/api/email/unsubscribe validation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyUnsubscribeToken.mockReturnValue(true)
    upsert.mockResolvedValue({ id: "newsletter_1" })
  })

  it("rejects malformed email with 400", async () => {
    const response = await GET(
      new Request("http://localhost/api/email/unsubscribe?email=bad-email&token=abc.def")
    )

    expect(response.status).toBe(400)
    expect(verifyUnsubscribeToken).not.toHaveBeenCalled()
    expect(upsert).not.toHaveBeenCalled()
  })

  it("rejects malformed token with 400", async () => {
    const response = await GET(
      new Request("http://localhost/api/email/unsubscribe?email=user@example.com&token=not-valid")
    )

    expect(response.status).toBe(400)
    expect(verifyUnsubscribeToken).not.toHaveBeenCalled()
    expect(upsert).not.toHaveBeenCalled()
  })
})

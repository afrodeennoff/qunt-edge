import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-url"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token"

describe("buildUnsubscribeUrl", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.UNSUBSCRIBE_TOKEN_SECRET =
      "a_very_long_secure_secret_for_unsubscribe_tokens_at_least_32_chars"
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("builds tokenized unsubscribe URL with request origin", () => {
    const email = "test@example.com"
    const request = new Request("https://app.example.com/api/email/welcome")

    const url = buildUnsubscribeUrl(email, request)
    const parsed = new URL(url)
    const token = parsed.searchParams.get("token")

    expect(parsed.origin).toBe("https://app.example.com")
    expect(parsed.pathname).toBe("/api/email/unsubscribe")
    expect(parsed.searchParams.get("email")).toBe(email)
    expect(token).toBeTruthy()
    expect(verifyUnsubscribeToken(token!, email)).toBe(true)
  })

  it("falls back to env base URL when request is not provided", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://prod.example.com"
    const email = "hello@example.com"

    const url = buildUnsubscribeUrl(email)
    expect(url.startsWith("https://prod.example.com/api/email/unsubscribe?")).toBe(true)
  })
})

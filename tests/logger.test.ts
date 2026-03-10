import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { logger, withLogContext } from "@/lib/logger"

describe("logger", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let writeMock: any

  beforeEach(() => {
    writeMock = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(process.stdout as any, "write").mockImplementation(writeMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("redacts sensitive values in development output", () => {
    logger.info("test-redaction", {
      token: "1234567890abcdef",
      safeField: "visible",
    })

    const output = writeMock.mock.calls[0]?.[0] as string
    expect(typeof output).toBe("string")
    expect(output).not.toContain("1234567890abcdef")
    expect(output).toContain("12***ef")
    expect(output).toContain("visible")
  })

  it("injects request and correlation identifiers from context", () => {
    withLogContext(
      {
        requestId: "req-123",
        route: "/api/test",
        method: "POST",
      },
      () => {
        logger.info("contextual-log")
      }
    )

    const output = writeMock.mock.calls[0]?.[0] as string
    expect(typeof output).toBe("string")
    expect(output).toContain("req-123")
    expect(output).toContain("correlationId")
    expect(output).toContain("/api/test")
    expect(output).toContain("POST")
  })
})

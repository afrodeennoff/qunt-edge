import { beforeEach, describe, expect, it, vi } from "vitest";

const { authAttemptMock } = vi.hoisted(() => ({
  authAttemptMock: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    authAttempt: authAttemptMock,
  },
}));

vi.mock("@/lib/security/auth-config", () => ({
  authSecurityConfig: {
    rateLimitEnabled: true,
    lockoutEnabled: true,
    lockoutThreshold: 3,
    lockoutWindowMs: 15 * 60 * 1000,
  },
  getLockoutDurationMs: (failureCount: number) => (failureCount >= 3 ? 5 * 60 * 1000 : 0),
}));

import {
  checkAuthGuard,
  recordAuthFailure,
  recordAuthSuccess,
} from "@/lib/security/auth-attempts";

describe("auth attempt guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks when account is currently locked", async () => {
    authAttemptMock.findUnique.mockResolvedValue({
      id: "attempt-1",
      failCount: 3,
      firstFailureAt: new Date(),
      lockedUntil: new Date(Date.now() + 60_000),
    });

    const result = await checkAuthGuard({
      email: "test@example.com",
      ip: "203.0.113.10",
      actionType: "password_login",
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("creates a new auth attempt record on first failure", async () => {
    authAttemptMock.findUnique.mockResolvedValueOnce(null);
    authAttemptMock.create.mockResolvedValue({ id: "new-attempt" });

    await recordAuthFailure({
      email: "test@example.com",
      ip: "203.0.113.10",
      actionType: "magic_link_request",
      userId: null,
    });

    expect(authAttemptMock.create).toHaveBeenCalledTimes(1);
    expect(authAttemptMock.update).not.toHaveBeenCalled();
  });

  it("escalates failures and sets lockout once threshold is reached", async () => {
    authAttemptMock.findUnique.mockResolvedValue({
      id: "attempt-2",
      userId: null,
      failCount: 2,
      firstFailureAt: new Date(Date.now() - 60_000),
      lockedUntil: null,
    });

    await recordAuthFailure({
      email: "test@example.com",
      ip: "203.0.113.10",
      actionType: "otp_verify",
      userId: null,
    });

    expect(authAttemptMock.update).toHaveBeenCalledTimes(1);
    const payload = authAttemptMock.update.mock.calls[0]?.[0]?.data;
    expect(payload.failCount).toBe(3);
    expect(payload.lockedUntil).toBeInstanceOf(Date);
  });

  it("resets failure state on success", async () => {
    authAttemptMock.findUnique.mockResolvedValue({
      id: "attempt-3",
      userId: null,
      failCount: 4,
      firstFailureAt: new Date(),
      lockedUntil: new Date(Date.now() + 30_000),
    });

    await recordAuthSuccess({
      email: "test@example.com",
      ip: "203.0.113.10",
      actionType: "password_login",
      userId: "user-1",
    });

    expect(authAttemptMock.update).toHaveBeenCalledTimes(1);
    const payload = authAttemptMock.update.mock.calls[0]?.[0]?.data;
    expect(payload.failCount).toBe(0);
    expect(payload.lockedUntil).toBeNull();
  });
});

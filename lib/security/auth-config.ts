type MfaEnforcementMode = "off" | "required_admin" | "required_all"

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback
  return value === "true"
}

function parseMfaMode(value: string | undefined): MfaEnforcementMode {
  if (value === "required_admin" || value === "required_all" || value === "off") return value
  return "required_all"
}

export const authSecurityConfig = {
  rateLimitEnabled: parseBoolean(process.env.AUTH_RATE_LIMIT_ENABLED, true),
  lockoutEnabled: parseBoolean(process.env.AUTH_LOCKOUT_ENABLED, true),
  mfaEnforcement: parseMfaMode(process.env.AUTH_MFA_ENFORCEMENT),
  errorObfuscationEnabled: parseBoolean(process.env.AUTH_ERROR_OBFUSCATION, true),
  tradovateTokenEncryptionEnabled: parseBoolean(process.env.TRADOVATE_TOKEN_ENCRYPTION_ENABLED, true),
  lockoutThreshold: parsePositiveInt(process.env.AUTH_LOCKOUT_THRESHOLD, 5),
  lockoutWindowMs: parsePositiveInt(process.env.AUTH_LOCKOUT_WINDOW_MS, 15 * 60 * 1000),
  lockoutDurationsMs: [
    parsePositiveInt(process.env.AUTH_LOCKOUT_DURATION_1_MS, 5 * 60 * 1000),
    parsePositiveInt(process.env.AUTH_LOCKOUT_DURATION_2_MS, 15 * 60 * 1000),
    parsePositiveInt(process.env.AUTH_LOCKOUT_DURATION_3_MS, 60 * 60 * 1000),
  ],
  oauthStateTtlMs: parsePositiveInt(process.env.AUTH_OAUTH_STATE_TTL_MS, 10 * 60 * 1000),
}

export function getLockoutDurationMs(failureCount: number): number {
  const durations = authSecurityConfig.lockoutDurationsMs
  if (failureCount >= authSecurityConfig.lockoutThreshold + 4) return durations[2]
  if (failureCount >= authSecurityConfig.lockoutThreshold + 2) return durations[1]
  return durations[0]
}


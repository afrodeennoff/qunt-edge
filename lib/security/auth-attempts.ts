export type AuthActionType = "password_login" | "otp_verify" | "magic_link_request"

export type AuthGuardResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; message: string }

export async function checkAuthGuard(params: {
  email: string
  ip: string
  actionType: AuthActionType
}): Promise<AuthGuardResult> {
  void params
  return { allowed: true }
}

export async function recordAuthFailure(params: {
  email: string
  ip: string
  actionType: AuthActionType
  userId?: string | null
}) {
  void params
  return
}

export async function recordAuthSuccess(params: {
  email: string
  ip: string
  actionType: AuthActionType
  userId?: string | null
}) {
  void params
  return
}

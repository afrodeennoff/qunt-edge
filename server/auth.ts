'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { User } from '@supabase/supabase-js'
import { authSecurityConfig } from '@/lib/security/auth-config'
import { checkAuthGuard, recordAuthFailure, recordAuthSuccess } from '@/lib/security/auth-attempts'

export async function getWebsiteURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Optional public override.
    process?.env?.VERCEL_URL ?? // Automatically set by Vercel at runtime.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

/**
 * Wraps Supabase auth operations to handle JSON parsing errors gracefully.
 * When Supabase API returns HTML error pages instead of JSON, this provides
 * a more meaningful error message.
 */
function handleAuthError(error: any): never {
  // Check if this is a JSON parsing error (indicates HTML response)
  if (
    error?.message?.includes('Unexpected token') ||
    error?.message?.includes('is not valid JSON') ||
    error?.originalError?.message?.includes('Unexpected token') ||
    error?.originalError?.message?.includes('is not valid JSON')
  ) {
    console.error('[Auth] Supabase API returned non-JSON response:', {
      error: error.message,
      originalError: error.originalError?.message,
    })
    throw new Error(
      'Authentication service is temporarily unavailable. The service returned an invalid response. Please try again in a few moments.'
    )
  }

  // Re-throw other errors as-is
  throw error
}

const GENERIC_AUTH_ERROR = 'Invalid credentials or verification required'

function getExternalAuthErrorMessage(errorMessage: string): string {
  if (!authSecurityConfig.errorObfuscationEnabled) return errorMessage
  return GENERIC_AUTH_ERROR
}

async function getRequestIp(): Promise<string> {
  try {
    const headerStore = await headers()
    const forwardedFor = headerStore.get('x-forwarded-for')
    const realIp = headerStore.get('x-real-ip')
    const ip = (forwardedFor?.split(',')[0] || realIp || '').trim()
    return ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV !== 'production') {
      return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key',
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // The `setAll` method was called from a Server Component.
              }
            },
          },
        }
      )
    }
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function signInWithDiscord(next: string | null = null, locale?: string) {
  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const callbackParams = new URLSearchParams()
  if (next) callbackParams.set('next', next)
  if (locale) callbackParams.set('locale', locale)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${websiteURL}api/auth/callback${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithGoogle(next: string | null = null, locale?: string) {
  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const callbackParams = new URLSearchParams()
  if (next) callbackParams.set('next', next)
  if (locale) callbackParams.set('locale', locale)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        prompt: 'select_account',
      },
      redirectTo: `${websiteURL}api/auth/callback${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

async function signOutSilently() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function signInWithEmail(email: string, next: string | null = null, locale?: string) {
  const requestIp = await getRequestIp()
  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'magic_link_request',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const websiteURL = await getWebsiteURL()
    const callbackParams = new URLSearchParams()
    if (next) callbackParams.set('next', next)
    if (locale) callbackParams.set('locale', locale)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${websiteURL}api/auth/callback${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
      },
    })
    if (error) {
      throw new Error(error.message)
    }
    await recordAuthSuccess({
      email,
      ip: requestIp,
      actionType: 'magic_link_request',
    })
  } catch (error: any) {
    await recordAuthFailure({
      email,
      ip: requestIp,
      actionType: 'magic_link_request',
      userId: null,
    })
    if (error instanceof Error) {
      throw new Error(getExternalAuthErrorMessage(error.message))
    }
    handleAuthError(error)
  }
}

// Password-based authentication (login)
// If user doesn't exist, automatically creates account and signs in
export async function signInWithPasswordAction(
  email: string,
  password: string,
  next: string | null = null,
  locale?: string
) {
  const requestIp = await getRequestIp()
  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'password_login',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      throw new Error(error.message)
    }

    // Sign-in succeeded normally
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await ensureUserInDatabase(user, locale)
      }
    } catch (e) {
      // Non-fatal; still proceed
      console.error('[signInWithPasswordAction] ensureUserInDatabase failed:', e)
    }

    // Optionally handle redirect on the client; return success and let client route
    const authUser = data.user ?? null
    await recordAuthSuccess({
      email,
      ip: requestIp,
      actionType: 'password_login',
      userId: authUser?.id ?? null,
    })
    return { success: true, next }
  } catch (error: any) {
    await recordAuthFailure({
      email,
      ip: requestIp,
      actionType: 'password_login',
      userId: null,
    })
    if (error instanceof Error) {
      throw new Error(getExternalAuthErrorMessage(error.message))
    }
    handleAuthError(error)
  }
}

// Password-based registration – auto signs in if email confirmation is disabled
export async function signUpWithPasswordAction(
  email: string,
  password: string,
  next: string | null = null,
  locale?: string
) {
  try {
    const supabase = await createClient()
    const websiteURL = await getWebsiteURL()
    const callbackParams = new URLSearchParams()
    if (next) callbackParams.set('next', next)
    if (locale) callbackParams.set('locale', locale)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${websiteURL}api/auth/callback${callbackParams.toString() ? `?${callbackParams.toString()}` : ''}`,
      },
    })
    if (error) {
      throw new Error(error.message)
    }

    // If email confirmation is disabled, user is automatically signed in
    if (data.user && data.session) {
      try {
        await ensureUserInDatabase(data.user, locale)
      } catch (e) {
        // Non-fatal; still proceed
        console.error('[signUpWithPasswordAction] ensureUserInDatabase failed:', e)
      }
    }

    return { success: true, next }
  } catch (error: any) {
    handleAuthError(error)
  }
}

// Allow a logged-in user (e.g., magic link users) to set or change a password
export async function setPasswordAction(newPassword: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
    return { success: true }
  } catch (error: any) {
    handleAuthError(error)
  }
}

/**
 * ensureUserInDatabase
 *
 * Ensures there is a corresponding user record in the public schema linked to the
 * Supabase Auth user, and synchronizes the preferred language/locale from the client.
 *
 * Behavior:
 * - If a user with matching `auth_user_id` exists, updates the email if it changed and
 *   keeps language set to the provided `locale` (fallbacks to existing value).
 * - If no match by `auth_user_id`, optionally checks for an existing user by email; if an
 *   email conflict with a different `auth_user_id` is detected, signs out and throws.
 * - Otherwise, creates a new `user` with `id` and `auth_user_id` set to the Supabase user id,
 *   email set from the Supabase profile, and language set to `locale` (default 'en'). Also
 *   attempts to create a default dashboard layout for first-time users.
 *
 * Parameters:
 * - user: Supabase `User` object (required). Must contain a valid `id`.
 * - locale: Optional locale string from the client (e.g. 'en', 'fr'). When provided, it is
 *   persisted to the `language` field for the user record.
 *
 * Returns:
 * - The up-to-date Prisma `user` record.
 *
 * Side effects:
 * - May sign the user out on integrity or identification errors.
 * - May create a default dashboard layout for new users.
 *
 * Errors:
 * - Throws on missing user or id, account conflicts, Prisma integrity/validation issues, or
 *   unexpected errors. NEXT_REDIRECT errors are re-thrown to allow Next.js redirects.
 */
export async function ensureUserInDatabase(user: User, locale?: string) {
  if (!user) {
    await signOutSilently();
    throw new Error('User data is required');
  }

  if (!user.id) {
    await signOutSilently();
    throw new Error('User ID is required');
  }

  try {
    // First try to find user by auth_user_id
    const existingUserByAuthId = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
    });

    // If user exists by auth_user_id, update fields if needed
    if (existingUserByAuthId) {
      const shouldUpdateEmail = existingUserByAuthId.email !== user.email;
      const shouldUpdateLanguage = !!locale && locale !== existingUserByAuthId.language;

      if (shouldUpdateEmail || shouldUpdateLanguage) {
        console.log('[ensureUserInDatabase] Updating existing user record');
        try {
          const updatedUser = await prisma.user.update({
            where: {
              auth_user_id: user.id // Always use auth_user_id as the unique identifier
            },
            data: {
              email: shouldUpdateEmail ? (user.email || existingUserByAuthId.email) : existingUserByAuthId.email,
              language: shouldUpdateLanguage ? (locale as string) : existingUserByAuthId.language
            },
          });
          console.log('[ensureUserInDatabase] SUCCESS: User updated successfully');
          return updatedUser;
        } catch (updateError) {
          console.error('[ensureUserInDatabase] ERROR: Failed to update user record:', updateError);
          throw new Error('Failed to update user');
        }
      }
      console.log('[ensureUserInDatabase] SUCCESS: Existing user found, no update needed');
      return existingUserByAuthId;
    }

    // If user doesn't exist by auth_user_id, check if email exists
    if (user.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUserByEmail && existingUserByEmail.auth_user_id !== user.id) {
        console.log('[ensureUserInDatabase] ERROR: Account conflict - email already associated with different auth method', {
          userEmail: user.email,
          existingAuthId: existingUserByEmail.auth_user_id,
          currentAuthId: user.id
        });
        await signOutSilently();
        throw new Error('Account conflict: Email already associated with different authentication method');
      }
    }

    // Create new user if no existing user found
    console.log('[ensureUserInDatabase] Creating new user');
    try {
      const newUser = await prisma.user.create({
        data: {
          auth_user_id: user.id,
          email: user.email || '', // Provide a default empty string if email is null
          id: user.id,
          language: locale || 'en'
        },
      });
      console.log('[ensureUserInDatabase] SUCCESS: New user created successfully');

      // Create default dashboard layout for new user
      try {
        const { createDefaultDashboardLayout } = await import('@/server/database');
        await createDefaultDashboardLayout(user.id);
        console.log('[ensureUserInDatabase] SUCCESS: Default dashboard layout created');
      } catch (layoutError) {
        console.error('[ensureUserInDatabase] WARNING: Failed to create default dashboard layout:', layoutError);
        // Don't throw here - user creation succeeded, layout can be created later
      }

      return newUser;
    } catch (createError) {
      if (createError instanceof Error &&
        createError.message.includes('Unique constraint failed')) {
        console.log('[ensureUserInDatabase] ERROR: Unique constraint failed when creating user', createError);
        await signOutSilently();
        throw new Error('Database integrity error: Duplicate user records found');
      }
      console.error('[ensureUserInDatabase] ERROR: Failed to create user:', createError);
      await signOutSilently();
      throw new Error('Failed to create user account');
    }
  } catch (error) {
    // Re-throw NEXT_REDIRECT errors immediately (these are normal Next.js redirects)
    if (error instanceof Error && (
      error.message === 'NEXT_REDIRECT' ||
      ('digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'))
    )) {
      throw error;
    }

    console.error('[ensureUserInDatabase] ERROR: Unexpected error in main catch block:', error);

    // Handle Prisma validation errors
    if (error instanceof Error) {
      if (error.message.includes('Argument `where` of type UserWhereUniqueInput needs')) {
        console.log('[ensureUserInDatabase] ERROR: Invalid user identification provided');
        await signOutSilently();
        throw new Error('Invalid user identification provided');
      }

      if (error.message.includes('Unique constraint failed')) {
        console.log('[ensureUserInDatabase] ERROR: Database integrity error - duplicate user records');
        await signOutSilently();
        throw new Error('Database integrity error: Duplicate user records found');
      }

      if (error.message.includes('Account conflict')) {
        console.log('[ensureUserInDatabase] ERROR: Re-throwing account conflict error');
        // Error already handled above
        throw error;
      }
    }

    // For any other unexpected errors, log out the user
    console.log('[ensureUserInDatabase] ERROR: Critical database error - signing out user');
    await signOutSilently();
    throw new Error('Critical database error occurred. Please try logging in again.');
  }
}

export async function verifyOtp(email: string, token: string, type: 'email' | 'signup' = 'email') {
  const requestIp = await getRequestIp()
  try {
    const guard = await checkAuthGuard({
      email,
      ip: requestIp,
      actionType: 'otp_verify',
    })
    if (!guard.allowed) {
      throw new Error(`${GENERIC_AUTH_ERROR}|RETRY_AFTER=${guard.retryAfterSeconds}`)
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    })

    if (data.user && data.session) {
      const locale = email.includes('.fr') ? 'fr' : 'en';
      await ensureUserInDatabase(data.user, locale)
    }

    if (error) {
      throw new Error(error.message)
    }

    await recordAuthSuccess({
      email,
      ip: requestIp,
      actionType: 'otp_verify',
      userId: data.user?.id ?? null,
    })

    return data
  } catch (error: any) {
    await recordAuthFailure({
      email,
      ip: requestIp,
      actionType: 'otp_verify',
      userId: null,
    })
    if (error instanceof Error) {
      throw new Error(getExternalAuthErrorMessage(error.message))
    }
    handleAuthError(error)
  }
}

async function requireAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user?.id) {
    throw new Error("User not authenticated")
  }

  return user
}

// Optimized function that uses middleware data when available
export async function getUserId(): Promise<string> {
  try {
    const user = await requireAuthenticatedUser()
    return user.id
  } catch (error: any) {
    handleAuthError(error)
  }
}

/**
 * Resolve the database user primary key (`User.id`) from an auth/middleware id.
 * Most relational tables (`Account`, `Trade`, `Tag`, `Mood`, etc.) reference `User.id`.
 */
export async function getDatabaseUserId(): Promise<string> {
  const user = await requireAuthenticatedUser()
  const rawUserId = user.id

  const byId = await prisma.user.findUnique({
    where: { id: rawUserId },
    select: { id: true },
  })
  if (byId?.id) return byId.id

  const byAuthId = await prisma.user.findUnique({
    where: { auth_user_id: rawUserId },
    select: { id: true },
  })
  if (byAuthId?.id) return byAuthId.id

  let resolvedEmail = user.email?.trim().toLowerCase() || ""

  if (!resolvedEmail) {
    resolvedEmail = `${rawUserId}@users.qunt-edge.local`
  }

  const created = await prisma.user.upsert({
    where: { id: rawUserId },
    create: {
      id: rawUserId,
      auth_user_id: rawUserId,
      email: resolvedEmail,
    },
    update: {},
    select: { id: true },
  })

  return created.id
}

export async function getUserEmail(): Promise<string> {
  const user = await requireAuthenticatedUser()
  return user.email || ""
}

// Lightweight updater for user language without full ensure logic
export async function updateUserLanguage(locale: string): Promise<{ updated: boolean }> {
  console.log("[Auth] updateUserLanguage", locale)
  const allowedLocales = new Set(['en', 'fr'])
  if (!allowedLocales.has(locale)) {
    return { updated: false }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) {
    return { updated: false }
  }

  const existing = await prisma.user.findUnique({ where: { auth_user_id: user.id } })
  if (!existing) {
    return { updated: false }
  }

  if (existing.language === locale) {
    return { updated: false }
  }

  await prisma.user.update({
    where: { auth_user_id: user.id },
    data: { language: locale },
  })
  return { updated: true }
}

// Identity linking functions
export async function linkDiscordAccount() {
  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'discord',
    options: {
      redirectTo: `${websiteURL}api/auth/callback?action=link`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
  if (error) {
    throw new Error(error.message)
  }
}

export async function linkGoogleAccount() {
  const supabase = await createClient()
  const websiteURL = await getWebsiteURL()
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: `${websiteURL}api/auth/callback?action=link`,
    },
  })
  if (data.url) {
    redirect(data.url)
  }
  if (error) {
    throw new Error(error.message)
  }
}

export async function unlinkIdentity(identity: any) {
  const supabase = await createClient()
  const { error } = await supabase.auth.unlinkIdentity(identity)
  if (error) {
    throw new Error(error.message)
  }
  return { success: true }
}

export async function getUserIdentities() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error('User not authenticated')
    }

    // Get user's identities using the proper method
    const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities()

    if (identitiesError) {
      throw new Error(identitiesError.message)
    }

    return identities
  } catch (error: any) {
    handleAuthError(error)
  }
}

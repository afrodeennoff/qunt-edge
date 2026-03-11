import { createClient, ensureUserInDatabase, getWebsiteURL } from '@/server/auth'
import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  )
}

async function ensureUserInDatabaseWithBudget(
  ensureFn: () => Promise<unknown>,
  timeoutMs: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  try {
    await Promise.race([
      ensureFn(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`ensureUserInDatabase timeout after ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery' for password reset
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next')
  const action = searchParams.get('action')
  const locale = searchParams.get('locale') || undefined


  // Normalize next path so values like "dashboard" become "/dashboard".
  // Keep redirects internal by rejecting protocol-relative and absolute URLs.
  let normalizedNext: string | null = null
  if (next) {
    const decodedNext = decodeURIComponent(next).trim()
    const isAbsolute =
      decodedNext.startsWith('http://') ||
      decodedNext.startsWith('https://') ||
      decodedNext.startsWith('//') ||
      decodedNext.startsWith('\\\\')

    if (decodedNext && !isAbsolute) {
      normalizedNext = `/${decodedNext.replace(/^\/+/, '')}`
    }
  }

  const safeLocale = (() => {
    const raw = (locale || '').trim().toLowerCase()
    if (!raw) return 'en'
    // Keep permissive: app supports multiple locales.
    if (!/^[a-z]{2}(-[a-z]{2})?$/.test(raw)) return 'en'
    return raw
  })()

  const withLocalePrefix = (path: string) => {
    const normalized = `/${path.replace(/^\/+/, '')}`
    if (normalized.startsWith('/api/')) return normalized
    if (/^\/[a-z]{2}(?:-[a-z]{2})?(?:\/|$)/i.test(normalized)) return normalized
    return `/${safeLocale}${normalized}`
  }

  const websiteURL = await getWebsiteURL()

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Handle password recovery redirect
        if (type === 'recovery') {
          return NextResponse.redirect(new URL(withLocalePrefix('/dashboard/settings?passwordReset=true'), websiteURL))
        }

        // Handle identity linking redirect
        if (action === 'link') {
          return NextResponse.redirect(new URL(withLocalePrefix('/dashboard/settings?linked=true'), websiteURL))
        }

        // Ensure DB user exists and persist locale before redirecting
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await ensureUserInDatabaseWithBudget(
              () => ensureUserInDatabase(user, locale),
              800
            )
          }
        } catch (e) {
          if (isNextRedirectError(e)) {
            throw e
          }
          console.error('Auth callback ensureUserInDatabase error:', e)
          // Non-fatal: continue redirect
        }

        if (normalizedNext) {
          return NextResponse.redirect(new URL(withLocalePrefix(normalizedNext), websiteURL))
        }
        return NextResponse.redirect(new URL(withLocalePrefix('/dashboard'), websiteURL))
      }
    } catch (error: unknown) {
      if (isNextRedirectError(error)) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : ''
      const originalErrorMessage =
        typeof error === 'object' &&
          error !== null &&
          'originalError' in error &&
          typeof (error as { originalError?: { message?: string } }).originalError?.message === 'string'
          ? (error as { originalError?: { message?: string } }).originalError?.message ?? ''
          : ''

      // Handle JSON parsing errors from Supabase API
      if (
        errorMessage.includes('Unexpected token') ||
        errorMessage.includes('is not valid JSON') ||
        originalErrorMessage.includes('Unexpected token') ||
        originalErrorMessage.includes('is not valid JSON')
      ) {
        console.error('[Auth Callback] Supabase API returned non-JSON response:', error)
        // Redirect to auth page with error message
        return NextResponse.redirect(new URL(withLocalePrefix('/authentication?error=service_unavailable'), websiteURL))
      }
      console.error('Auth callback unexpected error:', error)
    }
  }

  // return the user to the authentication page
  return NextResponse.redirect(new URL(withLocalePrefix('/authentication'), websiteURL))
}

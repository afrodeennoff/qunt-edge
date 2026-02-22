import { type NextRequest, NextResponse } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"
import { createServerClient } from "@supabase/ssr"
import { geolocation } from "@vercel/functions"
import { User } from "@supabase/supabase-js"
import { buildAppCsp, buildEmbedCsp, createNonce } from "@/lib/security/csp"

// Maintenance mode flag - Set to true to enable maintenance mode
const MAINTENANCE_MODE = false

// Use redirect strategy to ensure users are always on valid localized paths
const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr", "de", "es", "it", "pt", "vi", "hi", "ja", "zh", "yo"],
  defaultLocale: "en",
  urlMappingStrategy: "redirect",
})

const LOCALES = ["en", "fr", "de", "es", "it", "pt", "vi", "hi", "ja", "zh", "yo"] as const
const LOCALE_SET = new Set<string>(LOCALES)
const STATIC_FILE_REGEX = /\.[^/]+$/

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie")
  return Boolean(cookieHeader && cookieHeader.includes("sb-") && cookieHeader.includes("auth-token"))
}

function isRootOrLocaleRootPath(pathname: string): boolean {
  if (pathname === "/") return true
  return LOCALES.some((locale) => pathname === `/${locale}`)
}

function getLocale(pathname: string): string {
  const firstSegment = pathname.split('/')[1]
  return LOCALE_SET.has(firstSegment) ? firstSegment : 'en'
}

async function updateSession(request: NextRequest) {
  const response = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Proxy] Missing Supabase URL or anon key; skipping session refresh.")
    return { response, user: null, error: new Error("Missing Supabase environment variables") }
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Preserve Supabase defaults while enforcing secure production behavior.
            response.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
              sameSite: options?.sameSite ?? "lax",
              httpOnly: options?.httpOnly ?? true,
            })
          })
        },
      },
    },
  )

  let user: User | null = null
  let error: unknown = null

  try {
    // Add timeout to prevent hanging requests
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))

    const result = (await Promise.race([authPromise, timeoutPromise])) as any
    user = result.data?.user || null
    error = result.error
  } catch (authError: any) {
    // Handle JSON parsing errors from Supabase API (when API returns HTML instead of JSON)
    if (
      authError?.message?.includes('Unexpected token') ||
      authError?.message?.includes('is not valid JSON') ||
      authError?.originalError?.message?.includes('Unexpected token') ||
      authError?.originalError?.message?.includes('is not valid JSON')
    ) {
      console.error("[Proxy] Supabase API returned non-JSON response:", authError)
      // Don't throw - gracefully handle auth failures by treating as unauthenticated
      user = null
      error = new Error("Authentication service temporarily unavailable")
    } else {
      console.warn("Auth check failed:", authError)
      // Don't throw - gracefully handle auth failures
      user = null
      error = authError
    }
  }

  // Do not expose auth identity or auth error details via response headers.
  // Downstream code must derive identity from Supabase session server-side.

  return { response, user, error }
}

function setCspHeader(response: NextResponse, csp: string, reportOnly: boolean) {
  response.headers.delete("Content-Security-Policy")
  response.headers.delete("Content-Security-Policy-Report-Only")
  response.headers.set(
    reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
    csp
  )
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const locale = getLocale(pathname)
  const isDashboardRoute = pathname.includes("/dashboard")
  const isAdminRoute = pathname.includes("/admin")
  const isAuthRoute = pathname.includes("/authentication")
  const isEmbedRoute = pathname.includes("/embed")
  const isDev = process.env.NODE_ENV === "development"
  const cspEnabled = process.env.CSP_ENABLED !== "false"
  const cspReportOnly = process.env.CSP_REPORT_ONLY !== "false"
  const cspStrictMode = process.env.CSP_STRICT_MODE === "true"
  const isStaticAsset =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/videos/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes("/opengraph-image") ||
    pathname.includes("/twitter-image") ||
    pathname.includes("/icon") ||
    STATIC_FILE_REGEX.test(pathname)

  // More specific static asset exclusions - must be first!
  if (isStaticAsset) {
    return NextResponse.next()
  }

  // Apply i18n middleware first
  // This handles basic redirects for / to /en, etc.
  const response = I18nMiddleware(req)
  const nonce = createNonce()
  response.headers.set("x-nonce", nonce)

  // Embed route check (public path, no auth/session roundtrip needed)
  if (isEmbedRoute) {
    response.headers.delete("X-Frame-Options") // Allow framing

    // Check if request is from a local file or development environment
    const origin = req.headers.get("origin")
    const referer = req.headers.get("referer")
    const isLocalFile = origin === "null" || referer?.startsWith("file://") || (!origin && !referer)
    // If embedding from a local file (file://), omit CSP entirely so browsers don't block
    if (isLocalFile) {
      response.headers.delete("Content-Security-Policy")
      response.headers.delete("Content-Security-Policy-Report-Only")
      return response
    }

    // Development: omit CSP entirely to prevent frame-ancestors blocking during local testing
    if (isDev) {
      response.headers.delete("Content-Security-Policy")
      response.headers.delete("Content-Security-Policy-Report-Only")
      return response
    }

    // Production CSP - more restrictive
    // Allow localhost for testing (remove in final production)
    const allowedOrigins = [
      "'self'",
      "https://*.deltalytix.app", // Main domain
      "https://*.beta.deltalytix.app", // Beta subdomain
      "http://localhost:*", // For local testing
      "http://127.0.0.1:*", // For local testing
      "file:", // For local HTML file testing (may be ignored by some browsers)
      "https://thortradecopier.com",
      "https://app.thortradecopier.com",
    ].join(" ")

    if (cspEnabled) {
      setCspHeader(response, buildEmbedCsp(allowedOrigins), cspReportOnly)
    }

    return response
  }

  // Check for protected routes
  const needsSessionCheck = isDashboardRoute || isAdminRoute || isAuthRoute
  const hasAuthCookie = hasSupabaseAuthCookie(req)
  const shouldRunSessionCheck = needsSessionCheck && hasAuthCookie

  let user: User | null = null
  let error: unknown = null

  if (shouldRunSessionCheck) {
    const { response: authResponse, user: sessionUser, error: sessionError } = await updateSession(req)
    user = sessionUser
    error = sessionError

    // Merge responses - copy headers from auth response to i18n response
    authResponse.headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    // Copy cookies from auth response
    authResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as any,
      })
    })
  } else if (!hasAuthCookie && (isDashboardRoute || isAdminRoute)) {
    // Fast path: protected route with no auth cookie -> redirect to auth
    // Use locale-aware path
    const authUrl = new URL(`/${locale}/authentication`, req.url)

    // Preserve search params or return path
    // IMPORTANT: If we are on /dashboard (no locale), this logic might execute if I18nMiddleware didn't redirect us yet (e.g. rewrite).
    // But since we switched to 'redirect' strategy, /dashboard should have been redirected to /en/dashboard by I18nMiddleware(req) call.
    // However, I18nMiddleware returns a response with 307. We are continuing execution.
    // If I18nMiddleware returned a redirect, we should probably respect it UNLESS we need to override it?
    // Actually, if I18nMiddleware returns a 307, response.status is 307.
    // We should check response.status before doing our own logic?

    // If Next-International wants to redirect, let it redirect.
    if (response.status >= 300 && response.status < 400) {
      return response
    }

    // If we are here, it means we are on a valid path (localized or root if rewrite was on... but we turned it off).
    // So pathname should be /en/dashboard or similar.

    // Strip locale from next param if we want cleanliness, or keep it.
    // let encodedSearchParams = `${pathname.substring(1)}${req.nextUrl.search}`
    // This logic was stripping first char? No. substring(1)

    // Better way to build 'next':
    const nextPath = pathname + req.nextUrl.search
    if (nextPath) {
      authUrl.searchParams.append("next", nextPath)
    }
    return NextResponse.redirect(authUrl)
  }

  // Maintenance mode check
  if (MAINTENANCE_MODE && !pathname.includes("/maintenance") && isDashboardRoute) {
    return NextResponse.redirect(new URL(`/${locale}/maintenance`, req.url))
  }

  // Admin route check with better error handling
  if (isAdminRoute) {
    if (!user || error) {
      const authUrl = new URL(`/${locale}/authentication`, req.url)
      authUrl.searchParams.set("error", "admin_access_required")
      return NextResponse.redirect(authUrl)
    }

    // Only allow access to admin in production
    if (user.id !== process.env.ADMIN_USER_ID) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url))
    }
  }

  // Authentication checks with better error handling
  if (isDashboardRoute) {
    if (!user || error) {
      const nextPath = pathname + req.nextUrl.search
      const authUrl = new URL(`/${locale}/authentication`, req.url)

      if (nextPath) {
        authUrl.searchParams.append("next", nextPath)
      }

      // Add error context for debugging
      if (error) {
        authUrl.searchParams.set("auth_error", "session_invalid")
      }

      return NextResponse.redirect(authUrl)
    }
  } else if (isAuthRoute) {
    // Authenticated - redirect from auth to dashboard
    if (user && !error) {
      const nextParam = req.nextUrl.searchParams.get("next")

      let redirectPath = "/dashboard"
      if (nextParam) {
        // Assume nextParam is full path
        redirectPath = nextParam
      }

      // Ensure redirect path has locale if missing and starts with /
      if (redirectPath.startsWith('/') && !LOCALES.some(l => redirectPath.startsWith(`/${l}`))) {
        redirectPath = `/${locale}${redirectPath}`
      }

      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  // Geolocation handling: run once per visitor (cookie cache) to reduce edge work.
  const hasCountryCookie = Boolean(req.cookies.get("user-country")?.value)
  const shouldResolveGeolocation = !hasCountryCookie && isRootOrLocaleRootPath(pathname)
  if (shouldResolveGeolocation) {
    try {
      const geo = geolocation(req)

      if (geo.country) {
        response.headers.set("x-user-country", geo.country)
        response.cookies.set("user-country", geo.country, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days to minimize repeated edge geo work
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
      }

      if (geo.city) {
        response.headers.set("x-user-city", encodeURIComponent(geo.city))
      }

      if (geo.countryRegion) {
        response.headers.set("x-user-region", encodeURIComponent(geo.countryRegion))
      }
    } catch (geoError) {
      // Fallback to Vercel headers
      const country = req.headers.get("x-vercel-ip-country")
      const city = req.headers.get("x-vercel-ip-city")
      const region = req.headers.get("x-vercel-ip-country-region")

      if (country) {
        response.headers.set("x-user-country", country)
        response.cookies.set("user-country", country, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
      }
      if (city) response.headers.set("x-user-city", encodeURIComponent(city))
      if (region) response.headers.set("x-user-region", encodeURIComponent(region))
    }
  }

  if (cspEnabled) {
    const appCsp = buildAppCsp({ nonce, isDev, strictMode: cspStrictMode })
    setCspHeader(response, appCsp, cspReportOnly)
  }

  // Dashboard/auth HTML should never be browser-cached; stale documents force hard reload behavior.
  if (isDashboardRoute || isAuthRoute) {
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("x-dashboard-cache-policy", "no-store")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     * - opengraph-image (Open Graph image generation)
     * - public files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|icon|.*\\..*).*)",
  ],
}

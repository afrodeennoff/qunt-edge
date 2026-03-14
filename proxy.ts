import { type NextRequest, NextResponse } from "next/server"
import { createI18nMiddleware } from "next-international/middleware"
import { createServerClient } from "@supabase/ssr"
import { geolocation } from "@vercel/functions"
import { User } from "@supabase/supabase-js"
import { buildAppCsp, buildEmbedCsp, createNonce } from "@/lib/security/csp"
import { assertSecurityEnvConsistency } from "@/lib/env"

try {
  assertSecurityEnvConsistency()
} catch (error) {
  // Never fail middleware hard at runtime due env policy mismatch.
  // Validation still needs to be enforced by CI/release gates.
  console.error("[Proxy] Security environment validation failed:", error)
}

// Maintenance mode flag - Set to true to enable maintenance mode
const MAINTENANCE_MODE = false

// ── CORS Configuration ──────────────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  'https://qunt-edge.vercel.app',
  'https://www.qunt-edge.vercel.app',
])
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.add('http://localhost:3000')
  ALLOWED_ORIGINS.add('http://127.0.0.1:3000')
}
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true // same-origin requests have no Origin header
  return ALLOWED_ORIGINS.has(origin)
}

// Use redirect strategy to ensure users are always on valid localized paths
const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr", "de", "es", "it", "pt", "vi", "hi", "ja", "zh", "yo"],
  defaultLocale: "en",
  urlMappingStrategy: "redirect",
})

const LOCALES = ["en", "fr", "de", "es", "it", "pt", "vi", "hi", "ja", "zh", "yo"] as const
const LOCALE_SET = new Set<string>(LOCALES)
const STATIC_FILE_REGEX = /\.[^/]+$/
const PUBLIC_DOCUMENT_PATH_PREFIXES = [
  "/",
  "/about",
  "/pricing",
  "/updates",
  "/faq",
  "/docs",
  "/terms",
  "/privacy",
  "/support",
  "/community",
  "/propfirms",
  "/referral",
  "/newsletter",
  "/disclaimers",
]
const PRIVATE_DOCUMENT_PATH_PREFIXES = [
  "/dashboard",
  "/authentication",
  "/admin",
]
const PUBLIC_READ_API_PATHS = new Set<string>([
  "/api/health",
])
const PRIVATE_API_PATH_PREFIXES = [
  "/api/",
]

type RouteClass =
  | "static-asset"
  | "embed"
  | "public-api"
  | "private-api"
  | "public-document"
  | "private-document"
  | "other-document"

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

function normalizePathWithoutLocale(pathname: string): string {
  const segment = pathname.split("/")[1]
  if (!segment || !LOCALE_SET.has(segment)) return pathname
  const normalized = pathname.replace(new RegExp(`^/${segment}(?=/|$)`), "")
  return normalized || "/"
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === "/") return pathname === "/"
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isPrivateDocumentRoute(pathname: string): boolean {
  const normalizedPath = normalizePathWithoutLocale(pathname)
  return PRIVATE_DOCUMENT_PATH_PREFIXES.some((prefix) =>
    pathMatchesPrefix(normalizedPath, prefix)
  )
}

function isPublicDocumentRoute(pathname: string): boolean {
  const normalizedPath = normalizePathWithoutLocale(pathname)
  return PUBLIC_DOCUMENT_PATH_PREFIXES.some((prefix) =>
    pathMatchesPrefix(normalizedPath, prefix)
  )
}

function isPublicReadApiRoute(pathname: string): boolean {
  return PUBLIC_READ_API_PATHS.has(pathname)
}

function isPrivateApiRoute(pathname: string): boolean {
  return PRIVATE_API_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function classifyRoute(pathname: string): RouteClass {
  const normalizedPathname = normalizePathWithoutLocale(pathname)
  const isStaticAsset =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/videos/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes("/opengraph-image") ||
    pathname.includes("/twitter-image") ||
    pathname.includes("/icon") ||
    STATIC_FILE_REGEX.test(pathname)

  if (isStaticAsset) return "static-asset"
  if (pathMatchesPrefix(normalizedPathname, "/embed")) return "embed"
  if (isPublicReadApiRoute(pathname)) return "public-api"
  if (isPrivateApiRoute(pathname)) return "private-api"
  if (isPrivateDocumentRoute(pathname)) return "private-document"
  if (isPublicDocumentRoute(pathname)) return "public-document"
  return "other-document"
}

function applyPrivateNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  response.headers.set("x-dashboard-cache-policy", "private-no-store")
}

function applyPublicRevalidateHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "public, max-age=0, must-revalidate")
  response.headers.set("x-dashboard-cache-policy", "public-revalidate")
}

function redirectWithPrivateNoStore(url: URL) {
  const redirectResponse = NextResponse.redirect(url)
  applySecurityHeaders(redirectResponse)
  applyPrivateNoStoreHeaders(redirectResponse)
  return redirectResponse
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
  const normalizedPathname = normalizePathWithoutLocale(pathname)
  const origin = req.headers.get('origin')
  const locale = getLocale(pathname)
  const routeClass = classifyRoute(pathname)
  const isDashboardRoute = pathMatchesPrefix(normalizedPathname, "/dashboard")
  const isAdminRoute = pathMatchesPrefix(normalizedPathname, "/admin")
  const isAuthRoute = pathMatchesPrefix(normalizedPathname, "/authentication")
  const isEmbedRoute = routeClass === "embed"
  const isApiRoute = routeClass === "public-api" || routeClass === "private-api"
  const isDev = process.env.NODE_ENV === "development"
  const cspEnabled = process.env.CSP_ENABLED !== "false"
  const cspReportOnly = process.env.CSP_REPORT_ONLY
    ? process.env.CSP_REPORT_ONLY === "true"
    : process.env.NODE_ENV !== "production"
  const cspStrictMode = process.env.CSP_STRICT_MODE === "true"

  // More specific static asset exclusions - must be first!
  if (routeClass === "static-asset") {
    return NextResponse.next()
  }

  // ── CORS handling for API routes ─────────────────────────────────────────
  if (isApiRoute) {
    // Preflight
    if (req.method === 'OPTIONS') {
      const headers = new Headers()
      if (origin && isAllowedOrigin(origin)) {
        headers.set('Access-Control-Allow-Origin', origin)
      }
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      headers.set('Access-Control-Max-Age', '86400')
      headers.set('Access-Control-Allow-Credentials', 'true')
      return new NextResponse(null, { status: 204, headers })
    }

    // Reject cross-origin requests from disallowed origins
    if (origin && !isAllowedOrigin(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed', code: 'CORS_REJECTED' },
        { status: 403 }
      )
    }

    // Let API routes pass through with security headers + optional CORS
    const apiResponse = NextResponse.next()
    applySecurityHeaders(apiResponse)
    if (req.method === "GET" && routeClass === "public-api") {
      apiResponse.headers.set(
        "Cache-Control",
        "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      )
      apiResponse.headers.set("x-dashboard-cache-policy", "public-read-api")
    } else {
      applyPrivateNoStoreHeaders(apiResponse)
    }
    // Attach CORS header for allowed cross-origin API requests
    if (origin && isAllowedOrigin(origin)) {
      apiResponse.headers.set('Access-Control-Allow-Origin', origin)
      apiResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return apiResponse
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
      applySecurityHeaders(response)
      applyPrivateNoStoreHeaders(response)
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
    return redirectWithPrivateNoStore(authUrl)
  }

  // Maintenance mode check
  if (MAINTENANCE_MODE && !pathname.includes("/maintenance") && isDashboardRoute) {
    return redirectWithPrivateNoStore(new URL(`/${locale}/maintenance`, req.url))
  }

  // Admin route check with better error handling
  if (isAdminRoute) {
    if (!user || error) {
      const authUrl = new URL(`/${locale}/authentication`, req.url)
      authUrl.searchParams.set("error", "admin_access_required")
      return redirectWithPrivateNoStore(authUrl)
    }

    const allowedAdminIds = [process.env.ADMIN_USER_ID, process.env.ALLOWED_ADMIN_USER_ID]
      .filter((value): value is string => Boolean(value && value.trim()))

    if (!allowedAdminIds.includes(user.id)) {
      return redirectWithPrivateNoStore(new URL(`/${locale}/dashboard`, req.url))
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

      return redirectWithPrivateNoStore(authUrl)
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

      return redirectWithPrivateNoStore(new URL(redirectPath, req.url))
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
    const appCsp = buildAppCsp({ nonce, isDev, strictMode: cspStrictMode, reportOnly: cspReportOnly })
    setCspHeader(response, appCsp, cspReportOnly)
  }

  applySecurityHeaders(response)

  // Route-class cache policy split:
  // - private documents: strict no-store
  // - public documents: revalidated public cacheability
  if (routeClass === "private-document") {
    applyPrivateNoStoreHeaders(response)
  } else if (routeClass === "public-document") {
    applyPublicRevalidateHeaders(response)
  }

  return response
}

// ── Security Headers ────────────────────────────────────────────────────────
function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - opengraph-image (Open Graph image generation)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|icon|.*\\..*).*)",
  ],
}

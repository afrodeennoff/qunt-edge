import { type NextResponse } from 'next/server'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/locales/config'

const STATIC_FILE_REGEX = /\.[^/]+$/

const PUBLIC_DOCUMENT_PATH_PREFIXES = [
  '/',
  '/about',
  '/pricing',
  '/updates',
  '/faq',
  '/docs',
  '/terms',
  '/privacy',
  '/support',
  '/community',
  '/propfirms',
  '/referral',
  '/newsletter',
  '/disclaimers',
]

const PRIVATE_DOCUMENT_PATH_PREFIXES = [
  '/dashboard',
  '/authentication',
  '/admin',
]

const PUBLIC_READ_API_PATHS = new Set<string>(['/api/health'])
const PRIVATE_API_PATH_PREFIXES = ['/api/']

export type RouteClass =
  | 'static-asset'
  | 'embed'
  | 'public-api'
  | 'private-api'
  | 'public-document'
  | 'private-document'
  | 'other-document'

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES)

export function isRootOrLocaleRootPath(pathname: string): boolean {
  if (pathname === '/') return true
  return SUPPORTED_LOCALES.some((locale) => pathname === `/${locale}`)
}

export function getLocale(pathname: string): string {
  const firstSegment = pathname.split('/')[1]
  return LOCALE_SET.has(firstSegment) ? firstSegment : DEFAULT_LOCALE
}

export function normalizePathWithoutLocale(pathname: string): string {
  const segment = pathname.split('/')[1]
  if (!segment || !LOCALE_SET.has(segment)) return pathname
  const normalized = pathname.replace(new RegExp(`^/${segment}(?=/|$)`), '')
  return normalized || '/'
}

export function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === '/') return pathname === '/'
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function isPrivateDocumentRoute(pathname: string): boolean {
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

export function classifyRoute(pathname: string): RouteClass {
  const normalizedPathname = normalizePathWithoutLocale(pathname)
  const isStaticAsset =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/videos/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('/opengraph-image') ||
    pathname.includes('/twitter-image') ||
    pathname.includes('/icon') ||
    STATIC_FILE_REGEX.test(pathname)

  if (isStaticAsset) return 'static-asset'
  if (pathMatchesPrefix(normalizedPathname, '/embed')) return 'embed'
  if (isPublicReadApiRoute(pathname)) return 'public-api'
  if (isPrivateApiRoute(pathname)) return 'private-api'
  if (isPrivateDocumentRoute(pathname)) return 'private-document'
  if (isPublicDocumentRoute(pathname)) return 'public-document'
  return 'other-document'
}

export function applyPrivateNoStoreHeaders(response: NextResponse): void {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('x-dashboard-cache-policy', 'private-no-store')
}

export function applyPublicRevalidateHeaders(response: NextResponse): void {
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  response.headers.set('x-dashboard-cache-policy', 'public-revalidate')
}

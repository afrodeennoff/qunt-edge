import { createUnsubscribeToken } from "@/lib/unsubscribe-token"

type RequestOrBaseUrl = Request | URL | string | undefined

function resolveBaseUrl(requestOrBaseUrl?: RequestOrBaseUrl): string {
  if (typeof requestOrBaseUrl === "string" && requestOrBaseUrl.length > 0) {
    return requestOrBaseUrl.startsWith("http")
      ? requestOrBaseUrl
      : `https://${requestOrBaseUrl}`
  }

  if (requestOrBaseUrl instanceof URL) {
    return requestOrBaseUrl.origin
  }

  if (requestOrBaseUrl instanceof Request) {
    return new URL(requestOrBaseUrl.url).origin
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL

  if (!fromEnv) {
    return "http://localhost:3000"
  }

  return fromEnv.startsWith("http") ? fromEnv : `https://${fromEnv}`
}

export function buildUnsubscribeUrl(
  email: string,
  requestOrBaseUrl?: RequestOrBaseUrl
): string {
  const baseUrl = resolveBaseUrl(requestOrBaseUrl).replace(/\/+$/, "")
  const token = createUnsubscribeToken(email)

  return `${baseUrl}/api/email/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
}

import { createServerClient } from "@supabase/ssr";

type CookiePair = { name: string; value: string };

function parseCookieHeader(header: string | null): CookiePair[] {
  if (!header) return [];

  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=");
      if (eq === -1) return { name: part, value: "" };
      return {
        name: part.slice(0, eq).trim(),
        value: part.slice(eq + 1).trim(),
      };
    })
    .filter((pair) => pair.name.length > 0);
}

/**
 * Request-scoped Supabase client for Next.js route handlers.
 *
 * Important: this implementation avoids `next/headers` dynamic APIs (cookies())
 * so route handlers remain callable from unit tests without a Next request scope.
 */
export function createRouteClient(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  // Match server/auth.ts behavior: allow running in dev/test without full env.
  const resolvedUrl = url || "http://127.0.0.1:54321";
  const resolvedKey = key || "dummy-anon-key";

  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);

  return createServerClient(resolvedUrl, resolvedKey, {
    cookies: {
      getAll() {
        return cookies;
      },
      // Route handlers generally shouldn't be mutating auth cookies.
      // Keep this a no-op so unit tests and non-middleware routes stay stable.
      setAll() {},
    },
  });
}


const PROD_CONNECT_SOURCES = [
  "'self'",
  "https://*.supabase.co",
  "https://*.pooler.supabase.com",
  "https://vercel.live",
  "https://vitals.vercel-insights.com",
];

const DEV_CONNECT_SOURCES = [
  ...PROD_CONNECT_SOURCES,
  "http://localhost:*",
  "http://127.0.0.1:*",
  "ws://localhost:*",
  "ws://127.0.0.1:*",
];

function normalizeSources(sources: string[]): string {
  return Array.from(new Set(sources)).join(" ");
}

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function buildAppCsp(nonce: string, isDev: boolean): string {
  const connectSources = isDev ? DEV_CONNECT_SOURCES : PROD_CONNECT_SOURCES;

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    `connect-src ${normalizeSources(connectSources)}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

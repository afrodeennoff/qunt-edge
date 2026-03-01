type AppCspOptions = {
  nonce: string;
  isDev: boolean;
  strictMode: boolean;
  reportOnly: boolean;
};

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

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function normalizeSources(sources: string[]): string {
  return Array.from(new Set(sources)).join(" ");
}

export function buildAppCsp({ nonce, isDev, strictMode, reportOnly }: AppCspOptions): string {
  const connectSources = isDev ? DEV_CONNECT_SOURCES : PROD_CONNECT_SOURCES;
  const scriptSources = strictMode
    ? [`'self'`, `'nonce-${nonce}'`]
    : [`'self'`, `'nonce-${nonce}'`, `'unsafe-eval'`];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    `connect-src ${normalizeSources(connectSources)}`,
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(reportOnly ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.join("; ");
}

export function buildEmbedCsp(allowedOrigins: string): string {
  return [
    `frame-ancestors ${allowedOrigins}`,
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://vercel.live",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

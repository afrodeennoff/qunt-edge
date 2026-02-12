import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { fileURLToPath } from 'node:url';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/+$/, '');
const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  outputFileTracingRoot: workspaceRoot,
  assetPrefix: cdnUrl || undefined,
  // cacheComponents: true, // Enable Cache Components (Next.js 16+)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 days to reduce repeated image optimization work
    remotePatterns: [
      {
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
      },
    ],
  },
  pageExtensions: ['mdx', 'ts', 'tsx'],
  experimental: {
    useCache: true,
    mdxRs: true,
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
    cpus: 4,
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
    ],
  },
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=31536000, stale-while-revalidate=86400",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=31536000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  outputFileTracingIncludes: process.env.VERCEL ? undefined : {
    '/*': [
      '**/node_modules/@prisma/engines/libquery_engine-rhel-openssl-3.0.x.so.node',
      '**/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
    ],
    '/app/api/**': [
      '**/node_modules/.prisma/client/**',
    ],
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);

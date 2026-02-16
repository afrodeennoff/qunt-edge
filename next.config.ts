import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { fileURLToPath } from 'node:url';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/+$/, '');
const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));
const useStandaloneOutput = process.env.NEXT_STANDALONE === "1";
const configuredBuildCpus = Number(process.env.NEXT_BUILD_CPUS ?? (process.env.VERCEL ? 4 : 1));
const buildCpus = Number.isFinite(configuredBuildCpus) && configuredBuildCpus > 0
  ? configuredBuildCpus
  : 1;

const nextConfig: NextConfig = {
  output: useStandaloneOutput ? "standalone" : undefined,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  outputFileTracingRoot: workspaceRoot,
  assetPrefix: cdnUrl || undefined,
  // cacheComponents: true, // Enable Cache Components (Next.js 16+)
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75],
    minimumCacheTTL: 2678400, // 31 days to reduce repeated image optimization work
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    maximumRedirects: 0,
    remotePatterns: [
      {
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
      },
    ],
  },
  // Include JS extensions to keep Next.js internals compatible across versions.
  pageExtensions: ['mdx', 'ts', 'tsx', 'js', 'jsx', 'mjs'],
  experimental: {
    useCache: true,
    mdxRs: true,
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
    cpus: buildCpus,
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
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
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
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
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
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  outputFileTracingIncludes: useStandaloneOutput ? {
    '/*': [
      '**/node_modules/@prisma/engines/libquery_engine-rhel-openssl-3.0.x.so.node',
      '**/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
    ],
    '/app/api/**': [
      '**/node_modules/.prisma/client/**',
    ],
  } : undefined,
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);

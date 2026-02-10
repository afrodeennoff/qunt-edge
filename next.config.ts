import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  // cacheComponents: true, // Enable Cache Components (Next.js 16+)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 days to reduce repeated image optimization work
    remotePatterns: [
      {
        hostname: 'fhvmtnvjiotzztimdxbi.supabase.co',
      },
    ],
  },
  pageExtensions: ['mdx', 'ts', 'tsx'],
  experimental: {
    useCache: true,
    mdxRs: true,
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
    ],
  },
  async headers() {
    // Content Security Policy - Enterprise Grade
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https: http:;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' 
        https://*.supabase.co 
        https://api.openai.com 
        https://api.whop.com
        https://*.upstash.io
        https://*.sentry.io
        https://vercel.live
        https://*.vercel.app
        wss://*.supabase.co;
      media-src 'self' blob: data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://*.whop.com;
      frame-ancestors 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
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
            value: "DENY", // Changed from SAMEORIGIN to DENY for better security
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // More strict
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()", // Added FLoC blocking
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
  outputFileTracingIncludes: {
    '/*': [
      '**/node_modules/@prisma/engines/libquery_engine-rhel-openssl-3.0.x.so.node',
      '**/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
    ],
    '/app/api/**': [  // For App Router API routes (your auth callback)
      '**/node_modules/.prisma/client/**',
    ],
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);

import type { NextConfig } from "next";

export type OptimizedNextConfigResult = {
  config: NextConfig;
  warnings: string[];
};

function parseBuildCpus(rawValue: string | undefined, warnings: string[]): number | undefined {
  if (!rawValue) return undefined;
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    warnings.push(`Invalid NEXT_BUILD_CPUS value \"${rawValue}\". Falling back to Next.js default.`);
    return undefined;
  }
  return Math.floor(parsedValue);
}

function getImageHosts(supabaseUrl: string | undefined, warnings: string[]): string[] {
  const hosts = new Set<string>();

  if (supabaseUrl) {
    try {
      hosts.add(new URL(supabaseUrl).hostname);
    } catch {
      warnings.push(`Invalid NEXT_PUBLIC_SUPABASE_URL value \"${supabaseUrl}\". Ignoring it.`);
    }
  }

  hosts.add("images.unsplash.com");
  hosts.add("avatars.githubusercontent.com");

  return Array.from(hosts);
}

export function createOptimizedNextConfig(): OptimizedNextConfigResult {
  const warnings: string[] = [];
  const cpus = parseBuildCpus(process.env.NEXT_BUILD_CPUS, warnings);
  const imageHosts = getImageHosts(process.env.NEXT_PUBLIC_SUPABASE_URL, warnings);

  const config: NextConfig = {
    poweredByHeader: false,
    reactStrictMode: true,
    output: 'standalone',
    serverExternalPackages: ['crypto', 'pg'],
    turbopack: {
      root: process.cwd(),
    },
    experimental: {
      ...(cpus ? { cpus } : {}),
    },
    images: {
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60 * 60 * 24 * 7,
      remotePatterns: imageHosts.map((hostname) => ({
        protocol: "https",
        hostname,
      })),
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      maximumRedirects: 0,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      qualities: [50, 65, 75, 85],
    },
    async headers() {
      return [
        {
          // Apply security headers to all non-API routes
          source: '/((?!api/).*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-DNS-Prefetch-Control', value: 'on' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ],
        },
        {
          source: '/api/:path*',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          ],
        },
      ]
    },
  };

  return { config, warnings };
}

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

const isProduction = process.env.NODE_ENV === "production";

export function createOptimizedNextConfig(): OptimizedNextConfigResult {
  const warnings: string[] = [];
  const cpus = parseBuildCpus(process.env.NEXT_BUILD_CPUS, warnings);
  const imageHosts = getImageHosts(process.env.NEXT_PUBLIC_SUPABASE_URL, warnings);

  // Optional CDN prefix for static assets (set NEXT_PUBLIC_CDN_URL in env)
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || undefined;

  const config: NextConfig = {
    // ── Core ─────────────────────────────────────────────────────────────────
    poweredByHeader: false,
    reactStrictMode: true,

    // ── Output Mode ──────────────────────────────────────────────────────────
    // 'standalone' creates a self-contained build for Docker/VPS deployment.
    // Vercel ignores this setting and uses its own optimized deployment.
    output: "standalone",

    // ── Compression ──────────────────────────────────────────────────────────
    // Enable gzip compression at the Node.js level.
    // On Vercel this is handled by the CDN, but for Docker/VPS it's essential.
    compress: true,

    // ── CDN Asset Prefix ─────────────────────────────────────────────────────
    // When set, all _next/static assets are loaded from this origin.
    ...(cdnUrl ? { assetPrefix: cdnUrl } : {}),

    // ── Server External Packages ─────────────────────────────────────────────
    // These packages use Node.js-specific APIs and must not be bundled.
    serverExternalPackages: ["pg", "canvas", "sharp"],

    // ── Page Extensions (MDX support) ────────────────────────────────────────
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],

    // ── Turbopack ────────────────────────────────────────────────────────────
    turbopack: {
      root: process.cwd(),
    },

    // ── Experimental ─────────────────────────────────────────────────────────
    experimental: {
      ...(cpus ? { cpus } : {}),
      // Optimise package imports to reduce bundle size
      optimizePackageImports: [
        "lucide-react",
        "react-icons",
        "date-fns",
        "recharts",
        "framer-motion",
        "@radix-ui/react-icons",
      ],
    },

    // ── Logging ──────────────────────────────────────────────────────────────
    logging: {
      fetches: {
        fullUrl: !isProduction, // Log fetch URLs only in dev
      },
    },

    // ── Image Optimization ───────────────────────────────────────────────────
    images: {
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
      remotePatterns: imageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      maximumRedirects: 0,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      qualities: [50, 65, 75, 85],
    },

    // ── Security & Cache Headers ─────────────────────────────────────────────
    async headers() {
      return [
        {
          // Security headers for all HTML pages
          source: "/((?!api/).*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "X-DNS-Prefetch-Control", value: "on" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ],
        },
        {
          // API routes: prevent caching of sensitive data
          source: "/api/:path*",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          ],
        },
        {
          // Long-lived immutable cache for hashed static assets
          source: "/_next/static/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          // Cache font/image assets aggressively
          source: "/fonts/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ];
    },

    // ── Redirects ────────────────────────────────────────────────────────────
    async redirects() {
      return [
        // Redirect www to non-www (for self-hosted deploys)
        {
          source: "/:path*",
          has: [{ type: "host", value: "www.qunt-edge.vercel.app" }],
          destination: "https://qunt-edge.vercel.app/:path*",
          permanent: true,
        },
      ];
    },
  };

  return { config, warnings };
}

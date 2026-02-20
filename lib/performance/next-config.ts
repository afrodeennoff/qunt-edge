import type { NextConfig } from "next";

const DEFAULT_BUILD_CPUS = 1;
const VERCEL_BUILD_CPUS = 4;

const IMAGE_DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 256, 384, 512];
const IMAGE_QUALITIES = [50, 65, 75, 85, 95, 100];

export interface OptimizationSettings {
  output: NextConfig["output"];
  assetPrefix?: string;
  buildCpus: number;
  supabaseHostname?: string;
  warnings: string[];
}

function readBoolean(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function readPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function sanitizeUrlPrefix(rawValue: string | undefined, warnings: string[]): string | undefined {
  if (!rawValue) return undefined;
  const cleaned = rawValue.trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      warnings.push("Ignored NEXT_PUBLIC_CDN_URL because protocol is not http/https.");
      return undefined;
    }
    return cleaned;
  } catch {
    warnings.push("Ignored NEXT_PUBLIC_CDN_URL because the value is not a valid absolute URL.");
    return undefined;
  }
}

function extractHostname(rawValue: string | undefined, warnings: string[]): string | undefined {
  if (!rawValue) return undefined;
  try {
    return new URL(rawValue).hostname;
  } catch {
    warnings.push("Ignored NEXT_PUBLIC_SUPABASE_URL for image optimization because URL parsing failed.");
    return undefined;
  }
}

export function resolveOptimizationSettings(
  env: Record<string, string | undefined>,
): OptimizationSettings {
  const warnings: string[] = [];
  const useStandaloneOutput =
    readBoolean(env.NEXT_STANDALONE) || readBoolean(env.NEXT_OUTPUT_STANDALONE);
  const fallbackCpus = env.VERCEL ? VERCEL_BUILD_CPUS : DEFAULT_BUILD_CPUS;
  const buildCpus = readPositiveNumber(env.NEXT_BUILD_CPUS, fallbackCpus);
  const assetPrefix = sanitizeUrlPrefix(env.NEXT_PUBLIC_CDN_URL, warnings);
  const supabaseHostname = extractHostname(env.NEXT_PUBLIC_SUPABASE_URL, warnings);

  return {
    output: useStandaloneOutput ? "standalone" : undefined,
    assetPrefix,
    buildCpus,
    supabaseHostname,
    warnings,
  };
}

export function createOptimizedNextConfig(workspaceRoot: string): {
  config: NextConfig;
  warnings: string[];
} {
  const settings = resolveOptimizationSettings(process.env);

  const config: NextConfig = {
    output: settings.output,
    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    outputFileTracingRoot: workspaceRoot,
    assetPrefix: settings.assetPrefix,
    images: {
      formats: ["image/avif", "image/webp"],
      deviceSizes: IMAGE_DEVICE_SIZES,
      imageSizes: IMAGE_SIZES,
      qualities: IMAGE_QUALITIES,
      minimumCacheTTL: 2678400,
      dangerouslyAllowSVG: false,
      contentDispositionType: "attachment",
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      remotePatterns: settings.supabaseHostname
        ? [
            {
              protocol: "https",
              hostname: settings.supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : [],
    },
    pageExtensions: ["mdx", "ts", "tsx"],
    experimental: {
      useCache: true,
      mdxRs: true,
      webpackMemoryOptimizations: true,
      preloadEntriesOnStart: false,
      cpus: settings.buildCpus,
      optimizePackageImports: [
        "lucide-react",
        "date-fns",
        "recharts",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-select",
        "framer-motion",
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
            { key: "X-DNS-Prefetch-Control", value: "on" },
            { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ],
        },
        {
          source: "/_next/static/:path*",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
            { key: "CDN-Cache-Control", value: "public, s-maxage=31536000, stale-while-revalidate=86400" },
            { key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=31536000, stale-while-revalidate=86400" },
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
    async rewrites() {
      return [
        {
          source: "/api/v1/:path*",
          destination: "/api/:path*",
        },
      ];
    },
    outputFileTracingIncludes:
      settings.output === "standalone"
        ? {
            "/*": [
              "**/node_modules/@prisma/engines/libquery_engine-rhel-openssl-3.0.x.so.node",
              "**/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node",
            ],
            "/app/api/**": ["**/node_modules/.prisma/client/**"],
          }
        : undefined,
  };

  return { config, warnings: settings.warnings };
}

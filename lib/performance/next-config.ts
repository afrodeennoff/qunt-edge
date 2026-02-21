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

function getImageHosts(cdnUrl: string | undefined, supabaseUrl: string | undefined, warnings: string[]): string[] {
  const hosts = new Set<string>();

  if (cdnUrl) {
    try {
      hosts.add(new URL(cdnUrl).hostname);
    } catch {
      warnings.push(`Invalid NEXT_PUBLIC_CDN_URL value \"${cdnUrl}\". Ignoring it.`);
    }
  }

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

function parseAssetPrefix(cdnUrl: string | undefined, warnings: string[]): string | undefined {
  if (!cdnUrl) return undefined;
  try {
    const parsed = new URL(cdnUrl);
    return parsed.origin;
  } catch {
    warnings.push(`Invalid NEXT_PUBLIC_CDN_URL value \"${cdnUrl}\". assetPrefix will be ignored.`);
    return undefined;
  }
}

export function createOptimizedNextConfig(): OptimizedNextConfigResult {
  const warnings: string[] = [];
  const cpus = parseBuildCpus(process.env.NEXT_BUILD_CPUS, warnings);
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  const imageHosts = getImageHosts(cdnUrl, process.env.NEXT_PUBLIC_SUPABASE_URL, warnings);
  const assetPrefix = parseAssetPrefix(cdnUrl, warnings);

  const config: NextConfig = {
    poweredByHeader: false,
    reactStrictMode: true,
    ...(assetPrefix ? { assetPrefix } : {}),
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
  };

  return { config, warnings };
}

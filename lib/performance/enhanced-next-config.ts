import type { NextConfig } from "next";
import type { WebpackConfig } from "next";

export type OptimizedNextConfigResult = {
  config: NextConfig;
  warnings: string[];
};

function parseBuildCpus(rawValue: string | undefined, warnings: string[]): number | undefined {
  if (!rawValue) return undefined;
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    warnings.push(`Invalid NEXT_BUILD_CPUS value "${rawValue}". Falling back to Next.js default.`);
    return undefined;
  }
  return Math.floor(parsedValue);
}

function getImageHosts(
  cdnUrl: string | undefined,
  supabaseUrl: string | undefined,
  warnings: string[]
): string[] {
  const hosts = new Set<string>();

  if (cdnUrl) {
    try {
      hosts.add(new URL(cdnUrl).hostname);
    } catch {
      warnings.push(`Invalid NEXT_PUBLIC_CDN_URL value "${cdnUrl}". Ignoring it.`);
    }
  }

  if (supabaseUrl) {
    try {
      hosts.add(new URL(supabaseUrl).hostname);
    } catch {
      warnings.push(`Invalid NEXT_PUBLIC_SUPABASE_URL value "${supabaseUrl}". Ignoring it.`);
    }
  }

  hosts.add("images.unsplash.com");
  hosts.add("avatars.githubusercontent.com");

  return Array.from(hosts);
}

/**
 * Enhanced Next.js configuration with comprehensive performance optimizations
 */
export function createOptimizedNextConfig(): OptimizedNextConfigResult {
  const warnings: string[] = [];
  const cpus = parseBuildCpus(process.env.NEXT_BUILD_CPUS, warnings);
  const imageHosts = getImageHosts(
    process.env.NEXT_PUBLIC_CDN_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    warnings
  );

  const config: NextConfig = {
    poweredByHeader: false,
    reactStrictMode: true,
    
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

    webpack: (config: WebpackConfig, { isServer }) => {
      if (!config.externals) {
        config.externals = [];
      }
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }

      if (!isServer) {
        config.externals.push({
          'utf-8-validate': 'commonjs utf-8-validate',
          'bufferutil': 'commonjs bufferutil',
        });
      }

      if (!config.optimization) {
        config.optimization = {};
      }

      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|renderer)[\\/]/,
            priority: 40,
            enforce: true,
          },
          
          lib: {
            test: (module) => {
              const name = module.name;
              return (
                name &&
                /[\\/]node_modules[\\/]/.test(name) &&
                !/[\\/]node_modules[\\/](react|react-dom|scheduler|renderer)[\\/]/.test(name) &&
                !/[\\/]node_modules[\\/](d3|recharts|framer-motion|pdf-lib|exceljs|@tiptap|sharp|canvas)[\\/]/.test(name)
              );
            },
            name: 'lib',
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          
          shared: {
            name: 'shared',
            test: /[\\/]node_modules[\\/](@radix-ui|@tanstack|zustand)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
          },
          
          charts: {
            name: 'charts',
            test: /[\\/]node_modules[\\/](d3|recharts|victory)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          
          editor: {
            name: 'editor',
            test: /[\\/]node_modules[\\/](@tiptap|prosemirror)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          
          pdf: {
            name: 'pdf',
            test: /[\\/]node_modules[\\/](pdf-lib|pdf2json|jspdf)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          
          excel: {
            name: 'excel',
            test: /[\\/]node_modules[\\/](exceljs|xlsx)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          
          animation: {
            name: 'animation',
            test: /[\\/]node_modules[\\/](framer-motion|motion|gsap)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          
          imageProcessing: {
            name: 'image-processing',
            test: /[\\/]node_modules[\\/](sharp|canvas|fast-png)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };

      config.optimization.moduleIds = 'deterministic';
      
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;

      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      config.resolve.alias = {
        ...config.resolve.alias,
      };

      if (!config.module) {
        config.module = {};
      }
      if (!config.module.rules) {
        config.module.rules = [];
      }

      return config;
    },

    compress: true,

    poweredByHeader: false,

    generateEtags: true,

    headers: async () => {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains'
            }
          ]
        },
        {
          source: '/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable'
            }
          ]
        },
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable'
            }
          ]
        },
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, s-maxage=60, stale-while-revalidate=300'
            }
          ]
        }
      ];
    },

    async rewrites() {
      return [];
    },

    async redirects() {
      return [];
    },
  };

  return { config, warnings };
}

import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { fileURLToPath } from 'node:url';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/+$/, '');
const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));
const useStandaloneOutput =
  process.env.NEXT_STANDALONE === "1" ||
  process.env.NEXT_OUTPUT_STANDALONE === "true";

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

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  pageExtensions: ['mdx', 'ts', 'tsx'],

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
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "framer-motion",
    ],
    optimizeCss: true,
    optimizeServerReact: true,
  },

  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom': '@hot-loader/react-dom',
      };
    }

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
            enforce: true,
          },
          
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
              return `lib.${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          
          shared: {
            name: 'shared',
            chunks: 'all',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },

  async headers() {
    const securityHeaders = [
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    const cacheHeaders = [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=86400",
          },
        ],
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      ...cacheHeaders,
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
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
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);

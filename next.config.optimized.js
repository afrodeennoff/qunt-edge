import type { NextConfig } from 'next'
import createNextPlugin from 'next/dist/packages/next/build/swc/plugins'

const nextConfig: NextConfig = {
  // SWC minification for faster builds
  swcMinify: true,

  // Experimental features for better performance
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
    // Enable CSS optimization
    optimizeCss: true,
    // Enable scroll-restoration for better UX
    scrollRestoration: true,
  },

  // Image optimization configuration
  images: {
    // Enable remote image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
    ],
    // Image formats to use (AVIF has better compression)
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Minimum cache TTL (in seconds) for optimized images
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    // Allow serving images from external domains
    dangerouslyAllowSVG: true,
    // Content security policy for images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack configuration for advanced optimization
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        // Advanced chunk splitting
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // React framework code
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Next.js core
            nextjs: {
              name: 'nextjs',
              test: /[\\/]node_modules[\\/]next[\\/]/,
              priority: 30,
              enforce: true,
            },
            // Commons
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Shared UI components
            shared: {
              name: 'shared',
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
              priority: 15,
            },
            // Chart libraries
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|victory|d3)[\\/]/,
              priority: 10,
            },
            // Date utilities
              name: 'date',
              test: /[\\/]node_modules[\\/](date-fns|dayjs|moment)[\\/]/,
              priority: 10,
            },
            // Icons
            icons: {
              name: 'icons',
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui-react-icons)[\\/]/,
              priority: 10,
            },
          },
        },
        // Module concatenation for better performance
        concatenateModules: true,
        // Minimize bundle size
        minimize: true,
      };

      // Production-specific plugins
      config.plugins.push(
        // Analyze bundle size
        new webpack.BundleAnalysisPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: './reports/bundle-report.html',
        })
      );
    }

    // Module federation for micro-frontends (optional)
    if (!isServer) {
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          name: 'app',
          shared: {
            react: {
              singleton: true,
              requiredVersion: false,
            },
            'react-dom': {
              singleton: true,
              requiredVersion: false,
            },
          },
        })
      );
    }

    // Optimize for node modules
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
        'sharp': 'commonjs sharp',
      });
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });

    return config;
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Static assets caching
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes with shorter cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        // Images caching
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO and legacy URLs
  async redirects() {
    return [
      // Example redirect (customize based on your needs)
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites for proxy and API routes
  async rewrites() {
    return [
      // Example rewrite for API proxy
      // {
      //   source: '/api/proxy/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },

  // Output configuration
  output: 'standalone',

  // Production source maps (disabled for smaller builds, enable for debugging)
  productionBrowserSourceMaps: false,

  // Compress responses
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate Etags
  generateEtags: true,

  // HTTP2 for better performance
  http2: true,

  // trailingSlash handling
  trailingSlash: false,

  // Export for static hosting (optional)
  // distDir: 'dist',

  // Typescript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Environment variables (exposed to browser)
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig

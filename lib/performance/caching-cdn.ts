/**
 * Caching Strategies and CDN Optimization Configuration
 * 
 * Provides comprehensive caching strategies, service worker implementation,
 * and CDN optimization settings for Next.js applications.
 */

/**
 * Cache strategy types
 */
export type CacheStrategy = 'network-first' | 'cache-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only'

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  strategy: CacheStrategy
  maxAge: number // in seconds
  staleWhileRevalidate?: number // in seconds
  cacheableResponse?: {
    statuses: number[]
  }
}

/**
 * Cache strategy presets for common use cases
 */
export const CacheStrategies: Record<string, CacheConfig> = {
  // Static assets (images, fonts, CSS)
  staticAssets: {
    strategy: 'cache-first',
    maxAge: 31536000, // 1 year
    cacheableResponse: {
      statuses: [0, 200],
    },
  },

  // API responses (data that changes occasionally)
  apiResponses: {
    strategy: 'stale-while-revalidate',
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 86400, // 1 day
    cacheableResponse: {
      statuses: [0, 200],
    },
  },

  // HTML pages
  htmlPages: {
    strategy: 'network-first',
    maxAge: 3600, // 1 hour
    cacheableResponse: {
      statuses: [0, 200],
    },
  },

  // Real-time data (don't cache)
  realtimeData: {
    strategy: 'network-only',
    maxAge: 0,
  },

  // Offline fallback
  offlineFallback: {
    strategy: 'cache-only',
    maxAge: 86400, // 1 day
  },
}

/**
 * Service Worker implementation for offline functionality
 */
export const serviceWorkerCode = `
const CACHE_NAME = 'app-v1';
const RUNTIME_CACHE = 'runtime-v1';

// Assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // For CDN resources, use cache-first
    if (url.hostname.includes('cloudinary') || 
        url.hostname.includes('amazonaws')) {
      event.respondWith(cacheFirst(request));
    }
    return;
  }

  // API routes - stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Static assets - cache-first
  if (url.pathname.match(/\\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Pages - network-first
  event.respondWith(networkFirst(request));
});

// Caching strategy implementations
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline');
    }
    throw error;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline');
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  // Fetch in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Return cached version immediately or wait for network
  return cached || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement your sync logic here
  console.log('Syncing data...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification('Update Available', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
`;

/**
 * CDN configuration for various providers
 */
export const CDNConfigurations = {
  /**
   * Vercel CDN configuration
   */
  vercel: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000, immutable',
    },
    edgeConfig: {
      // Enable Edge Functions for dynamic content
      runtime: 'edge',
      // Regions for edge deployment
      regions: ['iad1'], // US East
    },
  },

  /**
   * Cloudflare CDN configuration
   */
  cloudflare: {
    cacheLevel: 'aggressive',
    minify: {
      javascript: true,
      css: true,
      html: true,
    },
    polish: 'lossless', // Image optimization
    mirage: true, // Mobile optimization
    autoMinify: true,
  },

  /**
   * AWS CloudFront configuration
   */
  cloudfront: {
    // Cache behavior settings
    allowedHTTPMethods: ['GET', 'HEAD', 'OPTIONS'],
    cachedHTTPMethods: ['GET', 'HEAD'],
    forwardedCookies: 'none',
    forwardedHeaders: ['Host', 'X-Forwarded-For'],
    minTTL: 0,
    defaultTTL: 86400, // 1 day
    maxTTL: 31536000, // 1 year
    compress: true,
  },

  /**
   * Netlify CDN configuration
   */
  netlify: {
    headers: [
      {
        for: '/static/*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        for: '/_next/static/*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ],
    redirects: [],
    rewrites: [],
  },
}

/**
 * Cache invalidation strategies
 */
export class CacheInvalidation {
  /**
   * Invalidate specific cache entries
   */
  static async invalidate(pattern: string | RegExp): Promise<void> {
    if (typeof caches === 'undefined') return

    const cacheNames = await caches.keys()

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()

      for (const request of keys) {
        if (typeof pattern === 'string') {
          if (request.url.includes(pattern)) {
            await cache.delete(request)
          }
        } else if (pattern.test(request.url)) {
          await cache.delete(request)
        }
      }
    }
  }

  /**
   * Invalidate entire cache
   */
  static async invalidateAll(): Promise<void> {
    if (typeof caches === 'undefined') return

    const cacheNames = await caches.keys()

    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
  }

  /**
   * Clear specific cache
   */
  static async clearCache(cacheName: string): Promise<void> {
    if (typeof caches === 'undefined') return

    await caches.delete(cacheName)
  }
}

/**
 * Resource hints for performance optimization
 */
export const ResourceHints = {
  /**
   * Preconnect to external domains
   */
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
  ],

  /**
   * Prefetch critical resources
   */
  prefetch: [
    '/api/user',
    '/api/settings',
  ],

  /**
   * Preload critical resources
   */
  preload: [
    {
      href: '/fonts/inter.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {
      href: '/images/hero-bg.webp',
      as: 'image',
    },
  ],

  /**
   * DNS prefetch for third-party domains
   */
  dnsPrefetch: [
    'https://www.google-analytics.com',
    'https://stats.g.doubleclick.net',
  ],
}

/**
 * Generate HTML head with resource hints
 */
export function generateResourceHints(): string {
  let hints = ''

  // Preconnect
  ResourceHints.preconnect.forEach(href => {
    hints += `<link rel="preconnect" href="${href}">\n`
  })

  // DNS Prefetch
  ResourceHints.dnsPrefetch.forEach(href => {
    hints += `<link rel="dns-prefetch" href="${href}">\n`
  })

  // Preload
  ResourceHints.preload.forEach(resource => {
    let attributes = `href="${resource.href}" as="${resource.as}"`
    if (resource.type) attributes += ` type="${resource.type}"`
    if (resource.crossOrigin) attributes += ` crossorigin="${resource.crossOrigin}"`
    hints += `<link rel="preload" ${attributes}>\n`
  })

  // Prefetch
  ResourceHints.prefetch.forEach(href => {
    hints += `<link rel="prefetch" href="${href}">\n`
  })

  return hints
}

/**
 * Progressive Web App (PWA) configuration
 */
export const PWAConfig = {
  name: 'Next.js App',
  shortName: 'App',
  description: 'A progressive web app built with Next.js',
  startUrl: '/',
  display: 'standalone',
  backgroundColor: '#ffffff',
  themeColor: '#000000',
  orientation: 'portrait-primary',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
  categories: ['productivity', 'utilities'],
  shortcuts: [
    {
      name: 'Dashboard',
      shortName: 'Dashboard',
      description: 'Go to dashboard',
      url: '/dashboard',
      icons: [{ src: '/icons/dashboard.png', sizes: '192x192' }],
    },
  ],
}

/**
 * Generate web app manifest
 */
export function generateManifest(): string {
  return JSON.stringify(PWAConfig, null, 2)
}

/**
 * Cache warming for critical resources
 */
export class CacheWarmer {
  private warmed = new Set<string>()

  /**
   * Warm cache for specific URLs
   */
  async warm(urls: string[]): Promise<void> {
    const promises = urls
      .filter(url => !this.warmed.has(url))
      .map(async url => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            this.warmed.add(url)
          }
        } catch (error) {
          console.warn(`Failed to warm cache for ${url}:`, error)
        }
      })

    await Promise.allSettled(promises)
  }

  /**
   * Check if URL is warmed
   */
  isWarmed(url: string): boolean {
    return this.warmed.has(url)
  }

  /**
   * Clear warmed URLs
   */
  clear(): void {
    this.warmed.clear()
  }
}

export const cacheWarmer = new CacheWarmer()

/**
 * CDN edge configuration for Next.js
 */
export const EdgeConfig = {
  // Edge function handler
  edgeFunction: `
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const url = req.nextUrl.clone()

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  return response
}
`,

  // Edge middleware for routing
  middleware: `
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Add custom headers
  const response = NextResponse.next()
  
  response.headers.set('X-Powered-By', 'Next.js Edge')

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
`,
}

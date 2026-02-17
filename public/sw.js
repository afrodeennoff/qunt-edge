const CACHE_NAME = 'quntedge-static-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/favicon.ico',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only cache same-origin GET requests for static assets
    if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
        return;
    }

    // Skip API, Auth, and Dashboard dynamic routes - these are handled by Edge/IndexedDB
    if (
        url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/authentication') ||
        url.pathname.includes('/dashboard/')
    ) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Cache static assets (images, fonts, scripts)
                if (
                    response.ok &&
                    (url.pathname.includes('/_next/static') ||
                        url.pathname.startsWith('/logos') ||
                        url.pathname.startsWith('/videos'))
                ) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            }).catch(() => {
                // Offline fallback could go here
            });
        })
    );
});

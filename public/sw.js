const CACHE_NAME = 'quntedge-static-v2';
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
    const destination = request.destination;

    // Only cache same-origin GET requests for static assets
    if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
        return;
    }

    // Never cache HTML/documents; stale HTML is the common hard-reload root cause.
    if (request.mode === 'navigate' || destination === 'document') {
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

    event.respondWith((async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            event.waitUntil(
                fetch(request).then((networkResponse) => {
                    if (!networkResponse.ok) return;
                    if (
                        url.pathname.includes('/_next/static') ||
                        url.pathname.startsWith('/logos') ||
                        url.pathname.startsWith('/videos')
                    ) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
                    }
                }).catch(() => {
                    // Best-effort revalidation.
                })
            );
            return cachedResponse;
        }

        const response = await fetch(request);
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
    })());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

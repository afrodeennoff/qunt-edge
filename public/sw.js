const CACHE_NAME = 'quntedge-static-v3';
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;
const CACHE_TIME_HEADER = 'x-sw-cached-at';
const ASSETS_TO_CACHE = [
    '/manifest.json',
    '/favicon.ico',
];

function isCacheableAsset(pathname) {
    return (
        pathname.includes('/_next/static') ||
        pathname.startsWith('/_next/image') ||
        pathname.startsWith('/logos') ||
        pathname.startsWith('/videos')
    );
}

function isExpired(cachedResponse) {
    const cachedAtRaw = cachedResponse.headers.get(CACHE_TIME_HEADER);
    if (!cachedAtRaw) return true;

    const cachedAt = Number(cachedAtRaw);
    if (!Number.isFinite(cachedAt)) return true;

    return Date.now() - cachedAt > MAX_CACHE_AGE_MS;
}

async function addCacheTimestamp(response) {
    const headers = new Headers(response.headers);
    headers.set(CACHE_TIME_HEADER, String(Date.now()));

    const body = await response.blob();
    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

async function pruneExpiredEntries(cache) {
    const requests = await cache.keys();
    await Promise.all(
        requests.map(async (request) => {
            const cached = await cache.match(request);
            if (!cached || !isExpired(cached)) return;
            await cache.delete(request);
        })
    );
}

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
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
                );
            }),
            caches.open(CACHE_NAME).then((cache) => pruneExpiredEntries(cache)),
        ])
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only cache same-origin GET requests for static assets
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    // For document navigations, always prefer network to avoid stale HTML/chunk manifests.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
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
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            if (!isExpired(cachedResponse)) {
                return cachedResponse;
            }
            await cache.delete(request);
        }

        try {
            const response = await fetch(request);

            if (response.ok && isCacheableAsset(url.pathname)) {
                const responseToCache = await addCacheTimestamp(response.clone());
                await cache.put(request, responseToCache);
            }

            return response;
        } catch {
            // Offline fallback for static assets only
            if (isCacheableAsset(url.pathname)) {
                return cache.match(request);
            }
            return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
        }
    })());
});

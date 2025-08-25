const CACHE_NAME = 'pos-erp-cache-v1';
// List of files that should be pre-cached for offline use.
const urlsToCache = [
  '/', // Alias for index.html
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/@google/genai@^1.11.0',
  'https://esm.sh/react@^19.1.0/',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-router-dom@^7.7.1',
  'https://esm.sh/lucide-react@^0.525.0',
  'https://esm.sh/sql.js@1.10.3',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm',
  'https://esm.sh/promptpay-qr@^0.5.0',
  'https://esm.sh/qrcode@^1.5.3'
];

// Install event: open a cache and add the URLs to it.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll for atomic operation
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache files during install:', err);
      })
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve assets from cache if available.
// Strategy: Cache First for pre-cached assets, then network.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0) || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We only want to cache GET requests.
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetch failed:', error);
          // When fetch fails (e.g., offline), the browser will show a network error.
          // This is often sufficient for PWAs that have their shell cached.
        });
      })
  );
});
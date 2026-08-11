/* ============================================================
   MYDUUKA — SERVICE WORKER FOR OFFLINE-FIRST OPERATION
   ============================================================ */

const CACHE_NAME = 'myduuka-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/design-system.css',
  './css/components.css',
  './css/screens.css',
  './css/animations.css',
  './js/utils.js',
  './js/data.js',
  './js/app.js',
  './js/screens/auth.js',
  './js/screens/home.js',
  './js/screens/money.js',
  './js/screens/sell.js',
  './js/screens/products.js',
  './js/screens/stock.js',
  './js/screens/customers.js',
  './js/screens/suppliers.js',
  './js/screens/reports.js',
  './js/screens/monitor.js',
  './js/screens/alerts.js',
  './js/screens/users.js',
  './js/screens/closeday.js',
  './js/screens/settings.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'https://unpkg.com/lucide@latest'
];

// Install Event — Cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app assets for offline use');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Cache-First Strategy for offline availability
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
      }

      // If not in cache, fetch from network and add to cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          try {
            cache.put(event.request, responseToCache);
          } catch (e) {
            console.warn('[ServiceWorker] Cache put failed:', e);
          }
        });

        return networkResponse;
      }).catch(() => {
        // If offline and request is for a page, return cached index.html
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

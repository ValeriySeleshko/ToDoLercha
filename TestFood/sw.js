/**
 * Service Worker for Plan4U Food Scanner
 * Ensures 100% offline standalone operation on mobile devices
 */

const CACHE_NAME = 'plan4u-food-scanner-v2';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './html5-qrcode.min.js',
  './manifest.json',
  './icon.png',
  './icon-192.png',
  './icon-512.png'
];

const DATA_ASSETS = [
  './Plan4U_Food.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching core assets...');
      // 1. Cache core assets first
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (e) {
        console.warn('[SW] Core pre-cache fallback:', e);
        for (const url of CORE_ASSETS) {
          try { await cache.add(url); } catch (_) {}
        }
      }

      // 2. Cache heavy database (14MB) in background
      try {
        await cache.addAll(DATA_ASSETS);
        console.log('[SW] Full database cached successfully for offline use!');
      } catch (e) {
        console.warn('[SW] Data cache retry:', e);
        for (const url of DATA_ASSETS) {
          try { await cache.add(url); } catch (_) {}
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Allow external API calls (e.g. Open Food Facts fallback) to go to network
  if (url.origin !== location.origin) {
    return;
  }

  // Cache-First with Network Fallback
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and navigating, return cached index.html
        if (req.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});

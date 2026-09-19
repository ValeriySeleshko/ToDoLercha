const CACHE_NAME = 'todo-notebook-v0.7.1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './i18n.js',
  './cycle_tracker.js',
  './finance_tracker.js',
  './maine_quests_data.js',
  './maine_quests.js',
  './initial_habits.js',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon.png',
  './favicon.png',
  './assets/cat_step.png',
  './assets/purr.wav'
];

// Add finance icons to pre-cache list
for (let i = 0; i <= 48; i++) {
  ASSETS.push(`./assets/finance_icons/fin_icon_${i}.png`);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => console.warn('PWA Cache prefetch error:', err));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request, timeoutMs = 1800) {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(new Error('Network timeout'));
    }, timeoutMs);

    fetch(request).then(
      (response) => {
        if (!timedOut) {
          clearTimeout(timer);
          resolve(response);
        }
      },
      (err) => {
        if (!timedOut) {
          clearTimeout(timer);
          reject(err);
        }
      }
    );
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Network-first with short timeout (1.8s) so weak connection falls back immediately to cache
  event.respondWith(
    fetchWithTimeout(event.request, 1800)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          // Do not cache partial (status 206) range requests
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache ignoring version query strings (?v=0.5.2)
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});

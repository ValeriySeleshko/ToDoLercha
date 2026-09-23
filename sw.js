const CACHE_NAME = 'todo-notebook-v20260923200855';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './i18n.js',
  './cycle_tracker.js',
  './finance_tracker.js',
  './nutrition_tracker.js',
  './joy_tracker.js',
  './maine_quests_data.js',
  './maine_quests.js',
  './initial_habits.js',
  './stickers_system.js',
  './achievements_system.js',
  './pet_system.js',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon.png',
  './favicon.png',
  './assets/cat_step.png',
  './assets/purr.wav'
];

// Add finance icons to pre-cache list (all 98 sticker icons)
for (let i = 0; i <= 97; i++) {
  ASSETS.push(`./assets/finance_icons/fin_icon_${i}.png`);
}

// Add paper stickers to pre-cache list
for (let i = 1; i <= 25; i++) {
  const num = String(i).padStart(2, '0');
  ASSETS.push(`./assets/stickers/paper/paper_${num}.png`);
  ASSETS.push(`./assets/stickers/paper/paper_${num}.webp`);
}

// Add paper sticker pile backdrops to pre-cache list
for (let i = 0; i < 5; i++) {
  const num = String(i).padStart(2, '0');
  ASSETS.push(`./assets/stickers/paper/back_sticker_${num}.png`);
  ASSETS.push(`./assets/stickers/paper/back_sticker_${num}.webp`);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) => cache.add(url).catch((err) => console.warn('PWA Cache item skip:', url, err)))
      );
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

function fetchWithTimeout(request, timeoutMs = 4000) {
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

  const url = new URL(event.request.url);

  // Allow third-party APIs (such as Open Food Facts) to go directly through the network
  if (url.origin !== self.location.origin) {
    return;
  }

  const isAsset = url.pathname.includes('/assets/') || 
                  /\.(png|jpg|jpeg|webp|svg|ico|wav|mp3|woff2?|ttf)$/i.test(url.pathname);

  // 1. Static Assets: Cache-First for ultra-fast, offline-reliable loading
  if (isAsset) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache)).catch(() => {});
          }
          return networkResponse;
        }).catch(() => {
          return caches.match(event.request, { ignoreSearch: true });
        });
      })
    );
    return;
  }

  // 2. Documents & Scripts: Network-first with 4s timeout and cache fallback
  event.respondWith(
    fetchWithTimeout(event.request, 4000)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          // Do not cache partial (status 206) range requests
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});

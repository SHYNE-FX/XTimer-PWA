// X-Timer Service Worker — v4.10
const CACHE_NAME = 'xtimer-v4.10';

// App shell — always cache on install
const SHELL_ASSETS = [
  './',
  './index.html',
  './CSS/base.css',
  './CSS/layout.css',
  './CSS/components.css',
  './JS/state.js',
  './JS/audio.js',
  './JS/timer.js',
  './JS/ui.js',
  './JS/main.js',
  './Images/icon.svg',
  './Images/icon-192.png',
  './Images/icon-512.png',
  './manifest.json'
];

// Audio files — cached on first request, not blocking install
const AUDIO_FILES = [
  './Audio/work.mp3',
  './Audio/prepare.mp3',
  './Audio/rest.mp3',
  './Audio/get ready to work.mp3',
  './Audio/get ready to rest.mp3',
  './Audio/all sets completed.mp3',
  ...Array.from({ length: 20 }, (_, i) => `./Audio/set ${i + 1}, completed.mp3`),
  ...Array.from({ length: 20 }, (_, i) => `./Audio/${i + 1} set${i === 0 ? '' : 's'} in total.mp3`)
];

// ── Install: cache app shell synchronously ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache shell first (critical path)
      await cache.addAll(SHELL_ASSETS);

      // Cache audio in background — don't block install
      cache.addAll(AUDIO_FILES).catch((err) =>
        console.warn('[SW] Some audio files not cached on install:', err)
      );
    })
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for local assets, network-first for external ─────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // External requests (Google Fonts, CDN) — network-first, fall back silently
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return empty response for external failures — app still works offline
        return new Response('', { status: 200 });
      })
    );
    return;
  }

  // Local assets — cache-first, update cache in background (stale-while-revalidate)
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null);

      // Return cached immediately if available, else wait for network
      return cached || fetchPromise;
    })
  );
});

// ── Background sync: re-cache audio on demand ───────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(AUDIO_FILES).catch(() => {});
    });
  }
});

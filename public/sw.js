// AGDS Corp POS - Service Worker
// Simple service worker for PWA installation only
// No caching or offline mode implemented

const CACHE_NAME = 'agds-pos-v1';

// Install event - just skip waiting
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event - clean up and take control
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    // Clean up old caches if any
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages
      return self.clients.claim();
    })
  );
});

// Fetch event - no caching, just pass through to network
self.addEventListener('fetch', (event) => {
  // Simply fetch from network, no caching logic
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.log('[Service Worker] Fetch failed:', error);
      throw error;
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Loaded - PWA install mode only, no caching');

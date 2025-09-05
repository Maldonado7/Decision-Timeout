// Decision Timeout Service Worker
const CACHE_NAME = 'decision-timeout-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/history',
  '/manifest.json',
  // Add other critical static assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/',
  'https://supabase.co/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('SW: Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Static assets - Cache First strategy
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // API requests - Network First with fallback
  if (API_CACHE_PATTERNS.some(pattern => url.href.includes(pattern))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache when network fails
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return offline page for failed API requests
            if (request.headers.get('accept').includes('text/html')) {
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'You are currently offline. Some features may be limited.'
                }),
                {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
            }
          });
        })
    );
    return;
  }

  // Default - Network First for everything else
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for decision saving when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-decision') {
    event.waitUntil(syncDecisions());
  }
});

async function syncDecisions() {
  // Retrieve pending decisions from IndexedDB and sync with server
  console.log('SW: Syncing offline decisions');
  // Implementation would depend on your offline storage strategy
}

// Push notifications for decision reminders (future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: 'Time to review your recent decisions!',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View History',
        icon: '/icon-96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Decision Timeout', options)
  );
});
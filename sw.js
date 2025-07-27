// EasOfTopia Platform Service Worker
// Version: 1.0.0
// Cache Name: eas-of-topia-v1.0.0

const CACHE_NAME = 'eas-of-topia-v1.0.0';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/contact-form.js',
  '/manifest.json',
  '/browserconfig.xml',
  '/sitemap.xml',
  '/robots.txt',
  '/offline.html',
  '/assets/logo.png',
  '/assets/logo_EasOfTopia.png',
  '/assets/logo_paletniffer.png'
];

// Error handling for unsupported URL schemes
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_FILES))
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .catch((error) => {
        console.error('[SW] Cache cleanup failed:', error);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip chrome-extension URLs to prevent cache errors
  if (request.url.includes('chrome-extension://')) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Validate URL
  if (!isValidUrl(request.url)) {
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
              .catch((error) => {
                console.error('[SW] Failed to cache navigation response:', error);
              });
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation failures
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache successful responses for static files
            if (response.status === 200 && STATIC_FILES.some(file => request.url.includes(file))) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone))
                .catch((error) => {
                  console.error('[SW] Failed to cache static file:', error);
                });
            }
            return response;
          })
          .catch(() => {
            // Return cached version if available
            return caches.match(request);
          });
      })
  );
});

// Message event - handle service worker messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 
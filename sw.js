// EasOfTopia Platform Service Worker
// Version: 1.2.0 - Enhanced for mobile performance and Vercel deployment
// Cache Name: eas-of-topia-v1.2.0

const CACHE_NAME = 'eas-of-topia-v1.2.0';
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

// Enhanced error handling for different server contexts
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    // Support both http and https, and localhost variations
    return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
           (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname.includes('.'));
  } catch {
    return false;
  }
}

// Enhanced cache strategy for different server contexts
function shouldCacheRequest(request) {
  const url = new URL(request.url);
  
  // Don't cache service worker itself
  if (url.pathname === '/sw.js') {
    return false;
  }
  
  // Don't cache live-server specific requests
  if (url.hostname === '127.0.0.1' && url.port === '5500') {
    // For live-server, only cache essential files
    return STATIC_FILES.some(file => url.pathname.includes(file));
  }
  
  // For Vercel deployment, cache more aggressively
  if (url.hostname === 'eas-of-topia.vercel.app') {
    return true;
  }
  
  // For other contexts, cache more aggressively
  return true;
}

// Install event - cache static files with enhanced error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        // Cache installation failed - silent fail for production
      })
  );
});

// Activate event - clean up old caches with enhanced cleanup
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
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
      .catch((error) => {
        // Cache cleanup failed - silent fail for production
      })
  );
});

// Enhanced fetch event with server-specific handling
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
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
  
  // Enhanced handling for live-server context
  if (url.hostname === '127.0.0.1' && url.port === '5500') {
    // For live-server, prioritize network over cache for CSS files
    if (url.pathname.includes('style.css')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache the fresh CSS
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone))
                .catch((error) => {
                  // Failed to cache CSS - silent fail for production
                });
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(request);
          })
      );
      return;
    }
  }
  
  // Enhanced handling for Vercel deployment
  if (url.hostname === 'eas-of-topia.vercel.app') {
    // For Vercel, use network-first strategy for better performance
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200 && shouldCacheRequest(request)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
              .catch((error) => {
                // Failed to cache response - silent fail for production
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200 && shouldCacheRequest(request)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
              .catch((error) => {
                // Failed to cache navigation response - silent fail for production
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
  
  // Handle static assets with enhanced caching strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response && shouldCacheRequest(request)) {
          return response;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache successful responses for static files
            if (response.status === 200 && shouldCacheRequest(request)) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone))
                .catch((error) => {
                  // Failed to cache static file - silent fail for production
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

// Enhanced message event handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle cache clearing requests
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          // Cache cleared successfully
        })
    );
  }
  
  // Handle version check requests
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '1.2.0',
      cacheName: CACHE_NAME
    });
  }
}); 
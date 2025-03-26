// Service Worker for event2ics PWA

const CACHE_NAME = 'event2ics-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/main.css',
  '/scripts/app.js',
  '/scripts/clipboard-handler.js',
  '/scripts/gemini-service.js',
  '/scripts/ics-generator.js',
  '/config/api-config.js',
  '/images/favicon.ico',
  '/images/icons_apple-touch-icon.png',
  '/images/icons_favicon-16x16.png',
  '/images/icons_favicon-32x32.png',
  '/images/img_icon-192.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          return name !== CACHE_NAME;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and requests to external resources
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin) ||
      event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache responses that aren't successful
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response since it can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Handle incoming shares (for share target functionality)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is a share target request
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const mediaFiles = formData.getAll('media');
      const text = formData.get('text') || '';
      const title = formData.get('title') || '';
      
      // Store the shared content for the main app to access
      const client = await self.clients.get(event.resultingClientId);
      if (client) {
        client.postMessage({
          type: 'share-target',
          text: text || title,
          files: mediaFiles
        });
      }
      
      // Redirect back to the main app
      return Response.redirect('/', 303);
    })());
  }
});
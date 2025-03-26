const CACHE_NAME = 'message-display-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/services/EventProcessor.js',
  '/js/services/ContentDisplay.js',
  '/js/services/ContentEditor.js'
];
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 處理離線緩存
self.addEventListener('fetch', (event) => {
  // 在開發模式下，直接獲取新的資源，不使用快取
  if (isDevelopment) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// 處理分享事件
self.addEventListener('share-target', async (event) => {
  const formData = await event.request.formData();
  const data = {};

  if (formData.has('text')) {
    data.type = 'text';
    data.data = formData.get('text');
  } else if (formData.has('files')) {
    const file = formData.get('files');
    if (file && file.type.startsWith('image/')) {
      data.type = 'image';
      data.data = URL.createObjectURL(file);
    }
  }

  // 發送消息給頁面
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  });

  clients.forEach(client => {
    client.postMessage({
      type: 'share-target',
      content: data
    });
  });

  // 重定向到主頁面
  return Response.redirect('/', 303);
});

// 清理舊的緩存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
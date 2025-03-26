const CACHE_NAME = 'event2ics-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/app.js',
    '/manifest.json',
    'https://unpkg.com/alpinejs',
    'https://cdn.tailwindcss.com'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

// 啟動 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// 處理資源請求
self.addEventListener('fetch', (event) => {
    // 處理分享目標
    if (event.request.method === 'POST') {
        event.respondWith(Response.redirect('/?share=true'));
        event.waitUntil(
            (async function() {
                const data = await event.request.formData();
                const client = await self.clients.get(event.resultingClientId);

                const files = data.getAll('image');
                const text = data.get('text');

                if (text) {
                    client.postMessage({ type: 'SHARED_TEXT', text });
                }

                if (files.length > 0) {
                    for (const file of files) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            client.postMessage({
                                type: 'SHARED_IMAGE',
                                data: reader.result
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                }
            })()
        );
        return;
    }

    // 處理一般資源請求
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
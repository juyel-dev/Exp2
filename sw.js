// sw.js (Service Worker)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('binaural-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/docs.html',
                '/admin.html',
                '/style.css',
                '/script.js',
                '/admin-script.js',
                // Add bg sounds URLs if possible, but since external, handle offline gracefully
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

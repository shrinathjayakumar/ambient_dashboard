const CACHE_NAME = 'ambient-cache-v1';
const urlsToCache = [
  '/',
  '/static/dashboard/styles.css',
  '/static/dashboard/script.js',
  '/static/dashboard/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

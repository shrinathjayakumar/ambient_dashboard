self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Just a simple fetch, no strict caching required to pass PWA checks.
  event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});

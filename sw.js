const CACHE_NAME = 'mobil-kontrol-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    )),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((response) => {
      if (response && response.ok && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});

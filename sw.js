/* The cache key is auto-derived from `package.json` `version` by
   `scripts/check-sw-cache-version.mjs`. A release bump (e.g. 1.1.0 to
   1.2.0) therefore invalidates the old PWA cache automatically; clients
   refetch the new assets on next visit. Manual edits to this line are
   overwritten by `npm run sw:sync` and rejected by CI / pre-commit if
   they go out of sync with package.json. */
const CACHE_NAME = 'mobil-kontrol-v1.1.0';

self.addEventListener('install', () => {
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

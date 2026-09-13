/* Service Worker: the app shell's caching policy.
 *
 * The cache key is auto-derived from `package.json` `version` by
 * `scripts/check-sw-cache-version.mjs`. A release bump (e.g. 1.3.0 to
 * 1.3.1) therefore invalidates the old PWA cache automatically; clients
 * refetch the new assets on next visit. Manual edits to this line are
 * overwritten by `npm run sw:sync` and rejected by CI / pre-commit if
 * they go out of sync with package.json.
 *
 * ---------------------------------------------------------------------
 * Two strategies, because the two kinds of request want opposite things
 *
 * The page is 51 files and about 430 KB over the wire once compressed,
 * almost all of it the checklist content itself. Through 1.3.0 every one
 * of them was fetched from the network on every visit, with the cache
 * used only when the network failed. On a desktop that is invisible. On
 * a phone on mobile data it is the whole experience: measured on an
 * emulated mid-range handset (Fast 3G, 4x CPU), the page took close to
 * eight seconds to become interactive, every single time it was opened.
 *
 *   Navigations (the HTML) stay network-first, with a timeout.
 *     The document is what carries a new release, and it is one small
 *     request. Asking the network for it first means a reader who is
 *     online sees the current version rather than yesterday's. The
 *     timeout is what makes that safe on a phone: a request that has not
 *     answered in NAVIGATION_TIMEOUT_MS gives way to the cached copy, so
 *     a weak signal costs a moment rather than the whole page. The
 *     network response is still awaited in the background and still
 *     updates the cache.
 *
 *   Everything else is stale-while-revalidate.
 *     Styles, scripts, icons and the manifest come straight from the
 *     cache, so a repeat visit paints immediately and works with no
 *     connection at all, and a fresh copy is fetched in the background
 *     for next time.
 *
 * Version skew, and why it is bounded
 *
 * A new release changes both the document and the files it references.
 * For exactly one load after that release, network-first navigation can
 * pair the new document with subresources still cached from the old one.
 * Two things keep that from mattering:
 *
 *   - The cache is per-version. `activate` deletes every cache whose key
 *     is not CACHE_NAME, so the moment the new worker takes over there is
 *     nothing old left to serve and the next load is wholly new.
 *   - The page reloads itself once when a new worker takes control (see
 *     js/18-app.js). Combined with skipWaiting() and clients.claim() the
 *     skew window closes on its own, without the reader doing anything.
 *
 * Scope
 *
 * Only same-origin GET requests are touched. Range requests are passed
 * straight through: a partial response must not be stored as if it were
 * the whole resource. */

const CACHE_NAME = 'mobil-kontrol-v1.3.1';

/* How long a navigation waits for the network before the cached copy is
   used instead. Long enough not to trip on an ordinary mobile round trip,
   short enough that a dead connection does not hold a blank page. */
const NAVIGATION_TIMEOUT_MS = 3000;

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

/* Store only a complete, first-party, successful response. `basic` rules
   out opaque cross-origin responses, whose status cannot be read. */
function cacheable(response) {
  return !!response && response.ok && response.type === 'basic' && response.status === 200;
}

function put(request, response) {
  const clone = response.clone();
  caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => {
    /* Quota, private mode, or the cache being evicted mid-write. The
       response has already been returned to the page either way. */
  });
}

/* Cache first, network in the background. Returns immediately when the
   file is already held; the refetch replaces it for the next load. */
function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request).then((response) => {
      if (cacheable(response)) put(request, response);
      return response;
    }).catch(() => cached);

    return cached || network;
  });
}

/* Network first, falling back to the cache on failure or on timeout.
   The network promise is not cancelled by the timeout: it goes on to
   update the cache in the background. */
function networkFirst(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    const network = fetch(request).then((response) => {
      if (cacheable(response)) cache.put(request, response.clone());
      return response;
    });

    const timeout = new Promise((resolve) => {
      setTimeout(() => resolve(cache.match(request)), NAVIGATION_TIMEOUT_MS);
    });

    return Promise.race([network, timeout])
      .then((response) => response || network)
      .catch(() => cache.match(request));
  });
}

self.addEventListener('fetch', (e) => {
  const request = e.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* A partial response answers one byte range and must never stand in for
     the resource. */
  if (request.headers.has('range')) return;

  if (request.mode === 'navigate') {
    e.respondWith(networkFirst(request));
    return;
  }

  e.respondWith(staleWhileRevalidate(request));
});

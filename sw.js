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
 * The app shell is stored while the worker installs
 *
 * A worker only sees the requests a page makes after the worker has taken
 * control of it, and on a first visit that happens after the page has
 * loaded: the page registers this file from js/18-app.js, by which time
 * every stylesheet and nearly every script has already arrived. A cache
 * filled only by the fetch handler is therefore still empty when a first
 * visit ends. The application could not open offline until it had been
 * opened twice, and the second visit still came from the network.
 *
 * So `install` stores APP_SHELL, every file the page needs in order to
 * open, before the worker is allowed to activate. Each file is requested
 * with `cache: 'no-cache'`, which makes the browser revalidate the copy
 * in its HTTP cache instead of trusting it. On a server that sends
 * validators, as GitHub Pages does, the files a first visit has just
 * loaded come back as 304s rather than as a second download; and on a
 * release the worker cannot store an old copy that the HTTP cache still
 * considers fresh. `cache.addAll` is all or nothing: if one file fails,
 * the worker is discarded rather than activated with half a shell, and
 * the browser tries again on a later visit.
 *
 * APP_SHELL is generated from index.html and manifest.webmanifest by
 * `scripts/check-sw-app-shell.mjs` (`npm run sw:sync`), and CI fails when
 * the list has drifted from them.
 *
 * ---------------------------------------------------------------------
 * Two strategies, because the two kinds of request want opposite things
 *
 * The page is 52 files and about 445 KB over the wire once compressed,
 * more than half of it the checklist content itself. Through 1.3.0 every
 * visit waited on the network for every one of them, with the cache used
 * only when the network failed. On a desktop that is invisible. On a phone
 * on mobile data it is the whole experience: on an emulated mid-range
 * handset (1.6 Mbps, 150 ms per response, 4x CPU) the first visit took 4.5
 * seconds and every visit after it close to 2, most of that spent on round
 * trips confirming that nothing had changed.
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
 *     nothing old left to serve. `install` has already stored the new
 *     shell in full by then, so the next load is wholly new and still
 *     comes from the cache.
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

/* Every file the page needs in order to open with no connection: the page
   itself, then each local stylesheet, script, icon and manifest index.html
   references, in document order, then the icons manifest.webmanifest adds.

   Generated by `npm run sw:sync` (scripts/check-sw-app-shell.mjs). Change
   index.html or the manifest and re-run it; CI rejects a list edited by
   hand that no longer matches them. */
const APP_SHELL = [
  './',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/favicon-48.png',
  'manifest.webmanifest',
  'js/00-bootstrap.js',
  'css/01-base.css',
  'css/02-layout.css',
  'css/03-categories.css',
  'css/04-presentation.css',
  'css/05-modals-core.css',
  'css/05-modals-feedback.css',
  'css/05-hero-pills.css',
  'css/05-modals-welcome.css',
  'css/05-modals-install.css',
  'css/05-modals-projects.css',
  'css/06-responsive-print.css',
  'css/07-design-minimal.css',
  'css/08-design-showcase.css',
  'css/09-design-picker.css',
  'js/01-i18n-strings.js',
  'js/02-help-content.js',
  'js/03a-data-01-idea-planning.js',
  'js/03b-data-02-design.js',
  'js/03c-data-03-code-layout.js',
  'js/03d-data-04-git.js',
  'js/03e-data-05-api.js',
  'js/03f-data-06-backend.js',
  'js/03g-data-07-offline.js',
  'js/03h-data-08-testing.js',
  'js/03i-data-09-security.js',
  'js/03j-data-10-a11y.js',
  'js/03k-data-11-release.js',
  'js/03l-data-12-monetization.js',
  'js/03m-data-13-analytics.js',
  'js/03n-data-14-cicd.js',
  'js/03-data.js',
  'js/04-projects.js',
  'js/04-storage.js',
  'js/05-framework.js',
  'js/05-backend.js',
  'js/06-view-state.js',
  'js/07-ui-helpers.js',
  'js/08-i18n-dom.js',
  'js/09-ai-prompt.js',
  'js/10-clipboard.js',
  'js/11-render.js',
  'js/12-progress.js',
  'js/13-filters.js',
  'js/14-welcome.js',
  'js/15-projects.js',
  'js/16-presentation.js',
  'js/17-install.js',
  'js/18-app.js',
  'js/19-design.js',
  'js/20-showcase-motion.js',
  'assets/icons/icon-512.png',
  'assets/icons/icon-192-maskable.png',
  'assets/icons/icon-512-maskable.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(
    APP_SHELL.map((url) => new Request(url, { cache: 'no-cache' }))
  )));
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
   update the cache in the background.

   The fallback ignores the query string. The shell is stored under the
   page's own address, and a link that reaches the page with one attached
   (a campaign tag, a share parameter) is still the same static document;
   without this, that link would open online and fail offline. */
function networkFirst(request) {
  return caches.open(CACHE_NAME).then((cache) => {
    const cached = () => cache.match(request, { ignoreSearch: true });

    const network = fetch(request).then((response) => {
      if (cacheable(response)) cache.put(request, response.clone());
      return response;
    });

    const timeout = new Promise((resolve) => {
      setTimeout(() => resolve(cached()), NAVIGATION_TIMEOUT_MS);
    });

    return Promise.race([network, timeout])
      .then((response) => response || network)
      .catch(() => cached());
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

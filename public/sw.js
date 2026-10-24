/* Pure Function service worker: lets the app open offline.
 * Network-first for same-origin GETs, falling back to cache.
 * Cross-origin requests (Supabase, fonts, video) are never touched. */
const CACHE = 'pf-shell-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['./', './manifest.webmanifest', './icons/icon-192.png']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    // page loads skip the browser HTTP cache (GitHub Pages caches for 10 min), so a new
    // version shows on the next open; hashed assets can use the normal cache
    fetch(req.mode === 'navigate' ? new Request(req, { cache: 'no-store' }) : req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./') : Response.error()))
      )
  );
});

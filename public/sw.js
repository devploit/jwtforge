// JWTForge service worker — enables offline use without risking stale deploys.
//
// Strategy:
//  - Navigations (HTML): network-first, fall back to cache when offline. Online
//    visitors always get the latest deploy.
//  - Immutable build assets (/_next/static/*): cache-first (their URLs are
//    content-hashed, so a new deploy fetches new URLs automatically).
//  - Everything else same-origin GET: stale-while-revalidate.
// Cross-origin requests (e.g. the opt-in JWKS fetch) are never touched.

const VERSION = "v1";
const CACHE = `jwtforge-${VERSION}`;

self.addEventListener("install", (event) => {
  // Activate this worker immediately on first install.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/", "/decode"])),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave JWKS etc. alone

  // Navigations: network-first.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Immutable hashed assets: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Other same-origin GETs: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

/* Service worker — Zielnik (offline-first cache) */
const VERSION = "zielnik-v11";
const REQUIRED_ASSETS = [
  "./",
  "index.html",
  "game.html",
  "herbarium.html",
  "css/styles.css",
  "css/game.css",
  "css/herbarium.css",
  "js/storage.js",
  "js/audio.js",
  "js/data.js",
  "js/menu.js",
  "js/game.js",
  "js/herbarium.js",
  "js/achievements.js",
  "js/pwa.js",
  "data/flowers.json",
  "manifest.webmanifest",
  "images/back.png",
];
const OPTIONAL_ASSETS = [
  "images/icon-192.png",
  "images/icon-512.png",
  "images/druid.png",
  "images/druid-sad.png",
  "images/druid-demonic.png",
  "images/druid-drunk.png",
  "images/druid-angry.png",
  "audio/burp.mp3",
];

function cacheOptionalAssets(cache) {
  return Promise.allSettled(OPTIONAL_ASSETS.map((url) => cache.add(url)))
    .then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn("Optional cache asset failed:", OPTIONAL_ASSETS[index], result.reason);
        }
      });
    });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(REQUIRED_ASSETS).then(() => cacheOptionalAssets(cache)))
      .catch((err) => {
        console.error("Service worker install failed:", err);
        throw err;
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/**
 * Strategy:
 *  - Navigations: network-first, fallback to cache.
 *  - Same-origin assets (images/audio/json): stale-while-revalidate.
 *  - Cross-origin (Google Fonts): cache opportunistically.
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Cross-origin (e.g. Google Fonts): cache-first then network.
  event.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});

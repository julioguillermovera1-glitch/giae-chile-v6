const GIAE_CACHE = "giae-chile-v1-servidor";
const GIAE_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./css/styles.css",
  "./js/app.js",
  "./manifest.json",
  "./datos/distribuidoras.json",
  "./datos/modulos.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(GIAE_CACHE).then(cache => cache.addAll(GIAE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== GIAE_CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => caches.match("./offline.html"));
    })
  );
});

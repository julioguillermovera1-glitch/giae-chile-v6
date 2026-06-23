const GIAE_CACHE = 'giae-chile-v1-3-0-cache';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './offline.html',
  './assets/giae-logo.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './css/styles.css',
  './js/app.js',
  './data/ric.json',
  './data/empalmes.json'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(GIAE_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== GIAE_CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(GIAE_CACHE).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match('./offline.html')))
  );
});

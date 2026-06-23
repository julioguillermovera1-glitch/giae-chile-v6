const GIAE_CACHE = 'giae-chile-v1-3-1-cache';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/giae-logo.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/css/styles.css',
  '/js/app.js',
  '/data/ric.json',
  '/data/empalmes.json'
];

const OFFLINE_HTML = `<!doctype html><html lang="es-CL"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GIAE Chile sin conexión</title><style>body{font-family:Arial,sans-serif;background:#eef3f8;color:#07172d;margin:0;display:grid;place-items:center;min-height:100vh}.card{background:white;border:1px solid #d9e2ec;border-radius:18px;padding:24px;max-width:520px;box-shadow:0 12px 34px rgba(25,35,55,.08)}h1{margin-top:0;color:#0f8f7c}</style></head><body><div class="card"><h1>GIAE Chile</h1><p><b>Modo sin conexión activo.</b></p><p>Vuelve a conectarte para guardar en nube o ejecutar auditorías avanzadas.</p><p>Creado por Julio Vera Concha · © 2026</p></div></body></html>`;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(GIAE_CACHE);
    await Promise.allSettled(CORE_ASSETS.map(async url => {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response && response.ok) await cache.put(url, response.clone());
      } catch (_) {}
    }));
    await cache.put('/offline.html', new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== GIAE_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(GIAE_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (_) {
      if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        return (await caches.match('/offline.html')) || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      return Response.error();
    }
  })());
});

const CACHE_NAME = 'my-pwa-shell-v1';
// devo de colocar /assets/????
//respuesta: No es necesario incluir la carpeta /assets/ a menos que tengas archivos específicos allí que quieras cachear. En este caso, los archivos listados en APP_SHELL son suficientes para el funcionamiento básico de la PWA.
const APP_SHELL = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/vite.svg',
  '/manifest.json'
];
// instalar service worker y cachear assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // cache app shell assets
      return cache.addAll(APP_SHELL).catch((err) => {
        console.error('Some assets failed to cache during install', err);
      });
      
    })
  );
  self.skipWaiting();
});
// limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});
// manejar fetch events para servir desde cache o red
self.addEventListener('fetch', (event) => {
  // For navigation requests, try cache first then network (offline fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((resp) => resp || fetch('/index.html'))
    );
    return;
  }

  // For other requests, try cache first, then network, then cache the response
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          // only cache successful GET responses
          if (!res || res.status !== 200 || event.request.method !== 'GET') return res;
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => {
          // optional: return a fallback image or offline page if present
          return caches.match('/index.html');
        });
    })
  );
});

// Simple message handler to support skipWaiting from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const CACHE_NAME_STATIC = 'my-pwa-static-v2';
const CACHE_NAME_DYNAMIC = 'my-pwa-dynamic-v1';
const CACHE_NAME_IMAGES = 'my-pwa-images-v1';

// App shell: archivos estáticos esenciales (cache-first)
const APP_SHELL = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json',
  '/offline.html'
];
// instalar service worker y cachear assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
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
          if (![CACHE_NAME_STATIC, CACHE_NAME_DYNAMIC, CACHE_NAME_IMAGES].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});
// manejar fetch events con estrategias distintas
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // 1) App shell (HTML/CSS/JS) - cache-first
  if (req.method === 'GET' && (req.destination === 'document' || req.destination === 'script' || req.destination === 'style')) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        // cache fetched shell assets
        if (res && res.status === 200) {
          const resClone = res.clone()
          caches.open(CACHE_NAME_STATIC).then((c) => c.put(req, resClone))
        }
        return res
      }).catch(() => {
        // fallback to offline page for navigation/documents
        if (req.destination === 'document') return caches.match('/offline.html')
      }))
    )
    return
  }

  // 2) Images - stale-while-revalidate
  if (req.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME_IMAGES).then(async (cache) => {
        const cached = await cache.match(req)
        const networkFetch = fetch(req).then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone())
          return res
        }).catch(() => null)
        return cached || networkFetch
      })
    )
    return
  }

  // 3) API requests - default to network, but provide offline JSON fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200 && req.method === 'GET') {
          const clone = res.clone()
          caches.open(CACHE_NAME_DYNAMIC).then((c) => c.put(req, clone))
        }
        return res
      }).catch(() => new Response(JSON.stringify({ error: 'offline', message: 'Client-only build: no backend available' }), { status: 503, headers: { 'Content-Type': 'application/json' } }))
    )
    return
  }

  // 4) Other GET requests - try cache first then network
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        // cache dynamic GET responses
        if (res && res.status === 200) {
          const resClone = res.clone()
          caches.open(CACHE_NAME_DYNAMIC).then((c) => c.put(req, resClone))
        }
        return res
      }).catch(() => {
        // final fallback to offline page for navigations
        if (req.destination === 'document') return caches.match('/offline.html')
      }))
    )
  }
})

// Simple message handler to support skipWaiting from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background Sync: cuando volvamos online, enviar las entradas guardadas en IndexedDB
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-entries') {
    event.waitUntil(syncEntries())
  }
})

// Helper básico de IndexedDB dentro del worker
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('pwa-activities-db', 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('activities')) {
        db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAllActivities() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('activities', 'readonly')
    const store = tx.objectStore('activities')
    const req = store.getAll()
    req.onsuccess = () => {
      resolve(req.result)
      db.close()
    }
    req.onerror = () => {
      reject(req.error)
      db.close()
    }
  })
}

async function deleteActivity(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('activities', 'readwrite')
    const store = tx.objectStore('activities')
    const req = store.delete(id)
    req.onsuccess = () => {
      resolve()
      db.close()
    }
    req.onerror = () => {
      reject(req.error)
      db.close()
    }
  })
}

async function syncEntries() {
  try {
    // En un build client-only no hay backend: aquí podemos simplemente dejar las entradas locales
    // o implementar una exportación automática (por ahora no borrar nada).
    const items = await getAllActivities()
    console.log('syncEntries called (client-only). items:', items && items.length)
    return
  } catch (err) {
    console.error('Error during syncEntries', err)
  }
}

// Push events: mostrar notificaciones push entrantes
self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : { title: 'Notificación', body: 'Tienes una notificación' }
    const title = data.title || 'Notificación'
    const options = {
      body: data.body || '',
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: data
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch (err) {
    console.error('Error handling push event', err)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((cl) => {
      if (cl.length > 0) return cl[0].focus()
      return clients.openWindow('/')
    })
  )
})

// Service Worker mínimo — permite que la app sea instalable en Android y iPhone
const CACHE = 'portal-dlp-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

// Estrategia: network-first con fallback a caché para navegación
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match('/') || fetch(event.request)
    )
  )
})

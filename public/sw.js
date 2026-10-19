// LottoLab offline shell: pages and static files visited once remain available.
// Draw data lives separately in IndexedDB. The service worker never caches the
// external results feed, so a new online refresh always checks its source.
const CACHE = 'lottolab-offline-shell-v1'
const SHELL = ['/', '/images/lottolab-logo.png', '/images/lab-hero.png', '/data/lotto-seed.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.allSettled(SHELL.map((url) => cache.add(url)))
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((name) => name.startsWith('lottolab-offline-shell-') && name !== CACHE)
        .map((name) => caches.delete(name))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, clone))
        }
        return response
      }).catch(async () =>
        (await caches.match(request)) || (await caches.match('/')) ||
        new Response('Offline. Reopen LottoLab when connected to cache this page.', { status: 503 })),
    )
    return
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/images/') || url.pathname.startsWith('/icon')) {
    event.respondWith(
      caches.match(request).then((saved) => saved || fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, clone))
        }
        return response
      })),
    )
  }
})

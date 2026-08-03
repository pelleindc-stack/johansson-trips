const CACHE_NAME = 'maui-trip-v10';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css?v=10',
  './app.js?v=10',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './route-map.png',
  './photos/kapalua-beach.jpg',
  './photos/oneloa-beach.jpg',
  './photos/oneloa-beach-selfie.jpg',
  './photos/dragons-teeth-coast.jpg',
  './photos/dragons-teeth-formations.jpg',
  './photos/dragons-teeth-view.jpg',
  './photos/honolua-bay.jpg',
  './photos/honolua-forest.jpg',
  './photos/nakalele-blowhole.jpg',
  './photos/nakalele-overlook.jpg',
  './photos/westin-sunset.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone()));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && response.type === 'basic') caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }))
  );
});

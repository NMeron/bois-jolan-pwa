const CACHE_NAME = 'bois-jolan-v1';

const FICHIERS_A_CACHER = [
  '/',
  '/index.html',
  '/style.css',
  '/style-panneau.css',
  '/app.js',
  '/pages/p1_Gros_Sable.html',
  '/pages/p4_Etang_Lambi_Corail.html',
  '/manifest.json'
];

// Installation — mise en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FICHIERS_A_CACHER))
  );
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch — répondre depuis le cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
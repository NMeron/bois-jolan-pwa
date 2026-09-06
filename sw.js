// ============================================
// SW.JS — Bois Jolan PWA · v2
// ⚠️ INCRÉMENTER "VERSION" À CHAQUE DÉPLOIEMENT
// ============================================

const VERSION     = '2.0.0';
const CACHE_APP   = 'bois-jolan-app-' + VERSION;
const CACHE_MEDIA = 'bois-jolan-media';   // non versionné : audio et photos

// Anciens caches à nettoyer (inclut le cache historique v1)
function estAncienCache(nom) {
  return (nom.startsWith('bois-jolan-app-') || nom === 'bois-jolan-v1')
         && nom !== CACHE_APP;
}

const SOCLE = [
  '/',
  '/index.html',
  '/style.css',
  '/style-panneau.css',
  '/app.js',
  '/manifest.json',
  '/pages/p1_Gros_Sable.html',
  '/pages/p4_Etang_Lambi_Corail.html'
];

// ---------- INSTALLATION ----------
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_APP);
    // Fichier par fichier : un 404 ne casse plus toute l'installation
    await Promise.all(SOCLE.map(url =>
      cache.add(new Request(url, { cache: 'reload' }))
           .catch(err => console.warn('[SW] non mis en cache :', url, err))
    ));
    self.skipWaiting();
  })());
});

// ---------- ACTIVATION ----------
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys    = await caches.keys();
    const anciens = keys.filter(estAncienCache);

    // S'il existait un cache antérieur, c'est une VRAIE mise à jour.
    // Sinon c'est un premier chargement : pas de bannière.
    const estUneMiseAJour = anciens.length > 0;

    await Promise.all(anciens.map(k => caches.delete(k)));
    await self.clients.claim();

    if (estUneMiseAJour) {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(c => c.postMessage({ type: 'MAJ_DISPONIBLE', version: VERSION }));
    }
  })());
});

// ---------- REQUÊTES ----------
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 1. Pages HTML → réseau prioritaire, cache en secours
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(reseauDabord(req));
    return;
  }

  // 2. Médias lourds → cache prioritaire (audio, images, polices)
  if (['audio', 'video', 'image', 'font'].includes(req.destination)) {
    event.respondWith(cacheDabord(req));
    return;
  }

  // 3. CSS / JS / JSON → affichage immédiat, rafraîchi en arrière-plan
  event.respondWith(cacheEtRafraichis(req));
});

// ---------- STRATÉGIES ----------

async function reseauDabord(req, delaiMax = 3000) {
  const cache = await caches.open(CACHE_APP);
  try {
    const reponse = await Promise.race([
      fetch(req),
      new Promise((_, rejeter) =>
        setTimeout(() => rejeter(new Error('delai depasse')), delaiMax))
    ]);
    if (reponse && reponse.ok) cache.put(req, reponse.clone());
    return reponse;
  } catch (e) {
    const cached = await cache.match(req);
    return cached
        || await cache.match('/index.html')
        || new Response('Hors ligne', {
             status: 503,
             headers: { 'Content-Type': 'text/plain; charset=utf-8' }
           });
  }
}

async function cacheDabord(req) {
  const cache  = await caches.open(CACHE_MEDIA);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const reponse = await fetch(req);
    if (reponse && reponse.ok) cache.put(req, reponse.clone());
    return reponse;
  } catch (e) {
    return new Response('', { status: 504 });
  }
}

async function cacheEtRafraichis(req) {
  const cache  = await caches.open(CACHE_APP);
  const cached = await cache.match(req);
  const reseau = fetch(req, { cache: 'no-store' })
    .then(rep => { if (rep && rep.ok) cache.put(req, rep.clone()); return rep; })
    .catch(() => null);
  return cached || (await reseau) || new Response('', { status: 504 });
}

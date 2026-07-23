/* ANOUANZÊ ERP — Service Worker (vanilla, sans next-pwa)
 * Stratégies :
 *   - Navigations (documents HTML) : network-first + fallback /offline
 *   - Assets statiques immuables (/_next/static/, images, polices) : cache-first
 *   - API (/api/**) : réseau uniquement (jamais de cache) — auth & données fraîches
 */

const VERSION = 'v1';
const CACHE = 'anouanze-' + VERSION;
const OFFLINE_URL = '/offline';

/* Ressources minimales pré-cachées à l'installation. */
const PRECACHE_URLS = [OFFLINE_URL, '/manifest.json', '/logo.svg', '/favicon.svg'];

/* Extensions considérées comme assets statiques cache-first. */
const STATIC_EXT =
  /\.(?:js|css|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|json|map)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      /* addAll échoue en bloc si une seule URL 404 → on tolère les échecs unitaires. */
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
        )
      );
      /* Pas de skipWaiting() ici : on laisse la nouvelle version en "waiting"
         pour que PWARegister propose explicitement « Actualiser ». */
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('anouanze-') && key !== CACHE)
          .map((key) => caches.delete(key))
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => undefined);
      }
      await self.clients.claim();
    })()
  );
});

/* Message depuis PWARegister pour activer immédiatement la nouvelle version. */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    STATIC_EXT.test(url.pathname)
  );
}

/* Cache-first : sert depuis le cache, met à jour en arrière-plan si absent. */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const fallback = await cache.match(request);
    if (fallback) return fallback;
    throw err;
  }
}

/* Network-first : réseau prioritaire, cache en secours. */
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

/* Navigation : network-first (avec navigation preload) + page /offline en dernier recours. */
async function handleNavigation(event) {
  const cache = await caches.open(CACHE);
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      if (preload.ok) cache.put(event.request, preload.clone());
      return preload;
    }
    const response = await fetch(event.request);
    if (response && response.ok) cache.put(event.request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Hors connexion</title>' +
        '<p style="font-family:sans-serif;padding:2rem">Vous êtes hors connexion.</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  /* Seules les requêtes GET sont éligibles au cache. */
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  /* Ne jamais toucher aux origines tierces ni aux schémas non http. */
  if (url.origin !== self.location.origin) return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* API : jamais interceptée (auth /api/auth/, données /api/v1/, etc.). */
  if (isApiRequest(url)) return;

  /* Ressources Next.js non cachables (HMR, RSC payloads dynamiques). */
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

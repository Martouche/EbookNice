/*
 * Service worker du Guide des Locaux — consultation hors ligne.
 *
 * - Pages : réseau d'abord ; sans réseau, dernière version consultée (favoris, fiches, carnets…),
 *   sinon la page /offline.html.
 * - Fichiers de l'application (/_next/static) : cache d'abord (noms versionnés, jamais modifiés).
 * - Photos et fonds de carte : copie en cache servie tout de suite, rafraîchie en arrière-plan.
 * Le back-office, l'authentification et les requêtes non-GET ne passent jamais par le cache.
 */
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const MEDIA = `media-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const LIMITS = { [PAGES]: 60, [MEDIA]: 400 };

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![PAGES, ASSETS, MEDIA].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Déconnexion : on oublie les pages personnelles mises en cache (favoris, compte…).
self.addEventListener("message", (event) => {
  if (event.data === "clear-pages") event.waitUntil(caches.delete(PAGES).then(() => caches.open(PAGES)).then((c) => c.add(OFFLINE_URL)));
});

async function trim(cacheName) {
  const limit = LIMITS[cacheName];
  if (!limit) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - limit))) await cache.delete(key);
}

async function put(cacheName, request, response) {
  if (!response || !(response.ok || response.type === "opaque")) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  trim(cacheName);
}

async function networkFirstPage(event) {
  const { request } = event;
  try {
    const response = await fetch(request);
    if (response.ok && !response.redirected) event.waitUntil(put(PAGES, request, response.clone()));
    return response;
  } catch {
    return (await caches.match(request, { ignoreVary: true })) ?? (await caches.match(OFFLINE_URL));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  put(ASSETS, request, response.clone());
  return response;
}

async function staleWhileRevalidate(event) {
  const { request } = event;
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => {
      event.waitUntil(put(MEDIA, request, response.clone()));
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}

const MEDIA_HOSTS = ["basemaps.cartocdn.com", "tiles.basemaps.cartocdn.com", "images.unsplash.com", "images.pexels.com"];

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (/^\/(?:en\/)?(?:admin|auth)(?:\/|$)/.test(url.pathname) || url.pathname === "/sw.js") return;
    if (request.mode === "navigate") return event.respondWith(networkFirstPage(event));
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/maplibre/") || url.pathname.startsWith("/icons/")) {
      return event.respondWith(cacheFirst(request));
    }
    if (url.pathname.startsWith("/_next/image")) return event.respondWith(staleWhileRevalidate(event));
    return;
  }

  // Photos Supabase Storage, banques d'images, tuiles et styles de la carte.
  const isStorage = url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/v1/object/public/");
  if (isStorage || MEDIA_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
    event.respondWith(staleWhileRevalidate(event));
  }
});

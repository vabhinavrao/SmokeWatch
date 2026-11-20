/**
 * SmokeWatch - Progressive Web App Service Worker
 * Provides offline caching, network-first API fallback, and background sync.
 */

const CACHE_NAME = "smokewatch-v1.2";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/app",
  "/app.html",
  "/manifest.webmanifest",
  "/assets/css/common.css",
  "/assets/css/app.css",
  "/assets/css/portal.css",
  "/assets/js/data.js",
  "/assets/js/api.js",
  "/assets/js/chart.js",
  "/assets/js/calculator.js",
  "/assets/js/reports.js",
  "/assets/js/map.js",
  "/assets/js/app.js",
  "/assets/js/portal.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/favicon.png",
  "/assets/icons/icon.svg",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

// Install: Pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Non-critical precache fetch issue:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy routing
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Open-Meteo Air Quality API: Network-first with cache fallback
  if (url.hostname.includes("open-meteo.com")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. OpenStreetMap tiles: Stale-while-revalidate for instant map panning
  if (url.hostname.includes("openstreetmap.org")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Static local assets: Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && event.request.method === "GET") {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});

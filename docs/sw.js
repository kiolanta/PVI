const CACHE_NAME = "v1";
const urlsToCache = [
  "/",
  "student.html",
  "/dashboard.html",
  "/tasks.html",
  "/profile.html",
  "/messages.html",
  "/student.css",
  "/task.css",
  "/messages.css",
  "/script.js",
  "/manifest.json",
  "/icons/web-app-manifest-192x192.png",
  "/icons/web-app-manifest-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(urlsToCache.map(url => {
        console.log(`Fetching ${url}`);
        return fetch(url).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`);
          }
          return cache.put(url, response.clone());
        }).catch(err => {
          console.error(`Не вдалося кешувати ${url}:`, err);
        });
      }));
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || networkFetch;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) 
          .map((key) => caches.delete(key))   
      );
    }).then(() => {
      console.log("Новий Service Worker активовано.");
      return self.clients.claim(); 
    })
  );
});
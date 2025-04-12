const CACHE_NAME = "v1";
const urlsToCache = [
  "/",
  "/views/student.html",
  "/views/dashboard.html",
  "/views/tasks.html",
  "/views/profile.html",
  "/views/messages.html",
  "/student.css",
  "/task.css",
  "/messages.css",
  "/script.js",
  "/student.js",
  "/task.js",
  "/dashboard.js",
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
  if (
    event.request.url.includes(".php") ||
    event.request.url.includes("index.php") ||
    event.request.method !== "GET"
  ) {
    return;
  }
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => cachedResponse);
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
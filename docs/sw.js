const CACHE_NAME = "v1";
const urlsToCache = [
  "/",
  "/student.html",
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

// Встановлення SW і кешування файлів
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Кешуємо файли по черзі, щоб мати можливість обробити помилки
      return Promise.all(urlsToCache.map(url => {
        console.log(`Fetching ${url}`);
        return fetch(url).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`);
          }
          return cache.put(url, response);
        }).catch(err => {
          console.error(err);
        });
      }));
    })
  );
});

// Перехоплення запитів
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Оновлення кешу
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (!cacheWhitelist.includes(cache)) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

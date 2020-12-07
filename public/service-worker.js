const CACHE_NAME = "budget-cache-v2";
const DATA_CACHE_NAME = "data-cache-v2";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/idb.js",
    "/assets/css/style.css",
    "/assets/images/icons/icon-72x72.png",
    "/assets/images/icons/icon-96x96.png",
    "/assets/images/icons/icon-128x128.png",
    "/assets/images/icons/icon-144x144.png",
    "/assets/images/icons/icon-152x152.png",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-384x384.png",
    "/assets/images/icons/icon-512x512.png",
];
// Install the service worker
self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(
        CACHE_NAME.then((cache) => {
          console.log("Your files were pre-cashed successfully!");
          return cache.addAll(FILES_TO_CACHE);
        })
      ),
      self.skipWaiting()
    );
  });
  
  // Activate the service worker and remove old data from the cache
  // YOUR CODE HERE
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      cache.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  })
  
  // Intercept fetch requests
  self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch((err) => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
    evt.respondWith(
      fetch(evt.request).catch(function () {
        return caches.match(evt.request).then(function (response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get("accept").includes("text/html")) {
            // return the cached home page for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
  });
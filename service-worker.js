const CACHE_NAME = "tournee-122-v13";

const APP_FILES = [
    "./",
    "./index.html",
    "./zones.json",
    "./manifest.json",
    "./service-worker.js",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)

                    .then(networkResponse => {

                        if (
                            event.request.method === "GET" &&
                            networkResponse.ok
                        ) {

                            const responseClone = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(
                                        event.request,
                                        responseClone
                                    );
                                });

                        }

                        return networkResponse;

                    })

                    .catch(() => {

                        if (event.request.mode === "navigate") {

                            return caches.match("./index.html");

                        }

                    });

            })

    );

});

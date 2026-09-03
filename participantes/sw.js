const CACHE_NAME = "street3x3-v2";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
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

  const request = event.request;

  // El HTML siempre se obtiene actualizado desde GitHub Pages.
  if (
    request.method === "GET" &&
    request.mode === "navigate"
  ) {

    event.respondWith(

      fetch(request, {
        cache: "no-store"
      })

      .then(response => {

        const copy = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put("./index.html", copy);
        });

        return response;

      })

      .catch(() => {
        return caches.match("./index.html");
      })

    );

    return;
  }

  // Para el resto de los archivos usamos caché cuando exista.
  event.respondWith(

    caches.match(request).then(cached => {

      return cached || fetch(request);

    })

  );

});

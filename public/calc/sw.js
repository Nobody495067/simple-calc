const CACHE = "game-library-shell-v7";
const FILES = ["./library.html", "./settings.html", "./manifest.webmanifest", "./directory.html", "./app-icon.svg", "./additions/ambient-lab.html", "./games-manifest.json", "./game-art-manifest.json"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("game-library-shell-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;
  const isPage = request.mode === "navigate" || /\\.html?$/i.test(url.pathname);
  const isManifest = /\\/(?:games-manifest|game-art-manifest)\\.json$/i.test(url.pathname);
  if (isManifest) {
    event.respondWith(fetch(request, { cache: "no-store" }).then(response => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request)));
    return;
  }
  if (isPage) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request)));
    return;
  }
  event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => hit)));
});

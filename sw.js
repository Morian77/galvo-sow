/* Galvo's SOW — offline cache
   Bump CACHE whenever index.html changes, so phones pick up the new build. */
var CACHE = "galvo-sow-v8-20260801";
var ASSETS = ["./", "./index.html", "./manifest.json", "./pdf-lib.min.js", "./pdf.min.js", "./pdf.worker.min.js"];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function networkFirst(req) {
  return fetch(req).then(function (r) {
    if (r && r.status === 200) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return r;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      return hit || caches.match("./index.html");
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  // The app itself and the job list are network-first: online you always get the
  // latest build, offline you fall straight back to the cached copy.
  if (req.mode === "navigate" ||
      req.url.indexOf("index.html") !== -1 ||
      req.url.indexOf("jobs.json") !== -1) {
    e.respondWith(networkFirst(req));
    return;
  }

  // Static libraries never change under the same name — cache first.
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (r) {
        if (r && r.status === 200 && r.type === "basic") {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return r;
      });
    })
  );
});

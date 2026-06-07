/* Service worker: cache app shell so it works offline once installed.
   Amharic TTS still needs internet (Google Translate endpoint). */
const CACHE = "theory-app-v3";
const ASSETS = [
  "./",
  "index.html",
  "questions.js",
  "manifest.webmanifest",
  "icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Never cache / intercept Google Translate (TTS audio + translation API)
  if (url.hostname.includes("translate.google")) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(()=>cached))
  );
});

// Offline cache for Hesabak. Bump VERSION when you change any file.
const VERSION = "hesabak-v3";
const FILES = ["./", "app/", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png",
  "landing/sheet-standard.webp", "landing/sheet-studio.webp", "landing/sheet-bold.webp", "landing/sheet-ledger.webp", "landing/sheet-standard-receipt.webp",
  "landing/fonts/Geist-Variable.woff2", "landing/fonts/jetbrains-mono-latin-500-normal.woff2", "landing/fonts/noto-sans-arabic-arabic-600-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Network first, so updates show up; cache when offline. Offline, a page that was never visited falls back to the app.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match(e.request.mode === "navigate" ? "app/" : "./")))
  );
});

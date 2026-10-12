// Works offline after the first visit. The app and its questions are saved on the phone and updated
// whenever there is connection, so new questions arrive without reinstalling anything.
const V = 'egel-com-1';
const CORE = ['./', './index.html', './preguntas.js', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // only this app's old copies: other apps on the same github.io address keep theirs
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('egel-com-') === 0 && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // newest copy when online, the saved one when not
  e.respondWith(fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); } return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});

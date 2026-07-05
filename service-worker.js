self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('highlighter-cache-v2').then(cache =>
      cache.addAll([
        './',
        './index.html',
        './style.css',
        './script.js',
        './manifest.json',
        './legal.css',
        './privacy.html',
        './support.html',
        './delete.html',
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== 'highlighter-cache-v2').map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isLegalPage = /privacy\.html|support\.html|delete\.html|legal\.css/.test(url.pathname);

  if (isLegalPage) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

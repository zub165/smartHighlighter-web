self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('highlighter-cache-v1').then(cache =>
      cache.addAll([
        './',
        './index.html',
        './style.css',
        './script.js',
        './manifest.json',
        './icons/icon-192.png',
        './icons/icon-512.png',
        'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      ])
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

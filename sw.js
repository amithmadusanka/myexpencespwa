const CACHE_NAME = 'expense-tracker-v1';
const ASSETS = [
  'index.html',
  'app.js',
  'manifest.json'
];

// Cache core assets on installation for offline access
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

// Serve assets from cache if offline
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(response => response || fetch(e.request)));
});
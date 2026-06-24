/* WaziHub service worker — offline shell */
const CACHE_NAME = 'wazihub-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/budget-intelligence.css',
  './icons/icon.svg',
  './data/i18n.js',
  './data/budget-intelligence.js',
  './data/contracts.js',
  './data/projects.js',
  './data/barazas-demo.js',
  './js/i18n.js',
  './js/utils.js',
  './js/report.js',
  './js/budget-intelligence.js',
  './js/contracts.js',
  './js/main.js',
  './js/pwa.js',
  './reports/PPIP-001-Report.pdf',
  './reports/PPIP-002-Report.pdf',
  './reports/PPIP-003-Report.pdf',
  './reports/PPIP-004-Report.pdf'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  if (event.request.method !== 'GET') {
    return;
  }
  if (url.pathname.indexOf('/api/') !== -1) {
    event.respondWith(
      fetch(event.request).catch(function () {
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});

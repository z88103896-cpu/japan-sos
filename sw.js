const CACHE_NAME = 'sos-safety-pro-v8';
const assets = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1161/1161388.png',
  'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of assets) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Cache warning: ' + asset);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    clients.claim().then(async () => {
      const allClients = await self.clients.matchAll();
      allClients.forEach(client => client.postMessage({ type: 'CACHE_SUCCESS' }));
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // إرجاع الملف من الكاش أو محاولة جلبه من الإنترنت
      return response || fetch(event.request).catch(() => {
        // في حالة الفشل التام (أوفلاين أو كاش ممسوح)، أظهر الصفحة الرئيسية للطوارئ
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});

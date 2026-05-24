const CACHE = 'fieldtrip-v1';
const ASSETS = ['./teacher.html','./student.html','./index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});

// 푸시 알림 수신
self.addEventListener('push', e => {
  const data = e.data?.json() || { title:'알림', body:'새 알림이 있습니다.' };
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'fieldtrip',
    requireInteraction: data.urgent || false,
    actions: data.actions || []
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.action === 'teacher' ? './teacher.html' : './student.html'));
});

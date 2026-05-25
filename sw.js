var CACHE = 'fieldtrip-v3';
var ASSETS = ['./teacher.html', './student.html', './index.html'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS).catch(function(){});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  
  // 외부 API 요청은 캐시하지 않고 네트워크로 직접 전달
  if (url.includes('api.vworld.kr') || 
      url.includes('safemap.go.kr') || 
      url.includes('openstreetmap.org') ||
      url.includes('nominatim') ||
      url.includes('overpass-api') ||
      url.includes('anthropic.com') ||
      url.includes('fonts.googleapis.com') ||
      url.includes('jsdelivr.net') ||
      url.includes('unpkg.com')) {
    // 외부 API는 그냥 통과 (캐시 안 함)
    return;
  }
  
  // 로컬 파일만 캐시 전략 적용
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseClone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, responseClone);
        });
        return response;
      }).catch(function() {
        return cached || new Response('오프라인 상태입니다.', {status: 503});
      });
    })
  );
});

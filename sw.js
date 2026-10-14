/* 球球宝藏库 —— 离线缓存（网络优先，断网时用缓存） */
var CACHE = 'qq-treasure-v2';

self.addEventListener('install', function(){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.indexOf('api.github.com') >= 0) return;  // 云端同步接口不缓存，保证拿到最新数据
  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match(req, { ignoreSearch: true });
    })
  );
});

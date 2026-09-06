const CACHE='nema-drive-shell-v4';
const SHELL=[
  './','./index.html','./traffic-lights.js','./vehicle-protocol.js','./navigation-core.js','./route-provider.js','./nema-drive-offline-routing.js','./nema-native-bridge.js',
  './map-provider.js','./nema-drive-map-core.js','./nema-drive-data-config.js','./nema-drive-offline-cache.js',
  './speed-limit-engine.js','./enforcement-engine.js','./traffic-engine.js','./navigation-intelligence.js',
  './navigation-runtime-bridge.js','./navigation-ui-runtime.js','./navigation-voice.js','./navigation-live-data.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});

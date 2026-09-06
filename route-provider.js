/* NEMA Route Provider v2. Provider-neutral routing with production adapter hooks. */
(function(){'use strict';
 const providers={};
 const normalize=(x,name)=>({distanceM:Number(x.distanceM)||0,durationSec:Number(x.durationSec)||0,geometry:x.geometry||null,steps:Array.isArray(x.steps)?x.steps:[],provider:x.provider||name,confidence:x.confidence||'provider',trafficAware:!!x.trafficAware});
 async function fetchWithTimeout(url,options={},timeoutMs=10000){const c=new AbortController();const timer=setTimeout(()=>c.abort(),timeoutMs);try{return await fetch(url,{...options,signal:c.signal});}finally{clearTimeout(timer);}}
 async function osrm({from,to,profile='driving',timeoutMs=10000}){
  if(!from||!to)throw new Error('Başlangıç ve hedef gerekli.');
  const url=`https://router.project-osrm.org/route/v1/${profile}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson&steps=true`;
  const r=await fetchWithTimeout(url,{headers:{Accept:'application/json'}},timeoutMs);if(!r.ok)throw new Error(`Rota servisi HTTP ${r.status}`);
  const d=await r.json();if(d.code!=='Ok'||!d.routes?.length)throw new Error('Rota bulunamadı.');const x=d.routes[0];
  return normalize({distanceM:x.distance,durationSec:x.duration,geometry:x.geometry,steps:(x.legs||[]).flatMap(l=>l.steps||[]).map(s=>({name:s.name||'',distanceM:s.distance,durationSec:s.duration,maneuver:s.maneuver||null})),provider:'OSRM',confidence:'provider',trafficAware:false},'OSRM');
 }
 providers.osrm=osrm;
 async function route(opts={}){
  const p=opts.provider||'osrm';
  if(p==='here'||p==='mapbox'){
   const native=window.NEMAMapProvider?.providers?.[p==='here'?'here-native':'mapbox-native'];
   if(!native)throw new Error(`${p} native adapter henüz bağlanmadı. API anahtarı ve iOS SDK yapılandırması gerekir.`);
  }
  if(!providers[p])throw new Error(`Bilinmeyen rota sağlayıcısı: ${p}`);
  const result=await providers[p](opts);if(window.NEMANavigation)window.NEMANavigation.setRoute(result);return result;
 }
 window.NEMARouteProvider={route,providers,normalize};
})();

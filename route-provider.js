/* NEMA Route Provider v3
 * Provider-neutral routing with validation, quality metadata and production adapter hooks.
 */
(function(){'use strict';
 const providers={};
 const finite=v=>Number.isFinite(Number(v));
 const validPoint=p=>p&&finite(p.lat)&&finite(p.lon)&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180;
 const normalize=(x,name)=>({distanceM:Math.max(0,Number(x.distanceM)||0),durationSec:Math.max(0,Number(x.durationSec)||0),geometry:x.geometry||null,steps:Array.isArray(x.steps)?x.steps:[],provider:x.provider||name,confidence:x.confidence||'provider',trafficAware:!!x.trafficAware,alternatives:Array.isArray(x.alternatives)?x.alternatives:[],updatedAt:x.updatedAt||Date.now()});
 const routeQuality=r=>({usable:r?.confidence==='exact'||(!!(r?.geometry?.coordinates?.length)&&r.distanceM>0&&r.durationSec>0),hasSteps:!!r?.steps?.length,trafficAware:!!r?.trafficAware,confidence:r?.confidence||'unknown',provider:r?.provider||'unknown'});
 async function fetchWithTimeout(url,options={},timeoutMs=10000){const c=new AbortController();const timer=setTimeout(()=>c.abort(),timeoutMs);try{return await fetch(url,{...options,signal:c.signal});}finally{clearTimeout(timer);}}
 async function osrm({from,to,profile='driving',timeoutMs=10000,alternatives=false}){
  if(!validPoint(from)||!validPoint(to))throw new Error('Geçerli başlangıç ve hedef koordinatları gerekli.');
  if(from.lat===to.lat&&from.lon===to.lon)return normalize({distanceM:0,durationSec:0,geometry:null,steps:[],provider:'OSRM',confidence:'exact'},'OSRM');
  const url=`https://router.project-osrm.org/route/v1/${encodeURIComponent(profile)}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson&steps=true&alternatives=${alternatives?'true':'false'}`;
  const r=await fetchWithTimeout(url,{headers:{Accept:'application/json'}},timeoutMs);if(!r.ok)throw new Error(`Rota servisi HTTP ${r.status}`);
  const d=await r.json();if(d.code!=='Ok'||!d.routes?.length)throw new Error('Rota bulunamadı.');
  const convert=x=>normalize({distanceM:x.distance,durationSec:x.duration,geometry:x.geometry,steps:(x.legs||[]).flatMap(l=>l.steps||[]).map(s=>({name:s.name||'',distanceM:s.distance,durationSec:s.duration,maneuver:s.maneuver||null,mode:s.mode||null})),provider:'OSRM',confidence:'provider',trafficAware:false},'OSRM');
  const main=convert(d.routes[0]);main.alternatives=(d.routes||[]).slice(1).map(convert);return main;
 }
 providers.osrm=osrm;
 async function route(opts={}){
  const p=opts.provider||'osrm';
  if(p==='here'||p==='mapbox'){
   const native=window.NEMAMapProvider?.providers?.[p==='here'?'here-native':'mapbox-native'];
   if(!native)throw new Error(`${p} native adapter henüz bağlanmadı. API anahtarı ve iOS SDK yapılandırması gerekir.`);
  }
  if(!providers[p])throw new Error(`Bilinmeyen rota sağlayıcısı: ${p}`);
  const result=normalize(await providers[p](opts),p);
  if(!routeQuality(result).usable)throw new Error('Rota servisi geçersiz veya eksik rota döndürdü.');
  if(window.NEMANavigation)window.NEMANavigation.setRoute(result);return result;
 }
 window.NEMARouteProvider={route,providers,normalize,routeQuality,validPoint};
})();

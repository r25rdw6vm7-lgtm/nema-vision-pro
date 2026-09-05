/* NEMA Route Provider v1. Browser-safe provider abstraction. */
(function(){'use strict';
 async function osrm({from,to,profile='driving'}){
  if(!from||!to)throw new Error('Başlangıç ve hedef gerekli.');
  const url=`https://router.project-osrm.org/route/v1/${profile}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson&steps=true`;
  const r=await fetch(url);if(!r.ok)throw new Error(`Rota servisi HTTP ${r.status}`);const d=await r.json();if(d.code!=='Ok'||!d.routes?.length)throw new Error('Rota bulunamadı.');const x=d.routes[0];
  return {distanceM:x.distance,durationSec:x.duration,geometry:x.geometry,steps:(x.legs||[]).flatMap(l=>l.steps||[]).map(s=>({name:s.name||'',distanceM:s.distance,durationSec:s.duration,maneuver:s.maneuver||null})),provider:'OSRM',confidence:'provider'};
 }
 const providers={osrm};
 async function route(opts){const p=opts?.provider||'osrm';if(!providers[p])throw new Error(`Bilinmeyen rota sağlayıcısı: ${p}`);const result=await providers[p](opts);if(window.NEMANavigation)window.NEMANavigation.setRoute(result);return result;}
 window.NEMARouteProvider={route,providers};
})();

/* NEMA Drive Navigation - UI Runtime v2
 * Keeps the legacy prototype UI synchronized with canonical navigation state.
 * The UI never becomes the source of truth. Loads the premium driving interaction layer.
 */
(function(){'use strict';
 const $=id=>document.getElementById(id);
 const text=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
 const num=v=>Number.isFinite(Number(v))?Number(v):null;
 function fmtDistance(m){const v=num(m);return v==null?'--':v>=1000?(v/1000).toFixed(1)+' km':Math.round(v)+' m';}
 function fmtEta(sec){const v=num(sec);if(v==null)return '--';const min=Math.max(1,Math.round(v/60));return min>=60?`${Math.floor(min/60)} sa ${min%60} dk`:`${min} dk`;}
 function loadPremium(){if(document.querySelector('script[data-nema-premium-runtime]'))return;const s=document.createElement('script');s.src='./nema-premium-runtime.js';s.async=false;s.dataset.nemaPremiumRuntime='1';(document.head||document.documentElement).appendChild(s);}
 function render(){const n=window.NEMANavigation,i=window.NEMANavigationIntelligence;if(!n)return;const p=n.state.position,l=n.state.speedLimit,r=n.state.route;
  if(p?.speedKmh!=null)text('speed',Math.max(0,Math.round(p.speedKmh)));
  if(l?.value!=null)text('limit',l.value);
  if(r){const summary=n.routeSummary(p?.speedKmh);if(summary){text('distance',fmtDistance(i?.state?.remainingM??r.distanceM));text('eta',fmtEta(i?.state?.etaSec??summary.liveEtaSec));}}
  const safety=n.drivingStatus(p?.speedKmh,l?.value),w=$('warning');if(w){w.className='warn';w.textContent=safety.message;if(safety.status==='over-limit')w.className='warn alert';}
  const quality=i?.state?.gpsQuality;if($('route')&&p){const acc=p.accuracyM!=null?` • doğruluk ±${Math.round(p.accuracyM)} m`:'';$('route').textContent=`GPS ${quality||'unknown'}${acc}`;}
  const routeState=$('nema-route-state');if(routeState)routeState.textContent=i?.state?.offRoute?'Rota dışı, yeniden rota hesaplanıyor':'Rota üzerinde';
  const cam=$('camera'),e=n.nearestEnforcement(1800,{verifiedOnly:true});if(cam&&e)cam.textContent=`${e.type==='speed_camera'?'Hız kamerası':'Denetim'} • ${Math.round(e.distanceM)} m`;
 }
 function bind(){if(window.NEMAUIRuntime)return;window.NEMAUIRuntime={render};loadPremium();['nema:position','nema:speed-limit','nema:route','nema:intelligence','nema:traffic','nema:enforcement','nema:reroute'].forEach(ev=>window.addEventListener(ev,render));setInterval(render,1000);render();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

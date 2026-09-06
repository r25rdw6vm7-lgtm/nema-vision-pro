/* NEMA Drive Navigation - UI Runtime v5
 * Canonical UI synchronization with stability, premium driving and mobile layers.
 */
(function(){'use strict';
 const $=id=>document.getElementById(id);
 const text=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
 const num=v=>Number.isFinite(Number(v))?Number(v):null;
 function fmtDistance(m){const v=num(m);return v==null?'--':v>=1000?(v/1000).toFixed(1)+' km':Math.round(v)+' m';}
 function fmtEta(sec){const v=num(sec);if(v==null)return '--';const min=Math.max(1,Math.round(v/60));return min>=60?`${Math.floor(min/60)} sa ${min%60} dk`:`${min} dk`;}
 function loadScript(src,attr){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(attr,'1');(document.head||document.documentElement).appendChild(s);}
 function loadPremium(){loadScript('./nema-stability-runtime.js','data-nema-stability-runtime');loadScript('./nema-navigation-orchestrator.js','data-nema-navigation-orchestrator');loadScript('./nema-premium-runtime.js','data-nema-premium-runtime');loadScript('./nema-mobile-polish.js','data-nema-mobile-polish');loadScript('./nema-premium-navigation-suite.js','data-nema-premium-navigation-suite');}
 function render(){const n=window.NEMANavigation,i=window.NEMANavigationIntelligence,q=window.NEMANavigationQuality,s=window.NEMAStability?.state;if(!n)return;const p=n.state.position,l=n.state.speedLimit,r=n.state.route;
  const canonicalSpeed=q?.state?.speedKmh??p?.speedKmh;
  if(p?.speedKmh!=null||Number.isFinite(Number(canonicalSpeed)))text('speed',q&&['initializing','rejected'].includes(q.state.speedConfidence)?'--':Math.max(0,Math.round(Number(canonicalSpeed)||0)));
  if(l?.value!=null)text('limit',l.value);
  if(r){const summary=n.routeSummary(p?.speedKmh);if(summary){text('distance',fmtDistance(i?.state?.remainingM??r.distanceM));text('eta',fmtEta(i?.state?.etaSec??summary.liveEtaSec));}}
  const safety=n.drivingStatus(p?.speedKmh,l?.value),w=$('warning');if(w){w.className='warn';w.textContent=safety.message;if(safety.status==='over-limit')w.className='warn alert';if(s?.gpsState==='stale'){w.className='warn alert';w.textContent='GPS verisi güncel değil. Güvenli sürüş için konumu kontrol edin.';}}
  const quality=i?.state?.gpsQuality;if($('route')&&p){const acc=p.accuracyM!=null?` • doğruluk ±${Math.round(p.accuracyM)} m`:'';const confidence=q?.state?.speedConfidence&&q.state.speedConfidence!=='initializing'?` • hız ${q.state.speedConfidence}`:'';const gpsState=s?.gpsState==='stale'?' • GPS gecikmeli':s?.gpsState==='degraded'?' • GPS zayıf':'';$('route').textContent=`GPS ${quality||'unknown'}${acc}${confidence}${gpsState}`;}
  const routeState=$('nema-route-state');if(routeState)routeState.textContent=i?.state?.offRoute?'Rota dışı, yeniden rota hesaplanıyor':'Rota üzerinde';
  const cam=$('camera'),e=n.nearestEnforcement(1800,{verifiedOnly:true});if(cam)cam.textContent=e?`${e.type==='speed_camera'?'Hız kamerası':'Denetim'} • ${Math.round(e.distanceM)} m`:'Doğrulanmış veri yok';
 }
 function bind(){if(window.NEMAUIRuntime)return;window.NEMAUIRuntime={render};loadPremium();['nema:position','nema:speed-limit','nema:route','nema:intelligence','nema:traffic','nema:enforcement','nema:reroute','nema:quality','nema:stability'].forEach(ev=>window.addEventListener(ev,render));setInterval(render,1000);render();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

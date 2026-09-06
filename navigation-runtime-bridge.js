/* NEMA Drive Navigation - Runtime Bridge v2
 * Canonical GPS -> intelligence -> voice -> reroute event pipeline.
 */
(function(){'use strict';
 const nav=()=>window.NEMANavigation, intel=()=>window.NEMANavigationIntelligence, voice=()=>window.NEMAVoice;
 const text=(s,v)=>{const e=document.querySelector(s);if(e)e.textContent=v;};
 function setDestination(p){const n=nav();return n?.setDestination?.(p)||null;}
 function updatePosition(p){const n=nav(),i=intel(),v=voice();if(!n||!p)return null;const pos=n.setPosition(p);if(!pos)return null;const snap=i?.update(pos);if(!snap)return null;if(snap.offRoute){text('#nema-route-state','Rota dışı, yeniden rota hesaplanıyor');v?.offRoute(true);if(i.rerouteAllowed()&&!i.state.reroutePending)i.reroute();}else{text('#nema-route-state','Rota üzerinde');v?.backOnRoute();}updateVoice();return snap;}
 function updateRoute(r){const n=nav();if(!n||!r)return null;const result=n.setRoute(r);updateVoice();return result;}
 function updateVoice(){const n=nav(),i=intel(),v=voice();if(!n||!v)return false;const speed=n.state.position?.speedKmh,limit=n.state.speedLimit?.value;if(limit!=null)v.overLimit(speed,limit);const next=i?.state?.nextStep;if(next?.step&&Number.isFinite(next.distanceM)&&next.distanceM<=650)v.maneuver(next.step,next.distanceM);const enforcement=n.nearestEnforcement(1200,{verifiedOnly:true});if(enforcement)v.enforcement(enforcement);return true;}
 function bind(){
  window.addEventListener('nema:position',e=>updatePosition(e.detail));
  window.addEventListener('nema:route',e=>updateRoute(e.detail));
  window.addEventListener('nema:speed-limit',updateVoice);
  window.addEventListener('nema:enforcement',updateVoice);
  window.addEventListener('nema:intelligence',updateVoice);
  window.addEventListener('nema:destination',e=>setDestination(e.detail));
  window.addEventListener('nema:reroute',()=>voice()?.speak('Yeni rota oluşturuldu.',{key:'reroute-complete',cooldownMs:15000}));
  window.addEventListener('nema:reroute-error',()=>voice()?.speak('Yeni rota hesaplanamadı. Güvenli bir yerde kontrol edin.',{key:'reroute-error',cooldownMs:30000}));
 }
 if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();}
 window.NEMANavigationRuntime={setDestination,updatePosition,updateRoute,updateVoice};
})();
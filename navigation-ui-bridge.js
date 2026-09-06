/* NEMA Drive Navigation - UI Bridge v1
 * Connects the existing web UI to the canonical navigation/intelligence/voice state.
 */
(function(){'use strict';
 const nav=()=>window.NEMANavigation, intel=()=>window.NEMANavigationIntelligence, voice=()=>window.NEMAVoice;
 const $=s=>document.querySelector(s);
 const text=(sel,value)=>{const el=$(sel);if(el)el.textContent=value;};
 function destinationFromLegacy(){if(!nav||!window.target)return null;return nav.setDestination(window.target);}
 function updatePosition(p){const n=nav();if(!n)return;const pos=n.setPosition(p);if(!pos)return;const i=intel();const snap=i?.update(pos);if(snap){text('#nema-route-state',snap.offRoute?'Rota dışı, yeniden rota hazırlanıyor':'Rota üzerinde');}}
 function updateRoute(r){const n=nav();if(!n||!r)return;const route=n.setRoute(r);if(route)destinationFromLegacy();}
 function updateVoice(){const n=nav(),v=voice();if(!n||!v)return;const speed=n.state.position?.speedKmh,limit=n.state.speedLimit?.value;if(limit!=null){v.overLimit(speed,limit);v.speedLimit(limit);}const i=intel();const next=i?.state?.nextStep;if(next?.step&&next.distanceM<=650)v.maneuver(next.step,next.distanceM);}
 function bind(){
  destinationFromLegacy();
  window.addEventListener('nema:position',e=>updatePosition(e.detail));
  window.addEventListener('nema:route',e=>{destinationFromLegacy();updateVoice();});
  window.addEventListener('nema:speed-limit',()=>updateVoice());
  window.addEventListener('nema:intelligence',()=>updateVoice());
  window.addEventListener('nema:destination',e=>{if(e.detail)window.target=e.detail;});
  window.addEventListener('nema:reroute',()=>{if(voice())voice().speak('Yeni rota oluşturuldu.',{key:'reroute-complete',cooldownMs:15000});});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
 window.NEMANavigationUI={updatePosition,updateRoute,updateVoice,destinationFromLegacy};
})();
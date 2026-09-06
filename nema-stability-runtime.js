/* NEMA Drive Stability Runtime v1
 * Defensive runtime for production-like browser sessions.
 * It does not fabricate GPS, traffic, route or enforcement data.
 */
(function(){'use strict';
 const state={started:false,lastPositionAt:0,lastGoodSpeedAt:0,gpsState:'waiting',pageVisible:true,errors:0,lastError:null,watchdog:null};
 const now=()=>Date.now();
 const emit=(name,detail={})=>window.dispatchEvent(new CustomEvent(name,{detail}));
 function setGpsState(v){if(state.gpsState===v)return;state.gpsState=v;emit('nema:stability',{gpsState:v});}
 function position(e){const p=e?.detail||{};const lat=Number(p.lat),lon=Number(p.lon),acc=Number(p.accuracyM);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;state.lastPositionAt=now();if(Number.isFinite(acc)&&acc<=100)setGpsState('active');else setGpsState('degraded');if(Number.isFinite(Number(p.speedKmh))&&Number(p.speedKmh)>=0)state.lastGoodSpeedAt=now();}
 function quality(e){const p=e?.detail||{};if(['initializing','rejected'].includes(p.speedConfidence))return;const s=Number(p.speedKmh);if(Number.isFinite(s)&&s>=0)state.lastGoodSpeedAt=now();}
 function watchdog(){if(!state.started)return;const age=state.lastPositionAt?now()-state.lastPositionAt:Infinity;if(age>15000)setGpsState('stale');else if(age>6000)setGpsState('degraded');else if(state.lastPositionAt)setGpsState('active');emit('nema:stability-heartbeat',{gpsState:state.gpsState,positionAgeMs:Number.isFinite(age)?age:null,pageVisible:state.pageVisible});}
 function visibility(){state.pageVisible=!document.hidden;emit('nema:visibility',{visible:state.pageVisible});}
 function errors(e){state.errors++;state.lastError={message:String(e?.message||e||'unknown'),at:now()};emit('nema:runtime-error',state.lastError);}
 function start(){if(state.started)return;state.started=true;window.addEventListener('nema:position',position);window.addEventListener('nema:quality',quality);document.addEventListener('visibilitychange',visibility);window.addEventListener('error',errors);window.addEventListener('unhandledrejection',e=>errors(e.reason||e));state.watchdog=setInterval(watchdog,3000);window.NEMAStability={state,start,watchdog};}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

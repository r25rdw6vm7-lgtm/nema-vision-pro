/* NEMA Drive Navigation - Navigation Core v1
 * Provider-agnostic route and driving safety orchestration.
 * External providers must supply verified data. No enforcement evasion logic.
 */
(function(){'use strict';
 const state={route:null,speedLimit:null,enforcement:[],traffic:null,position:null,lastUpdate:0};
 const n=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function normalizeSpeedLimit(x){if(x==null)return null;const v=n(x.value??x.speedLimitKmh??x.limit);if(v==null||v<5||v>160)return null;return {value:Math.round(v),unit:'km/h',source:x.source||'unknown',confidence:x.confidence||'unknown',temporary:!!x.temporary,updatedAt:x.updatedAt||Date.now()};}
 function setSpeedLimit(x){state.speedLimit=normalizeSpeedLimit(x);emit('nema:speed-limit',state.speedLimit);return state.speedLimit;}
 function setRoute(r){if(!r)return null;state.route={distanceM:n(r.distanceM,0),durationSec:n(r.durationSec,0),geometry:r.geometry||null,steps:Array.isArray(r.steps)?r.steps:[],provider:r.provider||'unknown',confidence:r.confidence||'unknown'};emit('nema:route',state.route);return state.route;}
 function setTraffic(t){state.traffic=t?{level:t.level||'unknown',delaySec:n(t.delaySec,0),speedKmh:n(t.speedKmh),source:t.source||'unknown',confidence:t.confidence||'unknown',updatedAt:t.updatedAt||Date.now()}:null;emit('nema:traffic',state.traffic);return state.traffic;}
 function setEnforcement(list){state.enforcement=(list||[]).filter(Boolean).map(x=>({type:x.type||'unknown',distanceM:n(x.distanceM,0),direction:x.direction||null,limitKmh:n(x.limitKmh),source:x.source||'unknown',confidence:x.confidence||'unknown',verified:!!x.verified,updatedAt:x.updatedAt||Date.now()})).filter(x=>x.distanceM>=0);emit('nema:enforcement',state.enforcement);return state.enforcement;}
 function drivingStatus(speedKmh,limitKmh){const s=n(speedKmh),l=n(limitKmh);if(s==null||l==null)return {status:'unknown',deltaKmh:null,message:'Hız veya hız limiti doğrulanıyor.'};const d=Math.round(s-l);return d>2?{status:'over-limit',deltaKmh:d,message:`Hız limiti ${d} km/h aşılmış.`}:d>0?{status:'near-limit',deltaKmh:d,message:'Hız limiti sınırındasınız.'}:{status:'within-limit',deltaKmh:d,message:'Hızınız yasal limit içinde.'};}
 function nearestEnforcement(maxDistanceM=5000){return state.enforcement.filter(x=>x.distanceM<=maxDistanceM).sort((a,b)=>a.distanceM-b.distanceM)[0]||null;}
 function eta(distanceM,speedKmh){const d=n(distanceM),s=n(speedKmh);return d==null||s==null||s<=0?null:d/(s/3.6);}
 function emit(name,detail){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}));}
 window.NEMANavigation={state,setSpeedLimit,normalizeSpeedLimit,setRoute,setTraffic,setEnforcement,drivingStatus,nearestEnforcement,eta};
})();

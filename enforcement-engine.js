/* NEMA Drive Navigation - Enforcement Intelligence Engine v1
 * Route-relevant enforcement, verified filtering and average-speed corridor lifecycle.
 * Supports lawful awareness only. No evasion or speeding logic.
 */
(function(){'use strict';
 const state={items:[],activeCorridor:null,updatedAt:0};
 const now=()=>Date.now();
 const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 const normType=t=>{const s=String(t||'unknown').toLowerCase();if(s.includes('average')||s.includes('section'))return'average-speed';if(s.includes('red'))return'red-light';if(s.includes('speed')||s.includes('camera')||s.includes('radar'))return'speed-camera';return s};
 function normalize(x){if(!x)return null;const updatedAt=num(x.updatedAt,now());return {id:x.id??null,type:normType(x.type),distanceM:Math.max(0,num(x.distanceM,0)),direction:x.direction||null,limitKmh:num(x.limitKmh),source:x.source||'unknown',confidence:x.confidence||'unknown',verified:!!x.verified,routeRelevant:x.routeRelevant!==false,wayId:x.wayId??null,startPoint:x.startPoint||null,endPoint:x.endPoint||null,lengthM:num(x.lengthM),updatedAt,expiresAt:num(x.expiresAt)};}
 function ingest(list){state.items=(Array.isArray(list)?list:[list]).map(normalize).filter(Boolean);state.updatedAt=now();return state.items;}
 function directionMatch(x,d){if(!x.direction||d==null)return true;const a=String(x.direction).toLowerCase(),b=String(d).toLowerCase();return a==='both'||a===b;}
 function relevant(ctx={}){const t=now(),maxAge=num(ctx.maxAgeMs,300000);return state.items.filter(x=>x.routeRelevant&&directionMatch(x,ctx.direction)&&(!ctx.verifiedOnly||x.verified)&&(!x.expiresAt||x.expiresAt>t)&&t-x.updatedAt<=maxAge&&(ctx.maxDistanceM==null||x.distanceM<=ctx.maxDistanceM));}
 function nearest(ctx={}){return relevant(ctx).sort((a,b)=>a.distanceM-b.distanceM)[0]||null;}
 function corridorLifecycle(corridor,positionDistanceM,elapsedSec){const c=normalize(corridor),d=num(positionDistanceM),t=num(elapsedSec);if(!c||c.type!=='average-speed')return{status:'unknown'};if(d==null)return{status:'approaching',corridor:c};if(d<=0)return{status:'approaching',corridor:c};if(c.lengthM&&d<c.lengthM){const avg=t&&t>0?d/(t/3600):null;const over=avg!=null&&c.limitKmh!=null&&avg>c.limitKmh+0.5;state.activeCorridor=c;return{status:over?'over-limit':'active',corridor:c,averageKmh:avg};}state.activeCorridor=null;return{status:'completed',corridor:c};}
 function clearStale(maxAgeMs=300000){const t=now();state.items=state.items.filter(x=>(!x.expiresAt||x.expiresAt>t)&&t-x.updatedAt<=maxAgeMs);if(state.activeCorridor&&!state.items.includes(state.activeCorridor))state.activeCorridor=null;return state.items;}
 function status(){clearStale();return{count:state.items.length,activeCorridor:state.activeCorridor,updatedAt:state.updatedAt};}
 window.NEMAEnforcementEngine={state,normalize,ingest,relevant,nearest,corridorLifecycle,clearStale,status};
})();
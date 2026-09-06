/* NEMA Drive Navigation - Speed Limit Intelligence Engine v2
 * Deterministic precedence, freshness, direction/segment matching, vehicle hooks and canonical-state integration.
 * Never invents a legal limit. Unknown is a valid state.
 */
(function(){'use strict';
 const state={candidates:[],resolved:null,updatedAt:0};
 const now=()=>Date.now();
 const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 const rank=x=>({official:500,verified:400,provider:300,map:200,fallback:100}[String(x||'').toLowerCase()]??0);
 const score=x=>rank(x.confidence)+rank(x.source);
 function normalize(x){if(!x)return null;const value=num(x.value??x.speedLimitKmh??x.limit);if(value==null||value<5||value>160)return null;const updatedAt=num(x.updatedAt,now()),expiresAt=num(x.expiresAt);return {id:x.id??null,value:Math.round(value),unit:'km/h',source:x.source||'unknown',confidence:x.confidence||'unknown',temporary:!!x.temporary,vehicleType:x.vehicleType||null,direction:x.direction||null,wayId:x.wayId??null,highway:x.highway||null,distanceM:num(x.distanceM),updatedAt,expiresAt:expiresAt??null,sourceRank:score(x)};}
 function ingest(list){const input=Array.isArray(list)?list:[list];state.candidates=input.map(normalize).filter(Boolean);state.updatedAt=now();return resolve();}
 function directionMatch(x,d){if(!x.direction||d==null)return true;const a=String(x.direction).toLowerCase(),b=String(d).toLowerCase();return a==='both'||a===b;}
 function compatible(x,ctx={}){if(!directionMatch(x,ctx.direction))return false;if(ctx.wayId!=null&&x.wayId!=null&&String(ctx.wayId)!==String(x.wayId))return false;if(ctx.vehicleType&&x.vehicleType&&x.vehicleType!==ctx.vehicleType)return false;const t=now();if(x.expiresAt&&x.expiresAt<=t)return false;const maxAge=num(ctx.maxAgeMs,300000);return t-x.updatedAt<=maxAge;}
 function resolve(ctx={}){const eligible=state.candidates.filter(x=>compatible(x,ctx)).sort((a,b)=>(score(b)-score(a))||((a.distanceM??Infinity)-(b.distanceM??Infinity)));state.resolved=eligible[0]||null;if(state.resolved&&typeof window!=='undefined'&&window.NEMANavigation?.setSpeedLimit)window.NEMANavigation.setSpeedLimit(state.resolved);return state.resolved;}
 function clearStale(maxAgeMs=300000){const t=now();state.candidates=state.candidates.filter(x=>(!x.expiresAt||x.expiresAt>t)&&t-x.updatedAt<=maxAgeMs);if(state.resolved&&!state.candidates.includes(state.resolved))state.resolved=null;return state.candidates;}
 function status(){clearStale();return {resolved:state.resolved,candidates:state.candidates.length,updatedAt:state.updatedAt,stale:state.candidates.some(x=>now()-x.updatedAt>300000)};}
 window.NEMASpeedLimitEngine={state,normalize,ingest,resolve,clearStale,status};
})();
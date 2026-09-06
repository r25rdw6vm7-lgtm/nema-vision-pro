/* NEMA Drive Navigation - Traffic Intelligence Engine v1
 * Provider-neutral traffic state, freshness, confidence and route ETA impact.
 * Unknown remains unknown. Demo data is never presented as live traffic.
 */
(function(){'use strict';
 const state={current:null,incidents:[],updatedAt:0,providers:{}};
 const now=()=>Date.now();
 const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 const levels=new Set(['free','light','moderate','heavy','severe','unknown']);
 function normalize(x){if(!x)return null;const updatedAt=num(x.updatedAt,now()),level=levels.has(String(x.level||'').toLowerCase())?String(x.level).toLowerCase():'unknown';return {level,delaySec:Math.max(0,num(x.delaySec,0)),speedKmh:num(x.speedKmh),source:x.source||'unknown',confidence:x.confidence||'unknown',updatedAt,expiresAt:num(x.expiresAt),incidents:Array.isArray(x.incidents)?x.incidents.map(normalizeIncident).filter(Boolean):[],live:x.live===true&&String(x.source||'').toLowerCase()!=='demo'};}
 function normalizeIncident(x){if(!x)return null;return{id:x.id??null,type:x.type||'unknown',severity:x.severity||'unknown',description:x.description||'',distanceM:Math.max(0,num(x.distanceM,0)),roadClosed:!!x.roadClosed,source:x.source||'unknown',updatedAt:num(x.updatedAt,now()),expiresAt:num(x.expiresAt)};}
 function ingest(x){state.current=normalize(x);state.incidents=state.current?.incidents||[];state.updatedAt=now();return state.current;}
 function applyToRoute(route){if(!route)return null;const t=state.current;if(!t||t.level==='unknown')return {...route,trafficAware:false,trafficDelaySec:null};return {...route,trafficAware:true,trafficDelaySec:t.delaySec,durationSec:Math.max(0,num(route.durationSec,0)+t.delaySec),trafficLevel:t.level,trafficSource:t.source,trafficConfidence:t.confidence};}
 function clearStale(maxAgeMs=120000){const t=now();if(state.current&&(t-state.current.updatedAt>maxAgeMs||(state.current.expiresAt&&state.current.expiresAt<=t)))state.current=null;state.incidents=state.incidents.filter(x=>t-x.updatedAt<=maxAgeMs&&(!x.expiresAt||x.expiresAt>t));return state.current;}
 function registerProvider(name,adapter){if(!name||typeof adapter!=='object')return false;state.providers[name]=adapter;return true;}
 function status(){clearStale();const c=state.current;return{level:c?.level||'unknown',delaySec:c?.delaySec??null,source:c?.source||'unknown',confidence:c?.confidence||'unknown',live:c?.live===true,incidentCount:state.incidents.length,providerCount:Object.keys(state.providers).length,updatedAt:state.updatedAt};}
 window.NEMATrafficEngine={state,normalize,normalizeIncident,ingest,applyToRoute,clearStale,registerProvider,status};
})();
/* NEMA Drive Navigation - Intelligence Engine v1
 * Route progress, maneuver state, ETA, reroute policy, data freshness and lawful enforcement awareness.
 * No enforcement evasion logic.
 */
(function(){
  'use strict';
  const state={progress:0,remainingM:0,currentStep:0,nextStep:null,etaSec:null,routeConfidence:'unknown',offRoute:false,reroutePending:false,lastRerouteAt:0,lastPosition:null};
  const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rad=d=>d*Math.PI/180;
  function distanceM(a,b){if(!a||!b)return Infinity;const R=6371000,p=rad(1),dLat=(b.lat-a.lat)*p,dLon=(b.lon-a.lon)*p,x=Math.sin(dLat/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
  function routePoints(route){const c=route?.geometry?.coordinates||[];return c.map(x=>({lat:x[1],lon:x[0]}));}
  function routeLength(route){const p=routePoints(route);let d=0;for(let i=1;i<p.length;i++)d+=distanceM(p[i-1],p[i]);return d;}
  function nearestProgress(position,route){const p=routePoints(route);if(!p.length)return {distanceM:Infinity,alongM:0,totalM:0};let best=Infinity,along=0,total=0;for(let i=1;i<p.length;i++){const seg=distanceM(p[i-1],p[i]);const da=distanceM(position,p[i-1]);const db=distanceM(position,p[i]);const candidate=Math.min(da,db);if(candidate<best){best=candidate;along=total+(da<db?0:seg);}total+=seg;}return {distanceM:best,alongM:along,totalM:total};}
  function update(position){const route=window.NEMANavigation?.state?.route;if(!route||!position)return null;const q=nearestProgress(position,route);state.lastPosition=position;state.remainingM=Math.max(0,q.totalM-q.alongM);state.progress=q.totalM?clamp(q.alongM/q.totalM,0,1):0;state.offRoute=q.distanceM>65;state.routeConfidence=route.confidence||'unknown';
    const steps=route.steps||[];let best=null,bestD=Infinity,index=0;steps.forEach((step,i)=>{const loc=step.maneuver?.location;if(!loc)return;const d=distanceM(position,{lat:loc[1],lon:loc[0]});if(d<bestD&&d>5){bestD=d;best=step;index=i;}});state.currentStep=index;state.nextStep=best?{index,distanceM:bestD,step:best}:null;const speed=num(window.NEMATrafficLights?.state?.vehicle?.speedKmh);state.etaSec=route.durationSec!=null&&route.durationSec>0?route.durationSec*(1-state.progress):null;if(speed>5)state.etaSec=state.remainingM/(speed/3.6);emit('nema:intelligence',snapshot());return snapshot();}
  function snapshot(){return {...state};}
  function dataHealth(item,maxAgeMs=120000){if(!item)return {status:'missing',ageMs:null};const age=Math.max(0,Date.now()-num(item.updatedAt,Date.now()));return {status:age<=maxAgeMs?'fresh':'stale',ageMs:age};}
  function drivingSafety(speed,limit){const s=num(speed),l=num(limit);if(s==null||l==null)return {status:'unknown',deltaKmh:null};const delta=Math.round(s-l);return {status:delta>2?'over-limit':delta>0?'near-limit':'within-limit',deltaKmh:delta};}
  function nearestEnforcement(position,items,maxM=5000){return (items||[]).filter(x=>x.verified!==false&&num(x.distanceM)>=0&&num(x.distanceM)<=maxM).sort((a,b)=>a.distanceM-b.distanceM)[0]||null;}
  function rerouteAllowed(now=Date.now(),cooldownMs=15000){return !state.reroutePending&&now-state.lastRerouteAt>=cooldownMs;}
  async function reroute(){if(!rerouteAllowed())return false;if(typeof window.buildRoute!=='function')return false;state.reroutePending=true;state.lastRerouteAt=Date.now();try{await window.buildRoute();state.offRoute=false;return true;}catch(e){return false;}finally{state.reroutePending=false;}}
  function emit(name,detail){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}));}
  window.NEMANavigationIntelligence={state,snapshot,distanceM,routeLength,nearestProgress,update,dataHealth,drivingSafety,nearestEnforcement,rerouteAllowed,reroute};
})();
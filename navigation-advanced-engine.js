/* NEMA Drive Advanced Navigation Engine v1
 * Route preferences, alternatives, waypoints, incidents, community reports,
 * lane guidance, landmark guidance and energy-aware planning contracts.
 * No fabricated live data: providers must ingest real/verified data.
 */
(function(){'use strict';
 const state={
   preferences:{mode:'fastest',avoidTolls:false,avoidHighways:false,avoidFerries:false,avoidUnpaved:false,preferSafer:false,preferFuelEfficient:false},
   waypoints:[],incidents:[],reports:[],lane:null,landmark:null,lastPlan:null
 };
 const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const now=()=>Date.now();
 const validPoint=p=>p&&num(p.lat)!=null&&num(p.lon)!=null&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180;
 function setPreferences(p={}){state.preferences={...state.preferences,...p};return {...state.preferences};}
 function setWaypoints(list=[]){state.waypoints=(Array.isArray(list)?list:[]).filter(validPoint).map((p,i)=>({id:p.id||`wp-${i+1}`,lat:Number(p.lat),lon:Number(p.lon),label:p.label||p.name||`Durak ${i+1}`,stopover:p.stopover!==false}));emit('nema:waypoints',state.waypoints);return state.waypoints;}
 function addWaypoint(p){return setWaypoints([...state.waypoints,p]);}
 function removeWaypoint(id){return setWaypoints(state.waypoints.filter(x=>x.id!==id));}
 function clearWaypoints(){return setWaypoints([]);}
 function routeScore(r={}){
   const p=state.preferences,d=num(r.durationSec,Infinity),dist=num(r.distanceM,Infinity),toll=num(r.tollCost,0),risk=num(r.riskScore,50),fuel=num(r.fuelCost,dist),traffic=num(r.delaySec,0);
   if(!Number.isFinite(d)||!Number.isFinite(dist))return Infinity;
   let score=d+traffic*0.7;
   if(p.mode==='shortest')score=dist/1.2+traffic*0.5;
   if(p.mode==='safest')score=d+risk*30;
   if(p.mode==='eco')score=fuel*300+traffic*0.5+d*0.25;
   if(p.avoidTolls&&toll>0)score+=600+toll*60;
   if(p.avoidHighways&&r.usesHighway)score+=900;
   if(p.avoidFerries&&r.usesFerry)score+=1200;
   if(p.avoidUnpaved&&r.usesUnpaved)score+=1500;
   if(p.preferSafer)score+=risk*20;
   if(p.preferFuelEfficient)score+=fuel*150;
   return score;
 }
 function rankRoutes(routes=[]){return (Array.isArray(routes)?routes:[]).map((r,i)=>({...r,alternativeIndex:i,selectionScore:routeScore(r)})).sort((a,b)=>a.selectionScore-b.selectionScore);}
 function chooseRoute(routes=[]){const ranked=rankRoutes(routes);state.lastPlan=ranked[0]||null;emit('nema:route-choice',state.lastPlan);return {selected:ranked[0]||null,alternatives:ranked.slice(1),ranked};}
 function normalizeIncident(x){if(!x||!validPoint(x))return null;const types=['accident','congestion','roadwork','closed-road','closed-lane','hazard','flood','low-visibility','object','police','speed-camera','weather','other'];const type=types.includes(x.type)?x.type:'other';return {id:x.id||null,type,lat:Number(x.lat),lon:Number(x.lon),distanceM:num(x.distanceM),severity:clamp(num(x.severity,1),1,5),direction:x.direction||null,roadId:x.roadId||null,source:x.source||'unknown',confidence:x.confidence||'unknown',verified:!!x.verified,createdAt:x.createdAt||now(),updatedAt:x.updatedAt||now(),expiresAt:x.expiresAt||null,message:x.message||''};}
 function ingestIncidents(list=[]){const clean=(Array.isArray(list)?list:[]).map(normalizeIncident).filter(Boolean);state.incidents=clean;emit('nema:incidents',state.incidents);return state.incidents;}
 function activeIncidents(maxAgeMs=180000){const t=now();return state.incidents.filter(x=>(!x.expiresAt||x.expiresAt>t)&&t-(x.updatedAt||x.createdAt)<=maxAgeMs);}
 function reportIncident(x){const incident=normalizeIncident({...x,source:x.source||'community',verified:false,createdAt:now(),updatedAt:now()});if(!incident)return null;state.reports.push({...incident,reportCount:1});emit('nema:incident-report',incident);return incident;}
 function confirmIncident(id,confirmed=true){const report=state.reports.find(x=>x.id===id);if(!report)return null;report.confirmed=!!confirmed;report.confirmedAt=now();return report;}
 function laneGuidance(lanes=[],currentIndex=null){const list=(Array.isArray(lanes)?lanes:[]).map((l,i)=>({...l,index:i,allowed:Array.isArray(l.allowed)?l.allowed:[]}));const idx=num(currentIndex);const current=idx==null?null:list[idx]||null;const recommended=current?idx:null;return state.lane={lanes:list,currentIndex:idx,recommendedIndex:recommended,confidence:current?.confidence||'unknown',updatedAt:now()};}
 function landmarkGuidance(items=[],position=null){const list=(Array.isArray(items)?items:[]).filter(Boolean).sort((a,b)=>(num(a.distanceM,Infinity)-num(b.distanceM,Infinity)));const next=list[0]||null;state.landmark={next,position,updatedAt:now()};return state.landmark;}
 function energyEstimate({distanceM=0,elevationGainM=0,consumptionPer100=0,batteryKwh=null,fuelLiters=null}={}){const d=Math.max(0,num(distanceM,0));const elevation=Math.max(0,num(elevationGainM,0));const base=Math.max(0,num(consumptionPer100,0))*d/100;const elevationPenalty=elevation*0.002;const energyKwh=batteryKwh!=null?base+elevationPenalty:null;const fuelLiters=fuelLiters!=null?base+elevationPenalty:null;return {distanceM:d,energyKwh,fuelLiters,estimatedConsumption:base+elevationPenalty};}
 function status(){return {preferences:{...state.preferences},waypoints:state.waypoints.length,activeIncidents:activeIncidents().length,reports:state.reports.length,lane:!!state.lane,landmark:!!state.landmark,lastPlan:state.lastPlan?{provider:state.lastPlan.provider,score:state.lastPlan.selectionScore}:null};}
 function emit(name,detail){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}));}
 window.NEMAAdvancedNavigation={state,setPreferences,setWaypoints,addWaypoint,removeWaypoint,clearWaypoints,routeScore,rankRoutes,chooseRoute,normalizeIncident,ingestIncidents,activeIncidents,reportIncident,confirmIncident,laneGuidance,landmarkGuidance,energyEstimate,status};
})();

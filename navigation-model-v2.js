/* NEMA Drive Navigation Intelligence Model v2
   Unifies route, traffic, safety, POI, personalization, EV and confidence signals.
   It never fabricates external/live data.
*/
(function(){
'use strict';
const state={version:2,mode:'driving',confidence:0,route:null,traffic:null,incidents:[],pois:[],lane:null,ev:null,lastDecision:null};
const n=x=>Number.isFinite(Number(x))?Number(x):null;
function confidence(parts=[]){const v=parts.filter(Number.isFinite);if(!v.length)return 0;return Math.round(v.reduce((a,b)=>a+b,0)/v.length);}
function ingest(input={}){if(input.route)state.route=input.route;if(input.traffic)state.traffic=input.traffic;if(Array.isArray(input.incidents))state.incidents=input.incidents;if(Array.isArray(input.pois))state.pois=input.pois;if(input.lane)state.lane=input.lane;if(input.ev)state.ev=input.ev;state.confidence=confidence([n(input.gpsConfidence),n(input.routeConfidence),n(input.trafficConfidence),n(input.dataConfidence)]);state.lastDecision=Date.now();return snapshot();}
function safety(){const route=state.route||{},traffic=state.traffic||{};let score=100;if(traffic.level==='severe')score-=25;if(traffic.level==='heavy')score-=12;if(route.confidence!=null&&route.confidence<60)score-=20;if(state.confidence<50)score-=15;return Math.max(0,Math.min(100,Math.round(score)));}
function decision(){const safe=safety();const traffic=state.traffic?.level||'unknown';let action='continue';if(safe<50)action='reassess';else if(traffic==='severe'||traffic==='heavy')action='consider-alternative';return {action,safetyScore:safe,confidence:state.confidence,traffic};}
function snapshot(){return JSON.parse(JSON.stringify({version:state.version,mode:state.mode,confidence:state.confidence,route:state.route,traffic:state.traffic,incidents:state.incidents,pois:state.pois,lane:state.lane,ev:state.ev,lastDecision:state.lastDecision}));}
window.NEMANavigationModel={state,ingest,safety,decision,snapshot,confidence};
})();

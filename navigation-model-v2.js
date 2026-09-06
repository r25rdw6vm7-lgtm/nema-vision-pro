/* NEMA Drive Navigation Intelligence Model v3
   Fuses route, traffic, safety, POI, personalization, EV, lane and perception signals.
   No fabricated live data and no unsafe speed recommendations.
*/
(function(){'use strict';
const state={version:3,mode:'driving',confidence:0,route:null,traffic:null,incidents:[],pois:[],lane:null,ev:null,vision:[],personalization:null,lastDecision:null};
const n=x=>Number.isFinite(Number(x))?Number(x):null;const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function confidence(parts=[]){const v=parts.map(n).filter(Number.isFinite);if(!v.length)return 0;return Math.round(v.reduce((a,b)=>a+b,0)/v.length);}
function ingest(input={}){if(input.route)state.route=input.route;if(input.traffic)state.traffic=input.traffic;if(Array.isArray(input.incidents))state.incidents=input.incidents;if(Array.isArray(input.pois))state.pois=input.pois;if(input.lane)state.lane=input.lane;if(input.ev)state.ev=input.ev;if(Array.isArray(input.vision))state.vision=input.vision;if(input.personalization)state.personalization=input.personalization;state.confidence=confidence([input.gpsConfidence,input.routeConfidence,input.trafficConfidence,input.dataConfidence,input.visionConfidence]);state.lastDecision=Date.now();return snapshot();}
function safety(){const route=state.route||{},traffic=state.traffic||{};let score=100;if(traffic.level==='severe')score-=25;if(traffic.level==='heavy')score-=12;if(route.confidence!=null&&route.confidence<60)score-=20;if(state.confidence<50)score-=15;if(state.lane?.confidence!=null&&state.lane.confidence<50)score-=8;const dangerous=state.incidents.filter(i=>['accident','closure','hazard','laneClosure'].includes(i.type)&&i.verified!==false).length;score-=Math.min(25,dangerous*8);return clamp(Math.round(score),0,100);}
function routeDecision(){const safe=safety(),traffic=state.traffic?.level||'unknown';if(safe<45)return 'reassess';if(traffic==='severe'||traffic==='heavy')return 'consider-alternative';if(state.ev?.needsCharge===true)return 'energy-stop-required';return 'continue';}
function safeSpeed(limit){const l=n(limit);if(l==null)return {known:false};return {known:true,maxLegalKmh:l};}
function decision(){return {action:routeDecision(),safetyScore:safety(),confidence:state.confidence,traffic:state.traffic?.level||'unknown',safeSpeed:safeSpeed(state.route?.speedLimitKmh)};}
function snapshot(){return JSON.parse(JSON.stringify({version:state.version,mode:state.mode,confidence:state.confidence,route:state.route,traffic:state.traffic,incidents:state.incidents,pois:state.pois,lane:state.lane,ev:state.ev,vision:state.vision,personalization:state.personalization,lastDecision:state.lastDecision}));}
window.NEMANavigationModel={state,ingest,safety,decision,safeSpeed,snapshot,confidence};
})();
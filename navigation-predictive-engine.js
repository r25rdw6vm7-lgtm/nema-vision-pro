/* NEMA Drive Predictive Intelligence v1
 * Predictive ETA, route risk, data confidence and provider-neutral traffic forecasting.
 * No fabricated live traffic: predictions require observed/ingested data.
 */
(function(){'use strict';
 const state={segments:[],history:[],last:null};
 const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const now=()=>Date.now();
 function normalizeSegment(x){if(!x||!x.id)return null;return{id:String(x.id),speedKmh:num(x.speedKmh),freeFlowKmh:num(x.freeFlowKmh),delaySec:num(x.delaySec,0),lengthM:Math.max(0,num(x.lengthM,0)),confidence:clamp(num(x.confidence,0),0,100),source:x.source||'unknown',updatedAt:num(x.updatedAt,now())};}
 function ingestSegments(list=[]){state.segments=(Array.isArray(list)?list:[]).map(normalizeSegment).filter(Boolean);return state.segments;}
 function confidence(inputs=[]){const v=(Array.isArray(inputs)?inputs:[]).map(x=>num(x,0)).filter(Number.isFinite);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0;}
 function predictSegment(x,horizonMin=5){const s=normalizeSegment(x);if(!s)return null;const age=Math.max(0,now()-s.updatedAt);const freshness=clamp(100-age/120000*100,0,100);if(s.speedKmh==null)return{...s,predictedSpeedKmh:null,predictedDelaySec:null,confidence:Math.round(s.confidence*0.6)};const ratio=s.freeFlowKmh?clamp(s.speedKmh/s.freeFlowKmh,0,1.5):null;const trend=state.history.filter(h=>h.id===s.id).slice(-3);const avg=trend.length?trend.reduce((a,h)=>a+h.speedKmh,0)/trend.length:s.speedKmh;const projected=ratio==null?s.speedKmh:clamp(s.speedKmh+(s.speedKmh-avg)*Math.min(horizonMin/5,1),0,160);const delay=s.lengthM>0&&projected>0?Math.max(0,s.lengthM/(projected/3.6)-s.lengthM/(Math.max(1,s.freeFlowKmh||projected)/3.6)):s.delaySec;return{...s,predictedSpeedKmh:Math.round(projected*10)/10,predictedDelaySec:Math.round(delay),confidence:Math.round((s.confidence+freshness)/2)};}
 function predictRoute(segments=[],horizonMin=5){const p=(Array.isArray(segments)?segments:[]).map(predictSegment).filter(Boolean);const delay=p.reduce((a,x)=>a+(x.predictedDelaySec||0),0);const c=confidence(p.map(x=>x.confidence));const risk=clamp(Math.round(p.reduce((a,x)=>a+(x.predictedSpeedKmh!=null&&x.freeFlowKmh?Math.max(0,1-x.predictedSpeedKmh/x.freeFlowKmh)*100:0),0)/(p.length||1)),0,100);const result={horizonMin,segments:p,predictedDelaySec:delay,confidence:c,riskScore:risk,decision:risk>=60?'reassess':risk>=35?'consider-alternative':'continue',updatedAt:now()};state.last=result;return result;}
 function eta(baseDurationSec,trafficDelaySec=0,confidenceScore=0){const base=Math.max(0,num(baseDurationSec,0)),delay=Math.max(0,num(trafficDelaySec,0));return{baseDurationSec:base,trafficDelaySec:delay,etaSec:base+delay,confidence:clamp(num(confidenceScore,0),0,100)};}
 function record(segmentId,speedKmh){if(!segmentId||num(speedKmh)==null)return false;state.history.push({id:String(segmentId),speedKmh:num(speedKmh),updatedAt:now()});if(state.history.length>500)state.history.shift();return true;}
 function status(){return{segments:state.segments.length,history:state.history.length,last:state.last?{delaySec:state.last.predictedDelaySec,confidence:state.last.confidence,riskScore:state.last.riskScore,decision:state.last.decision}:null};}
 window.NEMAPredictive={state,ingestSegments,predictSegment,predictRoute,eta,record,confidence,status};
})();

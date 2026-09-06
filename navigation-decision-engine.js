/* NEMA Drive Decision Engine v1
   Combines route, traffic, safety, POI, EV and Vision signals.
   No live/external data is fabricated. */
(function(){'use strict';
const state={last:null,thresholds:{rerouteTraffic:'severe',minConfidence:45}};
const n=v=>Number.isFinite(Number(v))?Number(v):null;
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v));}
function confidence(input={}){const vals=['gps','route','traffic','data','vision'].map(k=>n(input[k])).filter(v=>v!=null);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;}
function score(input={}){let safety=100,efficiency=100,comfort=100;const c=confidence(input);const traffic=input.traffic||{};if(traffic.level==='severe')safety-=25,efficiency-=30;else if(traffic.level==='heavy')safety-=12,efficiency-=18;else if(traffic.level==='moderate')efficiency-=8;if(c<45)safety-=15;if(input.route?.confidence!=null&&n(input.route.confidence)<60)safety-=15;if(input.incidents?.some(x=>x?.severity==='high'))safety-=20;if(input.ev?.reserveKwh!=null&&input.ev?.arrivalKwh!=null&&input.ev.arrivalKwh<input.ev.reserveKwh)safety-=25;if(input.vision?.hazardDetected) safety-=20;if(input.vision?.confidence!=null&&input.vision.confidence<50)comfort-=5;return{confidence:c,safety:clamp(safety),efficiency:clamp(efficiency),comfort:clamp(comfort)};}
function decide(input={}){const s=score(input);let action='continue';const reasons=[];if(s.safety<55){action='reassess';reasons.push('güvenlik skoru düşük');}else if((input.traffic?.level==='severe'||input.traffic?.level==='heavy')&&s.confidence>=45){action='consider-alternative';reasons.push('yoğun trafik');}if(input.ev?.arrivalKwh!=null&&input.ev?.reserveKwh!=null&&input.ev.arrivalKwh<input.ev.reserveKwh){action='charge-or-alternative';reasons.push('hedefte güvenli batarya rezervi yetersiz');}if(input.vision?.hazardDetected&&n(input.vision.confidence)>=70){action='hazard-caution';reasons.push('kamera tehlike algıladı');}state.last={at:Date.now(),action,reasons,scores:s};return state.last;}
function snapshot(){return JSON.parse(JSON.stringify({thresholds:state.thresholds,last:state.last}));}
window.NEMADecisionEngine={state,confidence,score,decide,snapshot};
})();

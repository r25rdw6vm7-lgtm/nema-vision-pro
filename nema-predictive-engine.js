/* NEMA Predictive Navigation Engine v1 */
(function(){'use strict';
 const state={samples:[],prediction:null,updatedAt:0};
 const n=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 function ingest(x={}){const s={speedKmh:n(x.speedKmh),delaySec:n(x.delaySec,0),trafficLevel:x.trafficLevel||'unknown',confidence:n(x.confidence,0),timestamp:n(x.timestamp,Date.now())};if(s.speedKmh==null&&s.delaySec==null)return null;state.samples.push(s);state.samples=state.samples.filter(v=>Date.now()-v.timestamp<900000).slice(-30);return predict();}
 function predict(horizonMin=5){const a=state.samples;if(!a.length)return null;const recent=a.slice(-8),delay=recent.reduce((z,x)=>z+x.delaySec,0)/recent.length,speed=recent.filter(x=>x.speedKmh!=null);const avg=speed.length?speed.reduce((z,x)=>z+x.speedKmh,0)/speed.length:null;const trend=speed.length>1?(speed[speed.length-1].speedKmh-speed[0].speedKmh)/Math.max(1,speed.length-1):0;const risk=Math.max(0,Math.min(100,(delay/180)*45+(avg!=null?Math.max(0,55-avg)*.8:20)+Math.max(0,-trend)*5));state.prediction={horizonMin,delaySec:Math.round(Math.max(0,delay+Math.max(0,-trend)*horizonMin*2)),speedKmh:avg==null?null:Math.round(Math.max(0,avg+trend*horizonMin)*10)/10,riskScore:Math.round(risk),confidence:Math.round(recent.reduce((z,x)=>z+x.confidence,0)/recent.length),updatedAt:Date.now()};state.updatedAt=Date.now();return {...state.prediction};}
 function decision(){const p=state.prediction;if(!p)return {action:'wait',reason:'Tahmin için veri yok'};if(p.riskScore>=70)return {action:'reassess',reason:'Trafik riski yüksek',prediction:p};if(p.riskScore>=40)return {action:'consider-alternative',reason:'Trafik kötüleşebilir',prediction:p};return {action:'continue',reason:'Belirgin kötüleşme sinyali yok',prediction:p};}
 function status(){return {samples:state.samples.length,prediction:state.prediction,decision:decision()};}
 window.NEMAPredictive={state,ingest,predict,decision,status};
})();

/* NEMA Vision perception contract v1. No fabricated detections. */
(function(){'use strict';
 const TYPES=['speedLimit','trafficSign','lane','trafficLight','hazard','roadSurface','landmark'];
 const state={detections:[],lastFrameAt:0,provider:null,ready:false};
 function normalize(d){if(!d||!TYPES.includes(d.type))return null;const confidence=Math.max(0,Math.min(1,Number(d.confidence)));if(!Number.isFinite(confidence))return null;return {type:d.type,confidence,box:d.box||null,value:d.value??null,source:d.source||'camera',timestamp:Number(d.timestamp)||Date.now(),metadata:d.metadata||{}};}
 function register(name,adapter,meta={}){if(!name||!adapter)return false;state.provider=name;state.ready=meta.enabled===true;state.adapter=adapter;return true;}
 async function process(frame,context={}){if(!state.adapter||!state.ready)throw new Error('NEMA Vision sağlayıcısı bağlı değil.');const raw=await state.adapter.detect(frame,context);const detections=(Array.isArray(raw)?raw:[raw]).map(normalize).filter(Boolean);state.detections=detections;state.lastFrameAt=Date.now();window.dispatchEvent(new CustomEvent('nema:vision',{detail:{detections,context}}));return detections;}
 function status(){return {provider:state.provider,ready:state.ready,detectionCount:state.detections.length,lastFrameAt:state.lastFrameAt};}
 window.NEMAVision={state,register,process,status,types:TYPES};
})();
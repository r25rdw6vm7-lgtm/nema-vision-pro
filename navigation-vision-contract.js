/* NEMA Vision contract v1. Camera/model adapter only. */
(function(){'use strict';
const state={adapter:null,last:null,capabilities:{sign:false,lane:false,signal:false,hazard:false,landmark:false}};
const allowed=new Set(['speed-sign','traffic-sign','lane','traffic-light','hazard','road-surface','landmark']);
function register(adapter,capabilities={}){if(!adapter||typeof adapter.detect!=='function')throw Error('Vision adapter detect() gerekli');state.adapter=adapter;state.capabilities={...state.capabilities,...capabilities};return status();}
function normalize(x){if(!x||!allowed.has(x.type))return null;const confidence=Math.max(0,Math.min(100,Number(x.confidence)||0));return {type:x.type,confidence,lat:Number.isFinite(Number(x.lat))?Number(x.lat):null,lon:Number.isFinite(Number(x.lon))?Number(x.lon):null,value:x.value??null,timestamp:Number(x.timestamp)||Date.now(),source:x.source||'vision-adapter'};}
async function detect(frame,context={}){if(!state.adapter)throw Error('NEMA Vision modeli bağlı değil');const raw=await state.adapter.detect(frame,context);const list=Array.isArray(raw)?raw:[raw];state.last=list.map(normalize).filter(Boolean);return state.last;}
function status(){return {registered:!!state.adapter,capabilities:{...state.capabilities},lastCount:state.last?.length||0};}
window.NEMAVisionContract={state,register,detect,normalize,status};
})();

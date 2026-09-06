/* NEMA Unified Confidence Engine v1 */
(function(){'use strict';
 const state={signals:{},score:0,updatedAt:0};
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 function set(name,value,weight=1){const v=Number(value);if(!Number.isFinite(v))return status();state.signals[name]={value:clamp(v),weight:Math.max(.1,Number(weight)||1),updatedAt:Date.now()};return recalc();}
 function ingest(x={}){for(const [k,v] of Object.entries(x)){if(v&&typeof v==='object')set(k,v.value,v.weight);else set(k,v);}return recalc();}
 function recalc(){const a=Object.values(state.signals);const now=Date.now();const fresh=a.filter(x=>now-x.updatedAt<120000);const den=fresh.reduce((z,x)=>z+x.weight,0);state.score=den?Math.round(fresh.reduce((z,x)=>z+x.value*x.weight,0)/den):0;state.updatedAt=now;return state.score;}
 function status(){return {score:recalc(),signals:{...state.signals},updatedAt:state.updatedAt};}
 window.NEMAConfidence={state,set,ingest,recalc,status};
})();

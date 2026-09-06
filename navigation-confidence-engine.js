/* NEMA Drive Confidence Engine v1 */
(function(){'use strict';
 const state={signals:{},last:0};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function set(name,value,source='unknown'){const v=Number(value);if(!name||!Number.isFinite(v))return null;state.signals[name]={value:clamp(v,0,100),source,updatedAt:Date.now()};return state.signals[name];}
 function score(required=[]){const list=(Array.isArray(required)?required:Object.keys(state.signals)).map(k=>state.signals[k]).filter(Boolean);if(!list.length)return{score:0,count:0};const score=Math.round(list.reduce((a,x)=>a+x.value,0)/list.length);state.last=score;return{score,count:list.length,signals:Object.fromEntries(list.map((x,i)=>[required[i]||`signal-${i}`,x]))};}
 function status(){return{score:state.last,signals:Object.keys(state.signals).length};}
 window.NEMAConfidence={state,set,score,status};
})();

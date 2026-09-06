/* NEMA Spatial Navigation Engine v1 */
(function(){'use strict';
 const state={landmarks:[],context:null};
 const n=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 function ingest(list=[]){state.landmarks=(Array.isArray(list)?list:[]).filter(x=>x&&Number.isFinite(Number(x.distanceM))).map(x=>({id:x.id||`${x.type||'landmark'}-${x.distanceM}`,type:x.type||'landmark',name:x.name||'',distanceM:n(x.distanceM,0),side:x.side||null,confidence:n(x.confidence,0)})).sort((a,b)=>a.distanceM-b.distanceM);return state.landmarks;}
 function next(maxM=500){return state.landmarks.find(x=>x.distanceM<=maxM)||state.landmarks[0]||null;}
 function instruction(x=next()){if(!x)return 'İleri devam edin.';const name=x.name?` ${x.name}`:'';const side=x.side==='left'?' solunuzda':x.side==='right'?' sağınızda':'';if(x.distanceM<80)return `${name||'Önemli nokta'}${side}. Hazır olun.`;return `${Math.round(x.distanceM)} metre sonra${name?` ${name}`:''}${side}.`;}
 function context(x={}){state.context={intersection:x.intersection||null,lanes:n(x.lanes),crosswalk:x.crosswalk===true,trafficLight:x.trafficLight===true,overpass:x.overpass===true,terrain:x.terrain||null,updatedAt:Date.now()};return state.context;}
 function status(){return {next:next(),instruction:instruction(),context:state.context,count:state.landmarks.length};}
 window.NEMASpatial={state,ingest,next,instruction,context,status};
})();

/* NEMA Drive Spatial Navigation v1
 * Provider-neutral 3D/spatial guidance contract for buildings, terrain, lanes,
 * crossings, signals and landmarks. Requires real map geometry/provider data.
 */
(function(){'use strict';
 const state={features:[],routeContext:null,last:null};
 const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
 function validPoint(p){return p&&num(p.lat)!=null&&num(p.lon)!=null;}
 function ingest(features=[]){state.features=(Array.isArray(features)?features:[]).filter(Boolean).map((x,i)=>({id:x.id||`sp-${i}`,type:x.type||'landmark',lat:num(x.lat),lon:num(x.lon),elevationM:num(x.elevationM),name:x.name||'',distanceM:num(x.distanceM),headingDeg:num(x.headingDeg),geometry:x.geometry||null,confidence:num(x.confidence,0)})).filter(x=>validPoint(x));return state.features;}
 function setRouteContext(ctx){state.routeContext=ctx&&typeof ctx==='object'?{...ctx}:null;return state.routeContext;}
 function nextFeature(position,types){if(!validPoint(position))return null;const allowed=Array.isArray(types)&&types.length?new Set(types):null;const list=state.features.filter(x=>!allowed||allowed.has(x.type)).map(x=>({...x,distanceM:num(x.distanceM,Infinity)})).sort((a,b)=>a.distanceM-b.distanceM);return state.last=list[0]||null;}
 function guidance(position){const n=nextFeature(position,['intersection','trafficLight','lane','crosswalk','landmark','overpass','building']);if(!n)return{status:'no-data',message:'Mekânsal yol verisi yok.'};const label=n.name||({trafficLight:'trafik ışığı',crosswalk:'yaya geçidi',overpass:'üst geçit',intersection:'kavşak',lane:'şerit',landmark:'landmark'}[n.type]||'yol detayı');return{status:'ready',feature:n,message:n.distanceM<100?`${label} ${Math.round(n.distanceM)} metre ileride.`:`${label} ${Math.round(n.distanceM)} metre ileride.`};}
 function status(){return{features:state.features.length,hasRouteContext:!!state.routeContext,last:state.last?{type:state.last.type,name:state.last.name}:null};}
 window.NEMASpatial={state,ingest,setRouteContext,nextFeature,guidance,status};
})();

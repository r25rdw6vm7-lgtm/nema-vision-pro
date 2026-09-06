/* NEMA Drive route-stop planner */
(function(){'use strict';
const state={stops:[],last:null};
const n=v=>Number.isFinite(Number(v))?Number(v):null;
function validPoint(p){return p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon));}
function add(stop){if(!validPoint(stop))throw Error('Geçersiz durak');const s={id:stop.id||`stop-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type:stop.type||'poi',name:String(stop.name||'Durak'),lat:Number(stop.lat),lon:Number(stop.lon),priority:n(stop.priority)??0};state.stops.push(s);return s;}
function remove(id){state.stops=state.stops.filter(x=>x.id!==id);return state.stops.slice();}
function clear(){state.stops=[];return []}
function rank(candidates=[],route){return candidates.filter(validPoint).map(x=>{const distanceM=route?.distanceToPoint?route.distanceToPoint(x):null;return {...x,distanceM}}).sort((a,b)=>(a.distanceM??Infinity)-(b.distanceM??Infinity));}
function snapshot(){return JSON.parse(JSON.stringify({stops:state.stops,last:state.last}));}
window.NEMARouteStops={state,add,remove,clear,rank,snapshot};
})();

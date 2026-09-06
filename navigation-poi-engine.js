/* NEMA Drive POI + personal places engine v1 */
(function(){
'use strict';
const KEY='nema-drive-places-v1';
const state={home:null,work:null,favorites:[],recent:[]};
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');Object.assign(state,{home:x.home||null,work:x.work||null,favorites:Array.isArray(x.favorites)?x.favorites:[],recent:Array.isArray(x.recent)?x.recent:[]});}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function valid(p){return p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon));}
function normalize(p){if(!valid(p))throw new Error('Geçersiz konum');return {lat:Number(p.lat),lon:Number(p.lon),name:String(p.name||'Hedef'),type:p.type||'place',updatedAt:Date.now()};}
function setHome(p){state.home=normalize(p);save();return state.home;}
function setWork(p){state.work=normalize(p);save();return state.work;}
function addFavorite(p){const x=normalize(p);state.favorites=[x,...state.favorites.filter(v=>Math.abs(v.lat-x.lat)>1e-6||Math.abs(v.lon-x.lon)>1e-6)].slice(0,100);save();return x;}
function removeFavorite(lat,lon){state.favorites=state.favorites.filter(v=>Math.abs(v.lat-lat)>1e-6||Math.abs(v.lon-lon)>1e-6);save();}
function addRecent(p){const x=normalize(p);state.recent=[x,...state.recent.filter(v=>Math.abs(v.lat-x.lat)>1e-6||Math.abs(v.lon-x.lon)>1e-6)].slice(0,30);save();}
function clearRecent(){state.recent=[];save();}
function all(){return {home:state.home,work:state.work,favorites:[...state.favorites],recent:[...state.recent]};}
function hav(a,b){const R=6371000,p=Math.PI/180,da=(b.lat-a.lat)*p,dl=(b.lon-a.lon)*p,x=Math.sin(da/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
function nearest(current,items){if(!valid(current))return null;return (items||[]).filter(valid).map(x=>({...x,distanceM:hav(current,x)})).sort((a,b)=>a.distanceM-b.distanceM)[0]||null;}
function routeStops(current,category,items,maxDistanceM=5000){const list=(items||[]).filter(valid).map(x=>({...x,distanceM:hav(current,x)})).filter(x=>x.distanceM<=maxDistanceM).sort((a,b)=>a.distanceM-b.distanceM);return {category,count:list.length,items:list.slice(0,20)};}
load();
window.NEMAPOI={state,setHome,setWork,addFavorite,removeFavorite,addRecent,clearRecent,all,nearest,routeStops};
})();

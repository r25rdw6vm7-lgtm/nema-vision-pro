/* NEMA Drive normalized data contracts v1. No fabricated live data. */
(function(){
'use strict';
const finite=x=>Number.isFinite(Number(x));
function point(p){if(!p||!finite(p.lat)||!finite(p.lon))throw new Error('Geçersiz koordinat');return {lat:Number(p.lat),lon:Number(p.lon)};}
function poi(x){return {id:x.id||null,name:String(x.name||''),category:x.category||'unknown',location:point(x.location||x),distanceM:finite(x.distanceM)?Number(x.distanceM):null,source:x.source||'unknown',verified:x.verified===true,confidence:finite(x.confidence)?Number(x.confidence):0,updatedAt:x.updatedAt||Date.now()};}
function incident(x){return {id:x.id||null,type:x.type||'hazard',severity:x.severity||'unknown',location:point(x.location||x),direction:x.direction||null,source:x.source||'unknown',verified:x.verified===true,expiresAt:x.expiresAt||null,updatedAt:x.updatedAt||Date.now()};}
function lane(x){return {roadId:x.roadId||null,laneCount:Math.max(0,Number(x.laneCount)||0),currentLane:Number.isInteger(x.currentLane)?x.currentLane:null,allowedLanes:Array.isArray(x.allowedLanes)?x.allowedLanes.filter(Number.isInteger):[],confidence:finite(x.confidence)?Number(x.confidence):0,source:x.source||'unknown',verified:x.verified===true};}
function evStation(x){return {id:x.id||null,name:String(x.name||''),location:point(x.location||x),connectors:Array.isArray(x.connectors)?x.connectors:[],available:x.available===true?true:x.available===false?false:null,powerKw:finite(x.powerKw)?Number(x.powerKw):null,source:x.source||'unknown',updatedAt:x.updatedAt||Date.now()};}
function status(){return {contracts:['poi','incident','lane','evStation'],liveData:false,note:'Contracts normalize external data; they do not invent provider values.'};}
window.NEMADataContracts={poi,incident,lane,evStation,status};
})();

/* NEMA Drive personalization engine v1 */
(function(){
'use strict';
const KEY='nema-drive-profile-v1';
const state={profile:{preferredMode:'fastest',avoidTolls:false,avoidHighways:false,avoidFerries:false,avoidUnpaved:false,preferSafer:false,preferFuelEfficient:false},samples:[],updatedAt:Date.now()};
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');if(x.profile)Object.assign(state.profile,x.profile);if(Array.isArray(x.samples))state.samples=x.samples.slice(-500);state.updatedAt=x.updatedAt||Date.now();}catch(e){}}
function save(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify({profile:state.profile,samples:state.samples,updatedAt:state.updatedAt}));}catch(e){}}
function setProfile(p={}){Object.assign(state.profile,p);save();return {...state.profile};}
function recordTrip(sample={}){const planned=Number(sample.plannedSec),actual=Number(sample.actualSec);if(!Number.isFinite(planned)||planned<=0||!Number.isFinite(actual)||actual<=0)return null;state.samples.push({plannedSec:planned,actualSec:actual,ratio:actual/planned,timestamp:Date.now()});state.samples=state.samples.slice(-500);save();return state.samples[state.samples.length-1];}
function eta(plannedSec){const p=Number(plannedSec);if(!Number.isFinite(p)||p<=0)return null;const recent=state.samples.slice(-50);if(recent.length<5)return Math.round(p);const avg=recent.reduce((a,x)=>a+x.ratio,0)/recent.length;const factor=Math.max(.75,Math.min(1.6,avg));return Math.round(p*factor);}
function routeScore(route={}){const s=Number(route.durationSec)||0,d=Number(route.distanceM)||0;const pref=state.profile;let score=0;score+=(s/60)*10;score+=(d/1000)*1.5;if(pref.preferSafer)score-=Number(route.safetyScore||0)*5;if(pref.preferFuelEfficient)score-=Number(route.energyScore||0)*4;if(pref.avoidTolls&&route.toll)score+=1000;if(pref.avoidHighways&&route.highway)score+=800;if(pref.avoidFerries&&route.ferry)score+=900;if(pref.avoidUnpaved&&route.unpaved)score+=700;return score;}
function rank(routes){return (routes||[]).slice().sort((a,b)=>routeScore(a)-routeScore(b)).map((r,i)=>({...r,preferenceScore:routeScore(r),rank:i+1}));}
load();
window.NEMAPersonalization={state,setProfile,recordTrip,eta,routeScore,rank};
})();

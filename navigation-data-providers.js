/* NEMA Drive Navigation Data Providers v1
 * Provider-neutral normalization for speed limits, enforcement, traffic and signals.
 * Live providers must be configured with verified/licensed data sources.
 */
(function(){
  'use strict';
  const state={speedLimit:null,enforcement:[],traffic:null,signals:[],lastSync:0};
  const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
  const ageMs=updatedAt=>Math.max(0,Date.now()-num(updatedAt,Date.now()));
  const confidence=(x,source)=>x?.confidence||((source||'').toLowerCase().includes('demo')?'demo':'unknown');
  function normalizeSpeedLimit(x){
    if(!x)return null;
    const value=num(x.value??x.speedLimitKmh??x.limit);
    if(value==null||value<5||value>160)return null;
    return {value:Math.round(value),unit:'km/h',source:x.source||'unknown',confidence:confidence(x,x.source),temporary:!!x.temporary,updatedAt:num(x.updatedAt,Date.now()),ageMs:ageMs(x.updatedAt)};
  }
  function normalizeEnforcement(x){
    if(!x)return null;
    const distanceM=num(x.distanceM??x.distance);
    if(distanceM==null||distanceM<0)return null;
    return {id:x.id||null,type:x.type||'unknown',distanceM:Math.round(distanceM),direction:x.direction||null,limitKmh:num(x.limitKmh??x.speedLimitKmh),source:x.source||'unknown',confidence:confidence(x,x.source),verified:!!x.verified,updatedAt:num(x.updatedAt,Date.now()),ageMs:ageMs(x.updatedAt)};
  }
  function normalizeTraffic(x){
    if(!x)return null;
    return {level:x.level||'unknown',delaySec:num(x.delaySec,0),speedKmh:num(x.speedKmh),source:x.source||'unknown',confidence:confidence(x,x.source),updatedAt:num(x.updatedAt,Date.now()),ageMs:ageMs(x.updatedAt)};
  }
  function normalizeSignal(x){
    if(!x)return null;
    const distanceM=num(x.distanceM??x.distance);
    if(distanceM==null||distanceM<0)return null;
    return {id:x.id||null,distanceM:Math.round(distanceM),phase:x.phase||'unknown',remainingSec:num(x.remainingSec),greenDurationSec:num(x.greenDurationSec,30),cycleSec:num(x.cycleSec,90),speedLimitKmh:num(x.speedLimitKmh),source:x.source||'unknown',confidence:confidence(x,x.source),updatedAt:num(x.updatedAt,Date.now()),ageMs:ageMs(x.updatedAt)};
  }
  function ingest(payload){
    const p=payload||{};
    if(p.speedLimit){state.speedLimit=normalizeSpeedLimit(p.speedLimit);window.NEMANavigation?.setSpeedLimit(state.speedLimit);}
    if(Array.isArray(p.enforcement)){state.enforcement=p.enforcement.map(normalizeEnforcement).filter(Boolean);window.NEMANavigation?.setEnforcement(state.enforcement);}
    if(p.traffic){state.traffic=normalizeTraffic(p.traffic);window.NEMANavigation?.setTraffic(state.traffic);}
    if(Array.isArray(p.signals)){state.signals=p.signals.map(normalizeSignal).filter(Boolean);window.NEMATrafficLights?.setSignals(state.signals);window.dispatchEvent(new CustomEvent('nema:signals',{detail:state.signals}));}
    state.lastSync=Date.now();
    return {speedLimit:state.speedLimit,enforcement:state.enforcement,traffic:state.traffic,signals:state.signals,lastSync:state.lastSync};
  }
  async function fetchJson(url,options={}){
    if(!url)throw new Error('Veri sağlayıcı URL gerekli.');
    const r=await fetch(url,{headers:{Accept:'application/json',...(options.headers||{})},...options});
    if(!r.ok)throw new Error(`Veri sağlayıcı HTTP ${r.status}`);
    return r.json();
  }
  async function sync(url,options={}){const data=await fetchJson(url,options);return ingest(data);}
  function demo(){
    return ingest({
      speedLimit:{value:50,source:'DEMO',confidence:'demo'},
      enforcement:[{id:'demo-eds-1',type:'eds',distanceM:720,limitKmh:50,source:'DEMO',confidence:'demo'}],
      traffic:{level:'moderate',delaySec:90,speedKmh:38,source:'DEMO',confidence:'demo'},
      signals:[
        {id:'demo-s1',distanceM:350,phase:'red',remainingSec:12,greenDurationSec:30,cycleSec:90,speedLimitKmh:50,source:'DEMO',confidence:'demo'},
        {id:'demo-s2',distanceM:1050,phase:'green',remainingSec:22,greenDurationSec:30,cycleSec:90,speedLimitKmh:50,source:'DEMO',confidence:'demo'},
        {id:'demo-s3',distanceM:1800,phase:'red',remainingSec:31,greenDurationSec:25,cycleSec:80,speedLimitKmh:50,source:'DEMO',confidence:'demo'}
      ]
    });
  }
  window.NEMADataProviders={state,normalizeSpeedLimit,normalizeEnforcement,normalizeTraffic,normalizeSignal,ingest,fetchJson,sync,demo};
})();

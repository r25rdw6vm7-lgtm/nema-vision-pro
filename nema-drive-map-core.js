/* NEMA Drive Map Core v1
 * Hybrid map-data policy and lightweight web map matching.
 * This layer never invents offline coverage or traffic data.
 */
(function(){
  'use strict';
  const state={
    mode:'hybrid',
    online:navigator.onLine!==false,
    offlineCoverage:false,
    lastMatch:null,
    updatedAt:Date.now()
  };
  const offlineProviders={};
  const n=v=>Number(v);
  const validPoint=p=>p&&Number.isFinite(n(p.lat))&&Number.isFinite(n(p.lon))&&Math.abs(n(p.lat))<=90&&Math.abs(n(p.lon))<=180;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function haversine(a,b){
    if(!validPoint(a)||!validPoint(b))return Infinity;
    const R=6371000,p=Math.PI/180,lat1=n(a.lat)*p,lat2=n(b.lat)*p,dl=(n(b.lat)-n(a.lat))*p,dg=(n(b.lon)-n(a.lon))*p;
    const x=Math.sin(dl/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dg/2)**2;
    return 2*R*Math.asin(Math.sqrt(x));
  }
  function bearing(a,b){
    if(!validPoint(a)||!validPoint(b))return null;
    const p=Math.PI/180,y=Math.sin((n(b.lon)-n(a.lon))*p)*Math.cos(n(b.lat)*p),x=Math.cos(n(a.lat)*p)*Math.sin(n(b.lat)*p)-Math.sin(n(a.lat)*p)*Math.cos(n(b.lat)*p)*Math.cos((n(b.lon)-n(a.lon))*p);
    return (Math.atan2(y,x)*180/Math.PI+360)%360;
  }
  function projectPoint(p,a,b){
    if(!validPoint(p)||!validPoint(a)||!validPoint(b))return null;
    const latScale=Math.cos(n(p.lat)*Math.PI/180);
    const ax=n(a.lon)*latScale,ay=n(a.lat),bx=n(b.lon)*latScale,by=n(b.lat),px=n(p.lon)*latScale,py=n(p.lat);
    const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
    const t=den?clamp(((px-ax)*dx+(py-ay)*dy)/den,0,1):0;
    const lon=(ax+(bx-ax)*t)/(latScale||1),lat=ay+(by-ay)*t;
    return {lat,lon,t};
  }
  function mapMatch(position,geometry){
    if(!validPoint(position)||!geometry?.coordinates?.length)return null;
    const coords=geometry.coordinates;
    let best=null;
    for(let i=1;i<coords.length;i++){
      const a={lon:coords[i-1][0],lat:coords[i-1][1]},b={lon:coords[i][0],lat:coords[i][1]};
      const projected=projectPoint(position,a,b);if(!projected)continue;
      const distanceM=haversine(position,projected);
      if(!best||distanceM<best.distanceM)best={point:projected,distanceM,segmentIndex:i-1,bearing:bearing(a,b)};
    }
    if(!best)return null;
    const accuracy=n(position.accuracyM);
    const confidence=best.distanceM<=15?'high':best.distanceM<=40?'good':best.distanceM<=80?'medium':'low';
    state.lastMatch={...best,confidence,updatedAt:Date.now()};
    return state.lastMatch;
  }
  function setOnline(value){state.online=!!value;state.updatedAt=Date.now();return status();}
  function setOfflineCoverage(value){state.offlineCoverage=!!value;state.updatedAt=Date.now();return status();}
  function registerOfflineProvider(name,provider){if(name&&provider&&typeof provider.route==='function')offlineProviders[name]=provider;return Object.keys(offlineProviders);}
  function routePolicy(){
    if(state.mode==='online')return state.online?'online':'unavailable';
    if(state.mode==='offline')return state.offlineCoverage&&Object.keys(offlineProviders).length?'offline':'unavailable';
    if(state.online)return 'online';
    return state.offlineCoverage&&Object.keys(offlineProviders).length?'offline':'unavailable';
  }
  function setMode(mode){if(['online','offline','hybrid'].includes(mode))state.mode=mode;return status();}
  function status(){return {...state,routePolicy:routePolicy(),offlineProviders:Object.keys(offlineProviders),hasOfflineEngine:Object.keys(offlineProviders).length>0};}
  window.addEventListener('online',()=>setOnline(true));
  window.addEventListener('offline',()=>setOnline(false));
  window.NEMADriveMapCore={state,haversine,bearing,mapMatch,setOnline,setOfflineCoverage,setMode,registerOfflineProvider,routePolicy,status};
})();

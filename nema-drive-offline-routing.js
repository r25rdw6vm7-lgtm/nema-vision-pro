/* NEMA Drive Offline Routing v2
 * Contract for real offline routing engines.
 * This module deliberately returns unavailable until a native/offline engine is registered.
 */
(function(){
  'use strict';
  const state={provider:null,lastError:null,lastRouteAt:0};
  const validPoint=p=>p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180;
  const providers={};
  function register(name,adapter){
    if(!name||!adapter||typeof adapter.route!=='function')throw new Error('Geçerli offline rota adaptörü gerekli.');
    providers[name]=adapter;state.provider=name;
    if(window.NEMADriveMapCore?.registerOfflineProvider)window.NEMADriveMapCore.registerOfflineProvider(name,adapter);
    return status();
  }
  async function route(opts={}){
    if(!validPoint(opts.from)||!validPoint(opts.to))throw new Error('Offline rota için geçerli başlangıç ve hedef koordinatları gerekli.');
    const name=opts.provider||state.provider,adapter=name&&providers[name];
    if(!adapter){state.lastError='Gerçek offline rota motoru bağlı değil.';throw new Error(state.lastError);}
    const result=await adapter.route(opts);
    if(!result||!Number.isFinite(Number(result.distanceM))||!Number.isFinite(Number(result.durationSec)))throw new Error('Offline motor geçersiz rota döndürdü.');
    state.lastError=null;state.lastRouteAt=Date.now();
    return {...result,provider:result.provider||name,offline:true,updatedAt:result.updatedAt||Date.now()};
  }
  function status(){return {provider:state.provider,providers:Object.keys(providers),available:Object.keys(providers).length>0,lastError:state.lastError,lastRouteAt:state.lastRouteAt};}
  window.NEMAOfflineRouting={state,providers,register,route,status};
  if(window.NEMANativeBridge?.state?.adapter&&!state.provider){register(`native-${window.NEMANativeBridge.state.platform||'unknown'}`,window.NEMANativeBridge.state.adapter);}
})();

/* NEMA Native Bridge v1
 * Explicit contract for native Android/iOS navigation adapters.
 * No native capability is assumed until an adapter is registered.
 */
(function(){'use strict';
 const state={platform:null,adapter:null,registeredAt:null};
 const validPoint=p=>p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180;
 function register(platform,adapter){
  if(!platform||!adapter||typeof adapter.route!=='function')throw new Error('Geçerli native navigasyon adaptörü gerekli.');
  state.platform=String(platform);state.adapter=adapter;state.registeredAt=Date.now();
  if(window.NEMAOfflineRouting?.register)window.NEMAOfflineRouting.register(`native-${state.platform}`,adapter);
  if(window.NEMAMapProvider?.configure)window.NEMAMapProvider.configure({offlineReady:true,provider:state.platform==='ios'?'here':'here'});
  return status();
 }
 async function route(opts={}){if(!state.adapter)throw new Error('Native navigasyon adaptörü bağlı değil.');if(!validPoint(opts.from)||!validPoint(opts.to))throw new Error('Geçerli başlangıç ve hedef koordinatları gerekli.');return state.adapter.route(opts);}
 function status(){return {platform:state.platform,registered:!!state.adapter,registeredAt:state.registeredAt,capabilities:{offlineRouting:!!state.adapter}};}
 window.NEMANativeBridge={state,register,route,status};
})();

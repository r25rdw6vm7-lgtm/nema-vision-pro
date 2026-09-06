/* NEMA Native Bridge v3
 * Explicit contract for native Android/iOS navigation adapters.
 * An adapter is not exposed as production offline routing until the native layer declares licensed offline maps + routing.
 */
(function(){'use strict';
 const state={platform:null,adapter:null,registeredAt:null,capabilities:{offlineRouting:false,offlineMaps:false,licensed:false}};
 const validPoint=p=>p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180;
 const offlineReady=()=>state.capabilities.offlineRouting&&state.capabilities.offlineMaps&&state.capabilities.licensed;
 function register(platform,adapter,capabilities={}){
  if(!platform||!adapter||typeof adapter.route!=='function')throw new Error('Geçerli native navigasyon adaptörü gerekli.');
  state.platform=String(platform);state.adapter=adapter;state.registeredAt=Date.now();
  state.capabilities={offlineRouting:capabilities.offlineRouting===true,offlineMaps:capabilities.offlineMaps===true,licensed:capabilities.licensed===true};
  if(offlineReady()&&window.NEMAOfflineRouting?.register)window.NEMAOfflineRouting.register(`native-${state.platform}`,adapter);
  if(window.NEMAMapProvider?.configure)window.NEMAMapProvider.configure({offlineReady:offlineReady(),provider:'here'});
  return status();
 }
 async function route(opts={}){if(!state.adapter)throw new Error('Native navigasyon adaptörü bağlı değil.');if(!validPoint(opts.from)||!validPoint(opts.to))throw new Error('Geçerli başlangıç ve hedef koordinatları gerekli.');if(opts.offline===true&&!offlineReady())throw new Error('Native offline navigasyon lisanslı offline harita ve routing yetenekleri olmadan kullanılamaz.');return state.adapter.route(opts);}
 function status(){return {platform:state.platform,registered:!!state.adapter,registeredAt:state.registeredAt,offlineReady:offlineReady(),capabilities:{...state.capabilities}};}
 window.NEMANativeBridge={state,register,route,status};
})();

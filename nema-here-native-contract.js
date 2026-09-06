/* NEMA Drive HERE Native Contract v1
 * Platform-neutral contract for a licensed HERE SDK Navigate integration.
 * This file does not claim that HERE SDK is bundled or licensed.
 */
(function(){'use strict';
 const state={platform:null,licensed:false,initialized:false,offlineMaps:false,lastError:null};
 const validPoint=p=>p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180;
 function register(adapter,meta={}){
  if(!adapter||typeof adapter.route!=='function')throw new Error('HERE native adapter route() gerekli.');
  state.platform=meta.platform||'native'; state.licensed=meta.licensed===true; state.initialized=meta.initialized===true; state.offlineMaps=meta.offlineMaps===true; state.lastError=null;
  if(window.NEMAOfflineRouting)window.NEMAOfflineRouting.register('here-native',adapter);
  return status();
 }
 function status(){return {...state,available:state.initialized&&state.licensed,offlineReady:state.initialized&&state.licensed&&state.offlineMaps};}
 window.NEMAHereNative={state,register,status,validPoint};
})();

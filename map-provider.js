/* NEMA Drive Map Provider v2
 * Hybrid provider policy for the web prototype and future native HERE/Mapbox adapters.
 * No provider key is embedded in source.
 */
(function(){
  'use strict';
  const state={provider:'osrm-web',mapProvider:'osm-esri-web',online:navigator.onLine!==false,offlineReady:false,mode:'hybrid'};
  const providers={
    'osm-esri-web':{kind:'web',map:'OpenStreetMap + Esri World Imagery',routing:'OSRM',geocoding:'Nominatim'},
    'here-native':{kind:'native',map:'HERE SDK Navigate',routing:'HERE RoutingEngine / OfflineRoutingEngine',navigation:'HERE VisualNavigator',offline:true},
    'mapbox-native':{kind:'native',map:'Mapbox Maps',routing:'Mapbox Navigation SDK',navigation:'Mapbox Navigation',offline:true}
  };
  function get(name=state.mapProvider){return providers[name]||providers['osm-esri-web'];}
  function configure(options={}){
    if(options.provider&&providers[options.provider])state.mapProvider=options.provider;
    if(options.routing)state.provider=options.routing;
    if(typeof options.online==='boolean')state.online=options.online;
    if(typeof options.offlineReady==='boolean')state.offlineReady=options.offlineReady;
    if(['online','offline','hybrid'].includes(options.mode))state.mode=options.mode;
    return status();
  }
  function status(){const p=get();return {...state,capabilities:{...p},productionReady:state.mapProvider!=='osm-esri-web'&&state.offlineReady};}
  function routeProvider(){if(state.provider==='here')return 'here-native';if(state.provider==='mapbox')return 'mapbox-native';return 'osrm-web';}
  function chooseRouteEngine(){
    if(state.mode==='offline')return state.offlineReady?routeProvider():'none';
    if(state.mode==='online')return state.online?state.provider:'none';
    if(state.online)return state.provider;
    return state.offlineReady?routeProvider():'none';
  }
  window.addEventListener('online',()=>{state.online=true;});
  window.addEventListener('offline',()=>{state.online=false;});
  window.NEMAMapProvider={state,providers,get,configure,status,routeProvider,chooseRouteEngine};
})();

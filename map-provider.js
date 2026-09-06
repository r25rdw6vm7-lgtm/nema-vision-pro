/* NEMA Drive Map Provider v1
 * Provider-neutral map configuration for web prototype and future native HERE/Mapbox adapters.
 * No provider key is embedded in source.
 */
(function(){
  'use strict';
  const state={provider:'osrm-web',mapProvider:'osm-esri-web',online:true,offlineReady:false};
  const providers={
    'osm-esri-web':{kind:'web',map:'OpenStreetMap + Esri World Imagery',routing:'OSRM',geocoding:'Nominatim'},
    'here-native':{kind:'native',map:'HERE SDK Navigate',routing:'HERE RoutingEngine / OfflineRoutingEngine',navigation:'HERE VisualNavigator',offline:true},
    'mapbox-native':{kind:'native',map:'Mapbox Maps',routing:'Mapbox Navigation SDK',navigation:'Mapbox Navigation',offline:true}
  };
  function get(name=state.mapProvider){return providers[name]||providers['osm-esri-web'];}
  function configure(options={}){if(options.provider&&providers[options.provider])state.mapProvider=options.provider;if(options.routing)state.provider=options.routing;if(typeof options.online==='boolean')state.online=options.online;if(typeof options.offlineReady==='boolean')state.offlineReady=options.offlineReady;return status();}
  function status(){const p=get();return {...state,capabilities:{...p},productionReady:state.mapProvider!=='osm-esri-web'&&state.offlineReady};}
  function routeProvider(){if(state.provider==='here')return 'here-native';if(state.provider==='mapbox')return 'mapbox-native';return 'osrm-web';}
  function chooseRouteEngine(){return state.online?state.provider:(state.offlineReady?routeProvider():'none');}
  window.NEMAMapProvider={state,providers,get,configure,status,routeProvider,chooseRouteEngine};
})();

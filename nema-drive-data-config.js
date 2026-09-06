/* NEMA Drive data configuration v1
 * No fabricated traffic/enforcement data. Providers are explicit and observable.
 */
(function(){
  'use strict';
  const providers = {
    map: {
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      labels: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
    },
    geocoder: {
      osm: 'https://nominatim.openstreetmap.org/search'
    },
    routing: {
      osrm: 'https://router.project-osrm.org/route/v1/driving'
    },
    osm: {
      overpass: [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
      ]
    },
    traffic: {
      url: null,
      configured: false
    },
    enforcement: {
      officialUrl: null,
      configured: false,
      verifiedOnly: true
    }
  };

  const cachePolicy = {
    appShell: 'cache-first',
    mapTiles: 'network-first',
    liveTraffic: 'network-only',
    enforcement: 'network-first',
    speedLimits: 'network-first',
    maxLiveAgeMs: 120000,
    maxSpeedLimitAgeMs: 300000
  };

  window.NEMADriveDataConfig = Object.freeze({providers, cachePolicy});
})();

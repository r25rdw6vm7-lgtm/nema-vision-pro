/* NEMA Drive data configuration v2
 * Online services are explicit. Offline map data is versioned and verified separately.
 * No fabricated traffic or enforcement data is permitted.
 */
(function(){
  'use strict';
  const providers = {
    map: {
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      labels: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
    },
    geocoder: { osm: 'https://nominatim.openstreetmap.org/search' },
    routing: { osrm: 'https://router.project-osrm.org/route/v1/driving' },
    osm: { overpass: ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'] },
    traffic: { url: null, configured: false },
    enforcement: { officialUrl: null, configured: false, verifiedOnly: true }
  };
  const offline = {
    source: 'OpenStreetMap regional extract',
    region: 'turkey',
    manifest: './data/turkey-offline-manifest.json',
    routingEngine: null,
    mapPackReady: false,
    note: 'A raw OSM extract is source data only; it is not treated as a routable offline map until a routing/rendering engine is installed.'
  };
  const cachePolicy = {
    appShell: 'cache-first',
    mapTiles: 'network-first',
    liveTraffic: 'network-only',
    enforcement: 'network-first',
    speedLimits: 'network-first',
    offlineMapPack: 'cache-first',
    maxLiveAgeMs: 120000,
    maxSpeedLimitAgeMs: 300000
  };
  window.NEMADriveDataConfig = Object.freeze({providers,offline,cachePolicy});
})();

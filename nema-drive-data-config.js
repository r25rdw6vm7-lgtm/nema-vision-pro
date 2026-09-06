/* NEMA Drive data configuration v3
 * Real providers are injected by the host/runtime. Secrets and SDK licenses never live in source.
 * No fabricated traffic, Vision, enforcement or offline coverage is permitted.
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
    traffic: { url: null, configured: false, runtimeKey: 'NEMA_TRAFFIC_URL' },
    enforcement: { officialUrl: null, configured: false, verifiedOnly: true },
    vision: { endpoint: null, configured: false, runtimeKey: 'NEMA_VISION_ENDPOINT' },
    native: { platform: null, configured: false },
    spatial3d: { provider: null, configured: false }
  };
  const offline = {
    source: 'OpenStreetMap regional extract + licensed native map package',
    region: 'turkey',
    manifest: './data/turkey-offline-manifest.json',
    routingEngine: null,
    mapPackReady: false,
    runtimeProvider: 'native',
    note: 'Raw OSM remains source data only. Production offline navigation requires a licensed native map/routing package.'
  };
  const cachePolicy = {
    appShell: 'cache-first',
    mapTiles: 'network-first',
    liveTraffic: 'network-only',
    enforcement: 'network-first',
    speedLimits: 'network-first',
    vision: 'network-only',
    offlineMapPack: 'cache-first',
    maxLiveAgeMs: 120000,
    maxSpeedLimitAgeMs: 300000
  };
  const runtime = {
    trafficUrl: null,
    visionEndpoint: null,
    nativePlatform: null,
    nativeLicensed: false,
    nativeOfflineReady: false,
    spatial3dReady: false
  };
  window.NEMADriveDataConfig = Object.freeze({providers,offline,cachePolicy,runtime});
})();

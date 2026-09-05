import type { AdapterKind, GeoPoint, Parcel, SoilData, SatelliteSignal, TrapSignal, UnifiedObservationSet, VisionSignal, WeatherData, ForecastWeather, Observation } from './contracts';

export interface DataAdapter<T> {
  readonly kind: AdapterKind;
  read(): Promise<Observation<T>>;
}

export type AgroAdapters = {
  parcel: DataAdapter<Parcel>;
  weather: DataAdapter<WeatherData>;
  forecast?: DataAdapter<ForecastWeather[]>;
  location?: DataAdapter<GeoPoint>;
  soil?: DataAdapter<SoilData>;
  camera?: DataAdapter<VisionSignal>;
  satellite?: DataAdapter<SatelliteSignal>;
  traps?: DataAdapter<TrapSignal[]>;
};

const now = () => new Date().toISOString();
const localObservation = <T>(source: AdapterKind, value: T): Observation<T> => ({
  value,
  provenance: { source, status: 'fresh', quality: 'good', receivedAt: now(), observedAt: now(), ageMinutes: 0 },
});

export function createDemoAdapters(): AgroAdapters {
  return {
    parcel: { kind: 'parcel', async read() { return localObservation('parcel', { id: 'PARSEL-001', name: 'Demo Parsel', crop: 'Bağ', phenology: 'Salkım gelişimi', center: { latitude: 37.4, longitude: 34.7 } }); } },
    weather: { kind: 'weather', async read() { return localObservation('weather', { temperatureC: 27, humidityPct: 84, rain24hMm: 8, windKmh: 11, leafWetnessHours: 6, solarHours: 7 }); } },
    soil: { kind: 'soil', async read() { return localObservation('soil', { moisturePct: 38 }); } },
    camera: { kind: 'camera', async read() { return localObservation('camera', { disease: 72, pest: 58, cropConfidence: 91, targetCount: 1 }); } },
    satellite: { kind: 'satellite', async read() { return localObservation('satellite', { stress: 41, ndvi: 0.68, ndre: 0.42, ndmi: 0.51, cloudPct: 8 }); } },
    traps: { kind: 'pest-trap', async read() { return localObservation('pest-trap', [{ pest: 'Genel izleme', count: 0, trendPct: 0 }]); } },
    location: { kind: 'location', async read() { return localObservation('location', { latitude: 37.4, longitude: 34.7, accuracyM: 10 }); } },
  };
}

export async function collectObservations(adapters: AgroAdapters): Promise<UnifiedObservationSet> {
  const [parcel, weather, soil, camera, satellite, traps, location, forecast] = await Promise.all([
    adapters.parcel.read(), adapters.weather.read(), adapters.soil?.read(), adapters.camera?.read(), adapters.satellite?.read(), adapters.traps?.read(), adapters.location?.read(), adapters.forecast?.read(),
  ]);
  return { parcel, weather, ...(soil ? { soil } : {}), ...(camera ? { vision: camera } : {}), ...(satellite ? { satellite } : {}), ...(traps ? { traps } : {}), ...(location ? { location } : {}), ...(forecast ? { forecast } : {}) };
}

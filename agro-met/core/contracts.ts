export type ISODate = string;

export type GeoPoint = { latitude: number; longitude: number; accuracyM?: number; capturedAt?: ISODate };
export type DataQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unusable';
export type ObservationStatus = 'fresh' | 'stale' | 'expired' | 'missing' | 'invalid';
export type AdapterKind = 'weather' | 'location' | 'parcel' | 'soil' | 'camera' | 'satellite' | 'pest-trap' | 'manual';

export type Provenance = {
  source: AdapterKind;
  provider?: string;
  observedAt?: ISODate;
  receivedAt?: ISODate;
  ageMinutes?: number;
  status: ObservationStatus;
  quality: DataQuality;
};

export type Observation<T> = { value: T; provenance: Provenance };

export type Parcel = {
  id: string;
  name?: string;
  crop: string;
  variety?: string;
  phenology?: string;
  areaHa?: number;
  center?: GeoPoint;
  boundary?: GeoPoint[];
};

export type WeatherData = {
  temperatureC: number;
  humidityPct: number;
  rain24hMm: number;
  rain72hMm?: number;
  windKmh: number;
  windDirectionDeg?: number;
  leafWetnessHours: number;
  solarHours: number;
  pressureHpa?: number;
};

export type ForecastWeather = WeatherData & { hoursAhead: number; precipitationProbabilityPct?: number };
export type SoilData = { moisturePct?: number; temperatureC?: number; ec?: number; ph?: number; nitrateMgKg?: number; salinityRisk?: number };
export type VisionSignal = { disease: number; pest: number; weed?: number; cropConfidence?: number; targetCount?: number };
export type SatelliteSignal = { stress: number; ndvi?: number; ndre?: number; ndmi?: number; cloudPct?: number };
export type TrapSignal = { pest: string; count: number; trendPct?: number; degreeDays?: number };

export type UnifiedObservationSet = {
  parcel: Observation<Parcel>;
  weather: Observation<WeatherData>;
  forecast?: Observation<ForecastWeather[]>;
  soil?: Observation<SoilData>;
  vision?: Observation<VisionSignal>;
  satellite?: Observation<SatelliteSignal>;
  traps?: Observation<TrapSignal[]>;
  location?: Observation<GeoPoint>;
};

export type Action = {
  id: string;
  title: string;
  priority: number;
  urgency: 'routine' | 'soon' | 'urgent' | 'immediate';
  rationale: string;
  dueHours?: number;
  completed?: boolean;
};

export type DecisionEvent = {
  id: string;
  type: 'risk.changed' | 'alert.created' | 'alert.resolved' | 'data.stale' | 'action.created' | 'assessment.created';
  occurredAt: ISODate;
  parcelId: string;
  severity?: string;
  message: string;
};

export type SystemState = {
  assessment: import('./agro-core').AgroAssessment;
  observations: UnifiedObservationSet;
  actions: Action[];
  events: DecisionEvent[];
  generatedAt: ISODate;
  engineVersion: string;
};

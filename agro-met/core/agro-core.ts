export type RiskLevel = 'LOW' | 'WATCH' | 'ADVISORY' | 'WARNING' | 'CRITICAL';
export type SignalSource = 'weather' | 'soil' | 'camera' | 'satellite' | 'manual';

export type WeatherSnapshot = {
  temperatureC: number;
  humidityPct: number;
  rain24hMm: number;
  windKmh: number;
  leafWetnessHours: number;
  solarHours: number;
};

export type ParcelContext = {
  id: string;
  crop: string;
  variety?: string;
  phenology?: string;
  areaHa?: number;
  latitude?: number;
  longitude?: number;
};

export type AssessmentInput = {
  parcel: ParcelContext;
  weather: WeatherSnapshot;
  soilMoisturePct?: number;
  cameraDiseaseSignal?: number;
  cameraPestSignal?: number;
  satelliteStressSignal?: number;
  dataAgeMinutes?: Partial<Record<SignalSource, number>>;
};

export type RiskFactor = {
  name: string;
  score: number;
  weight: number;
  reason: string;
  sources: SignalSource[];
};

export type ForecastPoint = { hoursAhead: number; risk: number; level: RiskLevel };
export type AgroAlert = { severity: Exclude<RiskLevel, 'LOW' | 'WATCH'>; title: string; reason: string; priority: number };

export type AgroAssessment = {
  overallRisk: number;
  diseaseRisk: number;
  pestRisk: number;
  waterStress: number;
  heatStress: number;
  frostRisk: number;
  confidence: number;
  dataQuality: number;
  level: RiskLevel;
  factors: RiskFactor[];
  actions: string[];
  alerts: AgroAlert[];
  forecast72h: ForecastPoint[];
};

const clamp = (n: number, min = 0, max = 100): number => Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
const finite = (n: unknown, fallback = 0): number => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
const pct = (n: number) => clamp(n);

function assertInput(input: AssessmentInput): void {
  if (!input || !input.parcel?.id || !input.parcel?.crop) throw new Error('Geçerli parsel kimliği ve ürün bilgisi zorunludur.');
  const w = input.weather;
  if (!w || !Number.isFinite(w.temperatureC) || !Number.isFinite(w.humidityPct)) throw new Error('Geçerli meteoroloji verisi zorunludur.');
  if (w.humidityPct < 0 || w.humidityPct > 100) throw new Error('Nem değeri 0-100 arasında olmalıdır.');
  if (w.rain24hMm < 0 || w.windKmh < 0 || w.leafWetnessHours < 0 || w.solarHours < 0) throw new Error('Meteoroloji değerleri negatif olamaz.');
  if (input.soilMoisturePct != null && (input.soilMoisturePct < 0 || input.soilMoisturePct > 100)) throw new Error('Toprak nemi 0-100 arasında olmalıdır.');
  for (const n of [input.cameraDiseaseSignal, input.cameraPestSignal, input.satelliteStressSignal]) if (n != null && (n < 0 || n > 100)) throw new Error('AI sinyalleri 0-100 arasında olmalıdır.');
}

function levelFor(score: number): RiskLevel {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'WARNING';
  if (score >= 50) return 'ADVISORY';
  if (score >= 30) return 'WATCH';
  return 'LOW';
}

function freshnessPenalty(age?: number): number {
  if (age == null || !Number.isFinite(age)) return 0;
  if (age <= 30) return 0;
  if (age <= 180) return 4;
  if (age <= 720) return 10;
  return 18;
}

function confidenceOf(input: AssessmentInput): { confidence: number; quality: number } {
  const ages = Object.values(input.dataAgeMinutes ?? {});
  const available = [true, input.soilMoisturePct != null, input.cameraDiseaseSignal != null, input.cameraPestSignal != null, input.satelliteStressSignal != null];
  const coverage = 62 + available.slice(1).filter(Boolean).length * 7;
  const freshness = ages.reduce((sum, age) => sum + freshnessPenalty(age), 0) / Math.max(1, ages.length);
  const quality = Math.round(clamp(coverage - freshness));
  return { confidence: Math.round(clamp(quality - 2 + (input.parcel.latitude != null && input.parcel.longitude != null ? 4 : 0))), quality };
}

export function assess(input: AssessmentInput): AgroAssessment {
  assertInput(input);
  const w = input.weather;
  const disease = clamp(
    0.28 * pct((w.humidityPct - 60) * 2.5) +
    0.25 * pct(w.leafWetnessHours * 9) +
    0.17 * pct(w.rain24hMm * 2.2) +
    0.20 * finite(input.cameraDiseaseSignal) +
    0.10 * finite(input.satelliteStressSignal)
  );
  const pest = clamp(
    0.32 * pct((w.temperatureC - 12) * 5) +
    0.18 * pct((w.humidityPct - 40) * 1.5) +
    0.30 * finite(input.cameraPestSignal) +
    0.20 * pct(w.solarHours * 8)
  );
  const waterStress = clamp(input.soilMoisturePct == null ? 30 + Math.max(0, 22 - w.rain24hMm) * 2 : (45 - input.soilMoisturePct) * 2.2);
  const heatStress = clamp((w.temperatureC - 28) * 7);
  const frostRisk = clamp((5 - w.temperatureC) * 14);
  const overall = Math.round(clamp(disease * 0.34 + pest * 0.22 + waterStress * 0.16 + heatStress * 0.16 + frostRisk * 0.12));
  const { confidence, quality } = confidenceOf(input);

  const factors: RiskFactor[] = [
    { name: 'Hastalık', score: Math.round(disease), weight: .34, sources: ['weather', ...(input.cameraDiseaseSignal != null ? ['camera'] : []), ...(input.satelliteStressSignal != null ? ['satellite'] : [])], reason: w.humidityPct >= 80 || w.leafWetnessHours >= 5 ? 'Nem ve yaprak ıslaklığı enfeksiyon penceresini büyütüyor.' : 'Meteorolojik enfeksiyon koşulları sınırlı.' },
    { name: 'Zararlı', score: Math.round(pest), weight: .22, sources: ['weather', ...(input.cameraPestSignal != null ? ['camera'] : [])], reason: w.temperatureC >= 20 ? 'Sıcaklık aktiviteyi destekliyor.' : 'Sıcaklık aktiviteyi sınırlıyor.' },
    { name: 'Su stresi', score: Math.round(waterStress), weight: .16, sources: input.soilMoisturePct != null ? ['soil', 'weather'] : ['weather'], reason: input.soilMoisturePct == null ? 'Toprak sensörü yok; yağış tabanlı tahmin kullanılıyor.' : 'Toprak nemi karar motoruna dahil edildi.' },
    { name: 'Isı stresi', score: Math.round(heatStress), weight: .16, sources: ['weather'], reason: heatStress > 0 ? 'Yüksek sıcaklık bitki stresini artırıyor.' : 'Kritik sıcaklık eşiği aşılmadı.' },
    { name: 'Don', score: Math.round(frostRisk), weight: .12, sources: ['weather'], reason: frostRisk > 0 ? 'Düşük sıcaklık riski mevcut.' : 'Don sinyali yok.' }
  ];

  const alerts: AgroAlert[] = factors.filter(f => f.score >= 65).map(f => ({
    severity: levelFor(f.score) as Exclude<RiskLevel, 'LOW' | 'WATCH'>,
    title: `${f.name} riski yükseldi`,
    reason: f.reason,
    priority: Math.round(f.score * f.weight)
  })).sort((a, b) => b.priority - a.priority);

  const actions = [
    disease >= 70 ? 'Öncelikli saha taraması yap ve hastalık belirtilerini doğrula.' : 'Hastalık belirtilerini günlük izle.',
    pest >= 65 ? 'Zararlı popülasyonunu kamera veya tuzak verisiyle doğrula.' : 'Zararlı aktivitesini izle.',
    waterStress >= 65 ? 'Sulama kararını kök bölgesi nemiyle doğrula.' : 'Sulama ihtiyacını izlemeye devam et.'
  ];

  const forecast72h = [6, 12, 24, 36, 48, 72].map(hoursAhead => {
    const humidityPulse = Math.sin(hoursAhead / 14) * 3;
    const rainPulse = Math.min(8, w.rain24hMm * (hoursAhead / 72));
    const projected = Math.round(clamp(overall + humidityPulse + rainPulse + (heatStress > 45 ? hoursAhead / 18 : 0) - (frostRisk > 45 ? hoursAhead / 24 : 0)));
    return { hoursAhead, risk: projected, level: levelFor(projected) };
  });

  return { overallRisk: overall, diseaseRisk: Math.round(disease), pestRisk: Math.round(pest), waterStress: Math.round(waterStress), heatStress: Math.round(heatStress), frostRisk: Math.round(frostRisk), confidence, dataQuality: quality, level: levelFor(overall), factors, actions, alerts, forecast72h };
}

export const AgroCore = Object.freeze({ assess, levelFor, clamp });

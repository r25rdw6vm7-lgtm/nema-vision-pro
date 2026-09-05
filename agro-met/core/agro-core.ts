export type RiskLevel = 'LOW' | 'WATCH' | 'ADVISORY' | 'WARNING' | 'CRITICAL';

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
  phenology: string;
  areaHa?: number;
};

export type AssessmentInput = {
  parcel: ParcelContext;
  weather: WeatherSnapshot;
  soilMoisturePct?: number;
  cameraDiseaseSignal?: number;
  cameraPestSignal?: number;
  satelliteStressSignal?: number;
};

export type RiskFactor = {
  name: string;
  score: number;
  reason: string;
};

export type AgroAssessment = {
  overallRisk: number;
  diseaseRisk: number;
  pestRisk: number;
  waterStress: number;
  heatStress: number;
  frostRisk: number;
  confidence: number;
  level: RiskLevel;
  factors: RiskFactor[];
  actions: string[];
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function assess(input: AssessmentInput): AgroAssessment {
  const w = input.weather;
  const disease = clamp(
    0.30 * clamp((w.humidityPct - 65) * 2.2) +
    0.25 * clamp(w.leafWetnessHours * 8) +
    0.15 * clamp(w.rain24hMm * 2.5) +
    0.20 * (input.cameraDiseaseSignal ?? 0) +
    0.10 * (input.satelliteStressSignal ?? 0)
  );
  const pest = clamp(
    0.35 * clamp((w.temperatureC - 12) * 5) +
    0.20 * clamp((w.humidityPct - 45) * 1.4) +
    0.25 * (input.cameraPestSignal ?? 0) +
    0.20 * clamp(w.solarHours * 8)
  );
  const waterStress = clamp(
    input.soilMoisturePct == null ? 30 + Math.max(0, 22 - w.rain24hMm) * 2 :
    (45 - input.soilMoisturePct) * 2.2
  );
  const heatStress = clamp((w.temperatureC - 28) * 7);
  const frostRisk = clamp((5 - w.temperatureC) * 14);
  const overall = Math.round(
    disease * 0.34 + pest * 0.22 + waterStress * 0.16 + heatStress * 0.16 + frostRisk * 0.12
  );
  const confidence = Math.round(clamp(
    65 + (input.soilMoisturePct != null ? 8 : 0) + (input.cameraDiseaseSignal != null ? 8 : 0) +
    (input.cameraPestSignal != null ? 6 : 0) + (input.satelliteStressSignal != null ? 5 : 0)
  ));
  const level: RiskLevel = overall >= 85 ? 'CRITICAL' : overall >= 70 ? 'WARNING' : overall >= 50 ? 'ADVISORY' : overall >= 30 ? 'WATCH' : 'LOW';
  const factors: RiskFactor[] = [
    { name: 'Hastalık', score: Math.round(disease), reason: w.humidityPct >= 80 || w.leafWetnessHours >= 5 ? 'Yüksek nem ve yaprak ıslaklığı enfeksiyon penceresini büyütüyor.' : 'Meteorolojik enfeksiyon koşulları sınırlı.' },
    { name: 'Zararlı', score: Math.round(pest), reason: w.temperatureC >= 20 ? 'Sıcaklık birçok zararlının aktivitesini destekliyor.' : 'Sıcaklık aktiviteyi sınırlıyor.' },
    { name: 'Su stresi', score: Math.round(waterStress), reason: input.soilMoisturePct == null ? 'Toprak sensörü yok; yağış tabanlı tahmin kullanılıyor.' : 'Toprak nemi değerlendirmeye dahil edildi.' },
    { name: 'Isı stresi', score: Math.round(heatStress), reason: heatStress > 0 ? 'Yüksek sıcaklık bitki stresini artırıyor.' : 'Kritik sıcaklık eşiği aşılmadı.' },
    { name: 'Don', score: Math.round(frostRisk), reason: frostRisk > 0 ? 'Düşük sıcaklık riski mevcut.' : 'Don sinyali yok.' }
  ];
  const actions = [
    disease >= 70 ? 'Hastalık için parsel taraması ve yaprak kontrolü yap.' : 'Hastalık belirtilerini günlük gözlemle.',
    pest >= 65 ? 'Zararlı popülasyonunu tuzak/kamera ile doğrula.' : 'Zararlı aktivitesini izle.',
    waterStress >= 65 ? 'Sulama kararını kök bölgesi nemiyle doğrula.' : 'Sulama ihtiyacını izlemeye devam et.'
  ];
  return { overallRisk: overall, diseaseRisk: Math.round(disease), pestRisk: Math.round(pest), waterStress: Math.round(waterStress), heatStress: Math.round(heatStress), frostRisk: Math.round(frostRisk), confidence, level, factors, actions };
}

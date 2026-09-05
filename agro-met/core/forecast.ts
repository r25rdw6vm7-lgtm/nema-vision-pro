import type { AgroAssessment, AssessmentInput, RiskLevel } from './agro-core';
import { assess } from './agro-core';
import type { ForecastWeather } from './contracts';

export type RiskForecastPoint = Readonly<{ hoursAhead: number; level: RiskLevel; overall: number; disease: number; pest: number; water: number; heat: number; frost: number; confidence: number }>;

const HORIZONS = [6, 12, 24, 36, 48, 72];
const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function forecastRisk(base: AssessmentInput, weather: ForecastWeather[] = [], horizons = HORIZONS): RiskForecastPoint[] {
  return horizons.map(hoursAhead => {
    const candidates = weather.filter(w => w.hoursAhead <= hoursAhead).sort((a, b) => Math.abs(a.hoursAhead - hoursAhead) - Math.abs(b.hoursAhead - hoursAhead));
    const w = candidates[0];
    const input: AssessmentInput = w ? { ...base, weather: w } : base;
    const a: AgroAssessment = assess(input);
    const confidencePenalty = w ? 0 : 20;
    return { hoursAhead, level: a.level, overall: a.overallRisk, disease: a.diseaseRisk, pest: a.pestRisk, water: a.waterStress, heat: a.heatStress, frost: a.frostRisk, confidence: clamp(a.confidence - confidencePenalty) };
  });
}

export function peakRisk(points: RiskForecastPoint[]): RiskForecastPoint | null {
  return points.length ? [...points].sort((a, b) => b.overall - a.overall)[0] : null;
}

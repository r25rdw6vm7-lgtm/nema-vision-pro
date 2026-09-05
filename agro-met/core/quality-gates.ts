import type { DataQuality, Observation, ObservationStatus } from './contracts';

export type QualityGateStatus = 'pass' | 'warn' | 'fail';
export type QualityGate = Readonly<{ name: string; status: QualityGateStatus; score: number; message: string }>;
export type QualityReport = Readonly<{ status: QualityGateStatus; score: number; gates: QualityGate[] }>;

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function freshnessGate(ageMinutes: number | undefined, staleAfterMinutes: number): QualityGate {
  if (ageMinutes === undefined) return { name: 'freshness', status: 'warn', score: 70, message: 'Veri yaşı belirtilmemiş.' };
  if (!Number.isFinite(ageMinutes) || ageMinutes < 0) return { name: 'freshness', status: 'fail', score: 0, message: 'Veri yaşı geçersiz.' };
  if (ageMinutes > staleAfterMinutes * 2) return { name: 'freshness', status: 'fail', score: 20, message: 'Veri çok eski.' };
  if (ageMinutes > staleAfterMinutes) return { name: 'freshness', status: 'warn', score: 55, message: 'Veri bayat; karar güveni düşürülmeli.' };
  return { name: 'freshness', status: 'pass', score: 100, message: 'Veri güncel.' };
}

function provenanceGate<T>(observation: Observation<T>): QualityGate {
  const p = observation.provenance;
  const validStatus: ObservationStatus[] = ['fresh', 'stale', 'expired', 'missing', 'invalid'];
  if (!validStatus.includes(p.status)) return { name: 'provenance', status: 'fail', score: 0, message: 'Kaynak durumu geçersiz.' };
  if (p.status === 'invalid' || p.status === 'missing') return { name: 'provenance', status: 'fail', score: 0, message: 'Kaynak verisi geçersiz veya eksik.' };
  if (p.status === 'expired') return { name: 'provenance', status: 'fail', score: 20, message: 'Kaynak verisinin süresi dolmuş.' };
  if (p.status === 'stale') return { name: 'provenance', status: 'warn', score: 60, message: 'Kaynak verisi eski.' };
  return { name: 'provenance', status: 'pass', score: 100, message: 'Kaynak doğrulaması uygun.' };
}

export function assessObservationQuality<T>(observation: Observation<T>, staleAfterMinutes = 60): QualityReport {
  const gates = [freshnessGate(observation.provenance.ageMinutes, staleAfterMinutes), provenanceGate(observation)];
  const score = clamp(gates.reduce((sum, gate) => sum + gate.score, 0) / gates.length);
  const status: QualityGateStatus = gates.some(g => g.status === 'fail') ? 'fail' : gates.some(g => g.status === 'warn') ? 'warn' : 'pass';
  return { status, score, gates };
}

export function aggregateQuality(qualities: Array<{ quality: DataQuality; ageMinutes?: number }>): QualityReport {
  if (!qualities.length) return { status: 'fail', score: 0, gates: [{ name: 'completeness', status: 'fail', score: 0, message: 'Hiç veri yok.' }] };
  const weights: Record<DataQuality, number> = { excellent: 100, good: 85, fair: 65, poor: 40, unusable: 0 };
  const score = clamp(qualities.reduce((s, q) => s + weights[q.quality], 0) / qualities.length);
  const status: QualityGateStatus = score >= 80 ? 'pass' : score >= 50 ? 'warn' : 'fail';
  return { status, score, gates: [{ name: 'aggregate-quality', status, score, message: `Birleşik veri kalitesi ${Math.round(score)}/100.` }] };
}

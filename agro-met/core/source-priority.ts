import type { AdapterKind, DataQuality, Observation, Provenance } from './contracts';

export type SourceCandidate<T> = Readonly<{ value: T; provenance: Provenance }>;
export type SourceDecision<T> = Readonly<{ selected: SourceCandidate<T> | null; rejected: Array<{ source: AdapterKind; reason: string }>; confidence: number }>;

const qualityWeight: Record<DataQuality, number> = { excellent: 1, good: 0.85, fair: 0.65, poor: 0.4, unusable: 0 };
const kindWeight: Record<AdapterKind, number> = { manual: 0.95, weather: 0.95, satellite: 0.9, soil: 0.9, camera: 0.9, 'pest-trap': 0.88, parcel: 0.98, location: 0.98 };

function score<T>(candidate: SourceCandidate<T>): number {
  const p = candidate.provenance;
  const agePenalty = p.ageMinutes === undefined ? 0.9 : Math.max(0.1, 1 - Math.min(p.ageMinutes, 1440) / 1440);
  const statusPenalty = p.status === 'fresh' ? 1 : p.status === 'stale' ? 0.65 : p.status === 'expired' ? 0.2 : 0;
  return qualityWeight[p.quality] * (kindWeight[p.source] ?? 0.5) * agePenalty * statusPenalty;
}

export function selectBestSource<T>(candidates: Array<SourceCandidate<T>>): SourceDecision<T> {
  if (!candidates.length) return { selected: null, rejected: [], confidence: 0 };
  const ranked = [...candidates].sort((a, b) => score(b) - score(a));
  const best = ranked[0];
  const rejected = ranked.slice(1).map(c => ({ source: c.provenance.source, reason: `Daha düşük kaynak skoru (${score(c).toFixed(3)}).` }));
  return { selected: score(best) > 0 ? best : null, rejected, confidence: Math.round(Math.min(1, score(best)) * 100) };
}

export function asCandidate<T>(observation: Observation<T>): SourceCandidate<T> { return observation; }

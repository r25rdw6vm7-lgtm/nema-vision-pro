export type TimePoint = { at: string; value: number };
export type Trend = { slope: number; direction: 'rising' | 'falling' | 'stable'; changePct: number; confidence: number };

export function trend(points: TimePoint[]): Trend {
  if (points.length < 2) return { slope:0, direction:'stable', changePct:0, confidence:20 };
  const first = points[0]!.value, last = points[points.length-1]!.value;
  const slope = (last-first)/(points.length-1);
  const changePct = first === 0 ? (last === 0 ? 0 : 100) : ((last-first)/Math.abs(first))*100;
  return { slope, direction: Math.abs(slope)<0.01 ? 'stable' : slope>0 ? 'rising' : 'falling', changePct, confidence:Math.min(100, 50+points.length*5) };
}

export function anomalyScore(value: number, baseline: number, deviation: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || !Number.isFinite(deviation) || deviation <= 0) return 0;
  return Math.max(0, Math.min(100, Math.abs(value-baseline)/deviation*25));
}

export function weightedScore(parts: Array<{ score:number; weight:number; confidence?:number }>): number {
  const valid = parts.filter(p => Number.isFinite(p.score) && Number.isFinite(p.weight) && p.weight > 0);
  const denom = valid.reduce((s,p)=>s+p.weight*Math.max(.1,(p.confidence ?? 100)/100),0);
  return denom ? valid.reduce((s,p)=>s+p.score*p.weight*Math.max(.1,(p.confidence ?? 100)/100),0)/denom : 0;
}

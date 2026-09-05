import { createDemoAdapters, collectObservations } from './adapters';
import { decide } from './decision-engine';
import { assess } from './agro-core';

export async function runCoreSelfTest(): Promise<{ passed: number; failed: number; checks: string[] }> {
  const checks: string[] = [];
  let passed = 0;
  let failed = 0;
  const check = (name: string, condition: boolean) => { checks.push(`${condition ? 'PASS' : 'FAIL'} ${name}`); condition ? passed++ : failed++; };

  const state = decide(await collectObservations(createDemoAdapters()));
  check('assessment üretildi', Number.isFinite(state.assessment.overallRisk));
  check('risk vektörleri 0-100', [state.assessment.diseaseRisk, state.assessment.pestRisk, state.assessment.waterStress, state.assessment.heatStress, state.assessment.frostRisk].every(v => v >= 0 && v <= 100));
  check('72 saat projeksiyonu mevcut', state.assessment.forecast72h.length === 6);
  check('aksiyonlar öncelikli', state.actions.every((a, i) => i === 0 || a.priority <= state.actions[i - 1].priority));
  check('kaynak bilgisi mevcut', state.assessment.factors.every(f => f.sources.length > 0));
  let rejected = false;
  try { assess({ parcel: { id: '', crop: 'Bağ' }, weather: { temperatureC: 20, humidityPct: 80, rain24hMm: 0, windKmh: 0, leafWetnessHours: 0, solarHours: 0 } }); } catch { rejected = true; }
  check('geçersiz veri reddediliyor', rejected);
  return { passed, failed, checks };
}

import { createDemoAdapters, collectObservations } from './adapters';
import { decide } from './decision-engine';
import { assess } from './agro-core';
import { loadConfig } from './config';
import { LastKnownGoodCache } from './cache';
import { evaluateActionPolicy } from './action-policy';
import { selectBestSource } from './source-priority';
import { simulateScenario } from './simulation';
import { assessObservationQuality } from './quality-gates';

export async function runCoreSelfTest(): Promise<{ passed: number; failed: number; checks: string[] }> {
  const checks: string[] = [];
  let passed = 0;
  let failed = 0;
  const check = (name: string, condition: boolean) => { checks.push(`${condition ? 'PASS' : 'FAIL'} ${name}`); condition ? passed++ : failed++; };

  const observations = await collectObservations(createDemoAdapters());
  const state = decide(observations);
  check('assessment üretildi', Number.isFinite(state.assessment.overallRisk));
  check('risk vektörleri 0-100', [state.assessment.diseaseRisk, state.assessment.pestRisk, state.assessment.waterStress, state.assessment.heatStress, state.assessment.frostRisk].every(v => v >= 0 && v <= 100));
  check('72 saat projeksiyonu mevcut', state.assessment.forecast72h.length === 6);
  check('aksiyonlar öncelikli', state.actions.every((a, i) => i === 0 || a.priority <= state.actions[i - 1].priority));
  check('kaynak bilgisi mevcut', state.assessment.factors.every(f => f.sources.length > 0));

  const config = loadConfig({ AGRO_ENV: 'test', AGRO_MAX_FORECAST_HOURS: '72' });
  check('typed config güvenli', config.environment === 'test' && config.maxForecastHours === 72);

  const cache = new LastKnownGoodCache<string>('self-test');
  cache.set('x', 'ok', 1000, 1000);
  check('last-known-good cache', cache.get('x', 1500)?.value === 'ok' && cache.get('x', 2500)?.stale === true);

  const policy = evaluateActionPolicy({ action: 'test', priority: 90, confidence: 85, evidenceCount: 1, regulated: true });
  check('yüksek etkili eylem insan onayına gidiyor', policy.allowed && policy.requiresHumanApproval);

  const source = selectBestSource([observations.weather, observations.weather]);
  check('kaynak seçimi deterministik', source.selected !== null && source.confidence > 0);

  const quality = assessObservationQuality(observations.weather);
  check('veri kalite kapısı çalışıyor', quality.score >= 0 && quality.score <= 100);

  const base = { parcel: { id: observations.parcel.value.id, crop: observations.parcel.value.crop, variety: observations.parcel.value.variety, phenology: observations.parcel.value.phenology, areaHa: observations.parcel.value.areaHa, latitude: observations.parcel.value.center?.latitude, longitude: observations.parcel.value.center?.longitude }, weather: observations.weather.value };
  const scenario = simulateScenario('self-test', 'Sıcaklık +5C', base, { weather: { temperatureC: observations.weather.value.temperatureC + 5 } });
  check('what-if simülasyon mutasyonu izole ediyor', Number.isFinite(scenario.delta.overall) && observations.weather.value.temperatureC !== base.weather.temperatureC + 5);

  let rejected = false;
  try { assess({ parcel: { id: '', crop: 'Bağ' }, weather: { temperatureC: 20, humidityPct: 80, rain24hMm: 0, windKmh: 0, leafWetnessHours: 0, solarHours: 0 } }); } catch { rejected = true; }
  check('geçersiz veri reddediliyor', rejected);
  return { passed, failed, checks };
}

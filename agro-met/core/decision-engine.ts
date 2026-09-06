import { assess, type AgroAssessment, type AssessmentInput } from './agro-core';
import type { Action, DecisionEvent, SystemState, UnifiedObservationSet } from './contracts';

export const ENGINE_VERSION = '2.0.0';

function toAssessmentInput(o: UnifiedObservationSet): AssessmentInput {
  const p = o.parcel.value;
  const w = o.weather.value;
  return {
    parcel: { id: p.id, crop: p.crop, variety: p.variety, phenology: p.phenology, areaHa: p.areaHa, latitude: p.center?.latitude, longitude: p.center?.longitude },
    weather: w,
    soilMoisturePct: o.soil?.value.moisturePct,
    cameraDiseaseSignal: o.vision?.value.disease,
    cameraPestSignal: o.vision?.value.pest,
    satelliteStressSignal: o.satellite?.value.stress,
    dataAgeMinutes: {
      weather: o.weather.provenance.ageMinutes,
      soil: o.soil?.provenance.ageMinutes,
      camera: o.vision?.provenance.ageMinutes,
      satellite: o.satellite?.provenance.ageMinutes,
    },
  };
}

export function prioritizeActions(a: AgroAssessment): Action[] {
  const actions: Action[] = [];
  if (a.diseaseRisk >= 70) actions.push({ id: 'disease-scout', title: 'Hastalık doğrulama taraması', priority: 95, urgency: 'urgent', rationale: a.factors.find(f => f.name === 'Hastalık')?.reason ?? 'Hastalık riski yüksek.', dueHours: 6 });
  if (a.pestRisk >= 65) actions.push({ id: 'pest-verify', title: 'Zararlı doğrulaması', priority: 88, urgency: 'soon', rationale: a.factors.find(f => f.name === 'Zararlı')?.reason ?? 'Zararlı riski yüksek.', dueHours: 12 });
  if (a.waterStress >= 65) actions.push({ id: 'water-check', title: 'Kök bölgesi nem kontrolü', priority: 82, urgency: 'soon', rationale: 'Sulama kararı gerçek kök bölgesi nemiyle doğrulanmalı.', dueHours: 12 });
  if (a.heatStress >= 65) actions.push({ id: 'heat-protection', title: 'Isı stresi kontrolü', priority: 90, urgency: 'urgent', rationale: 'Yüksek sıcaklık stresi kritik seviyeye yaklaşıyor.', dueHours: 6 });
  if (a.frostRisk >= 50) actions.push({ id: 'frost-watch', title: 'Don hazırlığı', priority: 98, urgency: 'immediate', rationale: 'Don riski saha koruma kararını gerektirebilir.', dueHours: 3 });
  if (!actions.length) actions.push({ id: 'routine-scout', title: 'Rutin saha gözlemi', priority: 35, urgency: 'routine', rationale: 'Yüksek öncelikli risk bulunmadı.', dueHours: 24 });
  return actions.sort((x, y) => y.priority - x.priority);
}

export function buildEvents(assessment: AgroAssessment, parcelId: string): DecisionEvent[] {
  const now = new Date().toISOString();
  const events: DecisionEvent[] = [{ id: `assessment-${Date.now()}`, type: 'assessment.created', occurredAt: now, parcelId, severity: assessment.level, message: `Risk değerlendirmesi ${assessment.level} seviyesinde üretildi.` }];
  for (const alert of assessment.alerts) events.push({ id: `alert-${alert.title}`, type: 'alert.created', occurredAt: now, parcelId, severity: alert.severity, message: `${alert.title}: ${alert.reason}` });
  return events;
}

export function decide(observations: UnifiedObservationSet): SystemState {
  const assessment = assess(toAssessmentInput(observations));
  const actions = prioritizeActions(assessment);
  return { assessment, observations, actions, events: buildEvents(assessment, observations.parcel.value.id), generatedAt: new Date().toISOString(), engineVersion: ENGINE_VERSION };
}

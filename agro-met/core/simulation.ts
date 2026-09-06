import { assess, type AgroAssessment, type AssessmentInput } from './agro-core';
import type { SoilData, VisionSignal, WeatherData } from './contracts';

export type ScenarioPatch = Readonly<{ weather?: Partial<WeatherData>; soilMoisturePctDelta?: number; vision?: Partial<VisionSignal> }>;
export type ScenarioResult = Readonly<{ id: string; label: string; baseline: AgroAssessment; simulated: AgroAssessment; delta: { overall: number; disease: number; pest: number; water: number; heat: number; frost: number } }>;

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function simulateScenario(id: string, label: string, base: AssessmentInput, patch: ScenarioPatch): ScenarioResult {
  const weather = { ...base.weather, ...(patch.weather ?? {}) };
  const simulatedInput: AssessmentInput = {
    ...base,
    weather,
    soilMoisturePct: patch.soilMoisturePctDelta === undefined || base.soilMoisturePct === undefined ? base.soilMoisturePct : clamp(base.soilMoisturePct + patch.soilMoisturePctDelta),
    cameraDiseaseSignal: patch.vision?.disease ?? base.cameraDiseaseSignal,
    cameraPestSignal: patch.vision?.pest ?? base.cameraPestSignal,
  };
  const baseline = assess(base);
  const simulated = assess(simulatedInput);
  return { id, label, baseline, simulated, delta: { overall: simulated.overallRisk - baseline.overallRisk, disease: simulated.diseaseRisk - baseline.diseaseRisk, pest: simulated.pestRisk - baseline.pestRisk, water: simulated.waterStress - baseline.waterStress, heat: simulated.heatStress - baseline.heatStress, frost: simulated.frostRisk - baseline.frostRisk } };
}

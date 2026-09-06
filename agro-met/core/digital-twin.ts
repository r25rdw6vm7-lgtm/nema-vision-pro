import type { Parcel, SoilData, WeatherData } from './contracts';

export type FarmTwinState = { parcelId: string; crop: string; stage?: string; canopyHealth: number; soilMoisture?: number; waterNeedMm: number; heatLoad: number; diseasePressure: number; pestPressure: number; yieldPotential: number; generatedAt: string };
export type Scenario = { name: string; irrigationMm?: number; temperatureDeltaC?: number; diseaseControlPct?: number; pestControlPct?: number };

export function buildFarmTwin(parcel: Parcel, weather: WeatherData, soil?: SoilData, diseasePressure = 0, pestPressure = 0): FarmTwinState {
  const moisture = soil?.moisturePct;
  const waterNeed = Math.max(0, 25 - (moisture ?? 35)) + Math.max(0, weather.temperatureC - 24) * 0.7;
  const heatLoad = Math.max(0, weather.temperatureC - 28) * 8;
  const canopyHealth = Math.max(0, 100 - diseasePressure * 0.35 - pestPressure * 0.2 - heatLoad * 0.25);
  const yieldPotential = Math.max(0, Math.min(100, canopyHealth - Math.max(0, waterNeed - 8) * 2));
  return { parcelId: parcel.id, crop: parcel.crop, stage: parcel.phenology, canopyHealth: Math.round(canopyHealth), soilMoisture: moisture, waterNeedMm: Number(waterNeed.toFixed(1)), heatLoad: Math.round(heatLoad), diseasePressure, pestPressure, yieldPotential: Math.round(yieldPotential), generatedAt: new Date().toISOString() };
}

export function simulateScenario(twin: FarmTwinState, scenario: Scenario): FarmTwinState {
  const irrigation = scenario.irrigationMm ?? 0;
  const temp = scenario.temperatureDeltaC ?? 0;
  const disease = Math.max(0, twin.diseasePressure * (1 - (scenario.diseaseControlPct ?? 0) / 100));
  const pest = Math.max(0, twin.pestPressure * (1 - (scenario.pestControlPct ?? 0) / 100));
  const moisture = twin.soilMoisture == null ? undefined : Math.min(100, twin.soilMoisture + irrigation * 0.45);
  const heat = Math.max(0, twin.heatLoad + temp * 8);
  const waterNeed = Math.max(0, twin.waterNeedMm - irrigation);
  const health = Math.max(0, Math.min(100, 100 - disease*.35 - pest*.2 - heat*.25 - Math.max(0,waterNeed-8)*2));
  return { ...twin, soilMoisture: moisture, waterNeedMm:Number(waterNeed.toFixed(1)), diseasePressure:Math.round(disease), pestPressure:Math.round(pest), heatLoad:Math.round(heat), canopyHealth:Math.round(health), yieldPotential:Math.round(health) };
}

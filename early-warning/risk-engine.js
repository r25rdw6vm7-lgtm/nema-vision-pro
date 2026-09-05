/**
 * AGRO-MET Early Warning Engine v1
 * Pure, deterministic scoring functions. Replace the sample inputs with live
 * weather, camera, sensor, satellite and phenology observations.
 */

export const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const n = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;

export function diseaseRisk({ temperatureC, relativeHumidity, leafWetnessHours, rain24hMm, susceptibleStage = 0.6, cameraEvidence = 0 }) {
  const temp = clamp(100 - Math.abs(n(temperatureC) - 22) * 11);
  const humidity = clamp((n(relativeHumidity) - 55) * 2.2);
  const wetness = clamp(n(leafWetnessHours) * 8.5);
  const rain = clamp(n(rain24hMm) * 4);
  const stage = clamp(n(susceptibleStage) * 100);
  const visual = clamp(n(cameraEvidence));
  return clamp(temp * .16 + humidity * .23 + wetness * .24 + rain * .10 + stage * .12 + visual * .15);
}

export function pestRisk({ temperatureC, degreeDayProgress = 0, humidity = 60, trapCountTrend = 0, hostStage = 0.5 }) {
  const temp = clamp(100 - Math.abs(n(temperatureC) - 25) * 8);
  const dd = clamp(n(degreeDayProgress) * 100);
  const hum = clamp((n(humidity) - 35) * 1.55);
  const trap = clamp((n(trapCountTrend) + 1) * 50);
  const host = clamp(n(hostStage) * 100);
  return clamp(temp * .20 + dd * .28 + hum * .12 + trap * .25 + host * .15);
}

export function stressRisk({ temperatureC, rain7dMm = 0, soilMoisturePct = 35, forecastHeatHours = 0, frostHours = 0 }) {
  const heat = clamp((n(temperatureC) - 27) * 7);
  const drought = clamp((35 - n(soilMoisturePct)) * 2.4);
  const heatForecast = clamp(n(forecastHeatHours) * 7);
  const frost = clamp(n(frostHours) * 18);
  const rainDeficit = clamp((35 - Math.min(n(rain7dMm), 35)) * 1.3);
  return clamp(heat * .28 + drought * .30 + heatForecast * .18 + frost * .14 + rainDeficit * .10);
}

export function aggregateRisk({ disease, pest, waterStress, heatStress, frost, heavyRain }) {
  return clamp(n(disease) * .30 + n(pest) * .18 + n(waterStress) * .14 + n(heatStress) * .14 + n(frost) * .10 + n(heavyRain) * .14);
}

export function riskLevel(score) {
  const s = clamp(score);
  if (s >= 85) return { key: 'critical', label: 'KRİTİK', color: 'red' };
  if (s >= 70) return { key: 'warning', label: 'YÜKSEK RİSK', color: 'red' };
  if (s >= 50) return { key: 'advisory', label: 'DİKKAT', color: 'amber' };
  if (s >= 30) return { key: 'watch', label: 'İZLEMELİ', color: 'green' };
  return { key: 'normal', label: 'NORMAL', color: 'green' };
}

export function confidence({ weatherCoverage = 1, cameraCoverage = 0.5, sensorCoverage = 0.5, modelFit = 0.8 }) {
  return Math.round(clamp(weatherCoverage * 35 + cameraCoverage * 25 + sensorCoverage * 20 + modelFit * 20));
}

export function explain({ disease, humidity, leafWetnessHours, temperatureC, rain24hMm }) {
  const reasons = [];
  if (n(humidity) >= 80) reasons.push('yüksek bağıl nem');
  if (n(leafWetnessHours) >= 6) reasons.push('uzun yaprak ıslaklığı');
  if (n(temperatureC) >= 18 && n(temperatureC) <= 27) reasons.push('hastalık gelişimine uygun sıcaklık');
  if (n(rain24hMm) >= 5) reasons.push('son 24 saatte yağış');
  if (!reasons.length) reasons.push('çoklu çevresel sinyaller');
  return `Hastalık riskini artıran ana sinyaller: ${reasons.join(', ')}. Hesaplanan risk ${Math.round(n(disease))}/100.`;
}

export function evaluate(input) {
  const disease = diseaseRisk(input);
  const pest = pestRisk(input);
  const waterStress = stressRisk(input);
  const heatStress = clamp((n(input.temperatureC) - 28) * 8 + n(input.forecastHeatHours) * 5);
  const frost = clamp(n(input.frostHours) * 20);
  const heavyRain = clamp(n(input.rain24hMm) * 5);
  const overall = aggregateRisk({ disease, pest, waterStress, heatStress, frost, heavyRain });
  return { disease, pest, waterStress, heatStress, frost, heavyRain, overall, level: riskLevel(overall), confidence: confidence(input), explanation: explain({ disease, ...input }) };
}

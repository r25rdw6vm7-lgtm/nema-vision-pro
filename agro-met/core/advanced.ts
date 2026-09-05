import type { ForecastWeather, GeoPoint, SoilData, TrapSignal, VisionSignal, WeatherData } from './contracts';

export type RiskVector = 'disease' | 'pest' | 'water' | 'heat' | 'frost' | 'weed' | 'nutrition' | 'yield' | 'climate' | 'harvest';
export type Urgency = 'routine' | 'soon' | 'urgent' | 'immediate';
export type CapabilityDomain = 'core' | 'parcel' | 'location' | 'weather' | 'soil' | 'crop' | 'vision' | 'disease' | 'pest' | 'weed' | 'irrigation' | 'nutrition' | 'satellite' | 'early-warning' | 'digital-twin' | 'decision' | 'agronomist-ai' | 'operations' | 'economics' | 'harvest' | 'climate' | 'knowledge' | 'security' | 'platform' | 'robotics';

export type Capability = { id: string; domain: CapabilityDomain; title: string; maturity: 'contract' | 'engine' | 'adapter' | 'production'; enabled: boolean };

const domains: Record<CapabilityDomain, string[]> = {
  core: ['typed-contracts','validation','provenance','freshness','uncertainty','calibration','anomaly-detection','drift-detection','model-health','explainability'],
  parcel: ['parcel-crud','polygon','area','elevation','slope','aspect','drainage','soil-zones','risk-zones','yield-zones'],
  location: ['device-gps','gnss','rtk','accuracy','track','coverage','field-routing'],
  weather: ['realtime','hourly-forecast','72h-forecast','7d-forecast','et0','vpd','dew-point','frost','heat','hail','storm','rainfall','microclimate'],
  soil: ['moisture','temperature','ec','ph','nutrients','salinity','root-zone','water-balance','sensor-health'],
  crop: ['crop-profile','variety-profile','phenology','degree-days','growth-stage','stress-state','yield-potential'],
  vision: ['object-detection','classification','segmentation','tracking','image-quality','video-understanding','before-after','plant-structure','multimodal'],
  disease: ['disease-library','infection-window','onset','severity','spread','hotspot','treatment-verification','resistance-risk'],
  pest: ['species','life-stage','trap-count','flight','degree-days','generation','threshold','spread','regional-radar'],
  weed: ['weed-detection','species','density','hotspot','selective-control'],
  irrigation: ['need','timing','duration','dose','et-based','sensor-based','stress-based','water-budget','post-check'],
  nutrition: ['deficiency-vision','soil-analysis','leaf-analysis','n-p-k','micro-elements','fertilization-plan','post-check'],
  satellite: ['sentinel','landsat','ndvi','ndre','ndmi','evi','savi','gndvi','msi','timeseries','change-detection','stress-zones'],
  'early-warning': ['multi-risk','alerts','escalation','72h','outbreak','regional-radar','loss-risk'],
  'digital-twin': ['parcel-twin','plant-twin','soil-twin','microclimate','water-budget','growth-simulation','scenario-simulation'],
  decision: ['prioritization','alternatives','cost-benefit','roi','expected-loss','what-if','human-approval','action-verification'],
  'agronomist-ai': ['natural-language','photo-question','voice','daily-brief','season-report','expert-mode','farmer-mode','evidence-citations'],
  operations: ['tasks','assignment','scouting','irrigation-task','spray-task','fertilization-task','harvest-task','proof','quality-control'],
  economics: ['costs','yield-value','loss-estimate','roi','profit-per-ha','scenario-profit'],
  harvest: ['maturity','quality','yield-estimate','harvest-window','labor','logistics','storage-risk','shelf-life'],
  climate: ['trend','drought','extremes','crop-suitability','variety-suitability','adaptation'],
  knowledge: ['knowledge-graph','literature-rag','technical-docs','regulation','source-ranking','evidence-level'],
  security: ['auth','roles','tenant-isolation','audit','encryption','backup','recovery'],
  platform: ['offline','sync-queue','cache','conflict-resolution','background-jobs','observability','versioning','feature-flags'],
  robotics: ['drone','robot','tractor-telemetry','route-planning','variable-rate','autonomous-scouting'],
};

export function capabilityRegistry(): Capability[] {
  return Object.entries(domains).flatMap(([domain, ids]) => ids.map((id, i) => ({ id, domain: domain as CapabilityDomain, title: id.replace(/-/g, ' '), maturity: i < 3 ? 'contract' : 'engine', enabled: true })));
}

export type AdvancedSignals = { weather?: WeatherData; forecast?: ForecastWeather[]; soil?: SoilData; vision?: VisionSignal; traps?: TrapSignal[]; satellite?: { stress: number; ndvi?: number; ndre?: number; ndmi?: number }; location?: GeoPoint; phenology?: string };
export type AdvancedInsight = { vector: RiskVector; score: number; confidence: number; reason: string; actions: string[]; uncertainty: number };

const clamp = (n: number) => Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
const avg = (xs: number[]) => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0;

export function degreeDayEstimate(baseC: number, temps: number[]): number { return temps.reduce((sum, t) => sum + Math.max(0, t - baseC), 0); }
export function vpdKpa(tempC: number, humidityPct: number): number { const es = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3)); return Math.max(0, es * (1 - humidityPct / 100)); }
export function et0Proxy(weather: WeatherData): number { const vpd = vpdKpa(weather.temperatureC, weather.humidityPct); return Math.max(0, 0.15 * (weather.temperatureC + 17) + 0.45 * vpd + 0.2 * weather.solarHours); }

export function analyzeAdvancedSignals(s: AdvancedSignals): AdvancedInsight[] {
  const out: AdvancedInsight[] = [];
  if (s.weather) {
    const w = s.weather;
    const heat = clamp((w.temperatureC - 28) * 7);
    const frost = clamp((5 - w.temperatureC) * 14);
    const disease = clamp((w.humidityPct - 60) * 2 + w.leafWetnessHours * 8 + w.rain24hMm * 1.5);
    const vpd = vpdKpa(w.temperatureC, w.humidityPct);
    out.push({ vector:'heat', score:heat, confidence:82, reason: heat > 0 ? 'Sıcaklık bitki stres eşiğini aşıyor.' : 'Isı stresi sinyali düşük.', actions: heat >= 65 ? ['Öğle saatlerinde bitki stresini doğrula.'] : ['Normal izle.'], uncertainty:8 });
    out.push({ vector:'frost', score:frost, confidence:88, reason: frost > 0 ? 'Düşük sıcaklık don riskini artırıyor.' : 'Don sinyali düşük.', actions: frost >= 50 ? ['Don koruma hazırlığını değerlendir.'] : ['Normal izle.'], uncertainty:6 });
    out.push({ vector:'disease', score:disease, confidence:76, reason: `Enfeksiyon ortamı: nem ${w.humidityPct}%, yaprak ıslaklığı ${w.leafWetnessHours}s, VPD ${vpd.toFixed(2)} kPa.`, actions: disease >= 65 ? ['Saha doğrulaması yap.'] : ['Belirti takibi yap.'], uncertainty:18 });
  }
  if (s.soil) {
    const m = s.soil.moisturePct;
    if (m != null) out.push({ vector:'water', score:clamp((45-m)*2.2), confidence:90, reason:`Kök bölgesi su sinyali ${m}%.`, actions:m < 25 ? ['Sulama ihtiyacını kök bölgesiyle doğrula.'] : ['Nem trendini izle.'], uncertainty:10 });
    if (s.soil.salinityRisk != null) out.push({ vector:'nutrition', score:clamp(s.soil.salinityRisk), confidence:75, reason:'Toprak tuzluluk riski beslenme ve su alımını etkileyebilir.', actions:s.soil.salinityRisk > 60 ? ['EC ve drenajı kontrol et.'] : ['EC trendini izle.'], uncertainty:25 });
  }
  if (s.vision) {
    out.push({ vector:'disease', score:clamp(s.vision.disease), confidence:clamp(s.vision.cropConfidence ?? 70), reason:`Görüntü modeli hastalık sinyali ${s.vision.disease}/100.`, actions:s.vision.disease >= 70 ? ['Aynı bölgeden doğrulama görüntüsü al.'] : ['Yeni görüntüyle izle.'], uncertainty:100-clamp(s.vision.cropConfidence ?? 70) });
    out.push({ vector:'pest', score:clamp(s.vision.pest), confidence:clamp(s.vision.cropConfidence ?? 70), reason:`Görüntü modeli zararlı sinyali ${s.vision.pest}/100.`, actions:s.vision.pest >= 65 ? ['Tuzak/kamera ile doğrula.'] : ['Aktiviteyi izle.'], uncertainty:100-clamp(s.vision.cropConfidence ?? 70) });
    if (s.vision.weed != null) out.push({ vector:'weed', score:clamp(s.vision.weed), confidence:clamp(s.vision.cropConfidence ?? 70), reason:'Görüntü modeli yabancı ot sinyali üretti.', actions:s.vision.weed >= 65 ? ['Hotspot taraması yap.'] : ['İzle.'], uncertainty:100-clamp(s.vision.cropConfidence ?? 70) });
  }
  if (s.traps?.length) {
    const trend = avg(s.traps.map(t => t.trendPct ?? 0));
    const counts = s.traps.reduce((a,t)=>a+t.count,0);
    out.push({ vector:'pest', score:clamp(counts*8 + Math.max(0,trend)*0.7), confidence:84, reason:`Tuzak toplamı ${counts}, ortalama trend ${trend.toFixed(1)}%.`, actions:trend > 20 ? ['Popülasyon trendini saha taramasıyla doğrula.'] : ['Tuzak serisini sürdür.'], uncertainty:16 });
  }
  if (s.satellite) {
    out.push({ vector:'yield', score:clamp((1-(s.satellite.ndvi ?? 0.6))*100), confidence:s.satellite.ndvi != null ? 82 : 55, reason:`Uzaktan algılama stres sinyali ${s.satellite.stress}/100.`, actions:s.satellite.stress >= 60 ? ['Hotspot alanını kamera ile doğrula.'] : ['Zaman serisini izle.'], uncertainty:s.satellite.ndvi != null ? 18 : 45 });
  }
  return out;
}

export function fuseInsights(insights: AdvancedInsight[]): AdvancedInsight[] {
  const grouped = new Map<RiskVector, AdvancedInsight[]>();
  for (const i of insights) grouped.set(i.vector, [...(grouped.get(i.vector) ?? []), i]);
  return [...grouped.entries()].map(([vector, xs]) => {
    const weights = xs.map(x => Math.max(0.1, x.confidence / 100));
    const score = clamp(xs.reduce((sum,x,i)=>sum+x.score*weights[i]!,0)/weights.reduce((a,b)=>a+b,0));
    const confidence = clamp(100 - avg(xs.map(x=>x.uncertainty)));
    return { vector, score:Math.round(score), confidence:Math.round(confidence), reason:xs.map(x=>x.reason).join(' | '), actions:[...new Set(xs.flatMap(x=>x.actions))], uncertainty:Math.round(100-confidence) };
  }).sort((a,b)=>b.score-a.score);
}

import { collectObservations, type AgroAdapters } from './adapters';
import { decide } from './decision-engine';
import { analyzeAdvancedSignals, fuseInsights } from './advanced';
import { buildFarmTwin } from './digital-twin';
import { SyncQueue, EventLog } from './platform';
import type { SystemState } from './contracts';

export type OrchestratedState = SystemState & { intelligence: ReturnType<typeof fuseInsights>; twin: ReturnType<typeof buildFarmTwin>; syncPending: number };

export class AgroIntelligenceOrchestrator {
  readonly sync = new SyncQueue();
  readonly events = new EventLog<string>();
  constructor(private readonly adapters: AgroAdapters) {}

  async run(): Promise<OrchestratedState> {
    const observations = await collectObservations(this.adapters);
    const base = decide(observations);
    const intelligence = fuseInsights(analyzeAdvancedSignals({
      weather: observations.weather.value,
      forecast: observations.forecast?.value,
      soil: observations.soil?.value,
      vision: observations.vision?.value,
      traps: observations.traps?.value,
      satellite: observations.satellite?.value,
      location: observations.location?.value,
      phenology: observations.parcel.value.phenology,
    }));
    const twin = buildFarmTwin(observations.parcel.value, observations.weather.value, observations.soil?.value, base.assessment.diseaseRisk, base.assessment.pestRisk);
    this.events.append(`assessment:${observations.parcel.value.id}:${base.assessment.level}`);
    return { ...base, intelligence, twin, syncPending: this.sync.size() };
  }
}

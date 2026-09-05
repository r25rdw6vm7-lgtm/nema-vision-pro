import { collectObservations, type AgroAdapters } from './adapters';
import { decide } from './decision-engine';
import { analyzeAdvancedSignals, fuseInsights } from './advanced';
import { buildFarmTwin } from './digital-twin';
import type { SystemState } from './contracts';

export type RuntimeStatus = 'idle' | 'collecting' | 'ready' | 'stale' | 'error';
export type RuntimeSnapshot = SystemState & { intelligence: ReturnType<typeof fuseInsights>; twin: ReturnType<typeof buildFarmTwin> };

export class AgroRuntime {
  private status: RuntimeStatus = 'idle';
  private lastState: RuntimeSnapshot | null = null;
  private lastError: string | null = null;
  constructor(private readonly adapters: AgroAdapters) {}
  getStatus() { return { status:this.status, lastState:this.lastState, lastError:this.lastError }; }

  async refresh(): Promise<RuntimeSnapshot> {
    this.status='collecting'; this.lastError=null;
    try {
      const observations=await collectObservations(this.adapters);
      const base=decide(observations);
      const intelligence=fuseInsights(analyzeAdvancedSignals({ weather:observations.weather.value, forecast:observations.forecast?.value, soil:observations.soil?.value, vision:observations.vision?.value, traps:observations.traps?.value, satellite:observations.satellite?.value, location:observations.location?.value, phenology:observations.parcel.value.phenology }));
      const twin=buildFarmTwin(observations.parcel.value, observations.weather.value, observations.soil?.value, base.assessment.diseaseRisk, base.assessment.pestRisk);
      this.lastState={...base,intelligence,twin}; this.status='ready'; return this.lastState;
    } catch(error) {
      this.lastError=error instanceof Error?error.message:'Bilinmeyen çalışma zamanı hatası';
      this.status=this.lastState?'stale':'error';
      if(this.lastState) return this.lastState;
      throw error;
    }
  }
  snapshot(): RuntimeSnapshot | null { return this.lastState; }
}

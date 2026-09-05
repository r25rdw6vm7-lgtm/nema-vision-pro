import { collectObservations, type AgroAdapters } from './adapters';
import { decide } from './decision-engine';
import type { SystemState } from './contracts';

export type RuntimeStatus = 'idle' | 'collecting' | 'ready' | 'error';

export class AgroRuntime {
  private status: RuntimeStatus = 'idle';
  private lastState: SystemState | null = null;
  private lastError: string | null = null;

  constructor(private readonly adapters: AgroAdapters) {}

  getStatus() { return { status: this.status, lastState: this.lastState, lastError: this.lastError }; }

  async refresh(): Promise<SystemState> {
    this.status = 'collecting';
    this.lastError = null;
    try {
      const observations = await collectObservations(this.adapters);
      this.lastState = decide(observations);
      this.status = 'ready';
      return this.lastState;
    } catch (error) {
      this.status = 'error';
      this.lastError = error instanceof Error ? error.message : 'Bilinmeyen çalışma zamanı hatası';
      throw error;
    }
  }

  snapshot(): SystemState | null { return this.lastState; }
}

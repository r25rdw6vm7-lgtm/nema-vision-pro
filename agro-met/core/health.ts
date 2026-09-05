export type HealthStatus = 'healthy' | 'degraded' | 'down';
export type SubsystemHealth = Readonly<{ name: string; status: HealthStatus; lastSuccessAt?: string; latencyMs?: number; errorCount: number; dataAgeMinutes?: number; message?: string }>;

export class HealthRegistry {
  private readonly states = new Map<string, SubsystemHealth>();
  reportSuccess(name: string, latencyMs: number, dataAgeMinutes?: number): void {
    this.states.set(name, { name, status: 'healthy', lastSuccessAt: new Date().toISOString(), latencyMs, errorCount: 0, dataAgeMinutes });
  }
  reportFailure(name: string, message: string): void {
    const previous = this.states.get(name);
    const errorCount = (previous?.errorCount ?? 0) + 1;
    this.states.set(name, { name, status: errorCount >= 3 ? 'down' : 'degraded', lastSuccessAt: previous?.lastSuccessAt, latencyMs: previous?.latencyMs, errorCount, dataAgeMinutes: previous?.dataAgeMinutes, message });
  }
  get(name: string): SubsystemHealth | null { return this.states.get(name) ?? null; }
  snapshot(): SubsystemHealth[] { return [...this.states.values()]; }
}

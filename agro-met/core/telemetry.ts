export type TelemetryEvent = Readonly<{ name: string; at: string; durationMs?: number; success?: boolean; attributes?: Record<string, string | number | boolean> }>;

export class TelemetryBuffer {
  private readonly events: TelemetryEvent[] = [];
  constructor(private readonly maxEvents = 500) {}
  record(event: Omit<TelemetryEvent, 'at'> & { at?: string }): void {
    this.events.push({ ...event, at: event.at ?? new Date().toISOString() });
    if (this.events.length > this.maxEvents) this.events.splice(0, this.events.length - this.maxEvents);
  }
  count(name?: string): number { return name ? this.events.filter(e => e.name === name).length : this.events.length; }
  snapshot(): TelemetryEvent[] { return [...this.events]; }
  clear(): void { this.events.length = 0; }
}

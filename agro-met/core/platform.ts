export type SyncOperation = { id: string; type: 'upsert' | 'delete'; resource: string; payload: unknown; createdAt: string; attempts: number };
export type AuditEntry = { id: string; actorId: string; action: string; resource: string; resourceId: string; occurredAt: string; metadata?: Record<string, unknown> };

export class SyncQueue {
  private readonly queue: SyncOperation[] = [];
  enqueue(resource: string, payload: unknown, type: SyncOperation['type'] = 'upsert'): SyncOperation {
    const op: SyncOperation = { id: `sync-${Date.now()}-${this.queue.length}`, type, resource, payload, createdAt: new Date().toISOString(), attempts: 0 };
    this.queue.push(op); return op;
  }
  peek(limit = 50): SyncOperation[] { return this.queue.slice(0, limit); }
  acknowledge(id: string): void { const i = this.queue.findIndex(x => x.id === id); if (i >= 0) this.queue.splice(i, 1); }
  fail(id: string): void { const op = this.queue.find(x => x.id === id); if (op) op.attempts += 1; }
  size(): number { return this.queue.length; }
}

export class EventLog<T> {
  private readonly entries: T[] = [];
  append(entry: T): void { this.entries.push(entry); }
  recent(limit = 100): T[] { return this.entries.slice(-limit).reverse(); }
  count(): number { return this.entries.length; }
}

export function createAuditEntry(actorId: string, action: string, resource: string, resourceId: string, metadata?: Record<string, unknown>): AuditEntry {
  return { id: `audit-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, actorId, action, resource, resourceId, occurredAt: new Date().toISOString(), ...(metadata ? { metadata } : {}) };
}

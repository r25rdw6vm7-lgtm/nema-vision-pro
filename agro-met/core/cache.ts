export type CacheEntry<T> = Readonly<{ value: T; storedAt: number; expiresAt: number; version: string }>;

export class LastKnownGoodCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  constructor(private readonly version = '1') {}
  set(key: string, value: T, ttlMs: number, now = Date.now()): void {
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new Error('Cache TTL geçersiz.');
    this.entries.set(key, { value, storedAt: now, expiresAt: now + ttlMs, version: this.version });
  }
  get(key: string, now = Date.now()): { value: T; stale: boolean } | null {
    const entry = this.entries.get(key);
    if (!entry || entry.version !== this.version) return null;
    return { value: entry.value, stale: now > entry.expiresAt };
  }
  delete(key: string): boolean { return this.entries.delete(key); }
  clear(): void { this.entries.clear(); }
  size(): number { return this.entries.size; }
}

export type EvidenceLevel = 'measured' | 'validated-model' | 'expert' | 'literature' | 'heuristic' | 'unknown';
export type KnowledgeItem = { id: string; topic: string; title: string; content: string; source?: string; evidence: EvidenceLevel; updatedAt: string; tags: string[] };
export type AgronomyAnswer = { answer: string; evidence: EvidenceLevel[]; confidence: number; caveats: string[] };

export class KnowledgeIndex {
  private readonly items: KnowledgeItem[] = [];
  add(item: KnowledgeItem): void { if (!item.id || !item.topic) throw new Error('Knowledge item kimliği ve konusu zorunludur.'); this.items.push(item); }
  search(query: string, limit = 10): KnowledgeItem[] {
    const q = query.toLocaleLowerCase('tr-TR').trim();
    if (!q) return [];
    return this.items.map(item => ({ item, score: [item.title,item.topic,item.content,...item.tags].join(' ').toLocaleLowerCase('tr-TR').includes(q) ? 1 : 0 })).filter(x=>x.score>0).slice(0,limit).map(x=>x.item);
  }
  all(): KnowledgeItem[] { return [...this.items]; }
}

export function safeAgronomyAnswer(answer: string, confidence: number, evidence: EvidenceLevel[], caveats: string[] = []): AgronomyAnswer {
  return { answer, confidence: Math.max(0, Math.min(100, confidence)), evidence, caveats: [...caveats, 'AI önerisi saha gözlemi, ürün etiketi ve yerel mevzuatla doğrulanmalıdır.'] };
}

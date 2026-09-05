export type SafetyDecision = { allowed: boolean; requiresHumanApproval: boolean; reasons: string[] };

export function guardAction(input: { action: string; priority: number; confidence: number; evidence: string[] }): SafetyDecision {
  const reasons: string[] = [];
  const requiresHumanApproval = input.priority >= 85 || input.confidence < 70;
  if (input.confidence < 40) reasons.push('Güven seviyesi düşük.');
  if (!input.evidence.length) reasons.push('Kanıt kaynağı yok.');
  if (requiresHumanApproval) reasons.push('Yüksek etkili veya belirsiz karar insan onayı gerektirir.');
  return { allowed: reasons.every(r => r !== 'Güven seviyesi düşük.' && r !== 'Kanıt kaynağı yok.'), requiresHumanApproval, reasons };
}

export function rejectUnsafeNumeric(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} geçersiz sayısal değer.`);
  return value;
}

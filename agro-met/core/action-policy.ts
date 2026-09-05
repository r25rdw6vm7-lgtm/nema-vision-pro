export type ActionPolicyInput = Readonly<{ action: string; priority: number; confidence: number; evidenceCount: number; irreversible?: boolean; regulated?: boolean }>;
export type ActionPolicyDecision = Readonly<{ allowed: boolean; requiresHumanApproval: boolean; reasons: string[] }>;

export function evaluateActionPolicy(input: ActionPolicyInput): ActionPolicyDecision {
  const reasons: string[] = [];
  const requiresHumanApproval = Boolean(input.irreversible || input.regulated || input.priority >= 85 || input.confidence < 70);
  if (input.confidence < 40) reasons.push('Güven seviyesi kritik derecede düşük.');
  if (input.evidenceCount < 1) reasons.push('En az bir kanıt kaynağı gerekli.');
  if (input.regulated) reasons.push('Düzenlemeye tabi eylem insan onayı gerektirir.');
  if (input.irreversible) reasons.push('Geri döndürülemez eylem insan onayı gerektirir.');
  return { allowed: input.confidence >= 40 && input.evidenceCount > 0, requiresHumanApproval, reasons };
}

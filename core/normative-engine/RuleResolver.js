/**
 * GIAE · RuleResolver
 * Evalúa reglas documentales simples contra un contexto de proyecto.
 */
export class RuleResolver {
  static resolve(rule, context = {}) {
    const evidence = context.evidence || {};
    const missing = [];

    for (const item of rule.requiredEvidence || []) {
      if (!evidence[item]) missing.push(item);
    }

    const passed = missing.length === 0;

    return {
      ruleId: rule.id,
      document: rule.document,
      status: passed ? 'cumple' : 'no_cumple',
      severity: passed ? 'ok' : rule.severity,
      message: passed ? 'La regla cumple con la evidencia disponible.' : 'Falta evidencia requerida para cumplir la regla.',
      missingEvidence: missing,
      explanation: rule.explanation,
      correction: passed ? '' : rule.correction,
      reference: rule.reference
    };
  }

  static resolveMany(rules = [], context = {}) {
    return rules.map((rule) => RuleResolver.resolve(rule, context));
  }
}

export default RuleResolver;

/**
 * GIAE · RuleExtractor
 * Sprint 0.9.0.008
 *
 * Convierte paquetes de reglas NORMA-CHILE en una colección normalizada
 * para que el Rule Engine pueda analizarlas sin depender de textos completos
 * de los documentos normativos.
 */
export class RuleExtractor {
  constructor(options = {}) {
    this.options = {
      requireReference: true,
      allowObsolete: false,
      ...options
    };
  }

  extract(rulePack = {}) {
    const rules = Array.isArray(rulePack.rules) ? rulePack.rules : [];
    return rules
      .map((rule) => this.normalize(rule, rulePack))
      .filter((rule) => this.isUsable(rule));
  }

  normalize(rule = {}, rulePack = {}) {
    return {
      id: rule.id,
      source: rule.source || rulePack.source || 'NORMA-CHILE',
      document: rule.document || rulePack.document || null,
      chapter: rule.chapter || null,
      clause: rule.clause || null,
      category: rule.category || 'general',
      type: rule.type || 'validation',
      severity: rule.severity || 'info',
      status: rule.status || 'draft',
      appliesTo: Array.isArray(rule.appliesTo) ? rule.appliesTo : [],
      requiredEvidence: Array.isArray(rule.requiredEvidence) ? rule.requiredEvidence : [],
      validation: rule.validation || {},
      explanation: rule.explanation || '',
      correction: rule.correction || '',
      engines: Array.isArray(rule.engines) ? rule.engines : [],
      reference: rule.reference || null,
      version: rule.version || rulePack.version || '1.0.0'
    };
  }

  isUsable(rule) {
    if (!rule.id || !rule.document) return false;
    if (this.options.requireReference && !rule.reference) return false;
    if (!this.options.allowObsolete && rule.status === 'obsolete') return false;
    return true;
  }
}

export default RuleExtractor;

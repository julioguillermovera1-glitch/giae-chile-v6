// GIAE Inspector Técnico · Puente entre Inspector y NORMA-CHILE
// Sprint 0.9.0.011

export class InspectorRuleBridge {
  constructor({ ruleEngine = null, normativeAnalyzer = null } = {}) {
    this.ruleEngine = ruleEngine;
    this.normativeAnalyzer = normativeAnalyzer;
  }

  async evaluateRuleSet({ ruleSet = [], project = {}, scope = 'presec' } = {}) {
    const results = [];

    for (const rule of ruleSet) {
      results.push(await this.evaluateRule({ rule, project, scope }));
    }

    return results;
  }

  async evaluateRule({ rule, project = {}, scope = 'presec' } = {}) {
    const evidence = this.collectEvidence(rule, project);
    const passed = this.resolvePass(rule, evidence, project);

    return {
      ruleId: rule.id,
      source: rule.source || rule.document || 'NORMA-CHILE',
      title: rule.title || rule.name || 'Regla normativa',
      scope,
      passed,
      severity: rule.severity || rule.criticidad || 'major',
      status: passed ? 'cumple' : 'observado',
      message: passed
        ? (rule.successMessage || 'Requisito verificado correctamente.')
        : (rule.failureMessage || rule.observation || 'Requisito no verificado.'),
      evidence,
      correction: rule.correction || rule.howToFix || rule.recomendacion || 'Revisar y completar antecedente técnico.',
      reference: rule.reference || rule.referencia || null
    };
  }

  collectEvidence(rule, project) {
    const key = rule.requiredField || rule.field || rule.documentKey;
    if (!key) {
      return { type: 'manual-review', found: false, detail: 'La regla requiere revisión manual o mapeo pendiente.' };
    }

    const value = this.getByPath(project, key);
    return {
      type: 'field-check',
      field: key,
      found: value !== undefined && value !== null && value !== '' && value !== false,
      value: value ?? null
    };
  }

  resolvePass(rule, evidence) {
    if (rule.validationType === 'manual') return false;
    if (evidence.type === 'manual-review') return false;
    return Boolean(evidence.found);
  }

  getByPath(obj, path) {
    return String(path).split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}

export default InspectorRuleBridge;

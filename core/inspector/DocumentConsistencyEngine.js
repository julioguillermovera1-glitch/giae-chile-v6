// GIAE Inspector Técnico · Motor de Consistencia Documental
// Sprint 0.9.0.012
// Compara documentos y resultados generados por motores para detectar contradicciones
// antes de presentar una carpeta técnica.

export class DocumentConsistencyEngine {
  constructor({ rules = [] } = {}) {
    this.rules = Array.isArray(rules) ? rules : [];
  }

  setRules(rules = []) {
    this.rules = Array.isArray(rules) ? rules : [];
    return this;
  }

  run(project = {}, options = {}) {
    const rules = this.filterRules(options);
    const results = rules.map(rule => this.evaluateRule(rule, project));
    const observations = results.filter(r => !r.passed);

    return {
      type: 'document-consistency',
      totalChecks: results.length,
      passed: results.filter(r => r.passed).length,
      observed: observations.length,
      observations,
      results,
      generatedAt: new Date().toISOString()
    };
  }

  filterRules(options = {}) {
    const scope = options.scope || 'presec';
    return this.rules.filter(rule => !rule.scope || rule.scope === scope || rule.scope === 'global');
  }

  evaluateRule(rule, project) {
    const left = this.getByPath(project, rule.leftPath);
    const right = this.getByPath(project, rule.rightPath);
    const passed = this.compare(left, right, rule.operator || 'equals', rule.tolerance ?? 0);

    return {
      id: rule.id,
      title: rule.title,
      category: rule.category || 'consistencia',
      severity: rule.severity || 'major',
      passed,
      status: passed ? 'cumple' : 'observado',
      evidence: {
        leftLabel: rule.leftLabel || rule.leftPath,
        rightLabel: rule.rightLabel || rule.rightPath,
        leftValue: left ?? null,
        rightValue: right ?? null,
        operator: rule.operator || 'equals',
        tolerance: rule.tolerance ?? 0
      },
      message: passed
        ? (rule.successMessage || 'Los antecedentes son consistentes.')
        : (rule.failureMessage || 'Se detectó inconsistencia entre antecedentes del proyecto.'),
      correction: rule.correction || 'Revisar los documentos indicados y regenerar desde Proyecto Activo.',
      reference: rule.reference || 'GIAE Inspector Técnico'
    };
  }

  compare(left, right, operator, tolerance = 0) {
    if (left === undefined || right === undefined || left === null || right === null) return false;

    switch (operator) {
      case 'equals':
        return String(left) === String(right);
      case 'numberEquals':
        return Math.abs(Number(left) - Number(right)) <= Number(tolerance || 0);
      case 'sameLength':
        return Array.isArray(left) && Array.isArray(right) && left.length === right.length;
      case 'includes':
        return Array.isArray(left) ? left.includes(right) : String(left).includes(String(right));
      case 'notEmptyBoth':
        return this.isFilled(left) && this.isFilled(right);
      default:
        return false;
    }
  }

  isFilled(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '' && value !== false;
  }

  getByPath(obj, path) {
    if (!path) return undefined;
    return String(path).split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}

export default DocumentConsistencyEngine;

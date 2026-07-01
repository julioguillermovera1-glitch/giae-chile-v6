/**
 * GIAE RuleRegistry
 * Registro central de reglas cargadas en memoria.
 * No contiene reglas fijas: solo administra reglas provenientes de data/norma-chile.
 */
export class RuleRegistry {
  constructor() {
    this.rules = new Map();
    this.documents = new Map();
  }

  registerRule(rule) {
    if (!rule || !rule.id) {
      throw new Error('Regla inválida: falta id.');
    }
    this.rules.set(rule.id, rule);
    return rule;
  }

  registerRules(rules = []) {
    rules.forEach((rule) => this.registerRule(rule));
    return this.getAllRules();
  }

  registerDocument(document) {
    if (!document || !document.id) {
      throw new Error('Documento normativo inválido: falta id.');
    }
    this.documents.set(document.id, document);
    return document;
  }

  getRule(id) {
    return this.rules.get(id) || null;
  }

  getAllRules() {
    return Array.from(this.rules.values());
  }

  findRules(filter = {}) {
    return this.getAllRules().filter((rule) => {
      if (filter.origin && rule.origin !== filter.origin) return false;
      if (filter.document && rule.document !== filter.document) return false;
      if (filter.category && rule.category !== filter.category) return false;
      if (filter.engine && !(rule.engines || []).includes(filter.engine)) return false;
      if (filter.status && rule.status !== filter.status) return false;
      return true;
    });
  }
}

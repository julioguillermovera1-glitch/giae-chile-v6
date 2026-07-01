// GIAE Sprint 0.9.0.009
// Proveedor de reglas RIC 18 para NORMA-CHILE.

export class RIC18RuleProvider {
  constructor(ruleSet = null) {
    this.ruleSet = ruleSet;
  }

  setRuleSet(ruleSet) {
    this.ruleSet = ruleSet;
    return this;
  }

  getRules() {
    return this.ruleSet?.reglas || [];
  }

  getById(ruleId) {
    return this.getRules().find((rule) => rule.id === ruleId) || null;
  }

  getByCategoria(categoria) {
    return this.getRules().filter((rule) => rule.categoria === categoria);
  }

  getCriticalRules() {
    return this.getRules().filter((rule) => ['alta', 'critica'].includes(rule.criticidad));
  }

  getPolicy() {
    return this.ruleSet?.politicaNormativa || {};
  }
}

export default RIC18RuleProvider;

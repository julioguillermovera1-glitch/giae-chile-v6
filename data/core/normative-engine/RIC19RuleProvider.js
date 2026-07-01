/**
 * RIC19RuleProvider
 * Proveedor de reglas estructuradas para puesta en servicio.
 * No genera certificados oficiales. Solo entrega reglas internas para auditoría GIAE.
 */
export class RIC19RuleProvider {
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

  getCriticalRules() {
    return this.getRules().filter((rule) => rule.criticidad === 'critica');
  }

  findByCategory(category) {
    return this.getRules().filter((rule) => rule.categoria === category);
  }

  findById(id) {
    return this.getRules().find((rule) => rule.id === id) || null;
  }
}

import { RuleRegistry } from './RuleRegistry.js';
import { RuleValidator } from './RuleValidator.js';
import { RuleExecutor } from './RuleExecutor.js';
import { RuleLoader } from './RuleLoader.js';
import { RuleLogger } from './RuleLogger.js';

/**
 * GIAE RuleEngine
 * Núcleo de ejecución normativa para DS8, RIC, IEC y reglas internas GIAE.
 */
export class RuleEngine {
  constructor() {
    this.registry = new RuleRegistry();
    this.logger = new RuleLogger();
    this.loadedPacks = [];
  }

  register(rule) {
    const validation = RuleValidator.validate(rule);
    if (!validation.valid) {
      console.warn('Regla rechazada:', rule?.id, validation.errors);
      return { registered: false, errors: validation.errors, rule };
    }
    this.registry.registerRule(rule);
    return { registered: true, errors: [], rule };
  }

  registerMany(rules = []) {
    return rules.map((rule) => this.register(rule));
  }

  async loadPack(path) {
    const rules = await RuleLoader.loadRulePack(path);
    const result = this.registerMany(rules);
    this.loadedPacks.push({ path, count: rules.length, loadedAt: new Date().toISOString() });
    return result;
  }

  execute(ruleId, context = {}) {
    const rule = this.registry.getRule(ruleId);
    const result = RuleExecutor.execute(rule, context);
    this.logger.log({ ruleId, result });
    return result;
  }

  executeByFilter(filter = {}, context = {}) {
    const rules = this.registry.findRules(filter);
    return rules.map((rule) => this.execute(rule.id, context));
  }

  getCoverage() {
    const rules = this.registry.getAllRules();
    const byDocument = rules.reduce((acc, rule) => {
      acc[rule.document] = acc[rule.document] || { total: 0, validada: 0, revision: 0 };
      acc[rule.document].total += 1;
      if (rule.status === 'validada' || rule.status === 'activa') acc[rule.document].validada += 1;
      else acc[rule.document].revision += 1;
      return acc;
    }, {});

    return {
      totalRules: rules.length,
      loadedPacks: this.loadedPacks,
      byDocument
    };
  }
}

export const GIAERuleEngine = new RuleEngine();

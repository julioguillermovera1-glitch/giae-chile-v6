// GIAE Inspector Técnico · Motor principal
// Integra reglas RIC 18 + RIC 19 con puntaje, evidencias y plan de acción.

import { InspectorRuleBridge } from './InspectorRuleBridge.js';
import { InspectorScore } from './InspectorScore.js';
import { InspectorActionPlan } from './InspectorActionPlan.js';
import { InspectorReport } from './InspectorReport.js';

export class InspectorEngine {
  constructor({ ruleEngine = null, normativeAnalyzer = null, rules = [] } = {}) {
    this.bridge = new InspectorRuleBridge({ ruleEngine, normativeAnalyzer });
    this.rules = rules;
  }

  setRules(rules = []) {
    this.rules = Array.isArray(rules) ? rules : [];
    return this;
  }

  async inspect(project = {}, options = {}) {
    const scope = options.scope || 'presec';
    const ruleSet = this.filterRules(options);
    const results = await this.bridge.evaluateRuleSet({ ruleSet, project, scope });
    const score = InspectorScore.calculate(results);
    const actionPlan = InspectorActionPlan.build(results);
    const report = InspectorReport.generate({ project, score, results, actionPlan });

    return { score, results, actionPlan, report };
  }

  filterRules(options = {}) {
    const documents = options.documents || ['RIC-18', 'RIC-19', 'RIC18', 'RIC19'];
    return this.rules.filter(rule => {
      const doc = rule.document || rule.source || rule.origen;
      return !doc || documents.includes(doc);
    });
  }
}

export default InspectorEngine;

/**
 * GIAE · RuleMapper
 * Relaciona reglas normativas con motores, documentos y categorías.
 */
export class RuleMapper {
  static byEngine(rules = [], engineName = '') {
    return rules.filter((rule) => rule.engines?.includes(engineName));
  }

  static byDocument(rules = [], document = '') {
    return rules.filter((rule) => rule.document === document);
  }

  static byCategory(rules = [], category = '') {
    return rules.filter((rule) => rule.category === category);
  }

  static createRelationshipMap(rules = []) {
    return rules.reduce((map, rule) => {
      const document = rule.document || 'UNKNOWN';
      if (!map[document]) map[document] = { total: 0, categories: {}, engines: {} };
      map[document].total += 1;
      map[document].categories[rule.category] = (map[document].categories[rule.category] || 0) + 1;
      (rule.engines || []).forEach((engine) => {
        map[document].engines[engine] = (map[document].engines[engine] || 0) + 1;
      });
      return map;
    }, {});
  }
}

export default RuleMapper;

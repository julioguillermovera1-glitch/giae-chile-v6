/**
 * GIAE RuleValidator
 * Valida que toda regla use el esquema mínimo de NORMA-CHILE.
 */
export class RuleValidator {
  static requiredFields = [
    'id',
    'origin',
    'document',
    'category',
    'title',
    'type',
    'severity',
    'status',
    'version',
    'reference',
    'engines'
  ];

  static validate(rule) {
    const errors = [];
    for (const field of RuleValidator.requiredFields) {
      if (rule[field] === undefined || rule[field] === null || rule[field] === '') {
        errors.push(`Falta campo obligatorio: ${field}`);
      }
    }

    if (rule.id && !/^CHL-(DS8|RIC\d{2}|IEC|GIAE)-[A-Z0-9-]+$/.test(rule.id)) {
      errors.push('ID no cumple formato esperado CHL-ORIGEN-CATEGORIA-NNN.');
    }

    if (rule.engines && !Array.isArray(rule.engines)) {
      errors.push('engines debe ser un arreglo.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

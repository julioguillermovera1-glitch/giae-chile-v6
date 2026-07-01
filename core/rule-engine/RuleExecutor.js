/**
 * GIAE RuleExecutor
 * Ejecuta reglas declarativas simples.
 * Las reglas avanzadas deben declararse como 'manual_review' hasta tener lógica segura.
 */
export class RuleExecutor {
  static execute(rule, context = {}) {
    if (!rule) {
      return RuleExecutor.result(false, 'Regla no encontrada.', 'critical', null);
    }

    if (rule.status !== 'validada' && rule.status !== 'activa') {
      return RuleExecutor.result(
        false,
        'La regla existe, pero no está validada para ejecución automática.',
        'warning',
        rule
      );
    }

    const evaluation = rule.evaluation || { mode: 'manual_review' };

    if (evaluation.mode === 'manual_review') {
      return RuleExecutor.result(
        null,
        rule.messages?.review || 'Se requiere revisión profesional o regla aún no automatizada.',
        rule.severity || 'warning',
        rule
      );
    }

    if (evaluation.mode === 'field_exists') {
      const value = RuleExecutor.getPath(context, evaluation.field);
      const ok = value !== undefined && value !== null && value !== '';
      return RuleExecutor.result(
        ok,
        ok ? (rule.messages?.ok || 'Cumple.') : (rule.messages?.error || 'No cumple.'),
        ok ? 'ok' : (rule.severity || 'critical'),
        rule
      );
    }

    if (evaluation.mode === 'equals') {
      const value = RuleExecutor.getPath(context, evaluation.field);
      const ok = value === evaluation.value;
      return RuleExecutor.result(
        ok,
        ok ? (rule.messages?.ok || 'Cumple.') : (rule.messages?.error || 'No cumple.'),
        ok ? 'ok' : (rule.severity || 'critical'),
        rule
      );
    }

    return RuleExecutor.result(
      null,
      'Modo de evaluación no reconocido. Se requiere revisión.',
      'warning',
      rule
    );
  }

  static getPath(object, path) {
    if (!path) return undefined;
    return path.split('.').reduce((current, key) => current?.[key], object);
  }

  static result(complies, message, severity, rule) {
    return {
      complies,
      message,
      severity,
      ruleId: rule?.id || null,
      reference: rule?.reference || null,
      origin: rule?.origin || null,
      document: rule?.document || null,
      version: rule?.version || null,
      timestamp: new Date().toISOString()
    };
  }
}

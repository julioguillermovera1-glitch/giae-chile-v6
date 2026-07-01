/**
 * RIC19ServiceValidator
 * Valida antecedentes mínimos de puesta en servicio sobre un objeto proyecto/carpeta.
 */
export class RIC19ServiceValidator {
  constructor(rules = []) {
    this.rules = rules;
  }

  validate(folder = {}) {
    const observations = this.rules.map((rule) => this.evaluateRule(rule, folder));
    const critical = observations.filter((item) => item.estado === 'incumple' && item.criticidad === 'critica').length;
    const incumple = observations.filter((item) => item.estado === 'incumple').length;

    return {
      documento: 'RIC 19',
      total: observations.length,
      incumple,
      critical,
      estado: critical > 0 ? 'no_apta' : incumple > 0 ? 'apta_con_observaciones' : 'apta',
      observaciones: observations
    };
  }

  evaluateRule(rule, folder) {
    const missing = (rule.evidencia_requerida || []).filter((key) => !this.hasEvidence(folder, key));
    const cumple = missing.length === 0;

    return {
      regla: rule.id,
      nombre: rule.nombre,
      referencia: rule.referencia,
      criticidad: rule.criticidad,
      estado: cumple ? 'cumple' : 'incumple',
      faltantes: missing,
      mensaje: cumple ? 'Evidencia encontrada.' : rule.mensaje_incumple,
      como_corregir: cumple ? null : rule.como_corregir,
      nota: rule.nota || null
    };
  }

  hasEvidence(folder, key) {
    const value = folder?.[key];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '' && value !== false;
  }
}

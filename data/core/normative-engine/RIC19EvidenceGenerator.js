/**
 * RIC19EvidenceGenerator
 * Convierte resultados de validación en evidencias legibles para el Inspector Técnico.
 */
export class RIC19EvidenceGenerator {
  static build(validationResult) {
    return (validationResult?.observaciones || []).map((obs) => ({
      regla: obs.regla,
      referencia: obs.referencia,
      estado: obs.estado,
      severidad: obs.criticidad,
      evidencia: obs.estado === 'cumple'
        ? 'La evidencia requerida fue encontrada en la carpeta técnica.'
        : `Faltan antecedentes: ${(obs.faltantes || []).join(', ')}`,
      accion_recomendada: obs.como_corregir,
      advertencia: obs.nota
    }));
  }
}

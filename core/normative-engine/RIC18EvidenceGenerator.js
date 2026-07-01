// GIAE Sprint 0.9.0.009
// Generador de evidencia para observaciones RIC 18.

export class RIC18EvidenceGenerator {
  build(rule, validationResult) {
    const status = validationResult?.status || 'warning';
    return {
      ruleId: rule?.id,
      documento: rule?.documento || 'RIC 18',
      numeral: rule?.numeral || null,
      titulo: rule?.titulo || 'Regla RIC 18',
      estado: status,
      criticidad: rule?.criticidad || 'media',
      observacion: validationResult?.message || rule?.evidencia?.si_falta || 'Revisión sin detalle.',
      camposFaltantes: validationResult?.missing || [],
      comoCorregir: rule?.correccion || 'Revisar antecedentes de la carpeta técnica.',
      notaGIAE: 'GIAE no reemplaza la revisión ni la aprobación oficial de la autoridad competente; entrega una revisión técnica previa.'
    };
  }

  buildMany(rules = [], results = []) {
    return results.map((result) => {
      const rule = rules.find((item) => item.id === result.ruleId);
      return this.build(rule, result);
    });
  }
}

export default RIC18EvidenceGenerator;

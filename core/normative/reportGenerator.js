export function buildNormativeReport(payload){
  const now = new Date().toISOString();
  return {
    tipo: "reporte_normativo_giae",
    version: "3.0.1",
    generadoEn: now,
    resumen: {
      estado: payload.status,
      modulo: payload.moduleId,
      reglasEvaluadas: payload.evaluated
    },
    resultados: (payload.results || []).map(item => ({
      regla: item.rule.id,
      nombre: item.rule.nombre,
      fuente: item.rule.fuente,
      categoria: item.rule.categoria,
      resultado: item.evaluation.result,
      severidad: item.evaluation.severity,
      mensaje: item.evaluation.message,
      accion: item.evaluation.action,
      referencia: item.evaluation.reference,
      confianza: item.evaluation.confidence,
      detalle: item.evaluation.detail
    }))
  };
}

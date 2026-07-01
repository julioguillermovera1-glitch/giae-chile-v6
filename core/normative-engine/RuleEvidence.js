/**
 * GIAE · RuleEvidence
 * Crea evidencias normalizadas para auditorías normativas.
 */
export class RuleEvidence {
  static fromProject(project = {}) {
    return {
      memoriaTecnica: Boolean(project.memoriaTecnica),
      planos: Boolean(project.planos),
      cuadroCarga: Boolean(project.cuadroCarga),
      unilineal: Boolean(project.unilineal),
      datosInstalador: Boolean(project.instalador?.nombre && project.instalador?.rut),
      puestaTierra: Boolean(project.puestaTierra),
      ensayos: Boolean(project.ensayos),
      informePuestaServicio: Boolean(project.informePuestaServicio)
    };
  }

  static summarize(results = []) {
    const total = results.length;
    const failed = results.filter((r) => r.status !== 'cumple');
    const critical = failed.filter((r) => r.severity === 'critical');

    return {
      total,
      cumple: total - failed.length,
      observaciones: failed.length,
      criticas: critical.length,
      estado: critical.length > 0 ? 'no_apto' : failed.length > 0 ? 'apto_con_observaciones' : 'apto'
    };
  }
}

export default RuleEvidence;

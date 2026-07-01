// GIAE Inspector · Auditor Técnico Inteligente Pre-Presentación
// Este módulo no reemplaza la revisión oficial de la SEC.
// Su objetivo es revisar la carpeta técnica antes de ser presentada por el instalador autorizado.

export class GIAEInspector {
  constructor({ ruleEngine = null, projectEngine = null } = {}) {
    this.ruleEngine = ruleEngine;
    this.projectEngine = projectEngine;
    this.version = '0.9.0.003';
  }

  inspect(project = {}) {
    const checks = [];

    checks.push(...this.checkDocuments(project));
    checks.push(...this.checkBasicConsistency(project));
    checks.push(...this.checkNormativeTraceability(project));

    const score = this.calculateScore(checks);
    const status = this.resolveStatus(score, checks);

    return {
      module: 'GIAE Inspector',
      version: this.version,
      disclaimer: 'GIAE no reemplaza la declaración oficial ni la revisión de la SEC. Este informe es una revisión técnica previa para reducir observaciones y rechazos.',
      score,
      status,
      summary: this.buildSummary(checks),
      checks,
      recommendations: this.buildRecommendations(checks),
      generatedAt: new Date().toISOString()
    };
  }

  checkDocuments(project) {
    const required = [
      ['memoriaTecnica', 'Memoria técnica'],
      ['planos', 'Planos del proyecto'],
      ['unilineal', 'Plano unilineal'],
      ['cuadroCargas', 'Cuadro de cargas'],
      ['puestaTierra', 'Datos de puesta a tierra'],
      ['empalme', 'Datos de empalme'],
      ['calculos', 'Cálculos eléctricos'],
      ['auditoria', 'Auditoría interna']
    ];

    return required.map(([key, label]) => {
      const exists = Boolean(project?.documentos?.[key] || project?.[key]);
      return {
        id: `GIAE-INS-DOC-${key.toUpperCase()}`,
        level: 'documental',
        severity: exists ? 'ok' : 'critical',
        title: label,
        status: exists ? 'cumple' : 'pendiente',
        problem: exists ? null : `Falta ${label}.`,
        why: exists ? 'Documento disponible en el Proyecto Activo.' : 'La carpeta técnica debe contener antecedentes suficientes para su revisión previa.',
        fix: exists ? null : `Generar o adjuntar ${label} antes de presentar la carpeta técnica.`,
        autoFix: false,
        normativeRefs: ['DS8', 'RIC18', 'RIC19']
      };
    });
  }

  checkBasicConsistency(project) {
    const checks = [];
    const circuitosCuadro = Number(project?.cuadroCargas?.circuitos?.length || 0);
    const circuitosUnilineal = Number(project?.unilineal?.circuitos?.length || 0);

    if (circuitosCuadro && circuitosUnilineal && circuitosCuadro !== circuitosUnilineal) {
      checks.push({
        id: 'GIAE-INS-CON-CIRCUITOS-001',
        level: 'consistencia',
        severity: 'major',
        title: 'Diferencia entre cuadro de cargas y unilineal',
        status: 'observado',
        problem: `El cuadro de cargas tiene ${circuitosCuadro} circuitos y el unilineal tiene ${circuitosUnilineal}.`,
        why: 'Los documentos técnicos deben ser coherentes entre sí para reducir observaciones en revisión.',
        fix: 'Actualizar el cuadro de cargas o regenerar el unilineal desde el Proyecto Activo.',
        autoFix: true,
        normativeRefs: ['RIC18']
      });
    }

    const tipoProyecto = project?.tipoSistema || project?.sistema;
    const tableroTipo = project?.tablero?.tipoSistema;
    if (tipoProyecto && tableroTipo && tipoProyecto !== tableroTipo) {
      checks.push({
        id: 'GIAE-INS-CON-SISTEMA-001',
        level: 'consistencia',
        severity: 'critical',
        title: 'Inconsistencia entre sistema del proyecto y tablero',
        status: 'no_cumple',
        problem: `El proyecto indica ${tipoProyecto}, pero el tablero indica ${tableroTipo}.`,
        why: 'El tipo de sistema debe ser consistente entre proyecto, tablero, empalme, unilineal y memoria técnica.',
        fix: 'Unificar el tipo de sistema eléctrico en todos los documentos del proyecto.',
        autoFix: false,
        normativeRefs: ['RIC1', 'RIC2', 'RIC18']
      });
    }

    return checks;
  }

  checkNormativeTraceability(project) {
    const refs = project?.normativeTrace || project?.trazabilidadNormativa || [];
    if (Array.isArray(refs) && refs.length > 0) {
      return [{
        id: 'GIAE-INS-NOR-TRACE-001',
        level: 'normativo',
        severity: 'ok',
        title: 'Trazabilidad normativa disponible',
        status: 'cumple',
        problem: null,
        why: 'El proyecto contiene referencias normativas implementadas.',
        fix: null,
        autoFix: false,
        normativeRefs: refs
      }];
    }

    return [{
      id: 'GIAE-INS-NOR-TRACE-001',
      level: 'normativo',
      severity: 'major',
      title: 'Trazabilidad normativa incompleta',
      status: 'observado',
      problem: 'No se encontraron referencias normativas suficientes asociadas al proyecto.',
      why: 'Cada recomendación técnica debe indicar la regla o referencia normativa usada por GIAE.',
      fix: 'Ejecutar Motor Normativo Chile y asociar DS8/RIC aplicables al proyecto.',
      autoFix: true,
      normativeRefs: ['DS8', 'RIC1-19']
    }];
  }

  calculateScore(checks) {
    if (!checks.length) return 100;
    const penalties = checks.reduce((total, check) => {
      if (check.severity === 'critical') return total + 18;
      if (check.severity === 'major') return total + 8;
      if (check.severity === 'minor') return total + 3;
      return total;
    }, 0);
    return Math.max(0, Math.min(100, 100 - penalties));
  }

  resolveStatus(score, checks) {
    const hasCritical = checks.some(c => c.severity === 'critical');
    if (hasCritical || score < 80) return { label: 'No recomendable presentar', color: 'red', risk: 'alto' };
    if (score < 95) return { label: 'Presentable con observaciones', color: 'yellow', risk: 'medio' };
    return { label: 'Técnicamente preparada para presentación', color: 'green', risk: 'bajo' };
  }

  buildSummary(checks) {
    return {
      total: checks.length,
      critical: checks.filter(c => c.severity === 'critical').length,
      major: checks.filter(c => c.severity === 'major').length,
      minor: checks.filter(c => c.severity === 'minor').length,
      ok: checks.filter(c => c.severity === 'ok').length,
      autoFixable: checks.filter(c => c.autoFix).length
    };
  }

  buildRecommendations(checks) {
    return checks
      .filter(c => c.status !== 'cumple')
      .map(c => ({
        id: c.id,
        title: c.title,
        problem: c.problem,
        fix: c.fix,
        autoFix: c.autoFix,
        normativeRefs: c.normativeRefs
      }));
  }
}

export const GIAEInspectorInstance = new GIAEInspector();

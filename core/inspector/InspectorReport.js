// GIAE Inspector Técnico · Informe técnico pre-presentación

export class InspectorReport {
  static generate({ project = {}, score = {}, results = [], actionPlan = [] } = {}) {
    return {
      title: 'Certificación Técnica GIAE',
      subtitle: 'Auditoría técnica pre-presentación',
      project: {
        name: project.name || project.nombre || 'Proyecto sin nombre',
        owner: project.owner || project.propietario || null,
        installer: project.installer || project.instalador || null
      },
      disclaimer: 'Este informe corresponde a una revisión técnica realizada por GIAE. No reemplaza la revisión, declaración ni aprobación oficial de la autoridad competente.',
      score,
      observations: results.filter(r => !r.passed),
      passedChecks: results.filter(r => r.passed),
      actionPlan,
      generatedAt: new Date().toISOString()
    };
  }

  static toText(report) {
    const lines = [];
    lines.push(report.title);
    lines.push(report.subtitle);
    lines.push('');
    lines.push(`Proyecto: ${report.project.name}`);
    lines.push(`Resultado: ${report.score.label || 'Sin evaluar'} (${report.score.score ?? 0}%)`);
    lines.push(`Riesgo: ${report.score.risk || 'sin dato'}`);
    lines.push('');
    lines.push('Observaciones:');
    for (const obs of report.observations || []) {
      lines.push(`- [${obs.severity}] ${obs.ruleId}: ${obs.message}`);
      if (obs.correction) lines.push(`  Corrección: ${obs.correction}`);
    }
    lines.push('');
    lines.push(report.disclaimer);
    return lines.join('\n');
  }
}

export default InspectorReport;

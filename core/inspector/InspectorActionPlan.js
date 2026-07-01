// GIAE Inspector Técnico · Plan de acción por observaciones

export class InspectorActionPlan {
  static build(results = []) {
    return results
      .filter(r => !r.passed)
      .map((r, index) => ({
        id: `ACTION-${String(index + 1).padStart(3, '0')}`,
        priority: this.priorityFromSeverity(r.severity),
        ruleId: r.ruleId,
        problem: r.message,
        normativeReference: r.reference,
        recommendedAction: r.correction,
        status: 'pendiente',
        autoFixAvailable: false
      }))
      .sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority));
  }

  static priorityFromSeverity(severity) {
    if (['critical', 'critica'].includes(severity)) return 'alta';
    if (['major', 'mayor', 'high', 'alta'].includes(severity)) return 'media';
    if (['minor', 'menor'].includes(severity)) return 'baja';
    return 'informativa';
  }

  static priorityOrder(priority) {
    return { alta: 1, media: 2, baja: 3, informativa: 4 }[priority] || 5;
  }
}

export default InspectorActionPlan;

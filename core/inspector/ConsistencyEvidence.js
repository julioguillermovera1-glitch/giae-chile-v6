// GIAE Inspector Técnico · Evidencias de consistencia documental
// Convierte resultados de consistencia en observaciones claras para el instalador.

export class ConsistencyEvidence {
  static toObservation(result) {
    return {
      id: result.id,
      title: result.title,
      severity: result.severity,
      status: result.status,
      problem: result.message,
      evidence: this.formatEvidence(result.evidence),
      correction: result.correction,
      reference: result.reference
    };
  }

  static formatEvidence(evidence = {}) {
    return `${evidence.leftLabel}: ${this.valueToText(evidence.leftValue)} | ${evidence.rightLabel}: ${this.valueToText(evidence.rightValue)}`;
  }

  static valueToText(value) {
    if (Array.isArray(value)) return `${value.length} elementos`;
    if (value === null || value === undefined || value === '') return 'sin dato';
    return String(value);
  }
}

export default ConsistencyEvidence;

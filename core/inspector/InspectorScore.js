// GIAE Inspector Técnico · Puntaje de carpeta técnica

export class InspectorScore {
  static weights = {
    critical: 20,
    critica: 20,
    high: 12,
    alta: 12,
    major: 8,
    mayor: 8,
    medium: 5,
    media: 5,
    minor: 2,
    menor: 2,
    info: 0,
    informativa: 0
  };

  static calculate(results = []) {
    const failed = results.filter(r => !r.passed);
    const penalty = failed.reduce((sum, r) => sum + (this.weights[r.severity] ?? 5), 0);
    const score = Math.max(0, Math.min(100, 100 - penalty));

    let status = 'apta_para_presentacion';
    let label = 'Apta para presentación';
    let risk = 'bajo';

    if (score < 80 || failed.some(r => ['critical', 'critica'].includes(r.severity))) {
      status = 'no_apta';
      label = 'No recomendable presentar';
      risk = 'alto';
    } else if (score < 95 || failed.length > 0) {
      status = 'apta_con_observaciones';
      label = 'Apta con observaciones';
      risk = 'medio';
    }

    return {
      score,
      status,
      label,
      risk,
      totalChecks: results.length,
      passed: results.filter(r => r.passed).length,
      observed: failed.length,
      critical: failed.filter(r => ['critical', 'critica'].includes(r.severity)).length,
      major: failed.filter(r => ['major', 'mayor', 'high', 'alta'].includes(r.severity)).length,
      minor: failed.filter(r => ['minor', 'menor'].includes(r.severity)).length
    };
  }
}

export default InspectorScore;

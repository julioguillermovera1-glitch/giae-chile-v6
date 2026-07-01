/**
 * Detecta referencias normativas obsoletas.
 * NCh4 queda excluida como base activa de validación.
 */
export class ObsoleteReferenceDetector {
  constructor() {
    this.patterns = [
      { pattern: /\bNCh\s*4\b/i, norm: 'NCh4', status: 'obsoleta', action: 'No usar para validación activa; reemplazar por DS N°8 y RIC aplicable.' },
      { pattern: /\bNCH4\b/i, norm: 'NCh4', status: 'obsoleta', action: 'No usar para validación activa; reemplazar por DS N°8 y RIC aplicable.' },
      { pattern: /\bNCh\s*Elec\.?\s*4\b/i, norm: 'NCh Elec. 4', status: 'obsoleta', action: 'No usar para validación activa; reemplazar por RIC aplicable.' }
    ];
  }

  scan(files = []) {
    const findings = [];
    for (const file of files) {
      const content = String(file.content || '');
      for (const rule of this.patterns) {
        if (rule.pattern.test(content)) {
          findings.push({
            file: file.path,
            norm: rule.norm,
            status: rule.status,
            action: rule.action,
            severity: 'alta'
          });
        }
      }
    }
    return findings;
  }
}

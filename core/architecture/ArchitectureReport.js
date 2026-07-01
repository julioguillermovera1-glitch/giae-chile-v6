export class ArchitectureReport {
  static build({ duplicates, obsoleteReferences, modules = [] } = {}) {
    const exactGroups = duplicates?.exactDuplicates?.length || 0;
    const nearPairs = duplicates?.nearDuplicates?.length || 0;
    const obsolete = obsoleteReferences?.length || 0;

    const score = Math.max(0, 100 - exactGroups * 8 - nearPairs * 2 - obsolete * 10);

    return {
      name: 'GIAE Architecture Health Report',
      version: '0.9.0.013',
      score,
      status: score >= 95 ? 'excelente' : score >= 85 ? 'bueno' : score >= 70 ? 'requiere_revision' : 'critico',
      duplicates,
      obsoleteReferences,
      modules,
      policy: {
        duplicateDetection: 'Solo duplicados exactos por hash se consideran duplicados reales. Similitudes se marcan solo para revisión humana.',
        obsoleteNorms: 'NCh4 no se usa como norma activa de validación; DS N°8 y RIC son la base vigente.'
      }
    };
  }
}

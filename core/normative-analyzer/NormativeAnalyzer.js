/**
 * GIAE NormativeAnalyzer
 * Sprint 0.9.0.005
 *
 * Objetivo:
 * - Leer el catálogo normativo DS8 + RIC 1-19.
 * - Entregar una base común para que el Rule Engine y GIAE Inspector
 *   puedan consultar documentos normativos sin inventar información.
 *
 * Nota:
 * Este analizador NO interpreta PDFs ni reemplaza la revisión oficial.
 * Solo organiza metadatos normativos y prepara el vínculo con reglas estructuradas.
 */
export class NormativeAnalyzer {
  constructor({ catalog = null, ruleEngine = null } = {}) {
    this.catalog = catalog;
    this.ruleEngine = ruleEngine;
    this.documents = [];
    this.ready = false;
  }

  loadCatalog(catalog) {
    if (!catalog || typeof catalog !== 'object') {
      throw new Error('Catálogo normativo inválido.');
    }

    const documents = Array.isArray(catalog.documents)
      ? catalog.documents
      : Array.isArray(catalog.documentos)
        ? catalog.documentos
        : [];

    this.catalog = catalog;
    this.documents = documents.map((doc) => this.normalizeDocument(doc));
    this.ready = true;

    return {
      loaded: true,
      totalDocuments: this.documents.length,
      documents: this.documents
    };
  }

  normalizeDocument(doc = {}) {
    const code = doc.code || doc.codigo || doc.id || '';
    const title = doc.title || doc.titulo || doc.nombre || '';
    const type = doc.type || doc.tipo || this.inferType(code);

    return {
      id: code,
      code,
      title,
      type,
      matter: doc.matter || doc.materia || '',
      source: doc.source || doc.fuente || 'NORMA-CHILE',
      status: doc.status || doc.estado || 'catalogado',
      version: doc.version || '1.0',
      file: doc.file || doc.archivo || doc.path || '',
      relatedEngines: doc.relatedEngines || doc.motores || []
    };
  }

  inferType(code = '') {
    const normalized = String(code).toUpperCase();
    if (normalized.includes('DS8') || normalized.includes('DS-8')) return 'marco_legal';
    if (normalized.includes('RIC')) return 'ric';
    if (normalized.includes('IEC')) return 'iec';
    return 'normativo';
  }

  getDocument(code) {
    return this.documents.find((doc) => doc.code === code || doc.id === code) || null;
  }

  listDocuments(filter = {}) {
    return this.documents.filter((doc) => {
      if (filter.type && doc.type !== filter.type) return false;
      if (filter.status && doc.status !== filter.status) return false;
      if (filter.text) {
        const q = String(filter.text).toLowerCase();
        const haystack = `${doc.code} ${doc.title} ${doc.matter}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  getRICDocuments() {
    return this.documents.filter((doc) => doc.type === 'ric');
  }

  getDS8() {
    return this.documents.find((doc) => doc.type === 'marco_legal') || null;
  }

  getCoverage() {
    const total = this.documents.length;
    const byType = this.documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {});

    return {
      ready: this.ready,
      totalDocuments: total,
      byType,
      hasDS8: Boolean(this.getDS8()),
      ricCount: this.getRICDocuments().length,
      expectedRIC: 19,
      ricComplete: this.getRICDocuments().length >= 19
    };
  }

  explainDocument(code) {
    const doc = this.getDocument(code);
    if (!doc) {
      return {
        found: false,
        message: `No existe documento normativo catalogado con código ${code}.`
      };
    }

    return {
      found: true,
      code: doc.code,
      title: doc.title,
      type: doc.type,
      matter: doc.matter,
      status: doc.status,
      message: `${doc.code} está catalogado en NORMA-CHILE como ${doc.title}.`
    };
  }
}

export const GIAENormativeAnalyzer = new NormativeAnalyzer();

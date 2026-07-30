-- Reglas normativas reales (RIC, DS8) consultables por el Chat IA y por los
-- motores de auditoria/documentacion. Antes vivian solo como archivos JSON
-- estaticos en data/norma-chile/rules/*.json; ahora tambien en D1 para poder
-- corregir o ampliar una regla sin tener que subir codigo nuevo.
--
-- Contenido: solo se cargan reglas ya extraidas y verificadas de la norma
-- real (ver tools/gen-normativa-sql.mjs). Documentos aun sin extraer no
-- generan filas aqui - el chat debe decir honestamente que no los tiene
-- cargados en vez de inventar contenido.

CREATE TABLE IF NOT EXISTS normative_rules (
  id TEXT PRIMARY KEY,
  documento TEXT NOT NULL,
  numeral TEXT,
  categoria TEXT,
  tipo TEXT,
  criticidad TEXT,
  titulo TEXT NOT NULL,
  verifica TEXT,
  correccion TEXT,
  validacion_json TEXT NOT NULL DEFAULT '{}',
  evidencia_json TEXT NOT NULL DEFAULT '{}',
  motores_json TEXT NOT NULL DEFAULT '[]',
  base_normativa TEXT,
  estado TEXT NOT NULL DEFAULT 'vigente',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_normrules_documento ON normative_rules(documento);
CREATE INDEX IF NOT EXISTS idx_normrules_categoria ON normative_rules(categoria);

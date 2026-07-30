#!/usr/bin/env node
// Genera INSERT statements SQL para la tabla normative_rules a partir de un
// archivo de reglas ya extraidas en data/norma-chile/. No inventa contenido:
// solo transcribe fielmente lo que ya esta en el JSON fuente, para evitar
// errores de transcripcion manual. Soporta los 3 formatos que ya existen en
// el proyecto (fueron escritos en distintas etapas, con distintos nombres de
// campo):
//   - "ric18": { reglas: [{ documento, numeral, categoria, tipo, criticidad,
//       titulo, verifica, correccion, validacion, evidencia, motores }] }
//   - "seed":  { rules: [{ document, chapter, clause, category, type,
//       severity, status, requiredEvidence, engines, explanation,
//       correction, reference }] }
//   - "ds8":   { reglas: [{ documento, articulo_o_apartado, categoria,
//       subcategoria, condicion, accion, mensaje_usuario, nivel, estado,
//       motores, referencia }] }
//
// Uso: node tools/gen-normativa-sql.mjs <ruta-al-json> [--formato=ric18|seed|ds8]
import fs from "node:fs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Uso: node tools/gen-normativa-sql.mjs <ruta-al-json-de-reglas> [--formato=ric18|seed|ds8]");
  process.exit(1);
}
const formatoArg = (process.argv.find(a => a.startsWith("--formato=")) || "").split("=")[1];

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

function esc(value) {
  return String(value == null ? "" : value).replace(/'/g, "''");
}

function detectFormat(data) {
  if (formatoArg) return formatoArg;
  if (Array.isArray(data.reglas) && data.reglas[0]?.numeral !== undefined) return "ric18";
  if (Array.isArray(data.reglas) && data.reglas[0]?.articulo_o_apartado !== undefined) return "ds8";
  if (Array.isArray(data.rules)) return "seed";
  throw new Error("No se pudo detectar el formato del archivo. Especifica --formato=ric18|seed|ds8");
}

const SEVERITY_ES = { critical: "alta", high: "alta", medium: "media", low: "baja" };
const STATUS_ES = { active: "vigente", validada: "vigente" };

function normalizeRic18(data) {
  return (data.reglas || []).map(r => ({
    id: r.id,
    documento: r.documento,
    numeral: r.numeral,
    categoria: r.categoria,
    tipo: r.tipo,
    criticidad: r.criticidad,
    titulo: r.titulo,
    verifica: r.verifica,
    correccion: r.correccion,
    validacion: r.validacion || {},
    evidencia: r.evidencia || {},
    motores: r.motores || [],
    baseNormativa: data.baseNormativa || r.documento,
    estado: data.estado || "vigente"
  }));
}

function normalizeSeed(data) {
  return (data.rules || []).map(r => ({
    id: r.id,
    documento: (r.document || "").replace(/^RIC(\d+)$/, "RIC $1"),
    numeral: [r.chapter, r.clause].filter(Boolean).join(" / "),
    categoria: r.category,
    tipo: r.type,
    criticidad: SEVERITY_ES[r.severity] || r.severity,
    titulo: (r.category || "").replace(/_/g, " ").replace(/^./, c => c.toUpperCase()),
    verifica: r.explanation,
    correccion: r.correction,
    validacion: { requiredEvidence: r.requiredEvidence || [] },
    evidencia: {},
    motores: r.engines || [],
    baseNormativa: (r.document || "").replace(/^RIC(\d+)$/, "RIC $1"),
    estado: STATUS_ES[r.status] || r.status || "vigente"
  }));
}

function normalizeDs8(data) {
  return (data.reglas || []).map(r => ({
    id: r.id,
    documento: "DS8",
    numeral: r.articulo_o_apartado,
    categoria: [r.categoria, r.subcategoria].filter(Boolean).join(" - "),
    tipo: "articulo",
    criticidad: r.nivel,
    titulo: r.subcategoria || r.categoria,
    verifica: r.condicion,
    correccion: r.accion,
    validacion: { condicion: r.condicion },
    evidencia: { mensaje: r.mensaje_usuario },
    motores: r.motores || [],
    baseNormativa: "Decreto Supremo N°8",
    estado: r.estado || "vigente"
  }));
}

const formato = detectFormat(data);
const normalizadas = formato === "ric18" ? normalizeRic18(data) : formato === "seed" ? normalizeSeed(data) : normalizeDs8(data);

const lines = [];
for (const r of normalizadas) {
  const validacion = JSON.stringify(r.validacion || {});
  const evidencia = JSON.stringify(r.evidencia || {});
  const motores = JSON.stringify(r.motores || []);
  lines.push(
    "INSERT INTO normative_rules (id, documento, numeral, categoria, tipo, criticidad, titulo, verifica, correccion, validacion_json, evidencia_json, motores_json, base_normativa, estado) VALUES (" +
      `'${esc(r.id)}', '${esc(r.documento)}', '${esc(r.numeral)}', '${esc(r.categoria)}', '${esc(r.tipo)}', ` +
      `'${esc(r.criticidad)}', '${esc(r.titulo)}', '${esc(r.verifica)}', '${esc(r.correccion)}', ` +
      `'${esc(validacion)}', '${esc(evidencia)}', '${esc(motores)}', '${esc(r.baseNormativa)}', '${esc(r.estado)}'` +
      ") ON CONFLICT(id) DO UPDATE SET numeral=excluded.numeral, categoria=excluded.categoria, tipo=excluded.tipo, " +
      "criticidad=excluded.criticidad, titulo=excluded.titulo, verifica=excluded.verifica, correccion=excluded.correccion, " +
      "validacion_json=excluded.validacion_json, evidencia_json=excluded.evidencia_json, motores_json=excluded.motores_json, estado=excluded.estado;"
  );
}

console.log(lines.join("\n"));
console.error(`Generadas ${lines.length} reglas (formato: ${formato}) desde ${inputPath}`);

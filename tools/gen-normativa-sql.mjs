#!/usr/bin/env node
// Genera INSERT statements SQL para la tabla normative_rules a partir de un
// archivo de reglas ya extraidas en data/norma-chile/rules/*.json (formato
// como ric-18.json). No inventa contenido: solo transcribe fielmente lo que
// ya esta en el JSON fuente, para evitar errores de transcripcion manual.
//
// Uso: node tools/gen-normativa-sql.mjs data/norma-chile/rules/ric-18.json > salida.sql
import fs from "node:fs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Uso: node tools/gen-normativa-sql.mjs <ruta-al-json-de-reglas>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

function esc(value) {
  return String(value == null ? "" : value).replace(/'/g, "''");
}

const lines = [];
for (const regla of data.reglas || []) {
  const validacion = JSON.stringify(regla.validacion || {});
  const evidencia = JSON.stringify(regla.evidencia || {});
  const motores = JSON.stringify(regla.motores || []);
  lines.push(
    "INSERT INTO normative_rules (id, documento, numeral, categoria, tipo, criticidad, titulo, verifica, correccion, validacion_json, evidencia_json, motores_json, base_normativa, estado) VALUES (" +
      `'${esc(regla.id)}', '${esc(regla.documento)}', '${esc(regla.numeral)}', '${esc(regla.categoria)}', '${esc(regla.tipo)}', ` +
      `'${esc(regla.criticidad)}', '${esc(regla.titulo)}', '${esc(regla.verifica)}', '${esc(regla.correccion)}', ` +
      `'${esc(validacion)}', '${esc(evidencia)}', '${esc(motores)}', '${esc(data.baseNormativa)}', '${esc(data.estado)}'` +
      ") ON CONFLICT(id) DO UPDATE SET numeral=excluded.numeral, categoria=excluded.categoria, tipo=excluded.tipo, " +
      "criticidad=excluded.criticidad, titulo=excluded.titulo, verifica=excluded.verifica, correccion=excluded.correccion, " +
      "validacion_json=excluded.validacion_json, evidencia_json=excluded.evidencia_json, motores_json=excluded.motores_json, estado=excluded.estado;"
  );
}

console.log(lines.join("\n"));
console.error(`Generadas ${lines.length} reglas desde ${inputPath}`);

const fs = require("fs");
const path = require("path");

const requeridos = [
  "public/index.html",
  "public/css/styles.css",
  "public/js/app.js",
  "public/offline.html",
  "public/manifest.json",
  "docs/POLITICA_ANTIPLAGIO.md",
  "docs/GIAE_CHARTER_V1.md"
];

let ok = true;
console.log("Verificando instalación de GIAE Chile...");
for (const file of requeridos) {
  const existe = fs.existsSync(path.join(__dirname, "..", file));
  console.log(`${existe ? "OK " : "FALTA "} ${file}`);
  if (!existe) ok = false;
}

if (!ok) {
  console.error("\nInstalación incompleta. Revisa los archivos faltantes.");
  process.exit(1);
}

console.log("\nInstalación base correcta.");
console.log("Creador y autor principal: Julio Vera Concha.");
console.log("Regla de oro: no plagio; todo recurso externo debe tener licencia y registro.");

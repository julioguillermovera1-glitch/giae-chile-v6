import { totalPower, currentSinglePhase, currentThreePhase, suggestBreaker, safeRound } from "../../core/calculations.js";

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function phaseFor(project, index) {
  if (project.supplyType !== "trifasico") return "R";
  return ["R", "S", "T"][index % 3];
}

function circuitCurrent(project, powerW) {
  return project.supplyType === "trifasico" ? currentThreePhase(powerW) : currentSinglePhase(powerW);
}

function normalizeCircuit(load, index, project) {
  const power = Number(load.powerW) || 0;
  const current = circuitCurrent(project, power);
  const breaker = Number(load.breakerA) || suggestBreaker(current) || (load.type === "Alumbrado" ? 10 : 16);
  return {
    numero: index + 1,
    nombre: load.name || `Circuito ${index + 1}`,
    fase: load.phase || phaseFor(project, index),
    aut: `Aut. 1x${breaker}A 10 kA C`,
    dif: load.differential || "P/D 2x25A 30 mA",
    tipo: load.outputType || (project.supplyType === "trifasico" ? "1P+N+T" : "1P+N+T"),
    w: power
  };
}

function buildCircuits(project) {
  const loads = project.loads || [];
  if (!loads.length) {
    return [
      normalizeCircuit({ name: "Alumbrado reserva", powerW: 0, breakerA: 10, type: "Alumbrado" }, 0, project),
      normalizeCircuit({ name: "Enchufes reserva", powerW: 0, breakerA: 16, type: "Enchufes" }, 1, project)
    ];
  }
  return loads.map((load, index) => normalizeCircuit(load, index, project));
}

function svgText(x, y, text, size = 12, anchor = "middle", weight = "400") {
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-weight="${weight}" fill="#111">${esc(text)}</text>`;
}

function wrapSvgText(x, y, text, max = 18, size = 12) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [""];
  words.forEach(word => {
    const last = lines.length - 1;
    if ((lines[last] + " " + word).trim().length > max) lines.push(word);
    else lines[last] = (lines[last] + " " + word).trim();
  });
  return lines.slice(0, 4).map((line, index) => svgText(x, y + index * (size + 3), line, size)).join("");
}

function breakerSymbol(x, y, label) {
  const clean = String(label || "Aut. 1x16A 10 kA C").replace("Aut.", "").replaceAll('"', "").trim();
  const parts = clean.split(/\s+/);
  const linea1 = parts.slice(0, 1).join(" ") || "1x16A";
  const linea2 = parts.slice(1, 3).join(" ") || "10 kA";
  const linea3 = parts.slice(3).join(" ") || "C";
  return `<line x1="${x}" y1="${y - 42}" x2="${x}" y2="${y - 22}" stroke="#111" stroke-width="2.2"/>
  <circle cx="${x}" cy="${y - 18}" r="4.5" fill="white" stroke="#111" stroke-width="2"/>
  <path d="M ${x} ${y - 18} A 27 27 0 0 1 ${x} ${y + 36}" fill="none" stroke="#111" stroke-width="2.2"/>
  <line x1="${x + 1}" y1="${y + 9}" x2="${x + 44}" y2="${y + 9}" stroke="#111" stroke-width="2.2"/>
  <circle cx="${x}" cy="${y + 36}" r="4.5" fill="white" stroke="#111" stroke-width="2"/>
  <line x1="${x}" y1="${y + 40}" x2="${x}" y2="${y + 64}" stroke="#111" stroke-width="2.2"/>
  <text x="${x + 48}" y="${y - 5}" font-size="13" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">AUT.</text>
  <text x="${x + 48}" y="${y + 13}" font-size="12.8" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${esc(linea1)}</text>
  <text x="${x + 48}" y="${y + 31}" font-size="12.8" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${esc(linea2)}</text>
  <text x="${x + 48}" y="${y + 49}" font-size="12.8" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${esc(linea3)}</text>`;
}

function diffSymbol(x, y, label) {
  const txt = String(label || "P/D 2x25A 30 mA").trim();
  let line1 = txt;
  let line2 = "";
  if (/30\s*mA/i.test(txt)) {
    line1 = txt.replace(/30\s*mA/i, "").trim();
    line2 = "30 mA";
  }
  return `<rect x="${x - 26}" y="${y}" width="52" height="46" fill="white" stroke="#111" stroke-width="1.8"/>
  <line x1="${x - 26}" y1="${y + 46}" x2="${x + 26}" y2="${y}" stroke="#111" stroke-width="1.4"/>
  <text x="${x - 10}" y="${y + 19}" font-size="13" text-anchor="middle" font-family="Arial" font-weight="900">P</text>
  <text x="${x + 11}" y="${y + 37}" font-size="13" text-anchor="middle" font-family="Arial" font-weight="900">D</text>
  <text x="${x + 40}" y="${y + 18}" font-size="11" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${esc(line1)}</text>
  <text x="${x + 40}" y="${y + 34}" font-size="11" text-anchor="start" font-family="Arial" font-weight="400" fill="#111">${esc(line2)}</text>
  <line x1="${x}" y1="${y + 46}" x2="${x}" y2="${y + 92}" stroke="#111" stroke-width="2.2"/>`;
}

function outputSymbol(x, y, n, circuit) {
  return `<circle cx="${x}" cy="${y}" r="15" fill="white" stroke="#111" stroke-width="2"/>
  ${svgText(x, y + 5, n, 14, "middle", "700")}
  <rect x="${x - 50}" y="${y + 25}" width="100" height="58" fill="white" stroke="#111" stroke-width="1.5"/>
  ${wrapSvgText(x, y + 43, circuit.nombre, 16, 11)}
  ${svgText(x, y + 77, circuit.tipo, 10)}`;
}

function renderSvg(project, circuits) {
  const isThree = project.supplyType === "trifasico";
  const total = totalPower(project.loads || []);
  const totalCurrent = isThree ? currentThreePhase(total) : currentSinglePhase(total);
  const generalA = suggestBreaker(totalCurrent) || 10;
  const general = isThree ? `Aut. 3x${generalA}A 10 kA C` : `Aut. 1x${generalA}A 10 kA C`;
  const n = Math.max(circuits.length, 1);

  // Ajuste automático del dibujo:
  // - pocos circuitos: más separación para que no se vea apretado.
  // - muchos circuitos: menos separación para que pueda entrar en hoja al imprimir.
  const gap = n <= 3 ? 210 : n <= 6 ? 180 : n <= 10 ? 145 : n <= 16 ? 118 : 96;
  const margin = 135;
  const minWidth = 920;
  const groupWidth = (n - 1) * gap;
  const width = Math.max(minWidth, groupWidth + margin * 2);
  const height = 720;
  const centerX = width / 2;
  const firstX = centerX - groupWidth / 2;
  const lastX = centerX + groupWidth / 2;
  const busY = 190;
  const outY = 545;
  const busStart = n === 1 ? centerX - 65 : firstX;
  const busEnd = n === 1 ? centerX + 65 : lastX;
  const title = project.name || "Tablero general";
  const barra = isThree ? "Barra repartidora tetrapolar 4x100A 10kA" : "Barra repartidora bipolar 2x100A 10kA";

  let svg = `<svg id="svgUnilineal" class="unilineal-print-fit" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="background:white;border:1px solid #cbd8e6;border-radius:14px">`;
  svg += `<rect x="50" y="55" width="${width - 100}" height="${height - 105}" fill="none" stroke="#777" stroke-dasharray="5 4"/>`;
  svg += svgText(centerX, 35, "Tablero general", 17, "middle", "700");
  svg += svgText(82, 82, title, 15, "start", "700");
  svg += svgText(82, 108, `Cliente: ${project.client || "Sin cliente"}`, 12, "start", "700");
  svg += svgText(82, 132, `Alimentación: ${isThree ? "Trifásica 3F+N+T" : "Monofásica 1F+N+T"} · P total: ${safeRound(total / 1000, 2)} kW · I total: ${safeRound(totalCurrent, 2)} A`, 12, "start", "700");

  // El automático general siempre queda centrado respecto al grupo de circuitos.
  svg += `<line x1="${centerX}" y1="45" x2="${centerX}" y2="53" stroke="#111" stroke-width="2"/>`;
  svg += breakerSymbol(centerX, 95, general);
  svg += `<line x1="${centerX}" y1="159" x2="${centerX}" y2="${busY}" stroke="#111" stroke-width="2"/>`;

  // La barra termina automáticamente en el último circuito generado.
  svg += `<line x1="${busStart}" y1="${busY}" x2="${busEnd}" y2="${busY}" stroke="#111" stroke-width="3"/>`;
  svg += svgText(centerX + Math.min(350, Math.max(180, groupWidth / 2)), busY - 28, barra, 15, "middle", "900");

  if (isThree) {
    svg += `<text x="${busEnd + 25}" y="${busY - 18}" font-size="14" font-family="Arial" font-weight="900">R</text><text x="${busEnd + 45}" y="${busY - 18}" font-size="14" font-family="Arial" font-weight="900">S</text><text x="${busEnd + 65}" y="${busY - 18}" font-size="14" font-family="Arial" font-weight="900">T</text>`;
  } else {
    svg += `<text x="${busEnd + 25}" y="${busY - 18}" font-size="14" font-family="Arial" font-weight="900">R</text>`;
  }

  svg += `<line x1="25" y1="${outY - 80}" x2="60" y2="${outY - 80}" stroke="#111" stroke-width="2"/><line x1="${width - 60}" y1="${outY - 80}" x2="${width - 25}" y2="${outY - 80}" stroke="#111" stroke-width="2"/>`;
  svg += svgText(40, outY - 95, "T.P", 13, "middle", "900");
  svg += svgText(width - 40, outY - 95, "T.S", 13, "middle", "900");
  svg += `<line x1="22" y1="${outY - 70}" x2="5" y2="${outY - 55}" stroke="#111"/><line x1="32" y1="${outY - 70}" x2="15" y2="${outY - 55}" stroke="#111"/><line x1="${width - 22}" y1="${outY - 70}" x2="${width - 5}" y2="${outY - 55}" stroke="#111"/><line x1="${width - 32}" y1="${outY - 70}" x2="${width - 15}" y2="${outY - 55}" stroke="#111"/>`;

  circuits.forEach((circuit, index) => {
    const x = firstX + index * gap;
    svg += svgText(x - 13, busY + 18, circuit.fase, 19, "middle", "900");
    svg += `<line x1="${x}" y1="${busY}" x2="${x}" y2="${busY + 72}" stroke="#111" stroke-width="2"/>`;
    svg += breakerSymbol(x, busY + 96, circuit.aut);
    svg += diffSymbol(x, busY + 215, circuit.dif);
    svg += outputSymbol(x, outY, `C${circuit.numero}`, circuit);
  });

  svg += `<text x="74" y="${height - 78}" font-size="11" font-family="Arial" font-weight="700" fill="#475569">Nota: diagrama generado automáticamente desde las cargas/cuadro de carga registrados en el proyecto. Debe ser revisado por instalador autorizado antes de declarar.</text>`;
  svg += `<text x="74" y="${height - 55}" font-size="11" font-family="Arial" font-weight="700" fill="#475569">Uso general: ${total} W · Generación automática GIAE Chile v1.0.</text>`;
  svg += `</svg>`;
  return `<div class="svg-scroll v951-scroll">${svg}</div>`;
}
function renderTable(circuits) {
  const rows = circuits.map(c => `<tr><td>${c.numero}</td><td>${esc(c.nombre)}</td><td>${esc(c.fase)}</td><td>${esc(c.aut)}</td><td>${esc(c.dif)}</td><td>${esc(c.tipo)}</td><td>${c.w} W</td></tr>`).join("");
  return `<div class="table-scroll"><table><thead><tr><th>N°</th><th>Circuito</th><th>Fase</th><th>Automático</th><th>Diferencial</th><th>Salida</th><th>Potencia</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function downloadSvg(project) {
  const svg = document.getElementById("svgUnilineal");
  if (!svg) return alert("No hay unilineal para descargar.");
  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(project.name || "GIAE_Unilineal").replace(/[^a-z0-9_-]+/gi, "_")}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state) {
  const project = state.currentProject;
  const circuits = buildCircuits(project);
  host.innerHTML = `
    <section class="module-window unilineal-view unilineal-v951">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Unilineal automático restaurado</h3>
        <p>Se genera desde cargas/cuadro de carga. Usa símbolo de automático tipo media luna, diferencial P/D, barra repartidora, fases, TP y TS.</p>
      </div>
      ${project.loads?.length ? "" : `<div class="result-box danger"><strong>Sin cargas reales:</strong> se muestran circuitos de reserva para visualizar el formato. Agrega cargas para generar el unilineal definitivo.</div>`}
      <div class="diagram-panel">${renderSvg(project, circuits)}</div>
      ${renderTable(circuits)}
      <div class="top-actions">
        <button id="downloadUnilinealBtn">Descargar SVG</button>
        <button id="printUnilinealBtn" class="secondary">Imprimir</button>
      </div>
    </section>`;

  host.querySelector("#downloadUnilinealBtn").addEventListener("click", () => downloadSvg(project));
  host.querySelector("#printUnilinealBtn").addEventListener("click", () => window.print());
}

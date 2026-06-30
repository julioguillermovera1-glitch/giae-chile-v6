import { totalPower, currentSinglePhase, currentThreePhase, suggestBreaker, safeRound } from "../../core/calculations.js";

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function phaseLabel(project, index) {
  if (project.supplyType !== "trifasico") return "R";
  return ["R", "S", "T"][index % 3];
}

function normalizeCircuit(load, index, project) {
  const power = Number(load.powerW) || 0;
  const current = project.supplyType === "trifasico"
    ? currentThreePhase(power)
    : currentSinglePhase(power);
  const breaker = Number(load.breakerA) || suggestBreaker(current) || 10;
  return {
    numero: index + 1,
    nombre: load.name || `Circuito ${index + 1}`,
    tipo: load.type || load.category || "Uso general",
    potencia: power,
    corriente: current,
    fase: phaseLabel(project, index),
    aut: `${breaker} A`,
    dif: load.differential || "30 mA"
  };
}

function buildCircuits(project) {
  const loads = project.loads || [];
  if (!loads.length) {
    return [
      normalizeCircuit({ name: "Alumbrado", type: "Reserva", powerW: 0, breakerA: 10 }, 0, project),
      normalizeCircuit({ name: "Enchufes", type: "Reserva", powerW: 0, breakerA: 16 }, 1, project)
    ];
  }
  return loads.map((load, index) => normalizeCircuit(load, index, project));
}

function svgText(x, y, text, size = 12, anchor = "middle", weight = "400") {
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-weight="${weight}" fill="#111827">${esc(text)}</text>`;
}

function wrapSvgText(x, y, text, max = 18, size = 12) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4).map((item, index) => svgText(x, y + index * (size + 4), item, size)).join("");
}

function breakerSymbol(x, y, label) {
  return `
    <g class="device-symbol">
      <rect x="${x - 36}" y="${y - 32}" width="72" height="64" rx="8" fill="#ffffff" stroke="#111827" stroke-width="2"/>
      <line x1="${x}" y1="${y - 46}" x2="${x}" y2="${y - 24}" stroke="#111827" stroke-width="2"/>
      <path d="M ${x - 18} ${y + 8} C ${x - 10} ${y - 12}, ${x + 12} ${y - 12}, ${x + 20} ${y + 8}" fill="none" stroke="#111827" stroke-width="2.5"/>
      <line x1="${x + 8}" y1="${y - 17}" x2="${x + 8}" y2="${y + 15}" stroke="#111827" stroke-width="2.5"/>
      ${svgText(x, y + 48, `AUT ${label}`, 11, "middle", "700")}
    </g>`;
}

function diffSymbol(x, y, label) {
  return `
    <g class="device-symbol">
      <line x1="${x}" y1="${y - 36}" x2="${x}" y2="${y - 17}" stroke="#111827" stroke-width="2"/>
      <rect x="${x - 34}" y="${y - 17}" width="68" height="56" rx="9" fill="#eef6ff" stroke="#111827" stroke-width="2"/>
      <circle cx="${x}" cy="${y + 5}" r="12" fill="none" stroke="#111827" stroke-width="2"/>
      <text x="${x}" y="${y + 10}" font-size="12" text-anchor="middle" font-family="Arial" font-weight="900" fill="#111827">ID</text>
      ${svgText(x, y + 58, label, 11, "middle", "700")}
    </g>`;
}

function outputSymbol(x, y, circuit) {
  return `
    <g>
      <line x1="${x}" y1="${y - 92}" x2="${x}" y2="${y - 32}" stroke="#111827" stroke-width="2"/>
      <circle cx="${x}" cy="${y}" r="30" fill="#ffffff" stroke="#111827" stroke-width="2"/>
      ${svgText(x, y + 5, `C${circuit.numero}`, 14, "middle", "900")}
      ${wrapSvgText(x, y + 47, circuit.nombre, 17, 11)}
      ${svgText(x, y + 93, `${circuit.tipo} · ${circuit.potencia} W`, 10, "middle", "600")}
    </g>`;
}

function renderSvg(project, circuits) {
  const isThree = project.supplyType === "trifasico";
  const total = totalPower(project.loads || []);
  const totalCurrent = isThree ? currentThreePhase(total) : currentSinglePhase(total);
  const general = `${suggestBreaker(totalCurrent) || 25} A`;
  const barra = isThree ? "Barra repartidora tetrapolar" : "Barra repartidora bipolar";
  const separation = 122;
  const left = 120;
  const rightPad = 180;
  const width = Math.max(1080, left + circuits.length * separation + rightPad);
  const height = 660;
  const center = Math.round((left + (circuits.length - 1) * separation / 2));
  const circuitCenter = Math.max(520, center);
  const busY = 245;
  const outputY = 505;
  const busStart = left - 50;
  const busEnd = left + (circuits.length - 1) * separation + 50;
  const barraX = Math.min(busEnd + 125, width - 120);
  const phaseText = isThree ? "R · S · T · N · PE" : "R · N · PE";

  let svg = `<svg id="svgUnilineal" class="unilineal-pro-svg" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Diagrama unilineal automático">
    <defs>
      <style>
        .frame{fill:#fff;stroke:#94a3b8;stroke-width:1.5;stroke-dasharray:7 5}.wire{stroke:#111827;stroke-width:2.4;stroke-linecap:round;fill:none}.earth{stroke:#111827;stroke-width:2;stroke-linecap:round;fill:none}.note{font:600 11px Arial,sans-serif;fill:#475569}.phase{font:900 20px Arial,sans-serif;fill:#111827}
      </style>
    </defs>`;

  svg += `<rect x="36" y="30" width="${width - 72}" height="${height - 70}" rx="14" class="frame"/>`;
  svg += svgText(width / 2, 62, "DIAGRAMA UNILINEAL AUTOMÁTICO", 19, "middle", "900");
  svg += svgText(74, 92, project.name || "Proyecto eléctrico", 15, "start", "900");
  svg += svgText(74, 116, `Cliente: ${project.client || "Sin cliente"}`, 12, "start", "600");
  svg += svgText(74, 139, `Alimentación: ${isThree ? "Trifásica" : "Monofásica"} · ${phaseText} · P. total: ${safeRound(total / 1000, 2)} kW · I total: ${totalCurrent} A`, 12, "start", "600");

  svg += `<line x1="${circuitCenter}" y1="78" x2="${circuitCenter}" y2="92" class="wire"/>`;
  svg += breakerSymbol(circuitCenter, 135, general);
  svg += `<line x1="${circuitCenter}" y1="199" x2="${circuitCenter}" y2="${busY}" class="wire"/>`;
  svg += `<line x1="${busStart}" y1="${busY}" x2="${busEnd}" y2="${busY}" stroke="#111827" stroke-width="3.4" stroke-linecap="round"/>`;
  svg += svgText(barraX, busY - 30, `${barra}`, 15, "middle", "900");
  svg += svgText(barraX, busY - 10, isThree ? "4x100 A · referencia configurable" : "2x100 A · referencia configurable", 11, "middle", "700");

  if (isThree) {
    svg += `<text x="${Math.min(busEnd + 45, width - 110)}" y="${busY + 8}" class="phase">R</text><text x="${Math.min(busEnd + 70, width - 85)}" y="${busY + 8}" class="phase">S</text><text x="${Math.min(busEnd + 95, width - 60)}" y="${busY + 8}" class="phase">T</text>`;
  } else {
    svg += `<text x="${Math.min(busEnd + 55, width - 70)}" y="${busY + 8}" class="phase">R</text>`;
  }

  svg += `<line x1="24" y1="${outputY - 80}" x2="60" y2="${outputY - 80}" class="earth"/><line x1="${width - 60}" y1="${outputY - 80}" x2="${width - 24}" y2="${outputY - 80}" class="earth"/>`;
  svg += svgText(42, outputY - 95, "T.P", 13, "middle", "900") + svgText(width - 42, outputY - 95, "T.S", 13, "middle", "900");

  circuits.forEach((circuit, index) => {
    const x = left + index * separation;
    svg += `<text x="${x - 16}" y="${busY + 24}" class="phase">${circuit.fase}</text>`;
    svg += `<line x1="${x}" y1="${busY}" x2="${x}" y2="${busY + 70}" class="wire"/>`;
    svg += breakerSymbol(x, busY + 94, circuit.aut);
    svg += diffSymbol(x, busY + 210, circuit.dif);
    svg += outputSymbol(x, outputY, circuit);
  });

  svg += `<text x="74" y="${height - 78}" class="note">Nota: diagrama generado automáticamente desde las cargas/cuadro de carga registrados en el proyecto. Debe ser revisado por instalador autorizado antes de declarar.</text>`;
  svg += `</svg>`;
  return `<div class="svg-scroll v951-scroll">${svg}</div>`;
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
  const svg = renderSvg(project, circuits);
  host.innerHTML = `
    <section class="module-window unilineal-view unilineal-v951">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Unilineal automático</h3>
        <p>Genera el diagrama según las cargas/cuadro de carga del proyecto. El dibujo se adapta a la cantidad de circuitos y al tipo de alimentación.</p>
      </div>
      ${project.loads?.length ? "" : `<div class="result-box danger"><strong>Sin cargas reales:</strong> se muestran circuitos de reserva para visualizar el formato. Agrega cargas para generar el unilineal definitivo.</div>`}
      <div class="diagram-panel">${svg}</div>
      <div class="top-actions">
        <button id="downloadUnilinealBtn">Descargar SVG</button>
        <button id="printUnilinealBtn" class="secondary">Imprimir</button>
      </div>
    </section>`;

  host.querySelector("#downloadUnilinealBtn").addEventListener("click", () => downloadSvg(project));
  host.querySelector("#printUnilinealBtn").addEventListener("click", () => window.print());
}

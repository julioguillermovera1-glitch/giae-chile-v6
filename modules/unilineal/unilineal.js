import { totalPower, currentSinglePhase, currentThreePhase, suggestBreaker } from "../../core/calculations.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildCircuits(project) {
  const loads = project.loads || [];
  if (loads.length) {
    return loads.map((load, index) => {
      const power = Number(load.powerW) || 0;
      const current = project.supplyType === "trifasico"
        ? currentThreePhase(power)
        : currentSinglePhase(power);
      return {
        id: `C${index + 1}`,
        name: load.name || `Circuito ${index + 1}`,
        power,
        current,
        breaker: suggestBreaker(current) || 10
      };
    });
  }

  return [
    { id: "C1", name: "Circuito de alumbrado", power: 0, current: 0, breaker: 10 },
    { id: "C2", name: "Circuito de enchufes", power: 0, current: 0, breaker: 16 }
  ];
}

function createSvg(project, circuits) {
  const isThreePhase = project.supplyType === "trifasico";
  const total = totalPower(project.loads || []);
  const totalCurrent = isThreePhase ? currentThreePhase(total) : currentSinglePhase(total);
  const mainBreaker = suggestBreaker(totalCurrent) || 25;
  const width = 980;
  const rowHeight = 92;
  const headerHeight = 150;
  const height = headerHeight + circuits.length * rowHeight + 90;
  const phaseText = isThreePhase ? "R / S / T / N" : "L / N";
  const verticalBusX = 170;
  const branchStartX = 250;
  const branchEndX = 850;
  const rows = circuits.map((circuit, index) => {
    const y = headerHeight + index * rowHeight;
    const phase = isThreePhase ? ["R", "S", "T"][index % 3] : "L";
    return `
      <g>
        <line x1="${verticalBusX}" y1="${y}" x2="${branchStartX}" y2="${y}" class="wire" />
        <line x1="${branchStartX}" y1="${y}" x2="${branchEndX}" y2="${y}" class="wire" />
        <rect x="${branchStartX + 22}" y="${y - 25}" width="88" height="50" rx="8" class="device" />
        <text x="${branchStartX + 66}" y="${y - 4}" text-anchor="middle" class="small">MCB</text>
        <text x="${branchStartX + 66}" y="${y + 15}" text-anchor="middle" class="small">${circuit.breaker} A</text>
        <path d="M ${branchStartX + 145} ${y + 24} C ${branchStartX + 185} ${y - 24}, ${branchStartX + 225} ${y - 24}, ${branchStartX + 265} ${y + 24}" class="symbol" />
        <line x1="${branchStartX + 205}" y1="${y - 34}" x2="${branchStartX + 205}" y2="${y + 8}" class="symbol" />
        <rect x="${branchStartX + 320}" y="${y - 25}" width="86" height="50" rx="8" class="device-soft" />
        <text x="${branchStartX + 363}" y="${y + 6}" text-anchor="middle" class="small">ID</text>
        <circle cx="${branchEndX + 20}" cy="${y}" r="13" class="load" />
        <text x="${branchEndX + 48}" y="${y - 10}" class="label">${escapeHtml(circuit.id)} · ${escapeHtml(circuit.name)}</text>
        <text x="${branchEndX + 48}" y="${y + 14}" class="small">${escapeHtml(phase)} · ${circuit.power} W · ${circuit.current} A</text>
      </g>`;
  }).join("");

  return `
    <svg class="unilineal-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Diagrama unilineal automático">
      <defs>
        <style>
          .wire{stroke:#102033;stroke-width:4;stroke-linecap:round;fill:none}
          .earth{stroke:#2d5d3a;stroke-width:4;stroke-linecap:round;fill:none}
          .device{fill:#ffffff;stroke:#1456a0;stroke-width:3}
          .device-soft{fill:#e6f0fb;stroke:#1456a0;stroke-width:2}
          .load{fill:#ffffff;stroke:#102033;stroke-width:3}
          .symbol{stroke:#102033;stroke-width:4;stroke-linecap:round;fill:none}
          .title{font:700 24px system-ui, sans-serif;fill:#102033}
          .label{font:700 18px system-ui, sans-serif;fill:#102033}
          .small{font:600 14px system-ui, sans-serif;fill:#66758a}
        </style>
      </defs>
      <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="22" fill="#fbfdff" stroke="#dbe5ef" />
      <text x="38" y="52" class="title">Unilineal automático · ${escapeHtml(project.name || "Proyecto")}</text>
      <text x="38" y="82" class="small">Alimentación: ${isThreePhase ? "Trifásica" : "Monofásica"} · Barra: ${phaseText} · Potencia total: ${total} W · General sugerido: ${mainBreaker} A</text>
      <line x1="${verticalBusX}" y1="102" x2="${verticalBusX}" y2="${height - 96}" class="wire" />
      <rect x="105" y="105" width="130" height="58" rx="10" class="device" />
      <text x="170" y="130" text-anchor="middle" class="small">IG</text>
      <text x="170" y="149" text-anchor="middle" class="small">${mainBreaker} A</text>
      <text x="38" y="122" class="label">Red</text>
      <text x="38" y="147" class="small">${phaseText}</text>
      ${rows}
      <line x1="${verticalBusX}" y1="${height - 78}" x2="${verticalBusX + 120}" y2="${height - 78}" class="earth" />
      <line x1="${verticalBusX + 120}" y1="${height - 78}" x2="${verticalBusX + 120}" y2="${height - 48}" class="earth" />
      <line x1="${verticalBusX + 92}" y1="${height - 48}" x2="${verticalBusX + 148}" y2="${height - 48}" class="earth" />
      <line x1="${verticalBusX + 100}" y1="${height - 36}" x2="${verticalBusX + 140}" y2="${height - 36}" class="earth" />
      <line x1="${verticalBusX + 110}" y1="${height - 24}" x2="${verticalBusX + 130}" y2="${height - 24}" class="earth" />
      <text x="${verticalBusX + 165}" y="${height - 55}" class="small">Barra de tierra / equipotencialidad</text>
    </svg>`;
}

function downloadSvg(project, svgMarkup) {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(project.name || "giae-unilineal").replace(/[^a-z0-9_-]+/gi, "_")}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state) {
  const project = state.currentProject;
  const circuits = buildCircuits(project);
  const svg = createSvg(project, circuits);
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Unilineal automático</h3>
        <p>Genera una imagen SVG propia según el cuadro de carga/cargas registradas. No modifica otros módulos.</p>
      </div>
      <div class="result-box">
        <strong>Funcionamiento:</strong> cada carga registrada crea un circuito. Si el proyecto es trifásico, distribuye visualmente los circuitos entre R, S y T.
      </div>
      <div class="diagram-panel">${svg}</div>
      <div class="top-actions">
        <button id="downloadUnilinealBtn">Descargar imagen SVG</button>
        <button id="printUnilinealBtn" class="secondary">Imprimir</button>
      </div>
    </section>`;

  host.querySelector("#downloadUnilinealBtn").addEventListener("click", () => downloadSvg(project, svg));
  host.querySelector("#printUnilinealBtn").addEventListener("click", () => window.print());
}

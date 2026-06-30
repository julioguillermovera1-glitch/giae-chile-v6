import { totalPower, currentSinglePhase, currentThreePhase, safeRound } from "../../core/calculations.js";
import { persist } from "../../core/store.js";

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function estimateEarthResistance({ resistivity, rodLength, rodDiameter, rods, meshFactor }) {
  const rho = Math.max(Number(resistivity) || 100, 1);
  const length = Math.max(Number(rodLength) || 2.4, 0.5);
  const diameter = Math.max(Number(rodDiameter) || 0.016, 0.006);
  const count = Math.max(Number(rods) || 1, 1);
  const factor = Math.min(Math.max(Number(meshFactor) || 0.65, 0.35), 1);
  const singleRod = (rho / (2 * Math.PI * length)) * (Math.log((4 * length) / diameter) - 1);
  const combined = singleRod / (1 + (count - 1) * factor);
  return safeRound(combined, 2);
}

function targetResistance(project) {
  const total = totalPower(project.loads || []);
  if (total >= 10000 || project.supplyType === "trifasico") return 5;
  return 10;
}

function buildRecommendation(estimated, target, measured) {
  const value = measured > 0 ? measured : estimated;
  if (value <= target) return { status: "Cumple preliminar", className: "ok", text: `Valor ${value} Ω dentro del objetivo preliminar de ${target} Ω.` };
  if (value <= target * 1.5) return { status: "Revisar", className: "warn", text: `Valor ${value} Ω cercano al límite. Conviene mejorar el sistema o validar con medición certificada.` };
  return { status: "No recomendado", className: "danger", text: `Valor ${value} Ω sobre el objetivo preliminar. Se recomienda rediseñar o agregar electrodos/malla.` };
}

function calculate(project, form) {
  const total = totalPower(project.loads || []);
  const current = project.supplyType === "trifasico" ? currentThreePhase(total) : currentSinglePhase(total);
  const data = {
    systemType: form.systemType,
    resistivity: Number(form.resistivity) || 100,
    rodLength: Number(form.rodLength) || 2.4,
    rodDiameter: Number(form.rodDiameter) || 0.016,
    rods: Number(form.rods) || 1,
    meshFactor: Number(form.meshFactor) || 0.65,
    measured: Number(form.measured) || 0,
    notes: form.notes || ""
  };
  const estimated = estimateEarthResistance(data);
  const target = targetResistance(project);
  const recommendation = buildRecommendation(estimated, target, data.measured);
  return { totalPowerW: total, currentA: current, target, estimated, ...data, recommendation };
}

function renderSummary(result) {
  return `
    <div class="earth-summary ${result.recommendation.className}">
      <article><small>Objetivo preliminar</small><strong>${result.target} Ω</strong></article>
      <article><small>Resistencia estimada</small><strong>${result.estimated} Ω</strong></article>
      <article><small>Medición ingresada</small><strong>${result.measured > 0 ? `${result.measured} Ω` : "Pendiente"}</strong></article>
      <article><small>Estado</small><strong>${esc(result.recommendation.status)}</strong></article>
    </div>
    <div class="result-box ${result.recommendation.className}">
      <strong>Resultado automático:</strong> ${esc(result.recommendation.text)}<br>
      <small>La estimación usa datos ingresados por el usuario. La declaración final exige medición en terreno y revisión del instalador autorizado.</small>
    </div>`;
}

function downloadReport(project, result) {
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Informe Tierra GIAE</title>
  <body style="font-family:Arial,sans-serif;line-height:1.45;padding:28px;color:#111827">
  <h1>Informe preliminar de puesta a tierra</h1>
  <p><b>Proyecto:</b> ${esc(project.name || "Sin nombre")}</p>
  <p><b>Cliente:</b> ${esc(project.client || "Sin cliente")}</p>
  <table border="1" cellspacing="0" cellpadding="8">
    <tr><th>Dato</th><th>Valor</th></tr>
    <tr><td>Sistema</td><td>${esc(result.systemType)}</td></tr>
    <tr><td>Potencia total</td><td>${result.totalPowerW} W</td></tr>
    <tr><td>Corriente calculada</td><td>${result.currentA} A</td></tr>
    <tr><td>Resistividad del terreno</td><td>${result.resistivity} Ω·m</td></tr>
    <tr><td>Electrodos</td><td>${result.rods} de ${result.rodLength} m</td></tr>
    <tr><td>Resistencia estimada</td><td>${result.estimated} Ω</td></tr>
    <tr><td>Medición real</td><td>${result.measured > 0 ? `${result.measured} Ω` : "Pendiente"}</td></tr>
    <tr><td>Objetivo preliminar</td><td>${result.target} Ω</td></tr>
    <tr><td>Estado</td><td>${esc(result.recommendation.status)}</td></tr>
  </table>
  <p><b>Observación:</b> ${esc(result.recommendation.text)}</p>
  <p>Documento preliminar. Requiere validación técnica, medición en terreno y revisión profesional.</p>
  </body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "GIAE_Informe_Puesta_Tierra.html";
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state) {
  const project = state.currentProject;
  const saved = project.earth || {};
  const initial = calculate(project, {
    systemType: saved.systemType || "TP + TS + equipotencialidad",
    resistivity: saved.resistivity || 100,
    rodLength: saved.rodLength || 2.4,
    rodDiameter: saved.rodDiameter || 0.016,
    rods: saved.rods || 1,
    meshFactor: saved.meshFactor || 0.65,
    measured: saved.measured || 0,
    notes: saved.notes || ""
  });

  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Puesta a tierra automática</h3>
        <p>Calcula una resistencia preliminar de puesta a tierra desde datos técnicos ingresados y la compara con un objetivo automático según el proyecto.</p>
      </div>
      <div class="form-grid">
        <label>Tipo de sistema
          <select id="systemType">
            <option>TP + TS + equipotencialidad</option>
            <option>Electrodo vertical</option>
            <option>Malla de tierra</option>
            <option>Anillo perimetral</option>
          </select>
        </label>
        <label>Resistividad terreno Ω·m <input type="number" min="1" step="1" id="resistivity" value="${initial.resistivity}"></label>
        <label>Largo electrodo m <input type="number" min="0.5" step="0.1" id="rodLength" value="${initial.rodLength}"></label>
        <label>Diámetro electrodo m <input type="number" min="0.006" step="0.001" id="rodDiameter" value="${initial.rodDiameter}"></label>
        <label>Cantidad electrodos <input type="number" min="1" step="1" id="rods" value="${initial.rods}"></label>
        <label>Factor de acoplamiento <input type="number" min="0.35" max="1" step="0.05" id="meshFactor" value="${initial.meshFactor}"></label>
        <label>Medición real Ω <input type="number" min="0" step="0.01" id="measured" value="${initial.measured}"></label>
        <label>Observaciones <input id="notes" value="${esc(initial.notes)}" placeholder="Ej: terreno húmedo, barra cobreada, cámara de registro"></label>
      </div>
      <div class="top-actions">
        <button id="earthCalculate">Calcular puesta a tierra</button>
        <button id="earthSave" class="secondary">Guardar en proyecto</button>
        <button id="earthDownload" class="secondary">Descargar informe</button>
      </div>
      <div id="earthResult">${renderSummary(initial)}</div>
    </section>`;

  host.querySelector("#systemType").value = initial.systemType;

  const readForm = () => ({
    systemType: host.querySelector("#systemType").value,
    resistivity: host.querySelector("#resistivity").value,
    rodLength: host.querySelector("#rodLength").value,
    rodDiameter: host.querySelector("#rodDiameter").value,
    rods: host.querySelector("#rods").value,
    meshFactor: host.querySelector("#meshFactor").value,
    measured: host.querySelector("#measured").value,
    notes: host.querySelector("#notes").value
  });

  let latest = initial;
  const update = () => {
    latest = calculate(project, readForm());
    host.querySelector("#earthResult").innerHTML = renderSummary(latest);
    return latest;
  };

  host.querySelector("#earthCalculate").addEventListener("click", update);
  host.querySelector("#earthSave").addEventListener("click", () => {
    latest = update();
    project.earth = latest;
    persist();
    alert("Puesta a tierra guardada en el proyecto.");
  });
  host.querySelector("#earthDownload").addEventListener("click", () => downloadReport(project, update()));
}

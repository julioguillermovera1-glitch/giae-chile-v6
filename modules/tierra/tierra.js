import { calculateGroundingProject } from "../../core/engineering/groundingEngine.js";
import { persist, addHistory } from "../../core/store.js";

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function num(value, digits = 2){
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(digits) : "0.00";
}

function resultClass(result){
  if(result.statusLevel === "ok") return "ok";
  if(result.statusLevel === "danger") return "danger";
  return "warn";
}

function methodLabel(id){
  const labels = {
    "vertical-simple": "Electrodo vertical simple",
    "vertical-multiple": "Banco de electrodos verticales",
    "vertical-mejorado": "Electrodos con mejoramiento",
    horizontal: "Conductor horizontal enterrado",
    anillo: "Anillo perimetral",
    malla: "Malla de puesta a tierra",
    fundacion: "Electrodo de fundacion"
  };
  return labels[id] || id;
}

function option(value, label, selected){
  return `<option value="${esc(value)}" ${value === selected ? "selected" : ""}>${esc(label)}</option>`;
}

function normalizeSaved(project){
  const saved = project.grounding || project.earth || {};
  const input = saved.inputs || saved;
  return {
    method: input.method || saved.summary?.selectedMethod || "vertical-multiple",
    groundingScheme: input.groundingScheme || saved.summary?.groundingScheme || "TT",
    resistivity: input.resistivity || saved.summary?.soilResistivity || 100,
    targetOhm: input.targetOhm || saved.summary?.targetOhm || "",
    rodLength: input.rodLength || 2.4,
    rodDiameter: input.rodDiameter || 0.016,
    rods: input.rods || saved.electrode?.quantity || 1,
    meshFactor: input.meshFactor || 0.65,
    horizontalLength: input.horizontalLength || 10,
    ringPerimeter: input.ringPerimeter || 20,
    meshWidth: input.meshWidth || 6,
    meshLength: input.meshLength || 6,
    meshSpacing: input.meshSpacing || 3,
    burialDepth: input.burialDepth || 0.6,
    foundationLength: input.foundationLength || 20,
    rcdMilliamp: input.rcdMilliamp || 30,
    touchVoltageLimit: input.touchVoltageLimit || 50,
    measuredOhm: input.measuredOhm || saved.summary?.measuredOhm || 0,
    notes: input.notes || saved.notes || ""
  };
}

function renderSummary(result){
  const cls = resultClass(result);
  return `
    <div class="earth-summary ${cls}">
      <article><small>Objetivo diseno</small><strong>${num(result.summary.targetOhm, 2)} ohm</strong></article>
      <article><small>Seleccion actual</small><strong>${num(result.summary.selectedEstimateOhm, 2)} ohm</strong></article>
      <article><small>Mejor alternativa</small><strong>${num(result.summary.recommendedEstimateOhm, 2)} ohm</strong></article>
      <article><small>Medicion real</small><strong>${result.summary.measuredOhm > 0 ? `${num(result.summary.measuredOhm, 2)} ohm` : "Pendiente"}</strong></article>
    </div>
    <div class="result-box ${cls}">
      <strong>Estado:</strong> ${esc(result.status)}<br>
      <strong>Seleccion:</strong> ${esc(result.selectedDesign.label)} (${num(result.selectedDesign.estimatedOhm, 2)} ohm estimados).<br>
      <strong>Recomendacion:</strong> ${esc(result.recommendedDesign.action)}<br>
      <strong>Conductor PE:</strong> ${esc(String(result.summary.peSectionMm2))} mm2 · conductor a electrodo ${esc(String(result.summary.electrodeConductorMm2))} mm2.<br>
      <small>Resultado preliminar: debe confirmarse con medicion en terreno, instrumento adecuado y revision profesional competente.</small>
    </div>`;
}

function renderAlternatives(result){
  const rows = result.alternatives.map(item => `
    <tr>
      <td><strong>${esc(item.label)}</strong><br><small>${esc(item.description)}</small></td>
      <td>${num(item.estimatedOhm, 2)} ohm</td>
      <td>${esc(item.status)}</td>
      <td>${esc(item.action)}</td>
    </tr>`).join("");
  return `<div class="table-scroll"><table><thead><tr><th>Alternativa</th><th>Estimacion</th><th>Estado</th><th>Accion tecnica</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderTrace(result){
  return `<div class="notice-list">${result.normativeTrace.map(item => `
    <article class="notice-line"><strong>${esc(item.source)} · ${esc(item.rule)}</strong><br><span>${esc(item.result)}</span></article>
  `).join("")}</div>`;
}

function renderObservations(result){
  return `<div class="notice-list">${result.observations.map(item => `
    <article class="notice-line ${esc(item.level)}"><strong>${esc(item.level)}</strong><br><span>${esc(item.message)}</span></article>
  `).join("")}</div>`;
}

function reportText(project, result){
  const lines = [];
  lines.push("INFORME PRELIMINAR DE PUESTA A TIERRA - GIAE CHILE");
  lines.push("");
  lines.push(`Proyecto: ${project.name || "Sin nombre"}`);
  lines.push(`Cliente: ${project.client || "Sin cliente"}`);
  lines.push(`Sistema electrico: ${project.supplyType || "Pendiente"}`);
  lines.push(`Esquema tierra: ${result.summary.groundingScheme}`);
  lines.push(`Objetivo diseno: ${result.summary.targetOhm} ohm`);
  lines.push(`Metodo seleccionado: ${result.selectedDesign.label}`);
  lines.push(`Estimacion seleccionada: ${result.selectedDesign.estimatedOhm} ohm`);
  lines.push(`Mejor alternativa: ${result.recommendedDesign.label} (${result.recommendedDesign.estimatedOhm} ohm)`);
  lines.push(`Medicion real: ${result.summary.measuredOhm > 0 ? `${result.summary.measuredOhm} ohm` : "Pendiente"}`);
  lines.push(`Estado: ${result.status}`);
  lines.push("");
  lines.push("Alternativas evaluadas:");
  result.alternatives.forEach(item => lines.push(`- ${item.label}: ${item.estimatedOhm} ohm · ${item.status}`));
  lines.push("");
  lines.push("Trazabilidad normativa:");
  result.normativeTrace.forEach(item => lines.push(`- ${item.source} / ${item.rule}: ${item.result}`));
  lines.push("");
  lines.push("Nota: NCh4 no se usa como norma activa de validacion. El informe no reemplaza medicion en terreno ni revision profesional.");
  return lines.join("\n");
}

function downloadReport(project, result) {
  const blob = new Blob([reportText(project, result)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "GIAE_Informe_Puesta_Tierra.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state) {
  const project = state.currentProject;
  const saved = normalizeSaved(project);
  let latest = calculateGroundingProject(project, saved);

  host.innerHTML = `
    <section class="module-window tierra-inteligente">
      <div>
        <p class="eyebrow">Motor RIC 6 · DS8 · IEC aplicable</p>
        <h3>Puesta a tierra inteligente</h3>
        <p>Compara soluciones preliminares de tierra, exige medicion real para verificar y excluye NCh4 como norma activa.</p>
      </div>
      <div class="result-box info">
        <strong>Datos del proyecto:</strong> ${esc(project.name || "Proyecto sin nombre")} · ${esc(project.supplyType === "trifasico" ? "Trifasico" : "Monofasico")} · corriente ${num(project.currentA || 0, 2)} A.
      </div>
      <div class="form-grid">
        <label>Metodo de diseno
          <select id="method">
            ${option("vertical-simple", "Electrodo vertical simple", saved.method)}
            ${option("vertical-multiple", "Banco de electrodos verticales", saved.method)}
            ${option("vertical-mejorado", "Electrodos con mejoramiento", saved.method)}
            ${option("horizontal", "Conductor horizontal enterrado", saved.method)}
            ${option("anillo", "Anillo perimetral", saved.method)}
            ${option("malla", "Malla de puesta a tierra", saved.method)}
            ${option("fundacion", "Electrodo de fundacion", saved.method)}
          </select>
        </label>
        <label>Esquema tierra
          <select id="groundingScheme">
            ${option("TT", "TT", saved.groundingScheme)}
            ${option("TN-S", "TN-S", saved.groundingScheme)}
            ${option("TN-C-S", "TN-C-S", saved.groundingScheme)}
            ${option("TN-C", "TN-C", saved.groundingScheme)}
            ${option("IT", "IT", saved.groundingScheme)}
          </select>
        </label>
        <label>Resistividad terreno ohm·m <input type="number" min="1" step="1" id="resistivity" value="${esc(saved.resistivity)}"></label>
        <label>Objetivo ohm <input type="number" min="0" step="0.1" id="targetOhm" value="${esc(saved.targetOhm)}" placeholder="Auto"></label>
        <label>Largo electrodo m <input type="number" min="0.5" step="0.1" id="rodLength" value="${esc(saved.rodLength)}"></label>
        <label>Diametro electrodo m <input type="number" min="0.006" step="0.001" id="rodDiameter" value="${esc(saved.rodDiameter)}"></label>
        <label>Cantidad electrodos <input type="number" min="1" step="1" id="rods" value="${esc(saved.rods)}"></label>
        <label>Factor acoplamiento <input type="number" min="0.35" max="1" step="0.05" id="meshFactor" value="${esc(saved.meshFactor)}"></label>
        <label>Conductor horizontal m <input type="number" min="1" step="1" id="horizontalLength" value="${esc(saved.horizontalLength)}"></label>
        <label>Anillo perimetral m <input type="number" min="4" step="1" id="ringPerimeter" value="${esc(saved.ringPerimeter)}"></label>
        <label>Malla ancho m <input type="number" min="1" step="0.5" id="meshWidth" value="${esc(saved.meshWidth)}"></label>
        <label>Malla largo m <input type="number" min="1" step="0.5" id="meshLength" value="${esc(saved.meshLength)}"></label>
        <label>Separacion malla m <input type="number" min="0.5" step="0.5" id="meshSpacing" value="${esc(saved.meshSpacing)}"></label>
        <label>Profundidad enterrado m <input type="number" min="0.2" step="0.1" id="burialDepth" value="${esc(saved.burialDepth)}"></label>
        <label>Fundacion/conductor m <input type="number" min="4" step="1" id="foundationLength" value="${esc(saved.foundationLength)}"></label>
        <label>Diferencial mA <input type="number" min="1" step="1" id="rcdMilliamp" value="${esc(saved.rcdMilliamp)}"></label>
        <label>Tension contacto V <input type="number" min="12" step="1" id="touchVoltageLimit" value="${esc(saved.touchVoltageLimit)}"></label>
        <label>Medicion real ohm <input type="number" min="0" step="0.01" id="measuredOhm" value="${esc(saved.measuredOhm)}"></label>
        <label>Observaciones <input id="notes" value="${esc(saved.notes)}" placeholder="Ej: suelo humedo, rocoso, camara existente"></label>
      </div>
      <div class="top-actions">
        <button id="earthCalculate">Recalcular</button>
        <button id="earthApplyDesign" class="secondary">Usar mejor alternativa</button>
        <button id="earthSave" class="secondary">Guardar en proyecto</button>
        <button id="earthDownload" class="secondary">Descargar informe</button>
      </div>
      <div id="earthResult">${renderSummary(latest)}</div>
      <section class="workspace-panel"><h4>Alternativas evaluadas</h4><div id="earthAlternatives">${renderAlternatives(latest)}</div></section>
      <section class="workspace-panel"><h4>Observaciones</h4><div id="earthObservations">${renderObservations(latest)}</div></section>
      <section class="workspace-panel"><h4>Trazabilidad normativa</h4><div id="earthTrace">${renderTrace(latest)}</div></section>
    </section>`;

  const readForm = () => ({
    method: host.querySelector("#method").value,
    groundingScheme: host.querySelector("#groundingScheme").value,
    resistivity: host.querySelector("#resistivity").value,
    targetOhm: host.querySelector("#targetOhm").value,
    rodLength: host.querySelector("#rodLength").value,
    rodDiameter: host.querySelector("#rodDiameter").value,
    rods: host.querySelector("#rods").value,
    meshFactor: host.querySelector("#meshFactor").value,
    horizontalLength: host.querySelector("#horizontalLength").value,
    ringPerimeter: host.querySelector("#ringPerimeter").value,
    meshWidth: host.querySelector("#meshWidth").value,
    meshLength: host.querySelector("#meshLength").value,
    meshSpacing: host.querySelector("#meshSpacing").value,
    burialDepth: host.querySelector("#burialDepth").value,
    foundationLength: host.querySelector("#foundationLength").value,
    rcdMilliamp: host.querySelector("#rcdMilliamp").value,
    touchVoltageLimit: host.querySelector("#touchVoltageLimit").value,
    measuredOhm: host.querySelector("#measuredOhm").value,
    notes: host.querySelector("#notes").value,
    designRegistered: Boolean(project.grounding?.savedAt)
  });

  const update = () => {
    latest = calculateGroundingProject(project, readForm());
    host.querySelector("#earthResult").innerHTML = renderSummary(latest);
    host.querySelector("#earthAlternatives").innerHTML = renderAlternatives(latest);
    host.querySelector("#earthObservations").innerHTML = renderObservations(latest);
    host.querySelector("#earthTrace").innerHTML = renderTrace(latest);
    return latest;
  };

  host.querySelectorAll("input,select").forEach(el => el.addEventListener("input", update));
  host.querySelector("#earthCalculate").addEventListener("click", update);
  host.querySelector("#earthApplyDesign").addEventListener("click", () => {
    latest = update();
    host.querySelector("#method").value = latest.summary.recommendedMethod;
    if(latest.summary.recommendedMethod.includes("vertical")) host.querySelector("#rods").value = latest.summary.recommendedRods;
    update();
  });
  host.querySelector("#earthSave").addEventListener("click", () => {
    latest = calculateGroundingProject(project, { ...readForm(), designRegistered: true });
    project.grounding = { ...latest, savedAt: new Date().toISOString(), designRegistered: true };
    project.earth = project.grounding;
    project.groundingEngine = latest;
    addHistory("Puesta a tierra inteligente guardada", "Puesta a tierra", false);
    persist();
    alert("Puesta a tierra guardada en el Proyecto Activo.");
  });
  host.querySelector("#earthDownload").addEventListener("click", () => downloadReport(project, update()));
}

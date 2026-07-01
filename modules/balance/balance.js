import { recalculateProject, persist, addHistory } from "../../core/store.js";
import { calculatePhaseBalance } from "../../core/engineering/phaseBalanceEngine.js";

function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function num(value, digits=2){
  return Number(value || 0).toLocaleString("es-CL", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function kwFromW(value){
  return (Number(value || 0) / 1000).toLocaleString("es-CL", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function phaseCards(balance){
  const phases = balance?.phases || {};
  return ["R","S","T"].map(phase => {
    const item = phases[phase] || { powerW: 0, currentA: 0, circuits: [] };
    return `<div class="dashboard-card phase-card">
      <h4>Fase ${phase}</h4>
      <div class="phase-power"><strong>${kwFromW(item.powerW)} kW</strong><span>${num(item.currentA)} A</span></div>
      <p class="muted">${(item.circuits || []).length} circuito(s)</p>
      <div class="mini-list">${(item.circuits || []).slice(0,8).map(c => `<span>${esc(c.number || c.id)} · ${esc(c.name)} · ${kwFromW(c.demandW)} kW</span>`).join("") || "<span>Sin cargas asignadas.</span>"}</div>
    </div>`;
  }).join("");
}

function suggestionsList(balance){
  const suggestions = balance?.suggestions || [];
  if(!suggestions.length){
    return `<div class="notice-ok"><strong>Resultado:</strong> ${esc(balance?.summary?.recommendation || "Sin observaciones de balance.")}</div>`;
  }
  return `<div class="notice-warn"><strong>Recomendaciones preliminares:</strong>
    <ul>${suggestions.map(s => `<li><strong>${esc(s.message)}</strong><br><span>${esc(s.action || "Validar en terreno y revisar tablero.")}</span></li>`).join("")}</ul>
  </div>`;
}

function traceBox(balance){
  return `<details class="normative-details" open><summary>Trazabilidad del balance</summary>
    <ul>${(balance?.trace || []).map(t => `<li><strong>${esc(t.source)} · ${esc(t.rule)}</strong><br>${esc(t.result)}</li>`).join("")}</ul>
  </details>`;
}

function buildManualPhaseOptions(load){
  const phase = load.phase || "Auto";
  return ["Auto","R","S","T","R-S-T"].map(p => `<option ${phase === p ? "selected" : ""}>${p}</option>`).join("");
}

function loadRows(project){
  const loads = project.loads || [];
  if(!loads.length) return `<div class="workspace-empty">No hay cargas registradas. Agrega cargas en el Motor de Ingeniería para calcular balance.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>Circuito</th><th>Tipo</th><th>Potencia</th><th>Fase asignada</th></tr></thead>
    <tbody>${loads.map((load, index) => `<tr>
      <td><strong>${esc(load.name)}</strong><br><small>${esc(load.id || `C${index+1}`)}</small></td>
      <td>${esc(load.type || "General")}</td>
      <td>${num(Number(load.quantity || 1) * Number(load.powerW || 0), 0)} W</td>
      <td><select data-phase-load="${index}">${buildManualPhaseOptions(load)}</select></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

export function render(host, state){
  const project = state.currentProject;
  recalculateProject();
  const balance = project.phaseBalance || calculatePhaseBalance(project.electricalEngine?.circuits || [], project);
  const isTri = project.supplyType === "trifasico";

  host.innerHTML = `<section class="module-window real-workspace">
    <div class="workspace-title-row">
      <div>
        <p class="eyebrow">Motor de Ingeniería · Etapa 4.0.3</p>
        <h3>Balance de fases y demanda</h3>
        <p>Analiza la distribución R, S y T desde el Proyecto Activo. Genera advertencias y recomendaciones preliminares de redistribución.</p>
      </div>
      <div class="status-strip"><span>${esc(project.name)}</span><span>${isTri ? "Trifásico" : "Monofásico"}</span><span>${esc(balance.status)}</span></div>
    </div>

    <div class="kpi-grid engineering-kpis">
      <div class="kpi-card"><span>Demanda total</span><strong>${kwFromW(balance.summary?.totalDemandW)} kW</strong></div>
      <div class="kpi-card"><span>Fase mayor</span><strong>${esc(balance.summary?.maxPhase || "R")}</strong><small>${kwFromW(balance.summary?.maxPhaseW)} kW</small></div>
      <div class="kpi-card"><span>Fase menor</span><strong>${esc(balance.summary?.minPhase || "R")}</strong><small>${kwFromW(balance.summary?.minPhaseW)} kW</small></div>
      <div class="kpi-card"><span>Desbalance</span><strong>${num(balance.summary?.imbalancePercent,1)} %</strong><small>Umbral ${num(balance.thresholdPercent,0)} %</small></div>
    </div>

    ${!isTri ? `<div class="notice-warn"><strong>Proyecto monofásico:</strong> el balance R/S/T no aplica. Cambia el Proyecto Activo a trifásico para usar este motor.</div>` : suggestionsList(balance)}

    <div class="phase-grid">${phaseCards(balance)}</div>

    <div class="dashboard-card">
      <h4>Asignación manual de fases</h4>
      <p class="muted">Puedes dejar cargas en Auto para que GIAE las distribuya, o fijarlas manualmente cuando el diseño del tablero lo requiera.</p>
      ${loadRows(project)}
      <div class="module-toolbar"><button id="savePhases" class="primary-action">Guardar fases</button><button id="autoPhases" class="secondary">Volver a Auto</button></div>
    </div>

    <div class="dashboard-card">
      <h4>Observación técnica</h4>
      <p>La redistribución de fases es una recomendación preliminar del motor. Debe revisarse con el cuadro de carga, tablero, protecciones, alimentadores y condiciones reales de ejecución.</p>
      ${traceBox(balance)}
    </div>
  </section>`;

  host.querySelector("#savePhases")?.addEventListener("click", () => {
    host.querySelectorAll("[data-phase-load]").forEach(select => {
      const idx = Number(select.dataset.phaseLoad);
      if(project.loads[idx]) project.loads[idx].phase = select.value;
    });
    addHistory("Se actualizaron fases manuales", "Balance", false);
    recalculateProject();
    persist();
    render(host, state);
  });
  host.querySelector("#autoPhases")?.addEventListener("click", () => {
    (project.loads || []).forEach(load => { load.phase = "Auto"; });
    addHistory("Se restableció balance automático", "Balance", false);
    recalculateProject();
    persist();
    render(host, state);
  });
}

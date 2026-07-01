import { recalculateProject, persist, addHistory } from "../../core/store.js";
import { calculatePanelProject } from "../../core/engineering/panelEngine.js";

function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function num(value, digits=1){ return Number(value || 0).toLocaleString("es-CL", { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
function deviceRows(devices){
  return devices.map((device, index) => `<tr>
    <td>${index + 1}</td>
    <td><strong>${esc(device.kind)}</strong><br><small>${esc(device.id)}</small></td>
    <td>${esc(device.label)}</td>
    <td>${esc(device.group || device.circuitName || "General")}</td>
    <td>${esc(device.poles || "-")}</td>
    <td>${esc(device.ampere ? device.ampere + " A" : "-")}</td>
    <td>${Number(device.modules || 0)}</td>
    <td>${esc(device.normativeStatus || device.status || "Preliminar")}</td>
  </tr>`).join("");
}
function groupCards(groups){
  if(!groups.length) return `<div class="workspace-empty">Aún no hay grupos de circuitos. Agrega cargas para construir el tablero.</div>`;
  return `<div class="panel-group-grid">${groups.map(group => `<article class="dashboard-card panel-group-card">
    <h4>${esc(group.name)}</h4>
    <p><strong>${group.circuitCount}</strong> circuitos asociados</p>
    <div class="muted-panel"><strong>${esc(group.differential.label)}</strong><br><span>${esc(group.differential.sensitivity)} · ${esc(group.differential.type)}</span></div>
    <small>Circuitos: ${esc(group.circuitIds.join(", "))}</small>
  </article>`).join("")}</div>`;
}
function observations(panel){
  if(!panel.observations?.length) return `<div class="notice-ok"><strong>Tablero preliminar:</strong> sin observaciones críticas.</div>`;
  return `<div class="notice-warn"><strong>Observaciones del Motor de Tableros:</strong><ul>${panel.observations.map(o => `<li><strong>${esc(o.level)}:</strong> ${esc(o.message)}</li>`).join("")}</ul></div>`;
}
function trace(panel){
  return `<details class="normative-details"><summary>Ver trazabilidad RIC 2 / Motor de Ingeniería</summary><ul>${(panel.normativeTrace || []).map(item => `<li><strong>${esc(item.source)} · ${esc(item.rule)}</strong><br>${esc(item.result)}</li>`).join("")}</ul></details>`;
}
function materialsTable(materials){
  return `<div class="data-table-wrap"><table><thead><tr><th>Familia</th><th>Elemento</th><th>Cantidad</th></tr></thead><tbody>${(materials || []).map(m => `<tr><td>${esc(m.family)}</td><td>${esc(m.item)}</td><td>${num(m.qty, m.unit === "m" ? 1 : 0)} ${esc(m.unit)}</td></tr>`).join("")}</tbody></table></div>`;
}
function buildReport(project, panel){
  return {
    type:"giae-panel-report",
    version:"5.0",
    generatedAt:new Date().toISOString(),
    project:{ id:project.id, name:project.name, client:project.client, supplyType:project.supplyType, installedPowerKw:project.installedPowerKw, demandPowerKw:project.demandPowerKw },
    panel
  };
}
export function render(host, state){
  recalculateProject();
  const project = state.currentProject;
  const panel = project.panelEngine || calculatePanelProject(project);
  host.innerHTML = `<section class="module-window real-workspace panel-workspace">
    <div class="workspace-title-row">
      <div>
        <p class="eyebrow">Etapa 5.0 · Motor de Tableros Inteligente</p>
        <h3>Tablero automático desde Proyecto Activo</h3>
        <p>GIAE genera una propuesta de tablero con IGA, DPS, diferenciales, automáticos, barras y gabinete. La propuesta queda lista para cuadro de carga, unilineal, presupuesto y documentación.</p>
      </div>
      <div class="status-strip"><span>${esc(panel.version)}</span><span>${esc(panel.status)}</span><span>${panel.circuits.length} circuitos</span></div>
    </div>

    <div class="kpi-grid engineering-kpis">
      <div class="kpi-card"><span>Gabinete sugerido</span><strong>${esc(panel.cabinetLabel)}</strong></div>
      <div class="kpi-card"><span>Módulos usados</span><strong>${panel.usedModules}</strong></div>
      <div class="kpi-card"><span>Reserva</span><strong>${num(panel.reservePercent,1)} %</strong></div>
      <div class="kpi-card"><span>Estado</span><strong>${esc(panel.status)}</strong></div>
    </div>

    ${observations(panel)}

    <div class="module-toolbar">
      <button id="savePanelBtn" class="primary-action">Guardar tablero en proyecto</button>
      <button id="recalcPanelBtn" class="secondary">Recalcular tablero</button>
      <button id="downloadPanelBtn" class="secondary">Descargar informe JSON</button>
    </div>

    <div class="dashboard-card">
      <h4>Agrupación automática por diferencial</h4>
      ${groupCards(panel.groups)}
    </div>

    <div class="dashboard-card">
      <h4>Dispositivos del tablero</h4>
      <div class="data-table-wrap wide-table"><table>
        <thead><tr><th>N°</th><th>Tipo</th><th>Elemento</th><th>Grupo/Circuito</th><th>Polos</th><th>Corriente</th><th>Mód.</th><th>Estado</th></tr></thead>
        <tbody>${deviceRows(panel.devices)}</tbody>
      </table></div>
    </div>

    <div class="dashboard-card">
      <h4>Barras y distribución</h4>
      <div class="panel-bars">${panel.bars.map(bar => `<div><strong>${esc(bar.kind)}</strong><span>${esc(bar.label)}</span><small>${esc(bar.status)}</small></div>`).join("")}</div>
      ${trace(panel)}
    </div>

    <div class="dashboard-card">
      <h4>Materiales generados para presupuesto</h4>
      ${materialsTable(panel.materials)}
    </div>
  </section>`;
  host.querySelector("#savePanelBtn").addEventListener("click", () => {
    project.panel = panel;
    project.panelEngine = panel;
    project.panelMaterials = panel.materials || [];
    addHistory("Tablero automático guardado", "Tableros", false);
    persist();
    alert("Tablero guardado en el Proyecto Activo.");
  });
  host.querySelector("#recalcPanelBtn").addEventListener("click", () => { recalculateProject(); persist(); render(host, state); });
  host.querySelector("#downloadPanelBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(buildReport(project, panel), null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tablero_${(project.name || "giae").toLowerCase().replace(/[^a-z0-9]+/gi,"-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

import { addLoad, clearLoads, persist, addHistory, recalculateProject } from "../../core/store.js";
import { calculateLoadProject } from "../../core/engineering/loadEngine.js";
import { calculateElectricalProject } from "../../core/engineering/electricalEngine.js";

function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function kw(w){ return (Number(w || 0) / 1000).toFixed(3).replace(".", ","); }
function num(n, d=2){ return Number(n || 0).toLocaleString("es-CL", { maximumFractionDigits:d, minimumFractionDigits:d }); }

function summaryCards(engine, electrical){
  const summary = electrical?.summary || {};
  return `
    <div class="kpi-grid engineering-kpis">
      <div class="kpi-card"><span>Potencia instalada</span><strong>${kw(engine.installedW)} kW</strong></div>
      <div class="kpi-card"><span>Demanda calculada</span><strong>${kw(engine.demandW)} kW</strong></div>
      <div class="kpi-card"><span>Corriente proyecto</span><strong>${num(engine.projectCurrentA)} A</strong></div>
      <div class="kpi-card"><span>Estado ingeniería</span><strong>${esc(summary.status || engine.status)}</strong></div>
    </div>`;
}

function balanceBox(engine, project){
  if(project.supplyType !== "trifasico"){
    return `<div class="dashboard-card"><h4>Balance de fases</h4><p>Proyecto monofásico. No aplica balance R-S-T.</p></div>`;
  }
  const b = engine.balance || { phases:{R:0,S:0,T:0}, imbalancePercent:0, recommendation:"" };
  return `<div class="dashboard-card">
    <h4>Balance automático de fases</h4>
    <div class="phase-balance">
      <div><span>R</span><strong>${kw(b.phases.R)} kW</strong></div>
      <div><span>S</span><strong>${kw(b.phases.S)} kW</strong></div>
      <div><span>T</span><strong>${kw(b.phases.T)} kW</strong></div>
      <div><span>Desbalance</span><strong>${num(b.imbalancePercent,1)} %</strong></div>
    </div>
    <p class="muted">${esc(b.recommendation)}</p>
  </div>`;
}

function rows(circuits){
  return circuits.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${esc(item.name)}</strong><br><small>${esc(item.type || "General")}</small></td>
      <td>${Number(item.quantity || 1)}</td>
      <td>${Number(item.powerW || 0).toLocaleString("es-CL")} W</td>
      <td>${kw(item.installedW)} kW</td>
      <td>${kw(item.demandW)} kW</td>
      <td>${num(item.currentA)} A</td>
      <td>${esc(item.phase || "Auto")}</td>
      <td><strong>${esc(item.suggestedBreaker)}</strong><br><small>${esc(item.suggestedDifferential)}</small></td>
      <td><strong>${esc(item.suggestedConductor)}</strong><br><small>Iz preliminar ${num(item.conductorIzA)} A</small></td>
      <td>${esc(item.suggestedConduit)}<br><small>ΔV ${num(item.voltageDropPercent || 0)} % · ${esc(item.confidence?.label || "Preliminar")}</small></td>
      <td><button class="ghost danger-text" data-delete-load="${index}">Quitar</button></td>
    </tr>`).join("");
}

function validationList(engine){
  const validations = engine.validations || [];
  if(!validations.length){
    return `<div class="notice-ok"><strong>Validación preliminar:</strong> sin observaciones críticas en el Motor de Cargas.</div>`;
  }
  return `<div class="notice-warn"><strong>Observaciones:</strong><ul>${validations.map(v => `<li>${esc(v.message)}</li>`).join("")}</ul></div>`;
}

function traceFor(circuit){
  return `<details class="normative-details"><summary>Ver trazabilidad</summary>
    <ul>${(circuit.normativeTrace || []).map(item => `<li><strong>${esc(item.source)} · ${esc(item.rule)}</strong><br>${esc(item.result)}</li>`).join("")}</ul>
  </details>`;
}


function materialsBox(electrical){
  const materials = electrical?.materials || [];
  if(!materials.length) return "";
  return `<div class="dashboard-card"><h4>Materiales técnicos generados</h4>
    <div class="data-table-wrap"><table><thead><tr><th>Familia</th><th>Elemento</th><th>Cantidad</th><th>Circuitos</th></tr></thead><tbody>
      ${materials.map(m => `<tr><td>${esc(m.family)}</td><td>${esc(m.item)}</td><td>${num(m.qty, m.unit === "m" ? 1 : 0)} ${esc(m.unit)}</td><td>${esc((m.circuits || []).join(", "))}</td></tr>`).join("")}
    </tbody></table></div>
    <p class="muted">Estos datos quedan disponibles para presupuesto, documentación y auditoría.</p>
  </div>`;
}

function traceTable(circuits){
  if(!circuits.length) return "";
  return `<div class="dashboard-card"><h4>Trazabilidad normativa aplicada</h4>
    ${circuits.map(c => `<div class="trace-item"><strong>Circuito ${c.circuitNumber}: ${esc(c.name)}</strong>${traceFor(c)}</div>`).join("")}
  </div>`;
}

export function render(host, state) {
  const project = state.currentProject;
  recalculateProject();
  const engine = project.loadEngine || calculateLoadProject(project);
  const electrical = project.electricalEngine || calculateElectricalProject(project);
  const circuits = electrical.circuits || engine.circuits || [];

  host.innerHTML = `
    <section class="module-window real-workspace cargas-workspace">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">PASO 2 · Ingreso de cargas</p>
          <h3>Cargas del proyecto</h3>
          <p>Ingresa los consumos por recinto. GIAE calcula potencia, demanda, corriente y circuitos.</p>
        </div>
        <div class="status-strip">
          <span>${esc(project.name)}</span>
          <span>${circuits.length} circuitos</span>
          <span>${kw(engine.demandW)} kW demanda</span>
        </div>
      </div>

      ${summaryCards(engine, electrical)}
      ${validationList(engine)}

      <div class="dashboard-card">
        <h4>Agregar carga</h4>
        <div class="form-grid compact load-form">
          <label>Descripción <input id="loadName" placeholder="Ej: enchufes sala 1"></label>
          <label>Tipo
            <select id="loadType">
              <option>Alumbrado</option><option>Enchufes</option><option>Mixto</option><option>Fuerza</option><option>Climatización</option><option>Especial</option>
            </select>
          </label>
          <label>Cantidad <input id="loadQty" type="number" min="1" value="1"></label>
          <label>W por unidad <input id="loadPower" type="number" min="0" value="100"></label>
          <label>Factor demanda <input id="loadFD" type="number" min="0" max="1" step="0.01" value="1"></label>
          <label>Factor simultaneidad <input id="loadFS" type="number" min="0" max="1" step="0.01" value="1"></label>
          <label>Factor potencia <input id="loadFP" type="number" min="0.1" max="1" step="0.01" value="0.95"></label>
          <label>Fase
            <select id="loadPhase"><option>Auto</option><option>R</option><option>S</option><option>T</option><option>R-S-T</option></select>
          </label>
        </div>
        <div class="module-toolbar">
          <button id="addLoadBtn" class="primary-action">Agregar al proyecto</button>
          <button id="continueToLoadBoardTop" class="primary-action">Continuar a cuadro de carga</button>
          <button id="clearLoadsBtn" class="secondary">Limpiar cargas</button>
        </div>
      </div>


      ${circuits.length ? `
        <div class="data-table-wrap wide-table">
          <table>
            <thead><tr><th>N°</th><th>Carga</th><th>Cant.</th><th>W unidad</th><th>Instalada</th><th>Demanda</th><th>Ib</th><th>Fase</th><th>Protección</th><th>Conductor</th><th>Canalización</th><th></th></tr></thead>
            <tbody>${rows(circuits)}</tbody>
          </table>
        </div>` : `<div class="workspace-empty">No hay cargas registradas. Agrega cargas para que los demás módulos trabajen con datos reales.</div>`}

      ${circuits.length ? `
        <div class="dashboard-card next-step-card">
          <div class="section-title-row">
            <div><h4>Cargas listas</h4><p>GIAE ya calculo potencia, demanda, corriente y circuitos preliminares. El siguiente paso es revisar el cuadro de carga generado.</p></div>
            <button id="continueToLoadBoard" class="primary-action">Continuar a cuadro de carga</button>
          </div>
        </div>` : `
        <div class="dashboard-card next-step-card muted-step">
          <div class="section-title-row">
            <div><h4>Siguiente paso</h4><p>Agrega al menos una carga para habilitar el cuadro de carga automatico.</p></div>
            <button id="backToProjectFlow" class="secondary">Volver a datos del proyecto</button>
          </div>
        </div>`}
    </section>`;

  const readLoad = () => ({
    name: host.querySelector("#loadName").value.trim(),
    type: host.querySelector("#loadType").value,
    quantity: Number(host.querySelector("#loadQty").value || 1),
    powerW: Number(host.querySelector("#loadPower").value || 0),
    demandFactor: Number(host.querySelector("#loadFD").value || 1),
    simultaneityFactor: Number(host.querySelector("#loadFS").value || 1),
    fp: Number(host.querySelector("#loadFP").value || 0.95),
    phase: host.querySelector("#loadPhase").value
  });

  host.querySelector("#addLoadBtn").addEventListener("click", () => {
    const load = readLoad();
    if (!load.name || !load.powerW || load.quantity < 1) return alert("Ingresa descripción, cantidad y potencia válida.");
    addLoad(load);
    render(host, state);
  });
  host.querySelector("#exampleLoadsBtn")?.addEventListener("click", () => {
    addLoad({ name:"Alumbrado LED sala", type:"Alumbrado", quantity:12, powerW:18, demandFactor:1, simultaneityFactor:1, fp:0.95, phase:"Auto" });
    addLoad({ name:"Enchufes generales", type:"Enchufes", quantity:8, powerW:180, demandFactor:0.7, simultaneityFactor:1, fp:0.95, phase:"Auto" });
    addLoad({ name:"Equipo especial", type:"Especial", quantity:1, powerW:1200, demandFactor:1, simultaneityFactor:1, fp:0.9, phase:"Auto" });
    render(host, state);
  });
  host.querySelector("#recalculateBtn")?.addEventListener("click", () => { recalculateProject(); persist(); render(host, state); });
  host.querySelector("#clearLoadsBtn").addEventListener("click", () => {
    if(confirm("¿Eliminar todas las cargas del Proyecto Activo?")){ clearLoads(); render(host, state); }
  });
  const goToLoadBoard = () => window.GIAE?.openModule?.("cuadro-carga");
  host.querySelector("#continueToLoadBoardTop")?.addEventListener("click", goToLoadBoard);
  host.querySelector("#continueToLoadBoard")?.addEventListener("click", goToLoadBoard);
  host.querySelector("#backToProjectFlow")?.addEventListener("click", () => window.GIAE?.openModule?.("proyectos"));
  host.querySelectorAll("[data-delete-load]").forEach(button => button.addEventListener("click", () => {
    project.loads.splice(Number(button.dataset.deleteLoad), 1);
    addHistory("Carga eliminada", "Cargas", false);
    recalculateProject();
    persist();
    render(host, state);
  }));
}

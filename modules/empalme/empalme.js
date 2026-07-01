import { updateProject, recalculateProject, addHistory, persist } from "../../core/store.js";
import { calculateConnectionProject } from "../../core/engineering/connectionEngine.js";

function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function num(n, d=2){ return Number(n || 0).toLocaleString("es-CL", { maximumFractionDigits:d, minimumFractionDigits:d }); }
function kw(n){ return `${num(n, 3)} kW`; }

function statusLabel(status){
  const map = {
    validado_preliminar: "Validado preliminar",
    en_revision: "En revisión",
    requiere_revision: "Requiere revisión"
  };
  return map[status] || status || "Pendiente";
}

function observationBox(items){
  if(!items?.length) return `<div class="notice-ok"><strong>Sin observaciones críticas:</strong> empalme preliminar coherente con las reglas iniciales cargadas.</div>`;
  return `<div class="notice-warn"><strong>Observaciones del Motor de Empalmes:</strong><ul>${items.map(item => `<li><strong>${esc(item.level)}</strong>: ${esc(item.message)}</li>`).join("")}</ul></div>`;
}

function standardsTable(engine){
  const rows = (engine.standards || []).map(item => `
    <tr class="${engine.selected?.breakerA === item.breakerA ? "selected-row" : ""}">
      <td>${item.breakerA} A</td>
      <td>${kw(item.nominalKw)}</td>
      <td>${num(item.maxKva, 2)} kVA</td>
      <td>${esc(item.type)}</td>
    </tr>`).join("");
  return `<details class="normative-details"><summary>Ver tabla normalizada utilizada</summary>
    <div class="data-table-wrap"><table><thead><tr><th>Limitador</th><th>Potencia a contratar</th><th>Potencia máx.</th><th>Tipo normalizado</th></tr></thead><tbody>${rows}</tbody></table></div>
  </details>`;
}

function trace(engine){
  return `<div class="dashboard-card"><h4>Trazabilidad normativa</h4>
    ${(engine.normativeTrace || []).map(item => `<div class="trace-item"><strong>${esc(item.source)} · ${esc(item.rule)}</strong><p>${esc(item.result)}</p></div>`).join("")}
  </div>`;
}

function docs(engine){
  const d = engine.documentationData || {};
  return `<div class="dashboard-card"><h4>Datos preparados para documentación</h4>
    <div class="data-table-wrap"><table><tbody>
      <tr><th>Distribuidora</th><td>${esc(d.distributor)}</td></tr>
      <tr><th>Tipo suministro</th><td>${esc(d.supplyType)}</td></tr>
      <tr><th>Servicio</th><td>${esc(d.serviceType)}</td></tr>
      <tr><th>Potencia instalada</th><td>${kw(d.installedKw)}</td></tr>
      <tr><th>Demanda calculada</th><td>${kw(d.demandKw)}</td></tr>
      <tr><th>Potencia normalizada</th><td>${kw(d.normalizedPowerKw)}</td></tr>
      <tr><th>Limitador</th><td>${d.limiterA || 0} A</td></tr>
      <tr><th>Tipo normalizado</th><td>${esc(d.normalizedType)}</td></tr>
      <tr><th>Dirección</th><td>${esc(d.address || "Pendiente")}</td></tr>
    </tbody></table></div>
  </div>`;
}

function budget(engine){
  const rows = (engine.budgetItems || []).map(item => `<tr><td>${esc(item.family)}</td><td>${esc(item.item)}</td><td>${num(item.qty,0)} ${esc(item.unit)}</td><td>${esc(item.source)}</td></tr>`).join("");
  return `<div class="dashboard-card"><h4>Materiales preparados para presupuesto</h4>
    ${rows ? `<div class="data-table-wrap"><table><thead><tr><th>Familia</th><th>Elemento</th><th>Cantidad</th><th>Origen</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="muted">Sin materiales de empalme hasta completar datos mínimos.</p>`}
  </div>`;
}

export function render(host, state) {
  const project = state.currentProject;
  recalculateProject();
  const engine = project.connectionEngine || calculateConnectionProject(project);
  const s = engine.summary || {};

  host.innerHTML = `
    <section class="module-window real-workspace empalme-workspace">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">Etapa 8.0 · Motor de Empalmes RIC 1</p>
          <h3>Motor de Empalmes</h3>
          <p>Determina el empalme preliminar desde el Proyecto Activo, usando potencia instalada, demanda, tipo de suministro y tabla normalizada RIC 1 cargada en GIAE.</p>
        </div>
        <div class="status-strip">
          <span>Proyecto: ${esc(project.name)}</span>
          <span>Estado: ${esc(statusLabel(engine.status))}</span>
          <span>Motor: ${esc(engine.version)}</span>
        </div>
      </div>

      <div class="kpi-grid engineering-kpis">
        <div class="kpi-card"><span>Potencia instalada</span><strong>${kw(s.installedKw)}</strong></div>
        <div class="kpi-card"><span>Demanda</span><strong>${kw(s.demandKw)}</strong></div>
        <div class="kpi-card"><span>Potencia normalizada</span><strong>${kw(s.normalizedPowerKw)}</strong></div>
        <div class="kpi-card"><span>Limitador</span><strong>${s.limiterA || 0} A</strong></div>
      </div>

      ${observationBox(engine.observations)}

      <div class="dashboard-card">
        <h4>Configuración de empalme</h4>
        <div class="form-grid compact">
          <label>Distribuidora
            <select id="connectionDistributor">
              ${["cge","copelec","frontel","saesa","chilquinta","coelcha"].map(d => `<option value="${d}" ${project.distributor === d ? "selected" : ""}>${d.toUpperCase()}</option>`).join("")}
            </select>
          </label>
          <label>Suministro
            <select id="connectionSupply">
              <option value="monofasico" ${project.supplyType !== "trifasico" ? "selected" : ""}>Monofásico</option>
              <option value="trifasico" ${project.supplyType === "trifasico" ? "selected" : ""}>Trifásico</option>
            </select>
          </label>
          <label>Tipo de servicio
            <select id="connectionService">
              <option value="instalacion-nueva" ${project.serviceType === "instalacion-nueva" ? "selected" : ""}>Instalación nueva</option>
              <option value="aumento-capacidad" ${project.serviceType === "aumento-capacidad" ? "selected" : ""}>Aumento de capacidad</option>
              <option value="regularizacion" ${project.serviceType === "regularizacion" ? "selected" : ""}>Regularización</option>
              <option value="factibilidad" ${project.serviceType === "factibilidad" ? "selected" : ""}>Factibilidad</option>
            </select>
          </label>
          <label>Modalidad constructiva
            <select id="connectionInstallation">
              <option value="definir-en-terreno" ${project.connectionInstallation === "definir-en-terreno" ? "selected" : ""}>Definir en terreno</option>
              <option value="aereo" ${project.connectionInstallation === "aereo" ? "selected" : ""}>Aéreo</option>
              <option value="subterraneo" ${project.connectionInstallation === "subterraneo" ? "selected" : ""}>Subterráneo</option>
            </select>
          </label>
        </div>
        <div class="module-toolbar">
          <button id="saveConnection" class="primary-action">Actualizar empalme</button>
          <button id="downloadConnection" class="secondary">Descargar informe JSON</button>
        </div>
      </div>

      <div class="card-grid">
        <article class="card"><h4>Distribuidora</h4><p>${esc(s.distributor)}</p></article>
        <article class="card"><h4>Tipo de empalme</h4><p>${esc(s.normalizedType)}</p></article>
        <article class="card"><h4>Potencia máx. empalme</h4><p>${num(s.maxKva,2)} kVA</p></article>
        <article class="card"><h4>Confianza</h4><p>${esc(statusLabel(s.confidence))}</p></article>
      </div>

      ${standardsTable(engine)}
      ${docs(engine)}
      ${budget(engine)}
      ${trace(engine)}

      <div class="result-box">
        El Motor de Empalmes prepara antecedentes técnicos. La conexión final depende de la distribuidora, estándares constructivos vigentes, comunicación SEC y revisión profesional competente.
      </div>
    </section>`;

  host.querySelector("#saveConnection")?.addEventListener("click", () => {
    updateProject({
      distributor: host.querySelector("#connectionDistributor").value,
      supplyType: host.querySelector("#connectionSupply").value,
      serviceType: host.querySelector("#connectionService").value,
      connectionInstallation: host.querySelector("#connectionInstallation").value
    }, { module:"Empalme", action:"Configuración de empalme actualizada" });
    render(host, state);
  });

  host.querySelector("#downloadConnection")?.addEventListener("click", () => {
    const payload = JSON.stringify(project.connectionEngine || engine, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `empalme_${(project.name || "proyecto").replace(/\s+/g,"_")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addHistory("Informe de empalme descargado", "Empalme");
    persist();
  });
}

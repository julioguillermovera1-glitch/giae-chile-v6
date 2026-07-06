import { persist, addHistory, saveCurrentProjectToLibrary } from "../../core/store.js";
import { ensureCloudWorkspace, buildCloudReadiness, buildCloudContract, queueProjectSync, clearSyncQueue, cloudSummary, D1_TABLES, R2_BUCKETS, ROLE_MATRIX, WORKER_ENDPOINTS } from "../../core/cloud/cloudWorkspaceEngine.js";

function esc(value = ""){
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function statusClass(status){
  if(status === "listo_para_worker" || status === "activa") return "ok";
  if(status === "preparacion_incompleta" || status === "preparacion_local") return "warn";
  return "danger";
}
function downloadJson(fileName, payload){
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
function renderChecks(checks){
  return checks.map(check => `<article class="notice-line ${check.ok ? "ok" : check.level}"><strong>${esc(check.label)}</strong><br><span>${check.ok ? "Listo" : "Requiere revision"}</span></article>`).join("");
}
function renderEndpoints(){
  return WORKER_ENDPOINTS.map(endpoint => `<tr><td><b>${esc(endpoint.method)}</b></td><td>${esc(endpoint.path)}</td><td>${esc(endpoint.scope)}</td></tr>`).join("");
}
function renderTables(){
  return D1_TABLES.map(table => `<tr><td><b>${esc(table.name)}</b></td><td>${esc(table.purpose)}</td><td><small>${esc(table.keys.join(", "))}</small></td></tr>`).join("");
}
function renderBuckets(){
  return R2_BUCKETS.map(bucket => `<article><strong>${esc(bucket.binding)}</strong><span>${esc(bucket.stores.join(", "))}</span></article>`).join("");
}
function renderRoles(){
  return ROLE_MATRIX.map(role => `<article><strong>${esc(role.label)}</strong><span>${esc(role.permissions.join(", "))}</span></article>`).join("");
}
function renderQueue(queue){
  if(!queue.length) return `<div class="workspace-empty">No hay paquetes pendientes de sincronizacion.</div>`;
  return queue.map(item => `<article class="cloud-queue-item"><div><b>${esc(item.projectName)}</b><span>${esc(item.operation)} - ${esc(item.createdAt)}</span></div><strong>${esc(item.status)}</strong></article>`).join("");
}

export function render(host, state){
  const cloud = ensureCloudWorkspace(state);
  const readiness = buildCloudReadiness(state);
  const summary = cloudSummary(state);
  const license = summary.license;
  const project = state.currentProject || {};
  host.innerHTML = `
    <section class="module-window cloud-module">
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Fase 4 - Nube y colaboracion</p>
          <h3>Nube, usuarios y licencias</h3>
          <p>Prepara GIAE para Cloudflare Workers, D1 y R2 manteniendo el modo local y el respaldo .giae.</p>
        </div>
        <div class="project-state-card ${statusClass(readiness.status)}">
          <small>Preparacion cloud</small>
          <strong>${readiness.score}%</strong>
          <span>${esc(readiness.status)}</span>
        </div>
      </div>

      <section class="admin-kpis compact-kpis cloud-kpis">
        <div><strong>${esc(cloud.mode)}</strong><span>Modo</span></div>
        <div><strong>${esc(license.label)}</strong><span>Licencia</span></div>
        <div><strong>${summary.pendingSync}</strong><span>Pendientes sync</span></div>
        <div><strong>${WORKER_ENDPOINTS.length}</strong><span>Endpoints API</span></div>
        <div><strong>${D1_TABLES.length}</strong><span>Tablas D1</span></div>
        <div><strong>${R2_BUCKETS.length}</strong><span>Buckets R2</span></div>
      </section>

      <section class="cloud-layout">
        <div class="cloud-main">
          <article class="admin-card cloud-config-panel">
            <h4>Configuracion local cloud-ready</h4>
            <div class="form-grid">
              <label>Nombre workspace<input id="cloudWorkspaceName" value="${esc(cloud.workspace.name)}"></label>
              <label>Base API Worker<input id="cloudApiBase" value="${esc(cloud.apiBaseUrl)}"></label>
              <label>Plan licencia<select id="cloudLicensePlan">
                ${["local-preparacion", "independiente", "empresa", "educacion"].map(plan => `<option value="${plan}" ${cloud.license.plan === plan ? "selected" : ""}>${plan}</option>`).join("")}
              </select></label>
              <label>Estado licencia<select id="cloudLicenseStatus">
                ${["preparacion_local", "activa", "suspendida", "vencida"].map(status => `<option value="${status}" ${cloud.license.status === status ? "selected" : ""}>${status}</option>`).join("")}
              </select></label>
              <label>Asientos<input id="cloudSeats" type="number" min="1" value="${Number(cloud.license.seats || 1)}"></label>
              <label>Vigencia<input id="cloudValidUntil" type="date" value="${esc(cloud.license.validUntil || "")}"></label>
            </div>
            <div class="row-actions">
              <button id="cloudSaveConfig">Guardar preparacion</button>
              <button id="cloudQueueProject" class="secondary">Preparar sync del proyecto</button>
              <button id="cloudDownloadContract" class="ghost">Contrato cloud</button>
              <button id="cloudDownloadPackage" class="ghost">Paquete sync</button>
              <button id="cloudClearQueue" class="ghost danger-text">Limpiar cola</button>
            </div>
          </article>

          <article class="admin-card">
            <h4>Checklist de salida Fase 4</h4>
            <div class="notice-list cloud-checks">${renderChecks(readiness.checks)}</div>
          </article>

          <article class="admin-card">
            <h4>Cola de sincronizacion local</h4>
            <p class="small">Proyecto activo: <b>${esc(project.name || "Proyecto sin nombre")}</b></p>
            <div class="cloud-queue-list">${renderQueue(cloud.syncQueue)}</div>
          </article>
        </div>

        <aside class="cloud-side">
          <article class="admin-card">
            <h4>Roles y permisos</h4>
            <div class="cloud-mini-list">${renderRoles()}</div>
          </article>
          <article class="admin-card">
            <h4>R2 archivos</h4>
            <div class="cloud-mini-list">${renderBuckets()}</div>
          </article>
        </aside>
      </section>

      <section class="admin-card">
        <h4>Contrato Worker</h4>
        <div class="table-scroll"><table><thead><tr><th>Metodo</th><th>Ruta</th><th>Permiso</th></tr></thead><tbody>${renderEndpoints()}</tbody></table></div>
      </section>

      <section class="admin-card">
        <h4>Modelo D1</h4>
        <div class="table-scroll"><table><thead><tr><th>Tabla</th><th>Uso</th><th>Campos clave</th></tr></thead><tbody>${renderTables()}</tbody></table></div>
      </section>

      <div class="policy-box"><b>Limite honesto:</b> esta fase prepara la arquitectura. La autenticacion real, tokens, validacion de licencia y escritura en nube deben ejecutarse en Cloudflare Worker.</div>
    </section>`;

  host.querySelector("#cloudSaveConfig").addEventListener("click", () => {
    cloud.workspace.name = host.querySelector("#cloudWorkspaceName").value.trim() || "GIAE Chile";
    cloud.workspace.updatedAt = new Date().toLocaleString("es-CL");
    cloud.apiBaseUrl = host.querySelector("#cloudApiBase").value.trim() || "/api/giae";
    cloud.license.plan = host.querySelector("#cloudLicensePlan").value;
    cloud.license.status = host.querySelector("#cloudLicenseStatus").value;
    cloud.license.seats = Math.max(1, Number(host.querySelector("#cloudSeats").value || 1));
    cloud.license.validUntil = host.querySelector("#cloudValidUntil").value;
    cloud.contract = buildCloudContract({ apiBase: cloud.apiBaseUrl });
    addHistory("Preparacion cloud actualizada", "Nube y licencias", false);
    persist();
    render(host, state);
  });

  host.querySelector("#cloudQueueProject").addEventListener("click", () => {
    saveCurrentProjectToLibrary("Proyecto guardado antes de preparar sincronizacion");
    const item = queueProjectSync(state, { action: "Proyecto preparado para sincronizacion", operation: "project.upsert" });
    addHistory("Paquete sync creado: " + item.id, "Nube y licencias", false);
    persist();
    render(host, state);
  });

  host.querySelector("#cloudDownloadContract").addEventListener("click", () => downloadJson("giae-cloud-contract.json", buildCloudContract({ apiBase: cloud.apiBaseUrl })));
  host.querySelector("#cloudDownloadPackage").addEventListener("click", () => {
    const item = cloud.syncQueue[0] || queueProjectSync(state, { action: "Paquete sync descargado", operation: "project.upsert" });
    persist();
    downloadJson("giae-sync-package.json", item.envelope);
    render(host, state);
  });
  host.querySelector("#cloudClearQueue").addEventListener("click", () => {
    if(!confirm("Limpiar paquetes de sincronizacion pendientes?")) return;
    const removed = clearSyncQueue(state);
    addHistory("Cola sync limpiada: " + removed + " paquete(s)", "Nube y licencias", false);
    persist();
    render(host, state);
  });
}
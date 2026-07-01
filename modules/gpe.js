import { recalculateProject, persist, addHistory, createRevision } from "../core/store.js";

function esc(value){
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
}

function statusClass(state){
  if(state === "ok") return "status-ok";
  if(state === "warning") return "status-warn";
  return "status-pending";
}

function issueClass(level){
  if(level === "alto") return "risk-high";
  if(level === "medio") return "risk-medium";
  if(level === "bajo") return "risk-low";
  return "risk-info";
}

function downloadJSON(filename, payload){
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state){
  recalculateProject();
  const p = state.currentProject;
  const gpe = p.gpe || {};
  const statuses = gpe.status || [];
  const issues = gpe.issues || [];
  const deps = gpe.dependencies || [];
  const revisions = p.revisions || [];

  host.innerHTML = `
    <section class="module-window gpe-module">
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Proyecto Inteligente</p>
          <h3>GIAE Project Engine</h3>
          <p>Coordina Proyecto Activo, cargas, ingeniería, tableros, normativa, documentación y futuras salidas del proyecto.</p>
        </div>
        <div class="project-state-card">
          <small>Preparación del proyecto</small>
          <strong>${Number(gpe.readiness || 0)}%</strong>
          <span>${esc(gpe.version || "GPE")}</span>
        </div>
      </div>

      <section class="dashboard-grid kpi-row">
        <article><small>Cargas</small><strong>${gpe.metrics?.loads || 0}</strong></article>
        <article><small>Circuitos</small><strong>${gpe.metrics?.circuits || 0}</strong></article>
        <article><small>Materiales</small><strong>${gpe.metrics?.materials || 0}</strong></article>
        <article><small>Observaciones</small><strong>${gpe.metrics?.warnings || 0}</strong></article>
      </section>

      <div class="top-actions wrap-actions">
        <button id="gpeRecalculate">Recalcular proyecto</button>
        <button id="gpeRevision" class="secondary">Crear revisión</button>
        <button id="gpeExport" class="secondary">Exportar diagnóstico GPE</button>
      </div>

      <div class="dashboard-grid two">
        <article class="dashboard-card">
          <h4>Estado por área</h4>
          <div class="status-list">
            ${statuses.map(item => `
              <div class="status-row ${statusClass(item.state)}">
                <span>${esc(item.name)}</span>
                <strong>${esc(item.label)}</strong>
              </div>
            `).join("")}
          </div>
        </article>

        <article class="dashboard-card">
          <h4>Acciones recomendadas</h4>
          ${(gpe.nextActions || []).map(action => `<p class="notice-line">${esc(action)}</p>`).join("") || "<p>Sin acciones pendientes.</p>"}
          <h4>Dependencias entre motores</h4>
          <div class="dependency-list">
            ${deps.map(dep => `<p><strong>${esc(dep.from)}</strong> → ${esc(dep.to)} <span>${esc(dep.status)}</span></p>`).join("")}
          </div>
        </article>
      </div>

      <div class="dashboard-grid two">
        <article class="dashboard-card">
          <h4>Auditoría continua</h4>
          ${issues.map(issue => `
            <div class="issue-row ${issueClass(issue.level)}">
              <strong>${esc(issue.area)}</strong>
              <span>${esc(issue.level)}</span>
              <p>${esc(issue.message)}</p>
            </div>
          `).join("") || "<p>No hay observaciones registradas.</p>"}
        </article>

        <article class="dashboard-card">
          <h4>Revisiones del proyecto</h4>
          ${revisions.slice().reverse().map(rev => `
            <div class="revision-row">
              <strong>${esc(rev.id)}</strong>
              <span>${esc(rev.date)}</span>
              <p>${esc(rev.reason)} · ${Number(rev.summary?.readiness || 0)}% preparación · ${esc(rev.hash)}</p>
            </div>
          `).join("") || "<p>No hay revisiones creadas.</p>"}

          <h4>Eventos GPE</h4>
          ${(gpe.eventLog || []).slice(-8).reverse().map(ev => `<p class="event-line"><strong>${esc(ev.type)}</strong><br>${esc(ev.date)} · ${esc(ev.message)}</p>`).join("")}
        </article>
      </div>
    </section>`;

  host.querySelector("#gpeRecalculate").addEventListener("click", () => {
    addHistory("GPE recalculó el proyecto completo", "GPE", false);
    recalculateProject();
    persist();
    render(host, state);
  });

  host.querySelector("#gpeRevision").addEventListener("click", () => {
    createRevision("Revisión manual creada desde GPE");
    addHistory("Revisión de proyecto creada", "GPE", false);
    persist();
    render(host, state);
  });

  host.querySelector("#gpeExport").addEventListener("click", () => {
    downloadJSON("diagnostico-gpe.json", {
      exportedAt: new Date().toISOString(),
      author: "Julio Guillermo Vera",
      project: {
        id: p.id,
        name: p.name,
        code: p.code,
        client: p.client,
        supplyType: p.supplyType,
        installedPowerKw: p.installedPowerKw,
        demandPowerKw: p.demandPowerKw
      },
      gpe
    });
  });
}

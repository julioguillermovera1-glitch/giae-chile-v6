import { updateProject, newProject, importProjectFile, exportProjectFile } from "../../core/store.js";

function esc(value){
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
}

function distributorOption(value, current, label){
  return `<option value="${value}" ${current === value ? "selected" : ""}>${label}</option>`;
}

function checklist(project){
  const list = project.checklist || [];
  return `<div class="active-checklist">${list.map(item => `
    <div class="check-item ${item.done ? "done" : "pending"}">
      <span>${item.done ? "✓" : "–"}</span><strong>${item.label}</strong>
    </div>`).join("")}</div>`;
}

function history(project){
  const items = (project.history || []).slice(-8).reverse();
  return `<div class="history-list">${items.map(item => `
    <p><strong>${esc(item.module)}</strong><br><span>${esc(item.date)} · ${esc(item.action)}</span></p>`).join("") || "<p>Sin historial.</p>"}</div>`;
}

export function render(host, state) {
  const project = state.currentProject;
  host.innerHTML = `
    <section class="module-window project-active-module">
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Núcleo de trabajo</p>
          <h3>Proyecto Activo</h3>
          <p>Base común para cargas, cuadro de carga, empalme, tierra, unilineal, documentación, presupuesto y auditoría.</p>
        </div>
        <div class="project-state-card">
          <small>Estado</small>
          <strong>${esc(project.status || "En desarrollo")}</strong>
          <span>${project.progress?.engineering || 0}% avance general</span>
        </div>
      </div>

      <section class="dashboard-grid kpi-row project-kpis">
        <article><small>Código</small><strong>${esc(project.code || project.id)}</strong></article>
        <article><small>Potencia instalada</small><strong>${Number(project.installedPowerKw || 0).toFixed(2)} kW</strong></article>
        <article><small>Demanda estimada</small><strong>${Number(project.demandPowerKw || 0).toFixed(2)} kW</strong></article>
        <article><small>Normativa</small><strong>${esc(project.progress?.normative || "Pendiente")}</strong></article>
      </section>

      <div class="dashboard-grid two">
        <article class="dashboard-card">
          <h4>Datos del proyecto</h4>
          <div class="form-grid">
            <label>Nombre del proyecto <input id="projectName" value="${esc(project.name)}"></label>
            <label>Código interno <input id="projectCode" value="${esc(project.code)}" placeholder="Ej: PR-2026-001"></label>
            <label>Cliente <input id="client" value="${esc(project.client)}"></label>
            <label>Empresa <input id="company" value="${esc(project.company)}"></label>
            <label>Instalador / responsable técnico <input id="installer" value="${esc(project.installer || project.responsible)}"></label>
            <label>Dirección <input id="address" value="${esc(project.address)}"></label>
            <label>Comuna <input id="commune" value="${esc(project.commune)}"></label>
            <label>Región <input id="region" value="${esc(project.region)}"></label>
            <label>Sistema
              <select id="supplyType">
                <option value="monofasico" ${project.supplyType === "monofasico" ? "selected" : ""}>Monofásico 220 V</option>
                <option value="trifasico" ${project.supplyType === "trifasico" ? "selected" : ""}>Trifásico 380/220 V</option>
              </select>
            </label>
            <label>Distribuidora
              <select id="distributor">
                ${distributorOption("cge", project.distributor, "CGE")}
                ${distributorOption("copelec", project.distributor, "Copelec")}
                ${distributorOption("frontel", project.distributor, "Frontel")}
                ${distributorOption("saesa", project.distributor, "Saesa")}
              </select>
            </label>
            <label>Tipo de proyecto
              <select id="serviceType">
                <option value="instalacion-nueva" ${project.serviceType === "instalacion-nueva" ? "selected" : ""}>Instalación nueva</option>
                <option value="regularizacion" ${project.serviceType === "regularizacion" ? "selected" : ""}>Regularización</option>
                <option value="aumento-potencia" ${project.serviceType === "aumento-potencia" ? "selected" : ""}>Aumento de potencia</option>
                <option value="modificacion" ${project.serviceType === "modificacion" ? "selected" : ""}>Modificación</option>
              </select>
            </label>
            <label>Estado
              <select id="projectStatus">
                <option ${project.status === "En desarrollo" ? "selected" : ""}>En desarrollo</option>
                <option ${project.status === "En revisión" ? "selected" : ""}>En revisión</option>
                <option ${project.status === "Listo para documentar" ? "selected" : ""}>Listo para documentar</option>
                <option ${project.status === "Cerrado" ? "selected" : ""}>Cerrado</option>
              </select>
            </label>
          </div>
          <div class="top-actions wrap-actions">
            <button id="saveProjectData">Actualizar proyecto activo</button>
            <button id="newProjectBtn" class="secondary">Nuevo proyecto</button>
            <button id="exportProjectBtn" class="secondary">Exportar .giae</button>
            <label class="import-label">Importar .giae<input id="importProjectInput" type="file" accept=".giae,application/json" hidden></label>
          </div>
        </article>

        <article class="dashboard-card">
          <h4>Checklist automático</h4>
          ${checklist(project)}
          <div class="dashboard-notice">El checklist se actualiza con los datos reales del Proyecto Activo. No reemplaza la auditoría normativa final.</div>
          <h4>Historial reciente</h4>
          ${history(project)}
        </article>
      </div>
    </section>`;

  host.querySelector("#saveProjectData").addEventListener("click", () => {
    updateProject({
      name: host.querySelector("#projectName").value.trim(),
      code: host.querySelector("#projectCode").value.trim(),
      client: host.querySelector("#client").value.trim(),
      company: host.querySelector("#company").value.trim(),
      installer: host.querySelector("#installer").value.trim(),
      responsible: host.querySelector("#installer").value.trim(),
      address: host.querySelector("#address").value.trim(),
      commune: host.querySelector("#commune").value.trim(),
      region: host.querySelector("#region").value.trim(),
      supplyType: host.querySelector("#supplyType").value,
      distributor: host.querySelector("#distributor").value,
      serviceType: host.querySelector("#serviceType").value,
      status: host.querySelector("#projectStatus").value
    }, { module: "Proyecto", action: "Datos generales del Proyecto Activo actualizados" });
    render(host, state);
  });

  host.querySelector("#newProjectBtn").addEventListener("click", () => {
    if(!confirm("¿Crear un nuevo Proyecto Activo? El proyecto actual debe estar exportado si quieres conservar una copia externa.")) return;
    newProject();
    render(host, state);
  });

  host.querySelector("#exportProjectBtn").addEventListener("click", () => {
    const payload = exportProjectFile();
    const safeName = (state.currentProject.name || "proyecto-giae").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "proyecto-giae";
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/giae+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.giae`;
    link.click();
    URL.revokeObjectURL(url);
  });

  host.querySelector("#importProjectInput").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if(!file) return;
    const text = await file.text();
    try{
      importProjectFile(JSON.parse(text));
      render(host, state);
    }catch{
      alert("No se pudo importar el archivo. Verifica que sea un proyecto .giae válido.");
    }
  });
}

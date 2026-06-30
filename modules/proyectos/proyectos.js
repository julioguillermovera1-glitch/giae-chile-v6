import { state as globalState, listProjects, saveCurrentProjectToLibrary, openProject, duplicateProject, deleteProject, archiveProject, renameProject, exportProjectById, importProjectToLibrary, newProject } from "../../core/store.js";

function esc(value){
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
}

function safeFileName(name){
  return (name || "proyecto-giae").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "proyecto-giae";
}

function downloadProject(payload){
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/giae+json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(payload.project?.name)}.giae`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderRows(projects){
  if(!projects.length){
    return `<tr><td colspan="8" class="empty-cell">No hay proyectos guardados en la biblioteca local.</td></tr>`;
  }
  return projects.map(project => `
    <tr data-project-row="${esc(project.id)}">
      <td><strong>${esc(project.name)}</strong><br><small>${esc(project.code || project.id)}</small></td>
      <td>${esc(project.client || "Sin cliente")}</td>
      <td>${esc(project.company || project.installer || "Sin responsable")}</td>
      <td>${esc(project.status)}</td>
      <td>${esc(project.supplyType === "trifasico" ? "Trifásico" : "Monofásico")}</td>
      <td>${Number(project.installedPowerKw || 0).toFixed(2)} kW</td>
      <td><small>${esc(project.updatedAt)}</small></td>
      <td class="project-actions-cell">
        <button data-action="open" data-id="${esc(project.id)}">Abrir</button>
        <button data-action="duplicate" data-id="${esc(project.id)}">Duplicar</button>
        <button data-action="rename" data-id="${esc(project.id)}">Renombrar</button>
        <button data-action="export" data-id="${esc(project.id)}">Exportar</button>
        <button data-action="archive" data-id="${esc(project.id)}">Archivar</button>
        <button class="danger-text" data-action="delete" data-id="${esc(project.id)}">Eliminar</button>
      </td>
    </tr>`).join("");
}

function cloudPlan(){
  return `
    <article class="dashboard-card cloud-plan-card">
      <h4>Preparado para nube Cloudflare</h4>
      <p>En esta etapa el almacenamiento funcional es local. La arquitectura queda preparada para producción con Workers, D1 y R2.</p>
      <div class="cloud-grid">
        <div><strong>D1</strong><span>Usuarios, empresas, permisos, proyectos y metadatos.</span></div>
        <div><strong>R2</strong><span>Logos, plantillas, PDF, imágenes, respaldos y archivos .giae.</span></div>
        <div><strong>Workers</strong><span>API segura para leer, guardar, sincronizar y auditar cambios.</span></div>
        <div><strong>.giae</strong><span>Formato portable para respaldo, envío e importación.</span></div>
      </div>
    </article>`;
}

export function render(host, state){
  const projects = listProjects({ includeArchived: false });
  const active = state.currentProject || {};
  host.innerHTML = `
    <section class="module-window projects-module">
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Gestión local</p>
          <h3>Administrador de Proyectos</h3>
          <p>Crea, guarda, abre, duplica, importa y exporta proyectos GIAE. Esta biblioteca funciona en el navegador y queda lista para futura sincronización en nube.</p>
        </div>
        <div class="project-state-card">
          <small>Proyecto activo</small>
          <strong>${esc(active.name || "Proyecto sin nombre")}</strong>
          <span>${Number(active.installedPowerKw || 0).toFixed(2)} kW · ${esc(active.status || "En desarrollo")}</span>
        </div>
      </div>

      <section class="dashboard-grid kpi-row">
        <article><small>Proyectos locales</small><strong>${projects.length}</strong></article>
        <article><small>Formato</small><strong>.giae</strong></article>
        <article><small>Modo actual</small><strong>Local</strong></article>
        <article><small>Nube</small><strong>D1/R2 preparado</strong></article>
      </section>

      <article class="dashboard-card project-toolbar-card">
        <div class="top-actions wrap-actions">
          <button id="newManagedProject">Nuevo proyecto</button>
          <button id="saveManagedProject" class="secondary">Guardar proyecto activo</button>
          <button id="exportActiveProject" class="secondary">Exportar activo .giae</button>
          <label class="import-label">Importar .giae<input id="managedImport" type="file" accept=".giae,application/json" hidden></label>
        </div>
        <div class="project-search-row">
          <label>Buscar proyecto<input id="projectSearch" placeholder="Cliente, código, comuna, estado, distribuidora..."></label>
        </div>
      </article>

      <article class="dashboard-card">
        <h4>Biblioteca local de proyectos</h4>
        <div class="table-wrap">
          <table class="projects-table">
            <thead><tr><th>Proyecto</th><th>Cliente</th><th>Responsable</th><th>Estado</th><th>Sistema</th><th>Potencia</th><th>Última modificación</th><th>Acciones</th></tr></thead>
            <tbody id="projectsRows">${renderRows(projects)}</tbody>
          </table>
        </div>
        <p class="small muted-note">Nota: el modo local usa el navegador. Para producción multiusuario se usará Cloudflare D1/R2.</p>
      </article>

      ${cloudPlan()}
    </section>`;

  function refresh(){ render(host, globalState); }

  host.querySelector("#newManagedProject").addEventListener("click", () => {
    if(!confirm("¿Crear un nuevo proyecto y guardarlo como Proyecto Activo?")) return;
    const name = prompt("Nombre del nuevo proyecto", "Proyecto sin nombre") || "Proyecto sin nombre";
    newProject({ name });
    saveCurrentProjectToLibrary("Nuevo proyecto creado desde Administrador de Proyectos");
    refresh();
    window.GIAE?.refreshActiveModule?.();
  });

  host.querySelector("#saveManagedProject").addEventListener("click", () => {
    saveCurrentProjectToLibrary();
    refresh();
  });

  host.querySelector("#exportActiveProject").addEventListener("click", () => {
    saveCurrentProjectToLibrary("Proyecto activo exportado");
    downloadProject(exportProjectById(globalState.currentProject.id));
  });

  host.querySelector("#managedImport").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if(!file) return;
    try{
      const payload = JSON.parse(await file.text());
      importProjectToLibrary(payload, true);
      refresh();
      window.GIAE?.refreshActiveModule?.();
    }catch{
      alert("No se pudo importar el archivo. Verifica que sea un .giae válido.");
    }
  });

  host.querySelector("#projectSearch").addEventListener("input", event => {
    const q = event.target.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const filtered = listProjects().filter(project => JSON.stringify(project).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q));
    host.querySelector("#projectsRows").innerHTML = renderRows(filtered);
  });

  host.querySelector("#projectsRows").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if(!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    if(action === "open"){
      openProject(id);
      refresh();
      window.GIAE?.openModule?.("proyecto");
    }
    if(action === "duplicate"){
      duplicateProject(id);
      refresh();
    }
    if(action === "rename"){
      const current = listProjects({ includeArchived: true }).find(project => project.id === id);
      const name = prompt("Nuevo nombre del proyecto", current?.name || "");
      if(name){ renameProject(id, name); refresh(); }
    }
    if(action === "export"){
      downloadProject(exportProjectById(id));
    }
    if(action === "archive"){
      if(confirm("¿Archivar este proyecto?")){ archiveProject(id); refresh(); }
    }
    if(action === "delete"){
      if(confirm("Eliminar borra este proyecto de la biblioteca local. ¿Continuar?")){ deleteProject(id); refresh(); }
    }
  });
}

import { state as globalState, listProjects, saveCurrentProjectToLibrary, openProject, duplicateProject, deleteProject, archiveProject, renameProject, exportProjectById, importProjectToLibrary, newProject, updateProject, addLoad, recalculateProject } from "../../core/store.js";

function esc(value){
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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

function fmtKw(value, digits = 2){
  return `${Number(value || 0).toLocaleString("es-CL", { minimumFractionDigits: digits, maximumFractionDigits: digits })} kW`;
}

function fmtA(value){
  return `${Number(value || 0).toLocaleString("es-CL", { maximumFractionDigits: 1 })} A`;
}

function systemLabel(value){
  return value === "trifasico" ? "Trifasico 380/220 V" : "Monofasico 220 V";
}

function docType(project){
  const kw = Number(project.demandPowerKw || project.installedPowerKw || 0);
  if(!project.client || !project.address || !(project.loads || []).length) return "Pendiente";
  if(kw <= 20) return "TE1 probable";
  if(kw <= 75) return "TE1 con revision tecnica";
  return "Revisar TE2/TE3 segun alcance";
}

function groundingLabel(project){
  const grounding = project.grounding || project.earth;
  if(grounding?.summary){
    return `${grounding.summary.recommendedEstimateOhm || grounding.summary.selectedEstimateOhm || "--"} ohm estimados`;
  }
  if(!(project.loads || []).length) return "Pendiente de cargas";
  return project.supplyType === "trifasico" ? "Banco de electrodos o malla preliminar" : "Electrodo vertical con diferencial";
}

function connectionSummary(project){
  const summary = project.connectionEngine?.summary || {};
  const distributor = summary.distributor || project.distributor || "Pendiente";
  const supply = project.supplyType === "trifasico" ? "Empalme trifasico" : "Empalme monofasico";
  return {
    type: `${supply} ${String(distributor).toUpperCase()}`,
    technicalType: summary.normalizedType || "Tipo normalizado pendiente",
    limiter: summary.limiterA ? `${summary.limiterA} A` : "Pendiente",
    power: summary.normalizedPowerKw ? fmtKw(summary.normalizedPowerKw, 2) : fmtKw(project.demandPowerKw, 2),
    distributor
  };
}

function completion(project){
  const checks = [
    Boolean(project.name && project.client && project.company && project.address && project.commune && project.distributor),
    (project.loads || []).length > 0,
    (project.loadBoard || []).length > 0,
    Boolean(project.grounding || project.earth || (project.loads || []).length),
    Boolean(project.unilineal || (project.loadBoard || []).length),
    Boolean(project.connectionEngine?.summary?.normalizedPowerKw)
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function flowSteps(project){
  const board = project.loadBoard || [];
  const connection = connectionSummary(project);
  return [
    { id:"datos", module:"proyectos", title:"PASO 1. Datos del proyecto", done:Boolean(project.name && project.client && project.company && project.address && project.commune && project.region && project.distributor), detail:`${project.client || "Cliente pendiente"} · ${project.company || "Empresa pendiente"}` },
    { id:"cargas", module:"proyectos", title:"PASO 2. Ingreso de cargas", done:(project.loads || []).length > 0, detail:`${(project.loads || []).length} cargas ingresadas` },
    { id:"cuadro", module:"cuadro-carga", title:"PASO 3. Cuadro de carga", done:board.length > 0, detail:`${board.length} circuitos calculados · ${fmtA(project.currentA)}` },
    { id:"tierra", module:"tierra", title:"PASO 4. Puesta a tierra", done:Boolean(project.grounding || project.earth || board.length), detail:groundingLabel(project) },
    { id:"unilineal", module:"unilineal", title:"PASO 5. Diagrama unilineal", done:Boolean(project.unilineal || board.length), detail:`Diagrama desde ${board.length || 0} circuitos y tablero principal` },
    { id:"empalme", module:"empalme", title:"PASO 6. Empalme a contratar", done:Boolean(project.connectionEngine?.summary?.normalizedPowerKw), detail:`${connection.type} · ${connection.limiter} · ${docType(project)}` }
  ];
}

function projectDataReady(project){
  return Boolean(project.name && project.client && project.company && project.address && project.commune && project.region && project.distributor);
}

function activeAssistantStep(project){
  const board = project.loadBoard || [];
  if(!projectDataReady(project)) return "datos";
  if(!(project.loads || []).length) return "cargas";
  if(!board.length) return "cuadro";
  if(!(project.grounding || project.earth)) return "tierra";
  if(!project.connectionEngine?.summary?.normalizedPowerKw) return "unilineal";
  return "cad";
}

function activeStepTitle(step){
  const titles = {
    datos: "PASO 1 · Datos del proyecto",
    cargas: "PASO 2 · Ingreso de cargas",
    cuadro: "PASO 3 · Cuadro de carga",
    tierra: "PASO 4 · Puesta a tierra",
    unilineal: "PASO 5 · Diagrama unilineal",
    empalme: "PASO 6 · Empalme",
    cad: "Plano CAD opcional"
  };
  return titles[step] || titles.datos;
}

function renderActiveAssistantStep(project, step, connection){
  if(step === "datos") return projectForm(project);
  if(step === "cargas") return quickLoadCard();
  if(step === "cuadro") return `<article class="dashboard-card active-flow-card">
    <div class="section-title-row"><div><h4>PASO 3 · Cuadro de carga</h4><p>GIAE ya puede ordenar las cargas y generar protecciones, conductores, fases y totales.</p></div><button class="primary-action" data-open-module="cuadro-carga">Abrir cuadro de carga</button></div>
    ${loadBoardPreview(project)}
  </article>`;
  if(step === "tierra") return `<article class="dashboard-card active-flow-card">
    <div class="section-title-row"><div><h4>PASO 4 · Puesta a tierra</h4><p>Con el cuadro de carga listo, GIAE propone la tierra recomendada.</p></div><button class="primary-action" data-open-module="tierra">Calcular puesta a tierra</button></div>
    <div class="recommendation-box"><strong>${esc(groundingLabel(project))}</strong><span>El detalle técnico queda dentro del módulo de tierra y debe confirmarse con medición real.</span></div>
  </article>`;
  if(step === "unilineal") return `<article class="dashboard-card active-flow-card">
    <div class="section-title-row"><div><h4>PASO 5 · Diagrama unilineal</h4><p>El unilineal se arma desde el cuadro de carga y la tierra del proyecto.</p></div><button class="primary-action" data-open-module="unilineal">Abrir unilineal</button></div>
    ${unilinealPreview(project)}
    <div class="top-actions wrap-actions"><button class="secondary" data-open-module="empalme">Continuar a empalme</button></div>
  </article>`;
  return `<article class="dashboard-card active-flow-card">
    <div class="section-title-row"><div><h4>PASO 6 · Empalme a contratar</h4><p>Con los cálculos listos, GIAE resume el empalme que corresponde contratar.</p></div><button class="primary-action" data-open-module="empalme">Ver empalme</button></div>
    <div class="recommendation-box"><strong>${esc(connection.type)} · ${esc(connection.limiter)}</strong><span>Potencia a contratar: ${esc(connection.power)} · ${esc(connection.technicalType)} · Documento: ${esc(docType(project))}</span></div>
    <div class="top-actions wrap-actions"><button class="secondary" data-open-module="cad-electrico">Crear plano CAD opcional</button></div>
  </article>`;
}
function nextStep(project){
  return flowSteps(project).find(step => !step.done) || flowSteps(project).at(-1);
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
      <td>${esc(systemLabel(project.supplyType))}</td>
      <td>${fmtKw(project.installedPowerKw)}</td>
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

function flowCards(project){
  return flowSteps(project).map(step => `
    <article class="project-flow-step ${step.done ? "done" : "pending"}">
      <span>${step.done ? "Listo" : "Pendiente"}</span>
      <h4>${esc(step.title)}</h4>
      <p>${esc(step.detail)}</p>
      <button class="secondary" data-open-module="${esc(step.module)}">Abrir</button>
    </article>`).join("");
}

function loadBoardPreview(project){
  const board = project.loadBoard || [];
  if(!board.length){
    return `<div class="workspace-empty compact-empty">Agrega cargas para generar automaticamente el cuadro de cargas.</div>`;
  }
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>N</th><th>Carga</th><th>Demanda</th><th>Ib</th><th>Proteccion</th><th>Conductor</th></tr></thead>
    <tbody>${board.slice(0, 6).map(row => `<tr>
      <td>${esc(row.number)}</td>
      <td><strong>${esc(row.description)}</strong><br><small>${esc(row.type)}</small></td>
      <td>${fmtKw(Number(row.demandW || 0) / 1000, 3)}</td>
      <td>${fmtA(row.currentA)}</td>
      <td>${esc(row.protection || "Pendiente")}</td>
      <td>${esc(row.conductor || "Pendiente")}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function unilinealPreview(project){
  const connection = connectionSummary(project);
  const circuits = project.loadBoard || [];
  return `<div class="single-line-preview">
    <div class="single-node utility">Red / ${esc(connection.distributor)}</div>
    <div class="single-line"></div>
    <div class="single-node meter">Empalme<br><strong>${esc(connection.limiter)}</strong></div>
    <div class="single-line"></div>
    <div class="single-node panel">Tablero General<br><strong>${fmtA(project.currentA)}</strong></div>
    <div class="single-branches">
      ${circuits.slice(0, 5).map(row => `<span>${esc(row.number)} · ${esc(row.protection || "PIA")}</span>`).join("") || "<span>Sin circuitos</span>"}
    </div>
  </div>`;
}

function projectForm(project){
  return `<article class="dashboard-card project-creation-card">
    <div class="section-title-row">
      <div><h4>PASO 1 · Datos del Proyecto</h4><p>Primero se ingresan datos de cliente, empresa, instalador, direccion, distribuidora y tipo de instalacion. Con esto GIAE habilita las cargas.</p></div>
      <button id="createProjectFromForm" class="primary-action">Iniciar proyecto</button>
    </div>
    <div class="form-grid compact">
      <label>Nombre del proyecto <input id="flowName" value="${esc(project.name)}" placeholder="Ej: Local comercial Los Angeles"></label>
      <label>Codigo interno <input id="flowCode" value="${esc(project.code)}" placeholder="PR-2026-001"></label>
      <label>Cliente <input id="flowClient" value="${esc(project.client)}" placeholder="Nombre cliente"></label>
      <label>Empresa <input id="flowCompany" value="${esc(project.company)}" placeholder="Empresa instaladora"></label>
      <label>Responsable tecnico <input id="flowInstaller" value="${esc(project.installer || project.responsible)}" placeholder="Nombre del instalador"></label>
      <label>Registro SEC <input id="flowSec" value="${esc(project.secRegistration || project.secNumber)}" placeholder="Registro SEC si corresponde"></label>
      <label>Direccion <input id="flowAddress" value="${esc(project.address)}" placeholder="Calle y numero"></label>
      <label>Comuna <input id="flowCommune" value="${esc(project.commune)}" placeholder="Comuna"></label>
      <label>Region <input id="flowRegion" value="${esc(project.region)}" placeholder="Region"></label>
      <label>Sistema
        <select id="flowSupply">
          <option value="monofasico" ${project.supplyType !== "trifasico" ? "selected" : ""}>Monofasico 220 V</option>
          <option value="trifasico" ${project.supplyType === "trifasico" ? "selected" : ""}>Trifasico 380/220 V</option>
        </select>
      </label>
      <label>Distribuidora
        <select id="flowDistributor">
          ${["cge","copelec","frontel","saesa","chilquinta","coelcha"].map(d => `<option value="${d}" ${project.distributor === d ? "selected" : ""}>${d.toUpperCase()}</option>`).join("")}
        </select>
      </label>
      <label>Tipo de instalacion
        <select id="flowInstallationType">
          <option value="domiciliaria" ${project.installationType === "domiciliaria" ? "selected" : ""}>Domiciliaria</option>
          <option value="comercial" ${project.installationType === "comercial" ? "selected" : ""}>Comercial</option>
          <option value="industrial" ${project.installationType === "industrial" ? "selected" : ""}>Industrial</option>
          <option value="provisoria" ${project.installationType === "provisoria" ? "selected" : ""}>Provisoria</option>
        </select>
      </label>
      <label>Tipo de inmueble
        <select id="flowPropertyType">
          <option value="vivienda" ${project.propertyType === "vivienda" ? "selected" : ""}>Vivienda</option>
          <option value="local-comercial" ${project.propertyType === "local-comercial" ? "selected" : ""}>Local comercial</option>
          <option value="oficina" ${project.propertyType === "oficina" ? "selected" : ""}>Oficina</option>
          <option value="edificio" ${project.propertyType === "edificio" ? "selected" : ""}>Edificio</option>
        </select>
      </label>
      <label>Potencia existente kW <input id="flowExistingPower" type="number" step="0.01" min="0" value="${esc(project.existingPowerKw)}" placeholder="0 si no corresponde"></label>
      <label>Tipo de trabajo
        <select id="flowService">
          <option value="instalacion-nueva" ${project.serviceType === "instalacion-nueva" ? "selected" : ""}>Instalacion nueva</option>
          <option value="regularizacion" ${project.serviceType === "regularizacion" ? "selected" : ""}>Regularizacion</option>
          <option value="aumento-potencia" ${project.serviceType === "aumento-potencia" ? "selected" : ""}>Aumento de potencia</option>
          <option value="modificacion" ${project.serviceType === "modificacion" ? "selected" : ""}>Modificacion</option>
        </select>
      </label>
      <label>Observaciones <input id="flowObservations" value="${esc(project.observations)}" placeholder="Notas del proyecto"></label>
      <label>Estado
        <select id="flowStatus">
          <option ${project.status === "En desarrollo" ? "selected" : ""}>En desarrollo</option>
          <option ${project.status === "En revision" ? "selected" : ""}>En revision</option>
          <option ${project.status === "Listo para documentar" ? "selected" : ""}>Listo para documentar</option>
          <option ${project.status === "Cerrado" ? "selected" : ""}>Cerrado</option>
        </select>
      </label>
    </div>
    <div class="top-actions wrap-actions">
      <button id="saveProjectIdentity">Validar datos y continuar a cargas</button>
    </div>
  </article>`;
}
function quickLoadCard(){
  return `<article class="dashboard-card quick-load-card">
    <div class="section-title-row">
      <div><h4>PASO 2 · Ingreso de Cargas</h4><p>Ingresa solo los consumos por recinto. GIAE calcula potencia, demanda, corriente, fases y circuitos.</p></div>
      <button class="secondary" data-open-module="cargas">Abrir cargas</button>
    </div>
    <div class="form-grid compact load-form">
      <label>Descripcion <input id="quickLoadName" placeholder="Ej: Enchufes oficina"></label>
      <label>Tipo
        <select id="quickLoadType"><option>Alumbrado</option><option>Enchufes</option><option>Fuerza</option><option>Climatizacion</option><option>Especial</option></select>
      </label>
      <label>Cantidad <input id="quickLoadQty" type="number" min="1" value="1"></label>
      <label>W unidad <input id="quickLoadPower" type="number" min="0" value="100"></label>
    </div>
    <div class="top-actions"><button id="quickAddLoad" class="primary-action">Agregar carga</button></div>
  </article>`;
}

export function render(host, state){
  recalculateProject();
  const projects = listProjects({ includeArchived: false });
  const project = state.currentProject || {};
  const connection = connectionSummary(project);
  const activeStep = activeAssistantStep(project);

  host.innerHTML = `
    <section class="module-window projects-module project-command-center focused-project-flow">
      ${renderActiveAssistantStep(project, activeStep, connection)}
      <details class="dashboard-card project-flow-summary compact-flow-summary">
        <summary>Ver avance completo del proyecto</summary>
        <section class="project-flow-grid">${flowCards(project)}</section>
      </details>

      <details class="dashboard-card project-toolbar-card secondary-library">
        <summary>Biblioteca local y respaldo</summary>
        <div class="section-title-row">
          <div><h4>Biblioteca local</h4><p>Guardar, abrir, importar y exportar queda como respaldo del trabajo, no como punto de partida.</p></div>
          <div class="top-actions wrap-actions">
            <button id="saveManagedProject" class="secondary">Guardar activo</button>
            <button id="exportActiveProject" class="secondary">Exportar .giae</button>
            <label class="import-label">Importar .giae<input id="managedImport" type="file" accept=".giae,application/json" hidden></label>
          </div>
        </div>
        <div class="project-search-row">
          <label>Buscar proyecto<input id="projectSearch" placeholder="Cliente, codigo, comuna, estado, distribuidora..."></label>
        </div>
        <div class="table-wrap">
          <table class="projects-table">
            <thead><tr><th>Proyecto</th><th>Cliente</th><th>Responsable</th><th>Estado</th><th>Sistema</th><th>Potencia</th><th>Ultima modificacion</th><th>Acciones</th></tr></thead>
            <tbody id="projectsRows">${renderRows(projects)}</tbody>
          </table>
        </div>
      </details>
    </section>`;
  function refresh(){ render(host, globalState); }

  function readProjectPatch(){
    return {
      name: host.querySelector("#flowName").value.trim() || "Proyecto sin nombre",
      code: host.querySelector("#flowCode").value.trim(),
      client: host.querySelector("#flowClient").value.trim(),
      company: host.querySelector("#flowCompany").value.trim(),
      installer: host.querySelector("#flowInstaller").value.trim(),
      responsible: host.querySelector("#flowInstaller").value.trim(),
      secRegistration: host.querySelector("#flowSec").value.trim(),
      address: host.querySelector("#flowAddress").value.trim(),
      commune: host.querySelector("#flowCommune").value.trim(),
      region: host.querySelector("#flowRegion").value.trim(),
      supplyType: host.querySelector("#flowSupply").value,
      distributor: host.querySelector("#flowDistributor").value,
      installationType: host.querySelector("#flowInstallationType").value,
      propertyType: host.querySelector("#flowPropertyType").value,
      existingPowerKw: Number(host.querySelector("#flowExistingPower").value || 0),
      serviceType: host.querySelector("#flowService").value,
      observations: host.querySelector("#flowObservations").value.trim(),
      status: host.querySelector("#flowStatus").value
    };
  }

  host.querySelector("#createProjectFromForm")?.addEventListener("click", () => {
    const patch = readProjectPatch();
    if(!projectDataReady(patch)) return alert("Completa nombre, cliente, empresa, direccion, comuna, region y distribuidora antes de continuar.");
    newProject(patch);
    saveCurrentProjectToLibrary("Proyecto creado desde flujo tecnico");
    refresh();
    window.GIAE?.refreshActiveModule?.();
  });

  host.querySelector("#saveProjectIdentity")?.addEventListener("click", () => {
    const patch = readProjectPatch();
    if(!projectDataReady(patch)) return alert("Completa nombre, cliente, empresa, direccion, comuna, region y distribuidora antes de continuar.");
    updateProject(patch, { module: "Proyecto", action: "Datos base actualizados desde flujo tecnico" });
    saveCurrentProjectToLibrary("Datos base guardados desde flujo tecnico");
    refresh();
    window.GIAE?.openModule?.("cargas");
  });

  host.querySelector("#quickAddLoad")?.addEventListener("click", () => {
    const load = {
      name: host.querySelector("#quickLoadName").value.trim(),
      type: host.querySelector("#quickLoadType").value,
      quantity: Number(host.querySelector("#quickLoadQty").value || 1),
      powerW: Number(host.querySelector("#quickLoadPower").value || 0),
      demandFactor: Number(host.querySelector("#quickLoadFD")?.value || 1),
      simultaneityFactor: 1,
      fp: 0.95,
      phase: host.querySelector("#quickLoadPhase")?.value || "Auto"
    };
    if(!load.name || !load.powerW || load.quantity < 1) return alert("Ingresa descripcion, cantidad y potencia valida.");
    addLoad(load);
    saveCurrentProjectToLibrary("Carga agregada desde flujo tecnico");
    refresh();
  });

  host.querySelectorAll("[data-open-module]").forEach(button => {
    button.addEventListener("click", () => window.GIAE?.openModule?.(button.dataset.openModule));
  });

  host.querySelector("#saveManagedProject")?.addEventListener("click", () => {
    saveCurrentProjectToLibrary();
    refresh();
  });

  host.querySelector("#exportActiveProject")?.addEventListener("click", () => {
    saveCurrentProjectToLibrary("Proyecto activo exportado");
    downloadProject(exportProjectById(globalState.currentProject.id));
  });

  host.querySelector("#managedImport")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if(!file) return;
    try{
      const payload = JSON.parse(await file.text());
      importProjectToLibrary(payload, true);
      refresh();
      window.GIAE?.refreshActiveModule?.();
    }catch{
      alert("No se pudo importar el archivo. Verifica que sea un .giae valido.");
    }
  });

  host.querySelector("#projectSearch")?.addEventListener("input", event => {
    const q = event.target.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const filtered = listProjects().filter(project => JSON.stringify(project).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q));
    host.querySelector("#projectsRows").innerHTML = renderRows(filtered);
  });

  host.querySelector("#projectsRows")?.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if(!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    if(action === "open"){
      openProject(id);
      refresh();
      window.GIAE?.openModule?.("proyectos");
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
      if(confirm("Archivar este proyecto?")){ archiveProject(id); refresh(); }
    }
    if(action === "delete"){
      if(confirm("Eliminar borra este proyecto de la biblioteca local. Continuar?")){ deleteProject(id); refresh(); }
    }
  });
}

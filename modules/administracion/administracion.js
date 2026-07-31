import { persist, importProjectFile, hasCompanyPermission, recalculateProject, state, ensureCompanyAccess, upsertCompanyUser, deleteCompanyUser, listCompanyUsersFromServer, getApiToken, setApiToken } from "../../core/store.js";

// UI state for cuentas corporativas
let cuentasState = { page: 1, pageSize: 10, sortBy: 'name', sortDir: 'asc', csvColumns: ["id","name","email","accountType","freeAccess","role","createdAt"] };

const moduleLabels = {
  dashboard: "Dashboard",
  proyectos: "Administrador de proyectos",
  proyecto: "Proyecto activo",
  "flujo-guiado": "Flujo guiado",
  gpe: "Motor de proyecto",
  usuarios: "Usuarios empresa",
  nube: "Nube y licencias",
  cargas: "Cargas",
  "cuadro-carga": "Cuadro de carga",
  balance: "Balance de fases",
  tableros: "Tableros",
  empalme: "Empalme",
  tierra: "Puesta a tierra",
  unilineal: "Unilineal",
  "cad-electrico": "CAD electrico",
  auditoria: "Auditoria",
  documentacion: "Centro de Documentacion SEC",
  "lector-documental": "Lector documental",
  presupuesto: "Presupuesto",
  educacion: "Aula Tecnica",
  administracion: "Panel administrador",
  biblioteca: "Base de conocimiento",
  componentes: "BUCE Componentes electricos",
  normativo: "Motor normativo",
  "norma-chile": "NORMA-CHILE"
};

function ensureAdminData(state){
  state.admin = state.admin || {};
  const companyName = (state.currentProject && state.currentProject.company) ? state.currentProject.company : "GIAE Chile";
  state.admin.company = state.admin.company || {
    name: companyName,
    rut: "76.000.000-0",
    address: "Av. Providencia 1234, Santiago, Chile",
    phone: "+56 9 1234 5678",
    email: "contacto@giaechile.cl",
    logoName: "Logo interno GIAE",
    logoData: "",
    brand: {
      name: companyName,
      primaryColor: "#102033",
      accentColor: "#1456a0",
      backgroundColor: "#eef3f8",
      templateStyle: "tecnico"
    }
  };
  state.admin.sessions = state.admin.sessions || [];
  state.admin.templates = state.admin.templates || [
    { name: "Cotización estándar", type: "Presupuesto", status: "Activa", content: "Cotización técnica\nCliente: {{cliente}}\nProyecto: {{proyecto}}\nCarga total: {{carga}} kW\nPresupuesto: ${{presupuesto}}\n\nOBSERVACIONES:\nSe adjuntan planos técnicos, memoria de cálculo y listado de materiales." },
    { name: "Orden de trabajo", type: "Trabajo", status: "Activa", content: "ORDEN DE TRABAJO\n\nResponsable: {{instalador}}\nProyecto: {{proyecto}}\nActividad: {{actividad}}\nFecha de inicio: {{fecha}}\n\nDetalles:\n- Revisión técnica normativa\n- Instalación de circuitos\n- Pruebas de funcionamiento" },
    { name: "Informe técnico IA", type: "Informe", status: "Activa", content: "INFORME TÉCNICO ANÁLISIS IA\n\nProyecto: {{proyecto}}\nCliente: {{cliente}}\nFecha: {{fecha}}\n\nRESUMEN EJECUTIVO:\nAnálisis de proyecto eléctrico con motor IA local especializado en RIC y normativa chilena (DS8, IEC).\n\nOBSERVACIONES:\n{{observaciones}}\n\nRECOMENDACIONES:\n- Validar con normativa vigente\n- Realizar pruebas de campo\n- Documentar cambios realizados" },
    { name: "Informe de auditoría", type: "Informe", status: "Activa", content: "INFORME DE AUDITORÍA TÉCNICA\n\nProyecto: {{proyecto}}\nAuditor: {{auditor}}\nFecha: {{fecha}}\n\nCRITERIOS DE REVISIÓN:\n✓ Cumplimiento normativo (RIC, IEC, DS8)\n✓ Cálculo de cargas y protecciones\n✓ Dimensionamiento de conductores\n✓ Puesta a tierra y seguridad\n\nHALLAZGOS:\n{{hallazgos}}\n\nACCIONES CORRECTIVAS:\n{{acciones}}" }
  ];
  const defaultEnabledModules = Object.fromEntries(Object.keys(moduleLabels).map(key => [key, true]));
  state.admin.enabledModules = { ...defaultEnabledModules, ...(state.admin.enabledModules || {}) };
  state.admin.enabledModules.administracion = true;
  state.admin.auditLog = state.admin.auditLog || [];

  // Ensure current project has default data structure
  if(state.currentProject){
    state.currentProject.name = state.currentProject.name || "Proyecto sin nombre";
    state.currentProject.client = state.currentProject.client || "Cliente: GIAE Chile";
    state.currentProject.supplyType = state.currentProject.supplyType || "Monofásico";
    state.currentProject.distributor = state.currentProject.distributor || "Distribuidora base";
    state.currentProject.budget = state.currentProject.budget || [];
    state.currentProject.loads = state.currentProject.loads || [];
    state.currentProject.version = state.currentProject.version || "1.0-alpha";
  }

  // Ensure IA memory structure with sample interactions
  if(state.currentProject && !Array.isArray(state.currentProject.iaMemory)){
    state.currentProject.iaMemory = [
      { timestamp: Date.now() - 3600000, request: "Diagnóstico general del proyecto", summary: "Sistema monofásico en correcto estado normativo. Recomendación: revisar caída de tensión en ramales." },
      { timestamp: Date.now() - 1800000, request: "Protecciones recomendadas", summary: "Se sugiere agregar protección diferencial en ramales de mayor demanda. Ampere recomendado: 16A curva C." }
    ];
  }
}

export function render(host, state){
  ensureAdminData(state);
  if(state.profile === "empresa" && !hasCompanyPermission("users.manage")){
    host.innerHTML = `<article class="module-window"><div class="result-box danger"><b>Acceso restringido.</b><br>Este usuario no tiene permiso para administrar la empresa.</div></article>`;
    return;
  }

  const isCompanyAdmin = state.profile === "empresa";
  host.innerHTML = `
    <article class="module-window admin-panel ${isCompanyAdmin ? "company-admin" : "real-admin"}">
      <div class="module-head">
        <div>
          <p class="eyebrow">Centro de control exclusivo</p>
          <h3>Panel Administrador GIAE</h3>
          <p>Desde aquí puedes crear, editar, activar, desactivar y borrar usuarios, módulos, plantillas y datos de empresa.</p>
        </div>
        <div class="row-actions">
          <button id="adminSaveBtn">Guardar datos de empresa</button>
          <button id="adminBackupBtn" class="secondary">Descargar respaldo</button>
        </div>
      </div>

      <section class="admin-kpis">
        <div><strong>${ensureCompanyAccess().users.filter(u => u.accountType !== "super_admin").length}</strong><span>Cuentas reales creadas</span></div>
        <div><strong>${recentSessionCount(state)}</strong><span>Sesiones activas (esta pestaña)</span></div>
        <div><strong>${Object.values(state.admin.enabledModules).filter(Boolean).length}</strong><span>Módulos activos</span></div>
        <div><strong>${state.admin.templates.length}</strong><span>Plantillas</span></div>
        <div><strong>${systemScore(state)}%</strong><span>Salud del sistema</span></div>
        <div><strong>${countLocalProjects(state)}</strong><span>Proyectos locales</span></div>
      </section>

      <section class="admin-tabs" aria-label="Secciones de administración">
        ${isCompanyAdmin ? `<button class="active" data-admin-tab="empresa">Empresa y logo</button>` : `<button class="active" data-admin-tab="usuarios">Pueblos Originarios</button><button data-admin-tab="sesiones">Conectados</button><button data-admin-tab="empresa">Empresa y logo</button><button data-admin-tab="modulos">Módulos</button><button data-admin-tab="plantillas">Plantillas</button><button data-admin-tab="sistema">Sistema</button><button data-admin-tab="estado">Estado del software</button><button data-admin-tab="inspector">Inspector</button><button data-admin-tab="originalidad">Originalidad</button><button data-admin-tab="roadmap">Roadmap</button><button data-admin-tab="cuentas">Cuentas corporativas</button>`}
      </section>

      ${!isCompanyAdmin ? `
      <section id="admTabUsuarios" class="admin-tab-page active">
        <div class="admin-card">
          <h4>Usuarios Pueblos Originarios</h4>
          <p class="small">Lista de cuentas registradas como <strong>Pueblos Originarios</strong> (cuentas reales en D1). Desde aquí puedes conceder o revocar <em>acceso gratuito</em> para usar los módulos disponibles. Para crear empresas, instaladores independientes u otras cuentas Pueblos Originarios, usa la pestaña "Cuentas corporativas".</p>
          <div id="admPueblosTable"></div>
        </div>
      </section>
      <section id="admTabCuentas" class="admin-tab-page">
        <div class="admin-card">
          <h4>Conexión con la nube</h4>
          <p class="small">Las cuentas ya se guardan en la base de datos real (D1), no en este navegador. Para crear, editar o ver cuentas necesitas pegar aquí el token de administrador del Worker (el mismo <code>GIAE_API_TOKEN</code> configurado en Cloudflare). Se guarda solo mientras esta pestaña esté abierta, nunca de forma permanente.</p>
          <div class="admin-inline">
            <input id="admApiToken" type="password" placeholder="Token de administrador (GIAE_API_TOKEN)" value="${escapeHtml(getApiToken())}">
            <button id="admSaveApiToken" class="primary">Guardar token</button>
            <span id="admApiTokenStatus" class="small">${getApiToken() ? "Token cargado en esta pestaña." : "Sin token: las cuentas no se podrán crear ni listar."}</span>
          </div>
        </div>
        <div class="admin-card">
          <h4>Cuentas corporativas</h4>
          <p class="small">Gestiona las cuentas registradas en el sistema (empresas, instaladores independientes y Pueblos Originarios). Aquí puedes crear, editar, otorgar/revocar acceso gratuito y eliminar cuentas.</p>
          <div class="admin-inline">
            <input id="cuentasSearch" placeholder="Buscar por nombre o correo">
            <select id="cuentasFilterType"><option value="">Todos los tipos</option><option value="empresa">Empresa</option><option value="independiente">Instalador independiente</option><option value="pueblos">Pueblos Originarios</option></select>
            <select id="cuentasFilterAccess"><option value="">Todos</option><option value="free">Acceso gratuito</option><option value="pending">Pendientes</option></select>
            <select id="cuentasSort"><option value="name:asc">Orden: Nombre ↑</option><option value="name:desc">Nombre ↓</option><option value="email:asc">Correo ↑</option><option value="email:desc">Correo ↓</option><option value="type:asc">Tipo ↑</option><option value="createdAt:desc">Creado ↓</option></select>
            <select id="cuentasPageSize"><option value="5">5</option><option value="10" selected>10</option><option value="25">25</option><option value="50">50</option></select>
            <button id="cuentasExportCsv" class="secondary">Exportar CSV</button>
            <button id="cuentasCsvColumnsBtn" class="secondary">Columnas CSV</button>
            <div id="cuentasCsvColumnsPanel" class="csv-columns-panel" style="display:none">
              <form id="cuentasCsvColumnsForm">
                ${["id","name","email","accountType","freeAccess","role","createdAt"].map(c => `<label><input type="checkbox" name="col" value="${c}" ${cuentasState.csvColumns.includes(c)?'checked':''}> ${c}</label>`).join('')}
                <div style="margin-top:6px"><button id="cuentasCsvColumnsSave" class="primary">Guardar</button> <button id="cuentasCsvColumnsClose" type="button" class="ghost">Cerrar</button></div>
              </form>
            </div>
          </div>
          <div id="admCuentasTable"></div>
          <div class="admin-inline">
            <input id="cuentaName" placeholder="Nombre cuenta">
            <input id="cuentaEmail" placeholder="correo@cuenta.cl">
            <input id="cuentaPassword" placeholder="Contraseña (obligatoria para cuentas nuevas)" type="password">
            <select id="cuentaType"><option value="empresa">Empresa</option><option value="independiente">Instalador independiente</option><option value="pueblos">Pueblos Originarios</option></select>
            <label class="checkbox-label"><input id="cuentaFreeAccess" type="checkbox"> Acceso gratuito (solo para Pueblos)</label>
            <button id="admAddCuenta" class="primary">Crear cuenta</button>
          </div>
        </div>
      </section>
      ` : ``}

      <section id="admTabSesiones" class="admin-tab-page">
        <div class="admin-card">
          <h4>Usuarios conectados</h4>
          <p class="small">En esta versión local se registran sesiones del navegador. Cuando exista servidor, aquí se verán conexiones reales de todos los usuarios.</p>
          <div id="admSessionsTable"></div>
        </div>
      </section>

      <section id="admTabEmpresa" class="admin-tab-page active">
        <div class="admin-card company-admin-card">
          <h4>Empresa / marca blanca</h4>
          <div class="form-grid">
            <label>Nombre empresa o instalador<input id="admCompany" value="${escapeHtml(state.admin.company.name)}"></label>
            <label>RUT<input id="admRut" value="${escapeHtml(state.admin.company.rut)}" placeholder="76.000.000-0"></label>
            <label>Dirección<input id="admAddress" value="${escapeHtml(state.admin.company.address)}"></label>
            <label>Correo<input id="admEmail" value="${escapeHtml(state.admin.company.email)}" placeholder="contacto@empresa.cl"></label>
            <label>Teléfono<input id="admPhone" value="${escapeHtml(state.admin.company.phone)}"></label>
            <label>Logo / imagen corporativa<input id="admLogo" type="file" accept="image/*"></label>
            <label>Archivo de presupuesto<input id="admBudgetUpload" type="file" accept=".giae,.json"></label>
          </div>
          <div class="logo-admin-preview">
            <div id="admLogoPreview">${state.admin.company.logoData ? `<img src="${state.admin.company.logoData}" alt="Logo empresa">` : defaultLogo()}</div>
            <p>Logo actual: <b id="admLogoName">${escapeHtml(state.admin.company.logoName)}</b></p>
          </div>
          <h4>Colores corporativos de la empresa</h4>
          <p class="small">Cada empresa puede usar una identidad propia. Se recomienda mantener pocos colores para conservar una imagen técnica y profesional.</p>
          <div class="color-grid">
            <label>Color principal<input id="admPrimaryColor" type="color" value="${escapeHtml(state.admin.company.brand?.primaryColor || '#102033')}"></label>
            <label>Color de acento<input id="admAccentColor" type="color" value="${escapeHtml(state.admin.company.brand?.accentColor || '#1456a0')}"></label>
            <label>Fondo<input id="admBackgroundColor" type="color" value="${escapeHtml(state.admin.company.brand?.backgroundColor || '#eef3f8')}"></label>
          </div>
          <label>Estilo de plantilla
            <select id="admTemplateStyle">
              ${["tecnico","sobrio","empresa","minimal"].map(style => `<option value="${style}" ${style === (state.admin.company.brand?.templateStyle || "tecnico") ? "selected" : ""}>${style}</option>`).join("")}
            </select>
          </label>
          <p class="small">Este estilo cambia el diseño de la cotización/presupuesto (módulo Presupuestos). Los colores de arriba se aplican en toda la plataforma (sidebar, botones, etc.).</p>
          ${isCompanyAdmin ? `<p class="small"><strong>Nota:</strong> como administrador de empresa puedes definir marca, logo y cargar presupuestos. Para administrar empleados usa el módulo Usuarios de Empresa.</p>` : `<div class="top-actions"><button id="admOpenCompanyUsers" class="secondary">Abrir Usuarios de empresa</button></div><p class="small"><strong>Nota:</strong> como administrador puedes abrir directamente el módulo Usuarios de empresa para crear empleados con correo y contraseña. Estos usuarios podrán iniciar sesión en el perfil Empresa.</p>`}
        </div>
      </section>

      <section id="admTabModulos" class="admin-tab-page">
        <div class="admin-card">
          <h4>Módulos de la plataforma</h4>
          <p class="small">Activa o desactiva herramientas del menú. El módulo Administración queda protegido para el administrador.</p>
          <div id="admModules" class="module-switches"></div>
        </div>
      </section>

      <section id="admTabPlantillas" class="admin-tab-page">
        <div class="admin-card">
          <h4>Plantillas de documentos y cotizaciones</h4>
          <div class="admin-inline">
            <input id="admTemplateName" placeholder="Nombre de plantilla">
            <select id="admTemplateType"><option>Presupuesto</option><option>Trabajo</option><option>Informe</option><option>TE1</option><option>Memoria técnica</option></select>
            <button id="admAddTemplate">Agregar</button>
          </div>
          <textarea id="admTemplateContent" class="template-editor" placeholder="Contenido de la plantilla. Puedes usar variables como {{cliente}}, {{proyecto}}, {{empresa}}, {{total}}."></textarea>
          <div id="admTemplatesTable"></div>
        </div>
      </section>



      <section id="admTabEstado" class="admin-tab-page">
        <div class="admin-card">
          <h4>Estado real del software</h4>
          <p class="small">Panel interno para revisar la salud de GIAE en esta instalación. En la versión nube podrá conectarse a Cloudflare D1, R2 y Workers.</p>
          <div id="admSoftwareStatus"></div>
          <div class="row-actions" style="margin-top:1rem">
            <button id="admRunDiagnostics">Ejecutar diagnóstico</button>
            <button id="admDownloadDiagnostics" class="secondary">Descargar reporte</button>
          </div>
        </div>
      </section>

      <section id="admTabInspector" class="admin-tab-page">
        <div class="admin-card">
          <h4>Inspector del sistema</h4>
          <p class="small">Herramienta del administrador para inspeccionar proyecto activo, almacenamiento local, módulos, sesión y configuración sin alterar los cálculos.</p>
          <div class="admin-inline">
            <select id="admInspectorTarget">
              <option value="project">Proyecto activo</option>
              <option value="storage">Almacenamiento local</option>
              <option value="modules">Módulos</option>
              <option value="session">Sesión</option>
              <option value="all">Todo el estado</option>
            </select>
            <button id="admInspectBtn">Inspeccionar</button>
            <button id="admCopyInspect" class="secondary">Copiar</button>
          </div>
          <pre id="admInspectorOutput" class="inspector-output">Selecciona una sección y presiona Inspeccionar.</pre>
        </div>
      </section>


      <section id="admTabOriginalidad" class="admin-tab-page">
        <div class="admin-card">
          <h4>Inspector de Originalidad</h4>
          <p class="small">Herramienta interna del Administrador / Modo Desarrollador. Revisa duplicación interna, marcas de generación automática, scripts externos y señales de riesgo dentro de los archivos cargados por GIAE. No compara contra toda internet.</p>
          <div class="policy-box"><b>Alcance:</b> análisis local del proyecto publicado. Si el resultado indica “Revisar”, no significa plagio confirmado; significa que el administrador debe revisar el fragmento o dependencia.</div>
          <div class="admin-inline">
            <button id="admOriginalityScan">Ejecutar análisis</button>
            <button id="admOriginalityDownload" class="secondary">Descargar reporte</button>
            <button id="admOriginalityCopy" class="ghost">Copiar resumen</button>
          </div>
          <div id="admOriginalityResult" class="originality-panel">
            <div class="result-box info"><b>Inspector listo.</b><br>Presiona “Ejecutar análisis” para revisar la instalación actual.</div>
          </div>
        </div>
      </section>

      <section id="admTabRoadmap" class="admin-tab-page">
        <div class="admin-card">
          <h4>Roadmap oficial GIAE</h4>
          <p class="small">Ruta incorporada al repositorio para ordenar la version publicable, GIAE 2.0, CAD electrico, lectura documental y razonamiento verificable.</p>
          <div class="admin-kpis compact-kpis">
            <div><strong>1</strong><span>Depuracion</span></div>
            <div><strong>2</strong><span>v1.0 local</span></div>
            <div><strong>3</strong><span>Documentos</span></div>
            <div><strong>4</strong><span>Nube</span></div>
            <div><strong>5</strong><span>CAD 2.0</span></div>
            <div><strong>6</strong><span>Razonador</span></div>
          </div>
          <div class="policy-box"><b>Documentos:</b> docs/ROADMAP_6_FASES_GIAE_CHILE.md y docs/GIAE_2_0_CAD_DOCUMENTOS_RAZONAMIENTO.md.<br><b>Datos:</b> docs/data/producto/product-manifest.json y docs/data/producto/roadmap-6-fases.json.</div>
          <div class="policy-box"><b>Fase 1 activa:</b> docs/FASE_1_PUBLICABLE_GIAE.md y tools/phase1-publicable-check.mjs.</div>
          <div class="policy-box"><b>Fase 2 activa:</b> manifest.webmanifest, sw.js, core/pwa.js y tools/phase2-installable-check.mjs.</div>
          <div class="policy-box"><b>Fase 3 activa:</b> Lector documental, core/document-intelligence y tools/phase3-document-intelligence-check.mjs.</div>
          <div class="policy-box"><b>Fase 4 activa:</b> Nube y licencias, core/cloud, data/cloud y tools/phase4-cloud-readiness-check.mjs.</div>
          <div class="policy-box"><b>Fase 5 activa:</b> CAD electrico, core/cad, data/cad y tools/phase5-cad-check.mjs.</div>
          <div class="policy-box"><b>Fase 5.6 activa:</b> Flujo guiado, core/workflow, data/workflow y tools/phase56-guided-flow-check.mjs.</div>
          <div class="policy-box"><b>Regla:</b> ninguna mejora debe copiar codigo externo ni prometer cumplimiento normativo sin reglas, medicion y evidencia.</div>
        </div>
      </section>

      <section id="admTabSistema" class="admin-tab-page">
        <div class="admin-card">
          <h4>Política normativa estricta</h4>
          <div class="policy-box"><b>Fuentes permitidas:</b> RIC, IEC y Decreto Supremo N8 de Chile.<br><b>Regla:</b> si no hay respaldo local suficiente, GIAE debe responder “requiere revisión normativa” y nunca inventar datos.</div>
          <h4>Resumen del sistema</h4>
          <div class="project-summary">
            <span><b>Proyecto activo:</b> ${escapeHtml(state.currentProject.name || "Sin nombre")}</span>
            <span><b>Cliente:</b> ${escapeHtml(state.currentProject.client || "Sin cliente")}</span>
            <span><b>Sistema:</b> ${escapeHtml(state.currentProject.supplyType || "No definido")}</span>
            <span><b>Distribuidora:</b> ${escapeHtml(state.currentProject.distributor || "No definida")}</span>
          </div>
          <h4>Registro de acciones</h4>
          <div id="admAuditLog"></div>
        </div>
      </section>
    </article>
  `;

  paintPueblos(state); paintSessions(state); paintTemplates(state); paintModules(state); paintAudit(state); wireEvents(state);
}

function wireEvents(state){
  const isCompanyAdmin = state.profile === "empresa";
  document.querySelectorAll("[data-admin-tab]").forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.adminTab)));
  document.querySelector("#adminSaveBtn").addEventListener("click", () => saveAdminForm(state, true));
  document.querySelector("#adminBackupBtn").addEventListener("click", () => downloadBackup(state));
  document.querySelector("#admLogo").addEventListener("change", event => loadLogo(event, state));
  document.querySelector("#admBudgetUpload")?.addEventListener("change", event => loadBudgetFile(event, state));
  if(isCompanyAdmin) {
    document.querySelector("#admOpenCompanyUsers")?.addEventListener("click", () => openCompanyUsers());
  }
  // Corporate accounts tab handlers (super-admin / administrador)
  document.querySelector("#admSaveApiToken")?.addEventListener("click", () => {
    setApiToken(document.querySelector("#admApiToken").value);
    document.querySelector("#admApiTokenStatus").textContent = getApiToken() ? "Token cargado en esta pestaña." : "Sin token: las cuentas no se podrán crear ni listar.";
    refreshCuentasFromServer(state);
  });
  document.querySelector("#admAddCuenta")?.addEventListener("click", () => addCuenta(state));
  document.querySelector("#cuentasSearch")?.addEventListener("input", () => { cuentasState.page = 1; paintCuentas(state); });
  document.querySelector("#cuentasFilterType")?.addEventListener("change", () => { cuentasState.page = 1; paintCuentas(state); });
  document.querySelector("#cuentasFilterAccess")?.addEventListener("change", () => { cuentasState.page = 1; paintCuentas(state); });
  document.querySelector("#cuentasSort")?.addEventListener("change", (e) => { const [k,d]= (e.target.value||'name:asc').split(':'); cuentasState.sortBy=k; cuentasState.sortDir=d; paintCuentas(state); });
  document.querySelector("#cuentasPageSize")?.addEventListener("change", (e) => { cuentasState.pageSize = Number(e.target.value||10); cuentasState.page = 1; paintCuentas(state); });
  document.querySelector("#cuentasExportCsv")?.addEventListener("click", () => exportCuentasCsv(state));
  document.querySelector("#cuentasCsvColumnsBtn")?.addEventListener("click", (e) => { const p = document.querySelector('#cuentasCsvColumnsPanel'); if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none'; });
  document.querySelector("#cuentasCsvColumnsClose")?.addEventListener("click", () => { const p = document.querySelector('#cuentasCsvColumnsPanel'); if(p) p.style.display = 'none'; });
  document.querySelector("#cuentasCsvColumnsSave")?.addEventListener("click", (ev) => { ev.preventDefault(); const form = document.querySelector('#cuentasCsvColumnsForm'); if(!form) return; const cols = Array.from(form.querySelectorAll('input[name="col"]:checked')).map(i => i.value); cuentasState.csvColumns = cols.length ? cols : cuentasState.csvColumns; document.querySelector('#cuentasCsvColumnsPanel').style.display = 'none'; });
  paintCuentas(state);
  refreshCuentasFromServer(state);
  document.querySelector("#admAddTemplate")?.addEventListener("click", () => addTemplate(state));
  document.querySelector("#admRunDiagnostics")?.addEventListener("click", () => paintSoftwareStatus(state, true));
  document.querySelector("#admDownloadDiagnostics")?.addEventListener("click", () => downloadDiagnostics(state));
  document.querySelector("#admInspectBtn")?.addEventListener("click", () => runInspector(state));
  document.querySelector("#admCopyInspect")?.addEventListener("click", () => copyInspectorOutput());
  document.querySelector("#admOriginalityScan")?.addEventListener("click", () => runOriginalityInspector(state));
  document.querySelector("#admOriginalityDownload")?.addEventListener("click", () => downloadOriginalityReport(state));
  document.querySelector("#admOriginalityCopy")?.addEventListener("click", () => copyOriginalitySummary());
  paintSoftwareStatus(state, false);
  runInspector(state, "project");
}

function showTab(tab){
  document.querySelectorAll("[data-admin-tab]").forEach(b => b.classList.toggle("active", b.dataset.adminTab === tab));
  document.querySelectorAll(".admin-tab-page").forEach(page => page.classList.remove("active"));
  document.querySelector(`#admTab${capitalize(tab)}`)?.classList.add("active");
}

function saveAdminForm(state, notify=false){
  const companyInput = document.querySelector("#admCompany");
  if(companyInput){
    state.admin.company = {
      ...state.admin.company,
      name: companyInput.value.trim(), rut: document.querySelector("#admRut").value.trim(), address: document.querySelector("#admAddress").value.trim(), email: document.querySelector("#admEmail").value.trim(), phone: document.querySelector("#admPhone").value.trim(),
      logoName: state.admin.company.logoName, logoData: state.admin.company.logoData,
      brand: {
        name: companyInput.value.trim() || "GIAE Chile",
        primaryColor: document.querySelector("#admPrimaryColor")?.value || "#102033",
        accentColor: document.querySelector("#admAccentColor")?.value || "#1456a0",
        backgroundColor: document.querySelector("#admBackgroundColor")?.value || "#eef3f8",
        templateStyle: document.querySelector("#admTemplateStyle")?.value || "tecnico"
      }
    };
    state.companyBrand = { ...state.admin.company.brand, logoData: state.admin.company.logoData };
    state.currentProject.company = state.admin.company.name;
  }
  addLog(state, "Configuración administrativa guardada.");
  persist();
  window.dispatchEvent(new CustomEvent("giae:admin-updated"));
  if(notify) alert("Configuración administrativa guardada.");
}

function paintPueblos(state){
  const access = ensureCompanyAccess();
  const pueblos = (access.users || []).filter(u => u.accountType === "pueblos");
  const rows = pueblos.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email || "")}</td>
      <td><span class="status ${u.status === "Activo" ? "on" : "off"}">${escapeHtml(u.status)}</span></td>
      <td>${u.freeAccess ? `<span class="tag tag-success">Acceso gratuito</span>` : `<span class="tag tag-muted">Pendiente</span>`}</td>
      <td><button class="ghost" data-toggle-pueblos="${u.id}">${u.freeAccess ? "Revocar" : "Conceder"}</button></td>
    </tr>
  `).join("");

  const host = document.querySelector("#admPueblosTable");
  if(!host) return;
  host.innerHTML = `<div class="table-scroll"><table><thead><tr><th>N°</th><th>Nombre</th><th>Correo</th><th>Estado</th><th>Acceso</th><th>Acciones</th></tr></thead><tbody>${rows || `<tr><td colspan="6">No hay usuarios de Pueblos Originarios.</td></tr>`}</tbody></table></div>`;

  document.querySelectorAll("[data-toggle-pueblos]").forEach(btn => btn.addEventListener("click", () => togglePueblosAccess(btn.dataset.togglePueblos, state)));
}

function togglePueblosAccess(userId, state){
  const access = ensureCompanyAccess();
  const user = (access.users || []).find(u => u.id === userId);
  if(!user) return alert("Usuario no encontrado.");
  const willGrant = !user.freeAccess;
  if(!confirm(`${willGrant ? 'Conceder' : 'Revocar'} acceso gratuito a ${user.name || user.email || user.id}?`)) return;
  user.freeAccess = willGrant;
  addLog(state, `${willGrant ? 'Acceso gratuito concedido' : 'Acceso gratuito revocado'} a ${user.name || user.email || user.id}.`);
  persist();
  paintPueblos(state);
  paintAudit(state);
}

function paintSessions(state){
  const rows = state.admin.sessions.map((s,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.profile)}</td><td><span class="status ${s.status === "Conectado" ? "on" : "off"}">${escapeHtml(s.status)}</span></td><td>${escapeHtml(s.lastSeen)}</td><td><button class="ghost danger-text" data-kick-session="${i}">Cerrar registro</button></td></tr>`).join("");
  document.querySelector("#admSessionsTable").innerHTML = `<div class="table-scroll"><table><thead><tr><th>N°</th><th>Usuario</th><th>Perfil</th><th>Estado</th><th>Última actividad</th><th>Acción</th></tr></thead><tbody>${rows || `<tr><td colspan="6">Sin registros de sesión.</td></tr>`}</tbody></table></div>`;
  document.querySelectorAll("[data-kick-session]").forEach(btn => btn.addEventListener("click", ()=>{state.admin.sessions[Number(btn.dataset.kickSession)].status="Desconectado"; addLog(state,"Registro de sesión cerrado por administrador."); persist(); paintSessions(state); paintAudit(state);}));
}

function paintModules(state){
  document.querySelector("#admModules").innerHTML = Object.entries(moduleLabels).map(([key,label])=>`
    <label class="switch-row"><span><b>${label}</b><small>${key === "administracion" ? "Solo administrador" : "Módulo operativo"}</small></span><input type="checkbox" data-module-switch="${key}" ${state.admin.enabledModules[key] !== false ? "checked" : ""} ${key === "administracion" ? "disabled" : ""}></label>`).join("");
  document.querySelectorAll("[data-module-switch]").forEach(input => input.addEventListener("change", ()=>{state.admin.enabledModules[input.dataset.moduleSwitch] = input.checked; addLog(state, `Módulo ${moduleLabels[input.dataset.moduleSwitch]} ${input.checked ? "activado" : "desactivado"}.`); persist(); window.dispatchEvent(new CustomEvent("giae:admin-updated")); paintAudit(state);}));
}

function addTemplate(state){ const name=document.querySelector("#admTemplateName").value.trim(); const type=document.querySelector("#admTemplateType").value; const content=document.querySelector("#admTemplateContent").value.trim(); if(!name)return alert("Ingresa el nombre de la plantilla."); state.admin.templates.push({name,type,status:"Activa",content}); document.querySelector("#admTemplateName").value=""; document.querySelector("#admTemplateContent").value=""; addLog(state,`Plantilla creada: ${name}.`); persist(); paintTemplates(state); paintAudit(state); }
function paintTemplates(state){
  const rows=state.admin.templates.map((tpl,i)=>`<tr><td>${i+1}</td><td><input data-tpl-name="${i}" value="${escapeHtml(tpl.name)}"></td><td><select data-tpl-type="${i}">${["Presupuesto","Trabajo","Informe","TE1","Memoria técnica"].map(t=>`<option ${t===tpl.type?"selected":""}>${t}</option>`).join("")}</select></td><td><select data-tpl-status="${i}"><option ${tpl.status==="Activa"?"selected":""}>Activa</option><option ${tpl.status==="Borrador"?"selected":""}>Borrador</option><option ${tpl.status==="Inactiva"?"selected":""}>Inactiva</option></select></td><td><textarea data-tpl-content="${i}" class="template-editor">${escapeHtml(tpl.content || "")}</textarea></td><td><button class="ghost" data-save-tpl="${i}">Guardar</button><button class="ghost danger-text" data-remove-template="${i}">Borrar</button></td></tr>`).join("");
  document.querySelector("#admTemplatesTable").innerHTML=`<div class="table-scroll"><table><thead><tr><th>N°</th><th>Plantilla</th><th>Tipo</th><th>Estado</th><th>Contenido</th><th>Acciones</th></tr></thead><tbody>${rows||`<tr><td colspan="5">Sin plantillas.</td></tr>`}</tbody></table></div>`;
  document.querySelectorAll("[data-save-tpl]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.saveTpl); state.admin.templates[i].name=document.querySelector(`[data-tpl-name="${i}"]`).value.trim(); state.admin.templates[i].type=document.querySelector(`[data-tpl-type="${i}"]`).value; state.admin.templates[i].status=document.querySelector(`[data-tpl-status="${i}"]`).value; state.admin.templates[i].content=document.querySelector(`[data-tpl-content="${i}"]`).value; addLog(state,`Plantilla actualizada: ${state.admin.templates[i].name}.`); persist(); paintTemplates(state); paintAudit(state);}));
  document.querySelectorAll("[data-remove-template]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.removeTemplate); const name=state.admin.templates[i].name; if(!confirm(`¿Borrar plantilla ${name}?`))return; state.admin.templates.splice(i,1); addLog(state,`Plantilla borrada: ${name}.`); persist(); paintTemplates(state); paintAudit(state);}));
}

function loadLogo(event,state){ const file=event.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{state.admin.company.logoName=file.name; state.admin.company.logoData=reader.result; document.querySelector("#admLogoName").textContent=file.name; document.querySelector("#admLogoPreview").innerHTML=`<img src="${reader.result}" alt="Logo empresa">`; state.companyBrand = { ...(state.companyBrand || {}), ...(state.admin.company.brand || {}), logoData: reader.result, name: state.admin.company.name }; addLog(state,`Logo cargado: ${file.name}.`); persist(); window.dispatchEvent(new CustomEvent("giae:admin-updated"));}; reader.readAsDataURL(file); }
function loadBudgetFile(event, state){ const file=event.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try { const payload = JSON.parse(reader.result); const budget = Array.isArray(payload.budget) ? payload.budget : Array.isArray(payload.project?.budget) ? payload.project.budget : null; if(Array.isArray(budget)){ state.currentProject.budget = budget; recalculateProject(); addLog(state, `Presupuesto importado: ${file.name}.`); persist(); alert('Presupuesto importado correctamente.'); window.dispatchEvent(new CustomEvent("giae:admin-updated")); return; } if(payload.project || payload.fileType === 'GIAE_PROJECT'){ importProjectFile(payload); addLog(state, `Proyecto importado desde archivo: ${file.name}.`); alert('Archivo cargado y proyecto actualizado.'); return; } alert('Archivo no contiene datos de presupuesto o proyecto válidos.'); } catch (err){ console.error(err); alert('Error leyendo el archivo. Verifica que sea JSON válido.'); }}; reader.readAsText(file); }
function downloadBackup(state){ saveAdminForm(state,false); const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download="giae-respaldo-administracion.json"; link.click(); URL.revokeObjectURL(url); }
function addLog(state,text){ ensureAdminData(state); state.admin.auditLog.unshift({date:new Date().toLocaleString("es-CL"),text}); state.admin.auditLog=state.admin.auditLog.slice(0,50); }
function paintAudit(state){ const rows=(state.admin.auditLog||[]).map((l,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(l.date)}</td><td>${escapeHtml(l.text)}</td></tr>`).join(""); const el=document.querySelector("#admAuditLog"); if(el) el.innerHTML=`<div class="table-scroll"><table><thead><tr><th>N°</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>${rows||`<tr><td colspan="3">Sin acciones registradas.</td></tr>`}</tbody></table></div>`; }

function openCompanyUsers(){
  if(window.GIAE?.openModule) {
    window.GIAE.openModule("usuarios");
  } else {
    alert("No se pudo abrir el módulo Usuarios de empresa.");
  }
}

function getFilteredCuentas(state){
  const access = ensureCompanyAccess();
  const users = access.users || [];
  const q = (document.querySelector('#cuentasSearch')?.value || '').toLowerCase().trim();
  const typeFilter = document.querySelector('#cuentasFilterType')?.value || '';
  const accessFilter = document.querySelector('#cuentasFilterAccess')?.value || '';
  const filtered = users.filter(u => {
    if(q){ const hay = `${(u.name||'').toLowerCase()} ${(u.email||'').toLowerCase()}`; if(!hay.includes(q)) return false; }
    if(typeFilter && (u.accountType || 'empresa') !== typeFilter) return false;
    if(accessFilter === 'free' && !u.freeAccess) return false;
    if(accessFilter === 'pending') {
      // pending = Pueblos Originarios WITHOUT freeAccess granted
      if(!(u.accountType === 'pueblos' && !u.freeAccess)) return false;
    }
    return true;
  });
  // Sorting
  const sortBy = cuentasState.sortBy || 'name';
  const sortDir = cuentasState.sortDir || 'asc';
  filtered.sort((a,b) => {
    const va = (a[sortBy] || '').toString().toLowerCase();
    const vb = (b[sortBy] || '').toString().toLowerCase();
    if(va < vb) return sortDir === 'asc' ? -1 : 1;
    if(va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  return filtered;
}

function paintCuentas(state){
  const host = document.querySelector("#admCuentasTable");
  if(!host) return;
  const all = getFilteredCuentas(state);
  const pageSize = cuentasState.pageSize || 10;
  const total = all.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if(cuentasState.page > pages) cuentasState.page = pages;
  const start = (cuentasState.page - 1) * pageSize;
  const pageItems = all.slice(start, start + pageSize);
  const rows = pageItems.map((u, i) => `
    <tr>
      <td>${start + i + 1}</td>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email || "")}</td>
      <td>${escapeHtml(u.accountType || "empresa")}</td>
      <td>${u.accountType === "pueblos" ? (u.freeAccess ? `<span class="tag tag-success">Acceso gratuito</span>` : `<span class="tag tag-muted">Pendiente</span>`) : "-"}</td>
      <td><button class="ghost" data-edit-cuenta="${u.id}">Editar</button> <button class="ghost" data-delete-cuenta="${u.id}">Borrar</button></td>
    </tr>
  `).join("");
  const makeIndicator = (col) => {
    if(cuentasState.sortBy !== col) return '';
    return cuentasState.sortDir === 'asc' ? ' ↑' : ' ↓';
  };
  host.innerHTML = `<div class="table-scroll"><table class="load-table"><thead><tr><th>N°</th><th data-sort="name" class="sortable">Nombre${makeIndicator('name')}</th><th data-sort="email" class="sortable">Correo${makeIndicator('email')}</th><th data-sort="accountType" class="sortable">Tipo${makeIndicator('accountType')}</th><th>Acceso</th><th>Acciones</th></tr></thead><tbody>${rows || `<tr><td colspan="6">No hay cuentas corporativas.</td></tr>`}</tbody></table></div>`;
  // pagination controls
  const pager = document.createElement('div');
  pager.className = 'admin-inline';
  pager.innerHTML = `<button class="ghost" id="cuentasPrev" ${cuentasState.page<=1?"disabled":""}>Anterior</button><span style="margin:0 8px">Página ${cuentasState.page} / ${pages}</span><button class="ghost" id="cuentasNext" ${cuentasState.page>=pages?"disabled":""}>Siguiente</button><label style="margin-left:8px">Ir a página <input id="cuentasJump" type="number" min="1" max="${pages}" value="${cuentasState.page}" style="width:60px;margin-left:6px"></label><button class="ghost" id="cuentasJumpBtn">Ir</button>`;
  host.appendChild(pager);
  document.querySelectorAll("[data-edit-cuenta]").forEach(btn => btn.addEventListener("click", () => editCuenta(btn.dataset.editCuenta)));
  document.querySelectorAll("[data-delete-cuenta]").forEach(btn => btn.addEventListener("click", () => deleteCuenta(btn.dataset.deleteCuenta)));
  // Header click-to-sort handlers
  document.querySelectorAll('#admCuentasTable th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if(cuentasState.sortBy === col){
        cuentasState.sortDir = cuentasState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        cuentasState.sortBy = col;
        cuentasState.sortDir = 'asc';
      }
      // sync select control if present
      const sel = document.querySelector('#cuentasSort');
      if(sel){ sel.value = `${cuentasState.sortBy}:${cuentasState.sortDir}`; }
      paintCuentas(state);
    });
  });
  document.querySelector('#cuentasPrev')?.addEventListener('click', () => { if(cuentasState.page>1) cuentasState.page--; paintCuentas(state); });
  document.querySelector('#cuentasNext')?.addEventListener('click', () => { const p = Math.max(1, Math.ceil(total / pageSize)); if(cuentasState.page<p) cuentasState.page++; paintCuentas(state); });
  document.querySelector('#cuentasJumpBtn')?.addEventListener('click', () => { const v = Number(document.querySelector('#cuentasJump')?.value || cuentasState.page); const p = Math.max(1, Math.ceil(total / pageSize)); if(v >= 1 && v <= p){ cuentasState.page = v; paintCuentas(state); } else alert('Número de página fuera de rango'); });
}

function exportCuentasCsv(state){
  const users = getFilteredCuentas(state);
  const headers = Array.isArray(cuentasState.csvColumns) && cuentasState.csvColumns.length ? cuentasState.csvColumns : ["id","name","email","accountType","freeAccess","role","createdAt"];
  const escape = (v) => {
    if(v === undefined || v === null) return '';
    const s = String(v);
    // escape quotes by doubling them and wrap in quotes if contains comma or quote or newline
    const needs = /[",\n]/.test(s);
    const safe = s.replaceAll('"', '""');
    return needs ? `"${safe}"` : safe;
  };
  const rows = users.map(u => headers.map(h => escape(u[h])).join(","));
  const csv = headers.join(",") + "\n" + rows.join("\n");
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'giae-cuentas-corporativas.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

async function refreshCuentasFromServer(state){
  const status = document.querySelector("#admApiTokenStatus");
  const result = await listCompanyUsersFromServer();
  if(!result.ok){
    if(status) status.textContent = result.error || "No se pudo obtener el listado de cuentas.";
    return;
  }
  if(status) status.textContent = `Token cargado en esta pestaña. ${result.users.length} cuenta(s) en la nube.`;
  paintCuentas(state);
}

async function addCuenta(state){
  const name = document.querySelector("#cuentaName").value.trim();
  const email = document.querySelector("#cuentaEmail").value.trim();
  const password = document.querySelector("#cuentaPassword").value || "";
  const accountType = document.querySelector("#cuentaType").value || "empresa";
  const freeAccess = !!document.querySelector("#cuentaFreeAccess").checked;
  if(!name || !email) return alert("Nombre y correo son obligatorios.");
  if(!password) return alert("Crea una contraseña para la cuenta nueva.");
  const result = await upsertCompanyUser({ name, email, password, accountType, freeAccess, role: accountType === 'pueblos' ? 'proyectos' : 'proyectos' });
  if(!result.ok) return alert(result.error || 'Error creando cuenta.');
  addLog(state, `Cuenta corporativa creada: ${email}`);
  persist();
  document.querySelector("#cuentaName").value = ""; document.querySelector("#cuentaEmail").value = ""; document.querySelector("#cuentaPassword").value = ""; document.querySelector("#cuentaFreeAccess").checked = false;
  await refreshCuentasFromServer(state);
}

function editCuenta(id){
  const access = ensureCompanyAccess();
  const user = (access.users || []).find(u => u.id === id);
  if(!user) return alert('Cuenta no encontrada');
  document.querySelector("#cuentaName").value = user.name || "";
  document.querySelector("#cuentaEmail").value = user.email || "";
  document.querySelector("#cuentaType").value = user.accountType || "empresa";
  document.querySelector("#cuentaFreeAccess").checked = Boolean(user.freeAccess);
  // Set add button to save mode
  const btn = document.querySelector("#admAddCuenta");
  btn.textContent = "Guardar cambios";
  btn.onclick = async () => {
    const name = document.querySelector("#cuentaName").value.trim();
    const email = document.querySelector("#cuentaEmail").value.trim();
    const password = document.querySelector("#cuentaPassword").value || "";
    const accountType = document.querySelector("#cuentaType").value || "empresa";
    const freeAccess = !!document.querySelector("#cuentaFreeAccess").checked;
    const result = await upsertCompanyUser({ id: user.id, name, email, password: password || undefined, accountType, freeAccess, role: user.role, permissions: user.permissions });
    if(!result.ok) return alert(result.error || 'Error guardando cuenta.');
    addLog(state, `Cuenta actualizada: ${email}`);
    persist();
    btn.textContent = "Crear cuenta";
    btn.onclick = () => addCuenta(state);
    document.querySelector("#cuentaName").value = ""; document.querySelector("#cuentaEmail").value = ""; document.querySelector("#cuentaPassword").value = ""; document.querySelector("#cuentaFreeAccess").checked = false;
    await refreshCuentasFromServer(state);
  };
}

async function deleteCuenta(id){
  if(!confirm('¿Desactivar esta cuenta corporativa? Podrás reactivarla despues editandola.')) return;
  const result = await deleteCompanyUser(id);
  if(!result.ok) return alert(result.error || 'No se pudo desactivar la cuenta.');
  addLog(state, `Cuenta desactivada: ${id}`);
  await refreshCuentasFromServer(state);
}

function countLocalProjects(state){
  return Array.isArray(state.projectLibrary) ? state.projectLibrary.length : 0;
}

// Cuenta sesiones marcadas "Conectado" con actividad reciente (20 min). Una
// sesion marcada "Conectado" que quedo huerfana (se cerro la pestana sin
// pulsar "Cerrar sesion") ya no cuenta como activa despues de ese tiempo.
const SESSION_FRESH_WINDOW_MS = 20 * 60 * 1000;
function recentSessionCount(state){
  const sessions = state.admin?.sessions || [];
  const now = Date.now();
  return sessions.filter(s => s.status === "Conectado" && (now - (s.lastSeenAt || 0)) < SESSION_FRESH_WINDOW_MS).length;
}

function systemScore(state){
  return buildDiagnostics(state).score;
}

function buildDiagnostics(state){
  const checks = [];
  const add = (name, ok, detail, level="info") => checks.push({ name, ok: Boolean(ok), detail, level });
  const p = state.currentProject || {};
  add("Sesión activa", Boolean(state.profile), state.profile ? `Perfil: ${state.profile}` : "Sin perfil activo", "critico");
  add("Proyecto activo", Boolean(p.id), p.id ? `${p.name || "Sin nombre"} · ${p.id}` : "No existe proyecto activo", "critico");
  add("Biblioteca de proyectos", Array.isArray(state.projectLibrary), `${countLocalProjects(state)} proyecto(s) locales`, "medio");
  add("Módulos registrados", Object.keys(moduleLabels).length >= 10, `${Object.keys(moduleLabels).length} módulos base`, "medio");
  add("Política normativa estricta", state.normativePolicy?.noInventar === true, "No inventar datos: " + (state.normativePolicy?.noInventar ? "activo" : "inactivo"), "critico");
  add("Fuentes normativas permitidas", Array.isArray(state.normativePolicy?.allowedSources) && state.normativePolicy.allowedSources.includes("RIC") && state.normativePolicy.allowedSources.includes("IEC"), (state.normativePolicy?.allowedSources || []).join(" · ") || "Sin fuentes", "critico");
  add("Empresa / marca", Boolean(state.admin?.company?.name || state.companyBrand?.name), state.admin?.company?.name || state.companyBrand?.name || "Sin empresa configurada", "medio");
  add("Cuentas reales creadas", ensureCompanyAccess().users.filter(u => u.accountType !== "super_admin").length > 0, `${ensureCompanyAccess().users.filter(u => u.accountType !== "super_admin").length} cuenta(s)`, "medio");
  add("Plantillas", Array.isArray(state.admin?.templates) && state.admin.templates.length > 0, `${state.admin?.templates?.length || 0} plantilla(s)`, "bajo");
  add("Guardado local", storageAvailable(), storageAvailable() ? "localStorage disponible" : "localStorage no disponible", "critico");
  const okCount = checks.filter(c => c.ok).length;
  const score = Math.round((okCount / checks.length) * 100);
  return { date: new Date().toLocaleString("es-CL"), version: p.version || "1.0-alpha", score, checks };
}

function storageAvailable(){
  try{
    const key="giae_test_storage";
    localStorage.setItem(key,"1");
    localStorage.removeItem(key);
    return true;
  }catch(e){ return false; }
}

function paintSoftwareStatus(state, log=false){
  const el = document.querySelector("#admSoftwareStatus");
  if(!el) return;
  const report = buildDiagnostics(state);
  const statusClass = report.score >= 85 ? "ok" : report.score >= 65 ? "warn" : "danger";
  el.innerHTML = `
    <div class="software-health ${statusClass}">
      <strong>${report.score}%</strong>
      <span>Salud general del software</span>
      <small>Última revisión: ${escapeHtml(report.date)}</small>
    </div>
    <div class="diagnostic-grid">
      ${report.checks.map(check => `
        <article class="diagnostic-item ${check.ok ? "pass" : "fail"}">
          <b>${check.ok ? "Correcto" : "Revisar"}</b>
          <strong>${escapeHtml(check.name)}</strong>
          <span>${escapeHtml(check.detail)}</span>
        </article>`).join("")}
    </div>
    <div class="policy-box"><b>Nota:</b> este estado es local del navegador. En producción se complementará con estado real de servidor, D1, R2, Workers, licencias y sincronización.</div>
  `;
  if(log){ addLog(state, `Diagnóstico ejecutado. Salud del sistema: ${report.score}%.`); persist(); paintAudit(state); }
}

function downloadDiagnostics(state){
  const payload = {
    software: "GIAE Chile v1.0",
    type: "reporte-diagnostico-administrador",
    generatedAt: new Date().toISOString(),
    diagnostics: buildDiagnostics(state),
    inspector: buildInspectorPayload(state, "all")
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "giae-diagnostico-software.json";
  link.click();
  URL.revokeObjectURL(url);
}

function runInspector(state, forcedTarget=null){
  const target = forcedTarget || document.querySelector("#admInspectorTarget")?.value || "project";
  const output = document.querySelector("#admInspectorOutput");
  if(!output) return;
  output.textContent = JSON.stringify(buildInspectorPayload(state, target), null, 2);
}

function buildInspectorPayload(state, target){
  const localKeys = [];
  try{
    for(let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i);
      if(key && key.toLowerCase().includes("giae")) localKeys.push({ key, bytes: (localStorage.getItem(key) || "").length });
    }
  }catch(e){ localKeys.push({ error: "No se pudo leer localStorage" }); }
  const payloads = {
    project: state.currentProject || {},
    storage: { available: storageAvailable(), giaeKeys: localKeys, projectLibraryCount: countLocalProjects(state) },
    modules: { labels: moduleLabels, enabled: state.admin?.enabledModules || {}, activeProfile: state.profile },
    session: { profile: state.profile, company: state.admin?.company?.name || state.companyBrand?.name || "", sessions: state.admin?.sessions || [] },
    all: {
      session: { profile: state.profile, company: state.admin?.company?.name || state.companyBrand?.name || "" },
      diagnostics: buildDiagnostics(state),
      project: state.currentProject || {},
      storage: { available: storageAvailable(), giaeKeys: localKeys, projectLibraryCount: countLocalProjects(state) },
      modules: { labels: moduleLabels, enabled: state.admin?.enabledModules || {} },
      admin: { users: ensureCompanyAccess().users || [], templates: state.admin?.templates || [], auditLog: state.admin?.auditLog || [] }
    }
  };
  return payloads[target] || payloads.project;
}

function copyInspectorOutput(){
  const output = document.querySelector("#admInspectorOutput")?.textContent || "";
  navigator.clipboard?.writeText(output).then(()=>alert("Inspector copiado al portapapeles.")).catch(()=>alert("No se pudo copiar automáticamente."));
}


async function runOriginalityInspector(state){
  const el = document.querySelector("#admOriginalityResult");
  if(!el) return;
  el.innerHTML = `<div class="result-box info"><b>Analizando archivos...</b><br>Revisando código cargado, duplicación interna, scripts externos y marcas sospechosas.</div>`;
  const report = await buildOriginalityReport(state);
  state.admin.lastOriginalityReport = report;
  addLog(state, `Inspector de originalidad ejecutado. Resultado: ${report.score}%.`);
  persist();
  paintAudit(state);
  paintOriginalityReport(report);
}

async function buildOriginalityReport(state){
  const files = await loadProjectSources();
  const warnings = [];
  const duplicateBlocks = detectDuplicateBlocks(files);
  const aiMarks = detectAiMarks(files);
  const externalRefs = detectExternalReferences(files);
  const duplicateIds = detectDuplicateIds(files);
  const veryLargeFiles = files.filter(f => f.text.length > 120000).map(f => ({ file: f.path, bytes: f.text.length }));
  const unknownLicenses = externalRefs.filter(ref => ref.type === "script" || ref.type === "stylesheet");

  duplicateBlocks.forEach(item => warnings.push({ level: item.count >= 3 ? "medio" : "bajo", area: "Duplicación interna", detail: `${item.count} bloques similares detectados`, files: item.files }));
  aiMarks.forEach(item => warnings.push({ level: "medio", area: "Marcas de generación", detail: item.match, files: [item.file] }));
  externalRefs.forEach(item => warnings.push({ level: "medio", area: "Dependencia externa", detail: item.url, files: [item.file] }));
  duplicateIds.forEach(item => warnings.push({ level: "bajo", area: "HTML", detail: `ID repetido: ${item.id}`, files: item.files }));
  veryLargeFiles.forEach(item => warnings.push({ level: "bajo", area: "Mantenibilidad", detail: `Archivo grande: ${item.bytes} caracteres`, files: [item.file] }));

  const penalties = warnings.reduce((sum, w) => sum + (w.level === "alto" ? 18 : w.level === "medio" ? 8 : 3), 0);
  const score = Math.max(0, Math.min(100, 100 - penalties));
  const status = score >= 90 ? "Excelente" : score >= 75 ? "Bueno con observaciones" : score >= 55 ? "Revisar" : "Riesgo alto";
  return {
    software: "GIAE Chile v1.0",
    module: "Inspector de Originalidad",
    generatedAt: new Date().toISOString(),
    scope: "Análisis local. No compara contra bases externas ni contra toda la web.",
    score,
    status,
    scannedFiles: files.map(f => ({ path: f.path, bytes: f.text.length })),
    summary: {
      files: files.length,
      duplicateGroups: duplicateBlocks.length,
      aiMarks: aiMarks.length,
      externalReferences: externalRefs.length,
      duplicateIds: duplicateIds.length,
      largeFiles: veryLargeFiles.length
    },
    warnings,
    recommendation: score >= 90 ? "Sin señales relevantes. Mantener revisión manual antes de publicar." : "Revisar advertencias, documentar dependencias externas y evitar bloques repetidos innecesarios."
  };
}

async function loadProjectSources(){
  const paths = [
    "./index.html", "./core/main.js", "./core/store.js", "./core/moduleRegistry.js", "./core/calculations.js", "./core/normativeGuard.js", "./css/platform.css",
    "./modules/dashboard/dashboard.js", "./modules/flujo-guiado/flujo-guiado.js", "./modules/proyectos/proyectos.js", "./modules/cargas/cargas.js", "./modules/cuadro-carga/cuadro-carga.js", "./modules/empalme/empalme.js", "./modules/tierra/tierra.js", "./modules/unilineal/unilineal.js", "./modules/documentacion/documentacion.js", "./modules/presupuesto/presupuesto.js", "./modules/auditoria/auditoria.js", "./modules/educacion/educacion.js", "./modules/usuarios/usuarios.js", "./modules/administracion/administracion.js"
  ];
  const loaded = [];
  for(const path of paths){
    try{
      const response = await fetch(path, { cache: "no-store" });
      if(response.ok){ loaded.push({ path, text: await response.text() }); }
    }catch(e){ /* en modo archivo local algunos navegadores bloquean fetch; se informa abajo */ }
  }
  if(!loaded.length){
    loaded.push({ path: "estado-local", text: JSON.stringify(window.__GIAE_STATE__ || {}, null, 2) });
  }
  return loaded;
}

function normalizeCodeBlock(text){
  return String(text || "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectDuplicateBlocks(files){
  const blocks = new Map();
  files.forEach(file => {
    const lines = normalizeCodeBlock(file.text).split(/(?<=;|\}|\{)/).map(x => x.trim()).filter(x => x.length > 80);
    lines.forEach(line => {
      const key = line.slice(0, 220);
      const entry = blocks.get(key) || { count: 0, files: new Set() };
      entry.count += 1;
      entry.files.add(file.path);
      blocks.set(key, entry);
    });
  });
  return [...blocks.entries()]
    .filter(([,v]) => v.count > 1 && v.files.size > 1)
    .slice(0, 20)
    .map(([sample,v]) => ({ sample, count: v.count, files: [...v.files] }));
}

function detectAiMarks(files){
  const patterns = [/chatgpt/i, /openai/i, /copilot/i, /generated by/i, /ai-generated/i, /creado por ia/i, /generado por ia/i];
  const found = [];
  files.forEach(file => {
    const lines = file.text.split(/\n/);
    lines.forEach((line, index) => {
      if(patterns.some(rx => rx.test(line))){ found.push({ file: file.path, line: index + 1, match: line.trim().slice(0, 180) }); }
    });
  });
  return found.slice(0, 40);
}

function detectExternalReferences(files){
  const found = [];
  files.forEach(file => {
    const regex = /<(script|link)[^>]+(?:src|href)=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    let match;
    while((match = regex.exec(file.text))){ found.push({ file: file.path, type: match[1].toLowerCase(), url: match[2] }); }
  });
  return found;
}

function detectDuplicateIds(files){
  const idMap = new Map();
  files.filter(f => f.path.endsWith(".html")).forEach(file => {
    const regex = /\sid=["']([^"']+)["']/gi;
    let match;
    while((match = regex.exec(file.text))){
      const id = match[1];
      const entry = idMap.get(id) || new Set();
      entry.add(file.path);
      idMap.set(id, entry);
    }
  });
  return [...idMap.entries()].filter(([,files]) => files.size > 1).map(([id, files]) => ({ id, files: [...files] })).slice(0, 30);
}

function paintOriginalityReport(report){
  const el = document.querySelector("#admOriginalityResult");
  if(!el) return;
  const statusClass = report.score >= 90 ? "ok" : report.score >= 75 ? "warn" : "danger";
  el.innerHTML = `
    <div class="software-health ${statusClass}">
      <strong>${report.score}%</strong>
      <span>${escapeHtml(report.status)}</span>
      <small>${escapeHtml(report.scope)}</small>
    </div>
    <section class="admin-kpis compact-kpis">
      <div><strong>${report.summary.files}</strong><span>Archivos revisados</span></div>
      <div><strong>${report.summary.duplicateGroups}</strong><span>Duplicados internos</span></div>
      <div><strong>${report.summary.aiMarks}</strong><span>Marcas IA</span></div>
      <div><strong>${report.summary.externalReferences}</strong><span>Referencias externas</span></div>
    </section>
    <div class="table-scroll">
      <table>
        <thead><tr><th>N°</th><th>Nivel</th><th>Área</th><th>Detalle</th><th>Archivos</th></tr></thead>
        <tbody>${report.warnings.map((w,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(w.level)}</td><td>${escapeHtml(w.area)}</td><td>${escapeHtml(w.detail)}</td><td>${escapeHtml((w.files||[]).join(', '))}</td></tr>`).join("") || `<tr><td colspan="5">Sin observaciones relevantes.</td></tr>`}</tbody>
      </table>
    </div>
    <div class="policy-box"><b>Recomendación:</b> ${escapeHtml(report.recommendation)}</div>
  `;
}

function downloadOriginalityReport(state){
  const report = state.admin?.lastOriginalityReport;
  if(!report) return alert("Primero ejecuta el análisis de originalidad.");
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "giae-inspector-originalidad.json";
  link.click();
  URL.revokeObjectURL(url);
}

function copyOriginalitySummary(){
  const text = document.querySelector("#admOriginalityResult")?.innerText || "";
  navigator.clipboard?.writeText(text).then(()=>alert("Resumen copiado al portapapeles.")).catch(()=>alert("No se pudo copiar automáticamente."));
}

function defaultLogo(){return `<svg viewBox="0 0 120 120" width="110" height="110"><rect x="10" y="10" width="100" height="100" rx="28" fill="#1456a0"/><path d="M66 18 30 68h27l-7 34 40-55H63z" fill="#10b981"/><text x="60" y="104" text-anchor="middle" fill="white" font-size="14" font-weight="800">GIAE</text></svg>`;}
function capitalize(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function escapeHtml(value){return String(value??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

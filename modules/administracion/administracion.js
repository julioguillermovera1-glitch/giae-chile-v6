import { persist } from "../../core/store.js";

const moduleLabels = {
  dashboard: "Dashboard",
  proyectos: "Administrador de proyectos",
  proyecto: "Proyecto activo",
  gpe: "Motor de proyecto",
  usuarios: "Usuarios empresa",
  cargas: "Cargas",
  "cuadro-carga": "Cuadro de carga",
  balance: "Balance de fases",
  tableros: "Tableros",
  empalme: "Empalme",
  tierra: "Puesta a tierra",
  unilineal: "Unilineal",
  auditoria: "Auditoria",
  documentacion: "Centro de Documentacion SEC",
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
  state.admin.company = state.admin.company || {
    name: state.currentProject.company || "GIAE Chile",
    rut: "",
    address: "",
    phone: "",
    email: "",
    logoName: "Logo interno GIAE",
    logoData: "",
    brand: {
      name: state.currentProject.company || "GIAE Chile",
      primaryColor: "#102033",
      accentColor: "#1456a0",
      backgroundColor: "#eef3f8",
      templateStyle: "tecnico"
    }
  };
  state.admin.users = state.admin.users || [
    { name: "Administrador general", email: "admin@giae.local", role: "Administrador", profile: "administrador", status: "Activo" },
    { name: "Instalador demo", email: "instalador@giae.local", role: "Instalador", profile: "independiente", status: "Activo" },
    { name: "Estudiante demo", email: "estudiante@giae.local", role: "Estudiante", profile: "estudiante", status: "Activo" }
  ];
  state.admin.sessions = state.admin.sessions || [
    { name: "Administrador", profile: "administrador", status: state.profile === "administrador" ? "Conectado" : "Desconectado", lastSeen: new Date().toLocaleString("es-CL") }
  ];
  state.admin.templates = state.admin.templates || [
    { name: "Cotización estándar", type: "Presupuesto", status: "Activa", content: "Cotización técnica\nCliente: {{cliente}}\nProyecto: {{proyecto}}\nTotal: {{total}}" },
    { name: "Orden de trabajo", type: "Trabajo", status: "Activa", content: "Orden de trabajo\nResponsable: {{instalador}}\nActividad: {{actividad}}" },
    { name: "Informe técnico", type: "Informe", status: "Activa", content: "Informe técnico\nProyecto: {{proyecto}}\nObservaciones: {{observaciones}}" }
  ];
  const defaultEnabledModules = Object.fromEntries(Object.keys(moduleLabels).map(key => [key, true]));
  state.admin.enabledModules = { ...defaultEnabledModules, ...(state.admin.enabledModules || {}) };
  state.admin.enabledModules.administracion = true;
  state.admin.auditLog = state.admin.auditLog || [];
}

export function render(host, state){
  ensureAdminData(state);
  if(state.profile !== "administrador"){
    host.innerHTML = `<article class="module-window"><div class="result-box danger"><b>Acceso restringido.</b><br>Este módulo solo puede verlo el administrador de la plataforma.</div></article>`;
    return;
  }

  host.innerHTML = `
    <article class="module-window admin-panel real-admin">
      <div class="module-head">
        <div>
          <p class="eyebrow">Centro de control exclusivo</p>
          <h3>Panel Administrador GIAE</h3>
          <p>Desde aquí puedes crear, editar, activar, desactivar y borrar usuarios, módulos, plantillas y datos de empresa.</p>
        </div>
        <div class="row-actions">
          <button id="adminSaveBtn">Guardar cambios</button>
          <button id="adminBackupBtn" class="secondary">Descargar respaldo</button>
          <button id="adminResetDemoBtn" class="ghost danger-text">Limpiar datos demo</button>
        </div>
      </div>

      <section class="admin-kpis">
        <div><strong>${state.admin.users.length}</strong><span>Usuarios creados</span></div>
        <div><strong>${state.admin.sessions.filter(s => s.status === "Conectado").length}</strong><span>Usuarios conectados</span></div>
        <div><strong>${Object.values(state.admin.enabledModules).filter(Boolean).length}</strong><span>Módulos activos</span></div>
        <div><strong>${state.admin.templates.length}</strong><span>Plantillas</span></div>
        <div><strong>${systemScore(state)}%</strong><span>Salud del sistema</span></div>
        <div><strong>${countLocalProjects(state)}</strong><span>Proyectos locales</span></div>
      </section>

      <section class="admin-tabs" aria-label="Secciones de administración">
        <button class="active" data-admin-tab="usuarios">Usuarios</button>
        <button data-admin-tab="sesiones">Conectados</button>
        <button data-admin-tab="empresa">Empresa y logo</button>
        <button data-admin-tab="modulos">Módulos</button>
        <button data-admin-tab="plantillas">Plantillas</button>
        <button data-admin-tab="sistema">Sistema</button>
        <button data-admin-tab="estado">Estado del software</button>
        <button data-admin-tab="inspector">Inspector</button>
        <button data-admin-tab="originalidad">Originalidad</button>
        <button data-admin-tab="roadmap">Roadmap</button>
      </section>

      <section id="admTabUsuarios" class="admin-tab-page active">
        <div class="admin-card">
          <h4>Crear / editar usuarios</h4>
          <div class="admin-inline admin-inline-5">
            <input id="admUserName" placeholder="Nombre usuario">
            <input id="admUserEmail" placeholder="correo@empresa.cl">
            <select id="admUserRole">
              <option>Administrador</option><option>Supervisor</option><option>Instalador</option><option>Cotizador</option><option>Estudiante</option><option>Solo lectura</option>
            </select>
            <select id="admUserProfile">
              <option value="administrador">Administrador</option><option value="empresa">Empresa</option><option value="independiente">Independiente</option><option value="estudiante">Estudiante</option>
            </select>
            <button id="admAddUser">Agregar usuario</button>
          </div>
          <div id="admUsersTable"></div>
        </div>
      </section>

      <section id="admTabSesiones" class="admin-tab-page">
        <div class="admin-card">
          <h4>Usuarios conectados</h4>
          <p class="small">En esta versión local se registran sesiones del navegador. Cuando exista servidor, aquí se verán conexiones reales de todos los usuarios.</p>
          <div id="admSessionsTable"></div>
        </div>
      </section>

      <section id="admTabEmpresa" class="admin-tab-page">
        <div class="admin-card company-admin-card">
          <h4>Empresa / marca blanca</h4>
          <div class="form-grid">
            <label>Nombre empresa o instalador<input id="admCompany" value="${escapeHtml(state.admin.company.name)}"></label>
            <label>RUT<input id="admRut" value="${escapeHtml(state.admin.company.rut)}" placeholder="76.000.000-0"></label>
            <label>Dirección<input id="admAddress" value="${escapeHtml(state.admin.company.address)}"></label>
            <label>Correo<input id="admEmail" value="${escapeHtml(state.admin.company.email)}" placeholder="contacto@empresa.cl"></label>
            <label>Teléfono<input id="admPhone" value="${escapeHtml(state.admin.company.phone)}"></label>
            <label>Logo / imagen corporativa<input id="admLogo" type="file" accept="image/*"></label>
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

  paintUsers(state); paintSessions(state); paintTemplates(state); paintModules(state); paintAudit(state); wireEvents(state);
}

function wireEvents(state){
  document.querySelectorAll("[data-admin-tab]").forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.adminTab)));
  document.querySelector("#adminSaveBtn").addEventListener("click", () => saveAdminForm(state, true));
  document.querySelector("#adminBackupBtn").addEventListener("click", () => downloadBackup(state));
  document.querySelector("#adminResetDemoBtn").addEventListener("click", () => {
    if(!confirm("¿Limpiar usuarios, plantillas y sesiones de prueba?")) return;
    state.admin.users = [];
    state.admin.templates = [];
    state.admin.sessions = [];
    addLog(state, "Administrador limpió datos demo.");
    persist(); render(document.querySelector("#windowHost"), state);
  });
  document.querySelector("#admLogo").addEventListener("change", event => loadLogo(event, state));
  document.querySelector("#admAddUser").addEventListener("click", () => addUser(state));
  document.querySelector("#admAddTemplate").addEventListener("click", () => addTemplate(state));
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

function addUser(state){
  const name = document.querySelector("#admUserName").value.trim();
  const email = document.querySelector("#admUserEmail").value.trim();
  const role = document.querySelector("#admUserRole").value;
  const profile = document.querySelector("#admUserProfile").value;
  if(!name) return alert("Ingresa un nombre de usuario.");
  state.admin.users.push({ name, email, role, profile, status: "Activo" });
  addLog(state, `Usuario creado: ${name}.`);
  document.querySelector("#admUserName").value = ""; document.querySelector("#admUserEmail").value = "";
  persist(); paintUsers(state); paintAudit(state);
}

function paintUsers(state){
  const rows = state.admin.users.map((user, index) => `
    <tr><td>${index + 1}</td><td><input data-user-name="${index}" value="${escapeHtml(user.name)}"></td><td><input data-user-email="${index}" value="${escapeHtml(user.email || "")}"></td><td><select data-user-role="${index}">${["Administrador","Supervisor","Instalador","Cotizador","Estudiante","Solo lectura"].map(r=>`<option ${r===user.role?"selected":""}>${r}</option>`).join("")}</select></td><td><select data-user-profile="${index}">${["administrador","empresa","independiente","estudiante"].map(p=>`<option value="${p}" ${p===user.profile?"selected":""}>${p}</option>`).join("")}</select></td><td><span class="status ${user.status === "Activo" ? "on" : "off"}">${escapeHtml(user.status)}</span></td><td class="actions-cell"><button class="ghost" data-save-user="${index}">Guardar</button><button class="ghost" data-toggle-user="${index}">${user.status === "Activo" ? "Desactivar" : "Activar"}</button><button class="ghost danger-text" data-remove-user="${index}">Borrar</button></td></tr>
  `).join("");
  document.querySelector("#admUsersTable").innerHTML = `<div class="table-scroll"><table><thead><tr><th>N°</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Perfil</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows || `<tr><td colspan="7">Sin usuarios creados.</td></tr>`}</tbody></table></div>`;
  document.querySelectorAll("[data-save-user]").forEach(btn => btn.addEventListener("click", () => saveUser(state, Number(btn.dataset.saveUser))));
  document.querySelectorAll("[data-toggle-user]").forEach(btn => btn.addEventListener("click", () => toggleUser(state, Number(btn.dataset.toggleUser))));
  document.querySelectorAll("[data-remove-user]").forEach(btn => btn.addEventListener("click", () => removeUser(state, Number(btn.dataset.removeUser))));
}

function saveUser(state, index){
  const user = state.admin.users[index]; if(!user) return;
  user.name = document.querySelector(`[data-user-name="${index}"]`).value.trim();
  user.email = document.querySelector(`[data-user-email="${index}"]`).value.trim();
  user.role = document.querySelector(`[data-user-role="${index}"]`).value;
  user.profile = document.querySelector(`[data-user-profile="${index}"]`).value;
  addLog(state, `Usuario actualizado: ${user.name}.`); persist(); paintUsers(state); paintAudit(state);
}
function toggleUser(state, index){ const user=state.admin.users[index]; if(!user)return; user.status = user.status === "Activo" ? "Inactivo" : "Activo"; addLog(state, `${user.status === "Activo" ? "Activado" : "Desactivado"}: ${user.name}.`); persist(); paintUsers(state); paintAudit(state); }
function removeUser(state, index){ const user=state.admin.users[index]; if(!user)return; if(!confirm(`¿Borrar usuario ${user.name}?`))return; state.admin.users.splice(index,1); addLog(state, `Usuario borrado: ${user.name}.`); persist(); paintUsers(state); paintAudit(state); }

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
function downloadBackup(state){ saveAdminForm(state,false); const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download="giae-respaldo-administracion.json"; link.click(); URL.revokeObjectURL(url); }
function addLog(state,text){ ensureAdminData(state); state.admin.auditLog.unshift({date:new Date().toLocaleString("es-CL"),text}); state.admin.auditLog=state.admin.auditLog.slice(0,50); }
function paintAudit(state){ const rows=(state.admin.auditLog||[]).map((l,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(l.date)}</td><td>${escapeHtml(l.text)}</td></tr>`).join(""); const el=document.querySelector("#admAuditLog"); if(el) el.innerHTML=`<div class="table-scroll"><table><thead><tr><th>N°</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>${rows||`<tr><td colspan="3">Sin acciones registradas.</td></tr>`}</tbody></table></div>`; }

function countLocalProjects(state){
  return Array.isArray(state.projectLibrary) ? state.projectLibrary.length : 0;
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
  add("Usuarios administrativos", Array.isArray(state.admin?.users) && state.admin.users.length > 0, `${state.admin?.users?.length || 0} usuario(s)`, "medio");
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
      admin: { users: state.admin?.users || [], templates: state.admin?.templates || [], auditLog: state.admin?.auditLog || [] }
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
    "./index.html", "./indice.html", "./core/main.js", "./core/store.js", "./core/moduleRegistry.js", "./core/calculations.js", "./core/normativeGuard.js", "./css/platform.css",
    "./modules/dashboard/dashboard.js", "./modules/proyecto/proyecto.js", "./modules/proyectos/proyectos.js", "./modules/cargas/cargas.js", "./modules/cuadro-carga/cuadro-carga.js", "./modules/empalme/empalme.js", "./modules/tierra/tierra.js", "./modules/unilineal/unilineal.js", "./modules/documentacion/documentacion.js", "./modules/presupuesto/presupuesto.js", "./modules/auditoria/auditoria.js", "./modules/educacion/educacion.js", "./modules/usuarios/usuarios.js", "./modules/administracion/administracion.js"
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

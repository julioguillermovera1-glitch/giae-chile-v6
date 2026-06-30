import { persist } from "../../core/store.js";

function ensureAdminData(state){
  state.admin = state.admin || {};
  state.admin.company = state.admin.company || {
    name: state.currentProject.company || "Empresa sin configurar",
    rut: "",
    address: "",
    phone: "",
    email: "",
    logoName: "Sin logo cargado"
  };
  state.admin.users = state.admin.users || [
    { name: "Administrador", role: "Administrador", profile: state.profile || "empresa", status: "Activo" }
  ];
  state.admin.templates = state.admin.templates || [
    { name: "Cotización estándar", type: "Presupuesto", status: "Activa" },
    { name: "Informe técnico", type: "Documento", status: "Borrador" }
  ];
  state.admin.enabledModules = state.admin.enabledModules || {
    proyecto: true,
    usuarios: true,
    cargas: true,
    cuadro: true,
    empalme: true,
    tierra: true,
    unilineal: true,
    documentacion: true,
    presupuesto: true,
    auditoria: true,
    educacion: true
  };
}

const moduleLabels = {
  proyecto: "Proyecto",
  usuarios: "Usuarios",
  cargas: "Cargas",
  cuadro: "Cuadro de carga",
  empalme: "Empalme",
  tierra: "Puesta a tierra",
  unilineal: "Unilineal",
  documentacion: "Documentación",
  presupuesto: "Presupuesto",
  auditoria: "Auditoría",
  educacion: "Educación"
};

export function render(host, state){
  ensureAdminData(state);
  const projectCount = state.currentProject?.name ? 1 : 0;
  const loadCount = state.currentProject?.loads?.length || 0;
  const userCount = state.admin.users.length;
  const activeModules = Object.values(state.admin.enabledModules).filter(Boolean).length;

  host.innerHTML = `
    <article class="module-window admin-panel">
      <div class="module-head">
        <div>
          <p class="eyebrow">Centro de control</p>
          <h3>Administración de plataforma</h3>
          <p>Panel para gestionar usuarios, empresa, módulos, plantillas, proyectos y respaldo local de GIAE Chile v1.0.</p>
        </div>
        <div class="row-actions">
          <button id="adminSaveBtn">Guardar configuración</button>
          <button id="adminBackupBtn" class="secondary">Descargar respaldo</button>
        </div>
      </div>

      <section class="admin-kpis">
        <div><strong>${userCount}</strong><span>Usuarios locales</span></div>
        <div><strong>${projectCount}</strong><span>Proyecto activo</span></div>
        <div><strong>${loadCount}</strong><span>Cargas ingresadas</span></div>
        <div><strong>${activeModules}</strong><span>Módulos activos</span></div>
      </section>

      <section class="admin-grid">
        <div class="admin-card">
          <h4>Empresa / cuenta</h4>
          <label>Nombre empresa o instalador<input id="admCompany" value="${escapeHtml(state.admin.company.name)}"></label>
          <label>RUT<input id="admRut" value="${escapeHtml(state.admin.company.rut)}" placeholder="76.000.000-0"></label>
          <label>Dirección<input id="admAddress" value="${escapeHtml(state.admin.company.address)}"></label>
          <label>Correo<input id="admEmail" value="${escapeHtml(state.admin.company.email)}" placeholder="contacto@empresa.cl"></label>
          <label>Teléfono<input id="admPhone" value="${escapeHtml(state.admin.company.phone)}"></label>
          <label>Logo / imagen corporativa<input id="admLogo" type="file" accept="image/*"></label>
          <p class="small">Logo actual: <b id="admLogoName">${escapeHtml(state.admin.company.logoName)}</b></p>
        </div>

        <div class="admin-card">
          <h4>Usuarios y roles</h4>
          <div class="admin-inline">
            <input id="admUserName" placeholder="Nombre usuario">
            <select id="admUserRole">
              <option>Administrador</option>
              <option>Supervisor</option>
              <option>Instalador</option>
              <option>Cotizador</option>
              <option>Estudiante</option>
              <option>Solo lectura</option>
            </select>
            <button id="admAddUser">Agregar</button>
          </div>
          <div id="admUsersTable"></div>
        </div>

        <div class="admin-card">
          <h4>Módulos de la plataforma</h4>
          <p class="small">Esto permite controlar qué herramientas estarán activas por cuenta o perfil.</p>
          <div id="admModules" class="module-switches"></div>
        </div>

        <div class="admin-card">
          <h4>Plantillas</h4>
          <div class="admin-inline">
            <input id="admTemplateName" placeholder="Nombre de plantilla">
            <select id="admTemplateType">
              <option>Presupuesto</option>
              <option>Informe</option>
              <option>TE1</option>
              <option>Memoria técnica</option>
            </select>
            <button id="admAddTemplate">Agregar</button>
          </div>
          <div id="admTemplatesTable"></div>
        </div>
      </section>

      <section class="admin-card">
        <h4>Proyecto activo</h4>
        <div class="project-summary">
          <span><b>Nombre:</b> ${escapeHtml(state.currentProject.name || "Sin nombre")}</span>
          <span><b>Cliente:</b> ${escapeHtml(state.currentProject.client || "Sin cliente")}</span>
          <span><b>Sistema:</b> ${escapeHtml(state.currentProject.supplyType || "No definido")}</span>
          <span><b>Distribuidora:</b> ${escapeHtml(state.currentProject.distributor || "No definida")}</span>
        </div>
      </section>
    </article>
  `;

  paintUsers(state);
  paintTemplates(state);
  paintModules(state);
  wireEvents(state);
}

function wireEvents(state){
  document.querySelector("#adminSaveBtn").addEventListener("click", () => saveAdminForm(state, true));
  document.querySelector("#adminBackupBtn").addEventListener("click", () => downloadBackup(state));
  document.querySelector("#admLogo").addEventListener("change", event => {
    const file = event.target.files?.[0];
    if(!file) return;
    state.admin.company.logoName = file.name;
    document.querySelector("#admLogoName").textContent = file.name;
    persist();
  });
  document.querySelector("#admAddUser").addEventListener("click", () => {
    const name = document.querySelector("#admUserName").value.trim();
    const role = document.querySelector("#admUserRole").value;
    if(!name) return alert("Ingresa un nombre de usuario.");
    state.admin.users.push({ name, role, profile: role === "Estudiante" ? "estudiante" : "empresa", status: "Activo" });
    document.querySelector("#admUserName").value = "";
    persist();
    paintUsers(state);
  });
  document.querySelector("#admAddTemplate").addEventListener("click", () => {
    const name = document.querySelector("#admTemplateName").value.trim();
    const type = document.querySelector("#admTemplateType").value;
    if(!name) return alert("Ingresa el nombre de la plantilla.");
    state.admin.templates.push({ name, type, status: "Activa" });
    document.querySelector("#admTemplateName").value = "";
    persist();
    paintTemplates(state);
  });
}

function saveAdminForm(state, notify=false){
  state.admin.company = {
    ...state.admin.company,
    name: document.querySelector("#admCompany").value.trim(),
    rut: document.querySelector("#admRut").value.trim(),
    address: document.querySelector("#admAddress").value.trim(),
    email: document.querySelector("#admEmail").value.trim(),
    phone: document.querySelector("#admPhone").value.trim()
  };
  state.currentProject.company = state.admin.company.name;
  persist();
  if(notify) alert("Configuración administrativa guardada localmente.");
}

function paintUsers(state){
  const rows = state.admin.users.map((user, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.role)}</td>
      <td>${escapeHtml(user.profile)}</td>
      <td>${escapeHtml(user.status)}</td>
      <td><button class="ghost danger-text" data-remove-user="${index}">Quitar</button></td>
    </tr>
  `).join("");
  document.querySelector("#admUsersTable").innerHTML = `
    <table><thead><tr><th>N°</th><th>Nombre</th><th>Rol</th><th>Perfil</th><th>Estado</th><th></th></tr></thead><tbody>${rows}</tbody></table>
  `;
  document.querySelectorAll("[data-remove-user]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeUser);
      state.admin.users.splice(index, 1);
      persist();
      paintUsers(state);
    });
  });
}

function paintTemplates(state){
  const rows = state.admin.templates.map((tpl, index) => `
    <tr><td>${index + 1}</td><td>${escapeHtml(tpl.name)}</td><td>${escapeHtml(tpl.type)}</td><td>${escapeHtml(tpl.status)}</td><td><button class="ghost danger-text" data-remove-template="${index}">Quitar</button></td></tr>
  `).join("");
  document.querySelector("#admTemplatesTable").innerHTML = `
    <table><thead><tr><th>N°</th><th>Plantilla</th><th>Tipo</th><th>Estado</th><th></th></tr></thead><tbody>${rows}</tbody></table>
  `;
  document.querySelectorAll("[data-remove-template]").forEach(button => {
    button.addEventListener("click", () => {
      state.admin.templates.splice(Number(button.dataset.removeTemplate), 1);
      persist();
      paintTemplates(state);
    });
  });
}

function paintModules(state){
  document.querySelector("#admModules").innerHTML = Object.entries(moduleLabels).map(([key, label]) => `
    <label class="switch-row">
      <span>${label}</span>
      <input type="checkbox" data-module-switch="${key}" ${state.admin.enabledModules[key] ? "checked" : ""}>
    </label>
  `).join("");
  document.querySelectorAll("[data-module-switch]").forEach(input => {
    input.addEventListener("change", () => {
      state.admin.enabledModules[input.dataset.moduleSwitch] = input.checked;
      persist();
    });
  });
}

function downloadBackup(state){
  saveAdminForm(state, false);
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "giae-respaldo-administracion.json";
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
}

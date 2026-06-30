import { persist } from "../../core/store.js";

const moduleLabels = {
  proyecto: "Proyecto",
  usuarios: "Usuarios empresa",
  administracion: "Administración",
  cargas: "Cargas",
  "cuadro-carga": "Cuadro de carga",
  empalme: "Empalme",
  tierra: "Puesta a tierra",
  unilineal: "Unilineal",
  documentacion: "Documentación",
  presupuesto: "Presupuesto",
  auditoria: "Auditoría",
  educacion: "Educación"
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
    logoData: ""
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
    { name: "Cotización estándar", type: "Presupuesto", status: "Activa" },
    { name: "Informe técnico", type: "Informe", status: "Activa" }
  ];
  state.admin.enabledModules = state.admin.enabledModules || Object.fromEntries(Object.keys(moduleLabels).map(key => [key, true]));
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
      </section>

      <section class="admin-tabs" aria-label="Secciones de administración">
        <button class="active" data-admin-tab="usuarios">Usuarios</button>
        <button data-admin-tab="sesiones">Conectados</button>
        <button data-admin-tab="empresa">Empresa y logo</button>
        <button data-admin-tab="modulos">Módulos</button>
        <button data-admin-tab="plantillas">Plantillas</button>
        <button data-admin-tab="sistema">Sistema</button>
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
            <select id="admTemplateType"><option>Presupuesto</option><option>Informe</option><option>TE1</option><option>Memoria técnica</option></select>
            <button id="admAddTemplate">Agregar</button>
          </div>
          <div id="admTemplatesTable"></div>
        </div>
      </section>

      <section id="admTabSistema" class="admin-tab-page">
        <div class="admin-card">
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
      name: companyInput.value.trim(), rut: document.querySelector("#admRut").value.trim(), address: document.querySelector("#admAddress").value.trim(), email: document.querySelector("#admEmail").value.trim(), phone: document.querySelector("#admPhone").value.trim()
    };
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

function addTemplate(state){ const name=document.querySelector("#admTemplateName").value.trim(); const type=document.querySelector("#admTemplateType").value; if(!name)return alert("Ingresa el nombre de la plantilla."); state.admin.templates.push({name,type,status:"Activa"}); document.querySelector("#admTemplateName").value=""; addLog(state,`Plantilla creada: ${name}.`); persist(); paintTemplates(state); paintAudit(state); }
function paintTemplates(state){
  const rows=state.admin.templates.map((tpl,i)=>`<tr><td>${i+1}</td><td><input data-tpl-name="${i}" value="${escapeHtml(tpl.name)}"></td><td><select data-tpl-type="${i}">${["Presupuesto","Informe","TE1","Memoria técnica"].map(t=>`<option ${t===tpl.type?"selected":""}>${t}</option>`).join("")}</select></td><td><select data-tpl-status="${i}"><option ${tpl.status==="Activa"?"selected":""}>Activa</option><option ${tpl.status==="Borrador"?"selected":""}>Borrador</option><option ${tpl.status==="Inactiva"?"selected":""}>Inactiva</option></select></td><td><button class="ghost" data-save-tpl="${i}">Guardar</button><button class="ghost danger-text" data-remove-template="${i}">Borrar</button></td></tr>`).join("");
  document.querySelector("#admTemplatesTable").innerHTML=`<div class="table-scroll"><table><thead><tr><th>N°</th><th>Plantilla</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows||`<tr><td colspan="5">Sin plantillas.</td></tr>`}</tbody></table></div>`;
  document.querySelectorAll("[data-save-tpl]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.saveTpl); state.admin.templates[i].name=document.querySelector(`[data-tpl-name="${i}"]`).value.trim(); state.admin.templates[i].type=document.querySelector(`[data-tpl-type="${i}"]`).value; state.admin.templates[i].status=document.querySelector(`[data-tpl-status="${i}"]`).value; addLog(state,`Plantilla actualizada: ${state.admin.templates[i].name}.`); persist(); paintTemplates(state); paintAudit(state);}));
  document.querySelectorAll("[data-remove-template]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.removeTemplate); const name=state.admin.templates[i].name; if(!confirm(`¿Borrar plantilla ${name}?`))return; state.admin.templates.splice(i,1); addLog(state,`Plantilla borrada: ${name}.`); persist(); paintTemplates(state); paintAudit(state);}));
}

function loadLogo(event,state){ const file=event.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{state.admin.company.logoName=file.name; state.admin.company.logoData=reader.result; document.querySelector("#admLogoName").textContent=file.name; document.querySelector("#admLogoPreview").innerHTML=`<img src="${reader.result}" alt="Logo empresa">`; addLog(state,`Logo cargado: ${file.name}.`); persist();}; reader.readAsDataURL(file); }
function downloadBackup(state){ saveAdminForm(state,false); const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download="giae-respaldo-administracion.json"; link.click(); URL.revokeObjectURL(url); }
function addLog(state,text){ ensureAdminData(state); state.admin.auditLog.unshift({date:new Date().toLocaleString("es-CL"),text}); state.admin.auditLog=state.admin.auditLog.slice(0,50); }
function paintAudit(state){ const rows=(state.admin.auditLog||[]).map((l,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(l.date)}</td><td>${escapeHtml(l.text)}</td></tr>`).join(""); const el=document.querySelector("#admAuditLog"); if(el) el.innerHTML=`<div class="table-scroll"><table><thead><tr><th>N°</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>${rows||`<tr><td colspan="3">Sin acciones registradas.</td></tr>`}</tbody></table></div>`; }
function defaultLogo(){return `<svg viewBox="0 0 120 120" width="110" height="110"><rect x="10" y="10" width="100" height="100" rx="28" fill="#1456a0"/><path d="M66 18 30 68h27l-7 34 40-55H63z" fill="#10b981"/><text x="60" y="104" text-anchor="middle" fill="white" font-size="14" font-weight="800">GIAE</text></svg>`;}
function capitalize(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function escapeHtml(value){return String(value??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

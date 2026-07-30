import { ensureCompanyAccess, currentCompanyUser, hasCompanyPermission, setActiveCompanyUser, upsertCompanyUser, deleteCompanyUser, listCompanyUsersFromServer, getApiToken } from "../../core/store.js";

// Evita volver a pedir el listado al servidor en cada re-render dentro de la
// misma carga de pagina (se resetea solo al recargar el navegador).
const usuariosModuleState = { loaded: false };

const permissions = [
  { id: "project.manage", label: "Crear y modificar proyectos" },
  { id: "inventory.view", label: "Ver inventario y entregas" },
  { id: "inventory.manage", label: "Administrar inventario y registrar entregas" },
  { id: "users.manage", label: "Administrar usuarios y permisos" },
  { id: "docs.view", label: "Ver documentacion" },
  { id: "budget.view", label: "Ver presupuestos" }
];

const roles = {
  proyectos: { label: "Solo proyectos", permissions: ["project.manage"] },
  inventario_lectura: { label: "Solo entrega/inventario", permissions: ["inventory.view"] },
  inventario_admin: { label: "Admin inventario", permissions: ["inventory.view", "inventory.manage"] },
  admin_empresa: { label: "Admin empresa", permissions: permissions.map(item => item.id) },
  super_admin: { label: "Super administrador", permissions: permissions.map(item => item.id) }
};

function esc(value = ""){
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function roleLabel(role){
  return roles[role]?.label || "Personalizado";
}

function permissionList(user){
  if(user.role === "super_admin") return "Todas las funciones";
  const list = permissions.filter(item => user.permissions?.includes(item.id)).map(item => item.label);
  return list.length ? list.join(", ") : "Sin permisos asignados";
}

function permissionChecks(selected = []){
  return permissions.map(item => `<label class="permission-check"><input type="checkbox" value="${esc(item.id)}" ${selected.includes(item.id) ? "checked" : ""}> ${esc(item.label)}</label>`).join("");
}

function userRows(users, activeId){
  return users.map(user => `<tr class="${user.id === activeId ? "active-user-row" : ""}">
    <td><strong>${esc(user.name)}</strong><br><small>${esc(user.email || "Sin correo")}</small></td>
    <td>${esc(user.accountType === "pueblos" ? "Pueblos Originarios" : user.accountType === "independiente" ? "Instalador independiente" : "Empresa")}</td>
    <td>${esc(roleLabel(user.role))}</td>
    <td>${esc(permissionList(user))}</td>
    <td>${esc(user.status || "Activo")}</td>
    <td>${user.accountType === "pueblos" ? `<span class="tag ${user.freeAccess ? "tag-success" : "tag-muted"}">${user.freeAccess ? "Acceso gratuito" : "Sin acceso"}</span>` : ""}</td>
    <td class="project-actions-cell">
      <button data-activate-user="${esc(user.id)}">Usar perfil</button>
      <button data-edit-user="${esc(user.id)}">Editar</button>
      ${user.role === "super_admin" ? "" : `<button class="danger-text" data-delete-user="${esc(user.id)}">Eliminar</button>`}
    </td>
  </tr>`).join("");
}

function defaultFormUser(){
  return { id: "", name: "", email: "", role: "proyectos", status: "Activo", permissions: roles.proyectos.permissions, password: "" };
}

function form(user = defaultFormUser()){
  return `<article class="dashboard-card company-user-form">
    <h4>${user.id ? "Editar usuario" : "Agregar usuario de empresa"}</h4>
    <input id="userId" type="hidden" value="${esc(user.id || "")}">
    <div class="form-grid compact">
      <label>Nombre <input id="userName" value="${esc(user.name || "")}" placeholder="Ej: Juan Perez"></label>
      <label>Correo / usuario <input id="userEmail" value="${esc(user.email || "")}" placeholder="usuario@empresa.cl"></label>
      <label>Contraseña <input id="userPassword" type="password" value="${esc(user.password || "")}" placeholder="${user.id ? "Dejar vacío para mantener la contraseña actual" : "Crear contraseña"}"></label>
      <p class="small note">La contraseña debe ser creada por la empresa o Pueblos Originarios y se usa para el ingreso del usuario.</p>
      <label>Tipo de cuenta
        <select id="userAccountType">
          <option value="empresa" ${!user.accountType || user.accountType === "empresa" ? "selected" : ""}>Empresa</option>
          <option value="independiente" ${user.accountType === "independiente" ? "selected" : ""}>Instalador independiente</option>
          <option value="pueblos" ${user.accountType === "pueblos" ? "selected" : ""}>Pueblos Originarios</option>
        </select>
      </label>
      <label>Rol
        <select id="userRole">
          ${Object.entries(roles).map(([id, role]) => `<option value="${id}" ${user.role === id ? "selected" : ""}>${esc(role.label)}</option>`).join("")}
        </select>
      </label>
      <label>Estado
        <select id="userStatus"><option ${user.status !== "Bloqueado" ? "selected" : ""}>Activo</option><option ${user.status === "Bloqueado" ? "selected" : ""}>Bloqueado</option></select>
      </label>
      <label class="checkbox-label"><input id="userFreeAccess" type="checkbox" ${user.freeAccess ? "checked" : ""} ${user.accountType === "pueblos" ? "" : "disabled"}> Acceso gratuito (solo para Pueblos Originarios)</label>
    </div>
    <div class="permission-grid" id="permissionGrid">${permissionChecks(user.permissions || [])}</div>
    <div class="top-actions wrap-actions"><button id="saveCompanyUser" class="primary-action">Guardar usuario</button><button id="clearUserForm" class="secondary">Nuevo usuario</button></div>
  </article>`;
}

export function render(host, state) {
  const access = ensureCompanyAccess();
  const active = currentCompanyUser();
  if(!hasCompanyPermission("users.manage")){
    host.innerHTML = `<section class="module-window"><div class="result-box danger"><strong>Acceso restringido.</strong><br>Este usuario no puede administrar trabajadores ni permisos.</div></section>`;
    return;
  }
  if(!getApiToken()){
    host.innerHTML = `<section class="module-window"><div class="result-box info"><strong>Falta el token de administrador en esta pestaña.</strong><br>Las cuentas ahora viven en la nube (D1), no en este navegador. Pide al Administrador que te comparta el token y pégalo en Panel de reparación → Cuentas corporativas para poder ver y editar trabajadores.</div></section>`;
    return;
  }
  if(!usuariosModuleState.loaded){
    usuariosModuleState.loaded = true;
    listCompanyUsersFromServer().then(() => render(host, state));
  }

  const companyUsers = access.users.filter(user => user.accountType !== "super_admin");
  const noUsers = companyUsers.length === 0;
  const connectedUsers = companyUsers.filter(user => user.status === "Activo").length;

  host.innerHTML = `
    <section class="module-window company-users-module">
      <section class="dashboard-grid kpi-row company-user-kpis">
        <article><small>Usuarios de empresa y pueblos</small><strong>${companyUsers.length}</strong></article>
        <article><small>Usuarios activos</small><strong>${connectedUsers}</strong></article>
        <article><small>Usuario activo</small><strong>${esc(active?.name || "Super administrador")}</strong></article>
      </section>
      ${noUsers ? `<div class="result-box info"><strong>No hay usuarios de empresa creados.</strong><br>Usa el formulario a continuación para agregar empleados con correo y contraseña. Luego ellos podrán iniciar sesión en Empresa.</div>` : ""}
      ${noUsers ? `<div class="result-box info"><strong>No hay usuarios de empresa creados.</strong><br>Usa el formulario a continuación para agregar empleados con correo y contraseña. Luego ellos podrán iniciar sesión en Empresa.</div>` : ""}
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Empresa</p>
          <h3>Super administrador y usuarios</h3>
          <p>Desde aqui el dueño de la empresa agrega trabajadores y limita lo que cada uno puede ver o administrar.</p>
        </div>
        <div class="project-state-card strong-state">
          <small>Usuario activo</small>
          <strong>${esc(active?.name || "Super administrador")}</strong>
          <span>${esc(roleLabel(active?.role))}</span>
        </div>
      </div>

      <section class="dashboard-grid kpi-row company-user-kpis">
        <article><small>Usuarios</small><strong>${access.users.length}</strong></article>
        <article><small>Super admin</small><strong>${access.users.filter(user => user.role === "super_admin").length}</strong></article>
        <article><small>Pueblos Originarios</small><strong>${access.users.filter(user => user.accountType === "pueblos").length}</strong></article>
        <article><small>Acceso gratuito</small><strong>${access.users.filter(user => user.accountType === "pueblos" && user.freeAccess).length}</strong></article>
        <article><small>Con inventario</small><strong>${access.users.filter(user => user.permissions?.includes("inventory.view")).length}</strong></article>
        <article><small>Con proyectos</small><strong>${access.users.filter(user => user.permissions?.includes("project.manage")).length}</strong></article>
      </section>

      <div id="companyUserFormHost">${form()}</div>

      <article class="dashboard-card">
        <h4>Usuarios de la empresa</h4>
        <div class="data-table-wrap wide-table"><table>
          <thead><tr><th>Usuario</th><th>Tipo</th><th>Rol</th><th>Permisos</th><th>Estado</th><th>Acceso</th><th>Acciones</th></tr></thead>
          <tbody>${userRows(access.users, access.activeUserId)}</tbody>
        </table></div>
      </article>
    </section>`;

  const readForm = () => {
    const role = host.querySelector("#userRole").value;
    const checked = Array.from(host.querySelectorAll("#permissionGrid input:checked")).map(input => input.value);
    return {
      id: host.querySelector("#userId").value,
      name: host.querySelector("#userName").value.trim(),
      email: host.querySelector("#userEmail").value.trim(),
      password: host.querySelector("#userPassword").value,
      accountType: host.querySelector("#userAccountType").value,
      freeAccess: host.querySelector("#userFreeAccess").checked,
      role,
      status: host.querySelector("#userStatus").value,
      permissions: role === "super_admin" ? roles.super_admin.permissions : checked
    };
  };

  const updatePermissionGrid = (roleValue) => {
    const preset = roles[roleValue]?.permissions || [];
    host.querySelector("#permissionGrid").innerHTML = permissionChecks(preset);
  };

  host.querySelector("#userRole")?.addEventListener("change", event => {
    updatePermissionGrid(event.target.value);
  });

  host.querySelector("#userAccountType")?.addEventListener("change", event => {
    const isPueblos = event.target.value === "pueblos";
    const freeAccessLabel = host.querySelector("label[for=freeAccessNote]");
    if(isPueblos){
      host.querySelector("#userFreeAccess").disabled = false;
    } else {
      host.querySelector("#userFreeAccess").checked = false;
      host.querySelector("#userFreeAccess").disabled = true;
    }
  });

  host.querySelector("#saveCompanyUser")?.addEventListener("click", async () => {
    const user = readForm();
    if(!user.name) return alert("Ingresa el nombre del usuario.");
    if(!user.email) return alert("Ingresa el correo del usuario.");
    if(!user.id && !user.password) return alert("Crea una contraseña para el nuevo usuario.");
    if(user.role !== "super_admin" && !user.permissions.length) return alert("Asigna al menos un permiso.");
    const result = await upsertCompanyUser(user);
    if(!result.ok) return alert(result.error || "No se pudo guardar el usuario.");
    await listCompanyUsersFromServer();
    window.dispatchEvent(new Event("giae:admin-updated"));
    render(host, state);
  });

  host.querySelector("#clearUserForm")?.addEventListener("click", () => {
    host.querySelector("#companyUserFormHost").innerHTML = form();
    render(host, state);
  });

  host.querySelectorAll("[data-activate-user]").forEach(button => button.addEventListener("click", () => {
    setActiveCompanyUser(button.dataset.activateUser);
    window.dispatchEvent(new Event("giae:admin-updated"));
    render(host, state);
  }));

  host.querySelectorAll("[data-edit-user]").forEach(button => button.addEventListener("click", () => {
    const user = ensureCompanyAccess().users.find(item => item.id === button.dataset.editUser);
    if(!user) return;
    host.querySelector("#userId").value = user.id;
    host.querySelector("#userName").value = user.name || "";
    host.querySelector("#userEmail").value = user.email || "";
    host.querySelector("#userRole").value = user.role || "proyectos";
    host.querySelector("#userStatus").value = user.status || "Activo";
    host.querySelector("#permissionGrid").innerHTML = permissionChecks(user.permissions || []);
    // preserve accountType and freeAccess when editing
    if(host.querySelector("#userAccountType")){
      host.querySelector("#userAccountType").value = user.accountType || "empresa";
    }
    if(host.querySelector("#userFreeAccess")){
      host.querySelector("#userFreeAccess").checked = Boolean(user.freeAccess);
      host.querySelector("#userFreeAccess").disabled = (user.accountType !== "pueblos");
    }
  }));

  host.querySelectorAll("[data-delete-user]").forEach(button => button.addEventListener("click", async () => {
    if(confirm("Desactivar este usuario de empresa?")){
      const result = await deleteCompanyUser(button.dataset.deleteUser);
      if(!result.ok) return alert(result.error || "No se pudo desactivar el usuario.");
      window.dispatchEvent(new Event("giae:admin-updated"));
      render(host, state);
    }
  }));
}
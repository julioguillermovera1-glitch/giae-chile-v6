import { ensureCompanyAccess, currentCompanyUser, hasCompanyPermission, setActiveCompanyUser, upsertCompanyUser, deleteCompanyUser } from "../../core/store.js";

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
    <td>${esc(roleLabel(user.role))}</td>
    <td>${esc(permissionList(user))}</td>
    <td>${esc(user.status || "Activo")}</td>
    <td class="project-actions-cell">
      <button data-activate-user="${esc(user.id)}">Usar perfil</button>
      <button data-edit-user="${esc(user.id)}">Editar</button>
      ${user.role === "super_admin" ? "" : `<button class="danger-text" data-delete-user="${esc(user.id)}">Eliminar</button>`}
    </td>
  </tr>`).join("");
}

function defaultFormUser(){
  return { id: "", name: "", email: "", role: "proyectos", status: "Activo", permissions: roles.proyectos.permissions };
}

function form(user = defaultFormUser()){
  return `<article class="dashboard-card company-user-form">
    <h4>${user.id ? "Editar usuario" : "Agregar usuario de empresa"}</h4>
    <input id="userId" type="hidden" value="${esc(user.id || "")}">
    <div class="form-grid compact">
      <label>Nombre <input id="userName" value="${esc(user.name || "")}" placeholder="Ej: Juan Perez"></label>
      <label>Correo / usuario <input id="userEmail" value="${esc(user.email || "")}" placeholder="usuario@empresa.cl"></label>
      <label>Rol
        <select id="userRole">
          ${Object.entries(roles).map(([id, role]) => `<option value="${id}" ${user.role === id ? "selected" : ""}>${esc(role.label)}</option>`).join("")}
        </select>
      </label>
      <label>Estado
        <select id="userStatus"><option ${user.status !== "Bloqueado" ? "selected" : ""}>Activo</option><option ${user.status === "Bloqueado" ? "selected" : ""}>Bloqueado</option></select>
      </label>
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

  host.innerHTML = `
    <section class="module-window company-users-module">
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
        <article><small>Con inventario</small><strong>${access.users.filter(user => user.permissions?.includes("inventory.view")).length}</strong></article>
        <article><small>Con proyectos</small><strong>${access.users.filter(user => user.permissions?.includes("project.manage")).length}</strong></article>
      </section>

      <div id="companyUserFormHost">${form()}</div>

      <article class="dashboard-card">
        <h4>Usuarios de la empresa</h4>
        <div class="data-table-wrap wide-table"><table>
          <thead><tr><th>Usuario</th><th>Rol</th><th>Permisos</th><th>Estado</th><th>Acciones</th></tr></thead>
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
      role,
      status: host.querySelector("#userStatus").value,
      permissions: role === "super_admin" ? roles.super_admin.permissions : checked
    };
  };

  host.querySelector("#userRole")?.addEventListener("change", event => {
    const preset = roles[event.target.value]?.permissions || [];
    host.querySelector("#permissionGrid").innerHTML = permissionChecks(preset);
  });

  host.querySelector("#saveCompanyUser")?.addEventListener("click", () => {
    const user = readForm();
    if(!user.name) return alert("Ingresa el nombre del usuario.");
    if(user.role !== "super_admin" && !user.permissions.length) return alert("Asigna al menos un permiso.");
    upsertCompanyUser(user);
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
  }));

  host.querySelectorAll("[data-delete-user]").forEach(button => button.addEventListener("click", () => {
    if(confirm("Eliminar este usuario de empresa?")){
      deleteCompanyUser(button.dataset.deleteUser);
      window.dispatchEvent(new Event("giae:admin-updated"));
      render(host, state);
    }
  }));
}
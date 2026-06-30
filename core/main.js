import { modules, menuGroups } from "./moduleRegistry.js";
import { restore, setProfile, clearProfile, state, persist, exportProjectFile, importProjectFile, saveCurrentProjectToLibrary } from "./store.js";

const loginView = document.querySelector("#loginView");
const platformView = document.querySelector("#platformView");
const menu = document.querySelector("#moduleMenu");
const host = document.querySelector("#windowHost");
const workspaceTabs = document.querySelector("#workspaceTabs");
const openWindows = new Map();
let activeWindowId = null;
const title = document.querySelector("#workspaceTitle");
const activeProfile = document.querySelector("#activeProfile");
const projectStatusLine = document.querySelector("#projectStatusLine");

restore();
applyBranding();

if (state.profile) openPlatform();
window.GIAE = window.GIAE || {};
window.GIAE.openModule = openModule;
window.GIAE.refreshActiveModule = refreshActiveModule;

window.addEventListener("giae:admin-updated", () => { applyBranding(); renderMenu(); });

document.querySelectorAll("[data-profile]").forEach(button => {
  button.addEventListener("click", () => {
    setProfile(button.dataset.profile);
    markSession(button.dataset.profile);
    openPlatform();
  });
});

document.querySelector("#saveProjectBtn").addEventListener("click", () => {
  saveCurrentProjectToLibrary();
  alert("Proyecto guardado en la biblioteca local de este navegador.");
});

const logoutBtn = document.querySelector("#logoutBtn");
logoutBtn.addEventListener("click", () => {
  closeSession();
  clearProfile();
  platformView.classList.add("hidden");
  loginView.classList.remove("hidden");
  activeProfile.textContent = "Sin sesión";
  host.innerHTML = "";
  openWindows.clear();
  activeWindowId = null;
  title.textContent = "Inicio";
  menu.innerHTML = "";
  if(workspaceTabs) workspaceTabs.innerHTML = "";
  updateStatusLine();
  refreshActiveModule();
});

document.querySelector("#exportBtn").addEventListener("click", () => {
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

window.GIAE.importProjectFile = payload => {
  importProjectFile(payload);
  updateStatusLine();
  if(window.GIAE?.openModule) window.GIAE.openModule("proyecto");
};

function openPlatform() {
  applyBranding();
  loginView.classList.add("hidden");
  platformView.classList.remove("hidden");
  activeProfile.textContent = profileLabel(state.profile);
  document.querySelector("#saveProjectBtn").classList.toggle("hidden", state.profile === "aula");
  document.querySelector("#exportBtn").classList.toggle("hidden", state.profile === "aula");
  renderMenu();
  updateStatusLine();
  const first = availableModules()[0];
  openModule(first?.id || "proyecto");
}

function availableModules(){
  return modules.filter(module => {
    const allowed = !module.profiles || module.profiles.includes(state.profile);
    const enabled = state.admin?.enabledModules?.[module.id] !== false;
    return allowed && enabled;
  });
}

function renderMenu() {
  const available = availableModules();
  const grouped = menuGroups.map(group => ({
    ...group,
    modules: available.filter(module => module.group === group.id)
  })).filter(group => group.modules.length);

  menu.innerHTML = grouped.map((group, index) => `
    <section class="menu-group ${index === 0 ? "open" : ""}" data-group="${group.id}">
      <button class="menu-group-title" type="button" data-toggle-group="${group.id}" aria-expanded="${index === 0 ? "true" : "false"}">
        <span>${group.label}</span><span class="menu-chevron">▾</span>
      </button>
      <div class="menu-group-body">
        ${group.modules.map(module => `<button class="menu-button" data-module="${module.id}">${module.label}</button>`).join("")}
      </div>
    </section>
  `).join("");

  menu.onclick = event => {
    const toggle = event.target.closest("[data-toggle-group]");
    if (toggle) {
      const group = toggle.closest(".menu-group");
      const isOpen = group.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      return;
    }
    const button = event.target.closest("[data-module]");
    if (!button) return;
    const group = button.closest(".menu-group");
    if (group && !group.classList.contains("open")) group.classList.add("open");
    openModule(button.dataset.module);
  };
}

async function openModule(moduleId) {
  const selected = availableModules().find(module => module.id === moduleId);
  if (!selected) return;

  if (openWindows.has(moduleId)) {
    activateWindow(moduleId);
    return;
  }

  const windowEl = document.createElement("article");
  windowEl.className = "internal-window loading";
  windowEl.dataset.windowId = moduleId;
  windowEl.innerHTML = `
    <header class="internal-window-titlebar">
      <div>
        <span class="window-caption">Módulo</span>
        <strong>${selected.label}</strong>
      </div>
      <div class="window-actions">
        <button type="button" class="window-control" data-window-action="minimize" aria-label="Minimizar">–</button>
        <button type="button" class="window-control" data-window-action="close" aria-label="Cerrar">×</button>
      </div>
    </header>
    <section class="internal-window-body">
      <div class="module-window"><p>Cargando ${selected.label}...</p></div>
    </section>`;

  host.appendChild(windowEl);
  openWindows.set(moduleId, { element: windowEl, module: selected });
  bindWindowControls(windowEl, moduleId);
  renderWorkspaceTabs();
  activateWindow(moduleId);

  const body = windowEl.querySelector(".internal-window-body");
  const module = await import(selected.path + `?v=${Date.now()}`);
  body.innerHTML = "";
  module.render(body, state);
  windowEl.classList.remove("loading");
  updateStatusLine();
  renderWorkspaceTabs();
}

function bindWindowControls(windowEl, moduleId){
  windowEl.addEventListener("mousedown", () => activateWindow(moduleId));
  windowEl.querySelectorAll("[data-window-action]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const action = button.dataset.windowAction;
      if(action === "close") closeWindow(moduleId);
      if(action === "minimize") minimizeWindow(moduleId);
    });
  });
}

function activateWindow(moduleId){
  const record = openWindows.get(moduleId);
  if(!record) return;
  activeWindowId = moduleId;
  openWindows.forEach((item, id) => {
    item.element.classList.toggle("active", id === moduleId);
    item.element.classList.remove("minimized");
  });
  const selected = record.module;
  title.textContent = selected.label;
  document.querySelectorAll(".menu-button").forEach(button => {
    button.classList.toggle("active", button.dataset.module === moduleId);
  });
  updateStatusLine();
  renderWorkspaceTabs();
}

function minimizeWindow(moduleId){
  const record = openWindows.get(moduleId);
  if(!record) return;
  record.element.classList.toggle("minimized");
  if(record.element.classList.contains("minimized")){
    title.textContent = "Escritorio";
    document.querySelectorAll(".menu-button").forEach(button => button.classList.remove("active"));
  } else {
    activateWindow(moduleId);
  }
  renderWorkspaceTabs();
}

function closeWindow(moduleId){
  const record = openWindows.get(moduleId);
  if(!record) return;
  record.element.remove();
  openWindows.delete(moduleId);
  if(activeWindowId === moduleId){
    const next = Array.from(openWindows.keys()).pop();
    if(next) activateWindow(next);
    else {
      activeWindowId = null;
      title.textContent = "Escritorio";
      document.querySelectorAll(".menu-button").forEach(button => button.classList.remove("active"));
    }
  }
  updateStatusLine();
  renderWorkspaceTabs();
}


function renderWorkspaceTabs(){
  if(!workspaceTabs) return;
  const entries = Array.from(openWindows.entries());
  workspaceTabs.classList.toggle("hidden", entries.length === 0);
  workspaceTabs.innerHTML = entries.map(([id, record]) => `
    <button type="button" class="workspace-tab ${id === activeWindowId ? "active" : ""} ${record.element.classList.contains("minimized") ? "minimized" : ""}" data-tab-window="${id}">
      <span>${record.module.label}</span>
      <small>${record.element.classList.contains("minimized") ? "Minimizado" : id === activeWindowId ? "Activo" : "Abierto"}</small>
    </button>
  `).join("");
  workspaceTabs.querySelectorAll("[data-tab-window]").forEach(button => {
    button.addEventListener("click", () => activateWindow(button.dataset.tabWindow));
  });
}

function refreshActiveModule(){
  if(!activeWindowId) return;
  const record = openWindows.get(activeWindowId);
  if(!record) return;
  const body = record.element.querySelector(".internal-window-body");
  import(record.module.path + `?v=${Date.now()}`).then(module => {
    body.innerHTML = "";
    module.render(body, state);
    updateStatusLine();
    renderWorkspaceTabs();
  });
}

function profileLabel(profile) {
  const labels = {
    independiente: "Instalador independiente",
    empresa: "Empresa",
    estudiante: "Estudiante",
    administrador: "Administrador",
    aula: "Aula Técnica - Acceso libre"
  };
  return labels[profile] || "Sin sesión";
}

function markSession(profile){
  state.admin = state.admin || {};
  state.admin.sessions = state.admin.sessions || [];
  const name = profileLabel(profile);
  const now = new Date().toLocaleString("es-CL");
  const existing = state.admin.sessions.find(session => session.profile === profile);
  if(existing){
    existing.status = "Conectado";
    existing.lastSeen = now;
  } else {
    state.admin.sessions.push({ name, profile, status: "Conectado", lastSeen: now });
  }
  persist();
}

function closeSession(){
  state.admin = state.admin || {};
  state.admin.sessions = state.admin.sessions || [];
  const current = state.admin.sessions.find(session => session.profile === state.profile);
  if(current){
    current.status = "Desconectado";
    current.lastSeen = new Date().toLocaleString("es-CL");
  }
  persist();
}


function applyBranding(){
  const brand = state.companyBrand || state.admin?.company?.brand || {};
  const root = document.documentElement;
  if(brand.primaryColor) root.style.setProperty("--brand-primary", brand.primaryColor);
  if(brand.accentColor) root.style.setProperty("--accent", brand.accentColor);
  if(brand.backgroundColor) root.style.setProperty("--bg", brand.backgroundColor);
  const logoNodes = document.querySelectorAll("[data-brand-logo]");
  logoNodes.forEach(node => {
    if(brand.logoData){
      node.innerHTML = `<img src="${brand.logoData}" alt="Logo empresa">`;
    } else {
      node.innerHTML = defaultLogoMarkup();
    }
  });
  const nameNodes = document.querySelectorAll("[data-brand-name]");
  nameNodes.forEach(node => node.textContent = brand.name || state.admin?.company?.name || "GIAE Chile");
}

function updateStatusLine(){
  if(!projectStatusLine) return;
  const p = state.currentProject || {};
  const name = p.name || p.nombre || p.projectName || "sin proyecto cargado";
  const company = state.admin?.company?.name || p.company || state.companyBrand?.name || "GIAE Chile";
  const pct = p.progress?.engineering ?? 0;
  const saved = p.updatedAt || "sin guardar";
  projectStatusLine.textContent = `Proyecto activo: ${name} · ${pct}% avance · Último guardado: ${saved} · Empresa: ${company} · Normativa: RIC · IEC eléctrica · DS N°8`;
}

function defaultLogoMarkup(){
  return `<svg viewBox="0 0 120 120" role="img" aria-hidden="true" class="giae-monogram">
    <rect x="12" y="12" width="96" height="96" rx="18" fill="none" stroke="currentColor" stroke-width="8"/>
    <path d="M76 39H51c-13 0-23 10-23 23s10 23 23 23h25V66H58" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M84 85V39" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}

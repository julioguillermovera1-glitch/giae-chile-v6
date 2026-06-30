import { modules } from "./moduleRegistry.js";
import { restore, setProfile, clearProfile, state, persist } from "./store.js";

const loginView = document.querySelector("#loginView");
const platformView = document.querySelector("#platformView");
const menu = document.querySelector("#moduleMenu");
const host = document.querySelector("#windowHost");
const title = document.querySelector("#workspaceTitle");
const activeProfile = document.querySelector("#activeProfile");

restore();
applyBranding();

if (state.profile) openPlatform();

window.addEventListener("giae:admin-updated", () => { applyBranding(); renderMenu(); });

document.querySelectorAll("[data-profile]").forEach(button => {
  button.addEventListener("click", () => {
    setProfile(button.dataset.profile);
    markSession(button.dataset.profile);
    openPlatform();
  });
});

document.querySelector("#saveProjectBtn").addEventListener("click", () => {
  persist();
  alert("Proyecto guardado localmente en este navegador.");
});

const logoutBtn = document.querySelector("#logoutBtn");
logoutBtn.addEventListener("click", () => {
  closeSession();
  clearProfile();
  platformView.classList.add("hidden");
  loginView.classList.remove("hidden");
  activeProfile.textContent = "Sin sesión";
  host.innerHTML = "";
  title.textContent = "Inicio";
  menu.innerHTML = "";
});

document.querySelector("#exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.currentProject, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "giae-proyecto.json";
  link.click();
  URL.revokeObjectURL(url);
});

function openPlatform() {
  applyBranding();
  loginView.classList.add("hidden");
  platformView.classList.remove("hidden");
  activeProfile.textContent = profileLabel(state.profile);
  renderMenu();
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
  menu.innerHTML = available.map(module => `
    <button class="menu-button" data-module="${module.id}">${module.label}</button>
  `).join("");
  menu.onclick = event => {
    const button = event.target.closest("[data-module]");
    if (!button) return;
    openModule(button.dataset.module);
  };
}

async function openModule(moduleId) {
  const selected = availableModules().find(module => module.id === moduleId);
  if (!selected) return;
  title.textContent = selected.label;
  document.querySelectorAll(".menu-button").forEach(button => {
    button.classList.toggle("active", button.dataset.module === moduleId);
  });
  host.innerHTML = `<div class="module-window"><p>Cargando ${selected.label}...</p></div>`;
  const module = await import(selected.path + `?v=${Date.now()}`);
  module.render(host, state);
}

function profileLabel(profile) {
  const labels = {
    independiente: "Instalador independiente",
    empresa: "Empresa",
    estudiante: "Estudiante",
    administrador: "Administrador"
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

function defaultLogoMarkup(){
  return `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><rect x="10" y="10" width="100" height="100" rx="24" fill="currentColor"/><path d="M30 72h25l-5 28 40-52H65l7-28z" fill="#fff"/></svg>`;
}

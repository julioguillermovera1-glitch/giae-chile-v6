import { modules } from "./moduleRegistry.js";
import { restore, setProfile, clearProfile, state, persist } from "./store.js";

const loginView = document.querySelector("#loginView");
const platformView = document.querySelector("#platformView");
const menu = document.querySelector("#moduleMenu");
const host = document.querySelector("#windowHost");
const title = document.querySelector("#workspaceTitle");
const activeProfile = document.querySelector("#activeProfile");

restore();
renderMenu();

if (state.profile) openPlatform();

document.querySelectorAll("[data-profile]").forEach(button => {
  button.addEventListener("click", () => {
    setProfile(button.dataset.profile);
    openPlatform();
  });
});

document.querySelector("#saveProjectBtn").addEventListener("click", () => {
  persist();
  alert("Proyecto guardado localmente en este navegador.");
});


const logoutBtn = document.querySelector("#logoutBtn");
logoutBtn.addEventListener("click", () => {
  clearProfile();
  platformView.classList.add("hidden");
  loginView.classList.remove("hidden");
  activeProfile.textContent = "Sin sesión";
  host.innerHTML = "";
  title.textContent = "Inicio";
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
  loginView.classList.add("hidden");
  platformView.classList.remove("hidden");
  activeProfile.textContent = profileLabel(state.profile);
  openModule("proyecto");
}

function renderMenu() {
  menu.innerHTML = modules.map(module => `
    <button class="menu-button" data-module="${module.id}">${module.label}</button>
  `).join("");
  menu.addEventListener("click", event => {
    const button = event.target.closest("[data-module]");
    if (!button) return;
    openModule(button.dataset.module);
  });
}

async function openModule(moduleId) {
  const selected = modules.find(module => module.id === moduleId);
  if (!selected) return;
  title.textContent = selected.label;
  document.querySelectorAll(".menu-button").forEach(button => {
    button.classList.toggle("active", button.dataset.module === moduleId);
  });
  host.innerHTML = `<div class="module-window"><p>Cargando ${selected.label}...</p></div>`;
  const module = await import(selected.path);
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

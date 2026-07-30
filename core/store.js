import { calculateLoadProject } from "./engineering/loadEngine.js";
import { calculateElectricalProject } from "./engineering/electricalEngine.js";
import { calculatePanelProject } from "./engineering/panelEngine.js";
import { calculateConnectionProject } from "./engineering/connectionEngine.js";
import { calculateDocumentationProject } from "./documentationEngine.js";
import { runProjectEngine, createProjectRevision } from "./projectEngine.js";
import { calculateCommercialProject } from "./commercial/budgetEngine.js";
import { runIntegralAudit } from "./audit/integralAuditEngine.js";
import { evaluateGuidedWorkflow } from "./workflow/guidedWorkflowEngine.js";
import { ensureCloudWorkspace } from "./cloud/cloudWorkspaceEngine.js";
const STORAGE_KEY = "giae_chile_v1_workspace";
const LIBRARY_KEY = "giae_chile_v1_project_library";
// La sesion (quien esta conectado en ESTA pestana) se guarda aparte, en
// sessionStorage, para que cada ventana/pestana pueda mantener su propio
// inicio de sesion sin cerrar la de las demas. Los datos compartidos
// (usuarios creados, proyectos, configuracion) siguen en localStorage.
const SESSION_KEY = "giae_chile_v1_tab_session";

function applyTabSession(){
  const raw = sessionStorage.getItem(SESSION_KEY);
  if(!raw){
    // Pestana nueva (o la app instalada se cerro y volvio a abrir): si no hay
    // internet, se restaura la ultima sesion ya validada en este dispositivo en
    // vez de dejar a la persona bloqueada sin poder trabajar. Con internet,
    // siempre se pide iniciar sesion de nuevo (por si la cuenta cambio de estado).
    state.profile = null;
    state.offlineSession = false;
    if(!isOnline()){
      const restored = restoreLastValidatedSession();
      if(restored){
        state.profile = restored.accountType === "super_admin" ? "administrador" : restored.accountType;
        state.offlineSession = true;
        saveTabSession();
      }
    }
    return;
  }
  try{
    const session = JSON.parse(raw);
    state.profile = session.profile ?? null;
    state.offlineSession = Boolean(session.offlineSession);
    if(state.companyAccess && session.activeUserId) state.companyAccess.activeUserId = session.activeUserId;
  }catch{
    state.profile = null;
    state.offlineSession = false;
  }
}

function saveTabSession(){
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    profile: state.profile ?? null,
    activeUserId: state.companyAccess?.activeUserId ?? null,
    offlineSession: Boolean(state.offlineSession)
  }));
}

function clearTabSession(){
  sessionStorage.removeItem(SESSION_KEY);
}
const ALL_COMPANY_PERMISSIONS = ["project.manage", "inventory.view", "inventory.manage", "users.manage", "docs.view", "budget.view"];

// --- Ingreso real contra el Worker/D1 (en vez de una copia local) ---
const API_BASE = "/api/giae";
// Token de escritura del Worker (el mismo GIAE_API_TOKEN configurado como secreto de
// Cloudflare). Vive en sessionStorage, no en localStorage, para no dejarlo guardado
// de forma permanente en el dispositivo. Lo pega el Administrador una vez por pestana
// en el panel de Cuentas corporativas.
const API_TOKEN_KEY = "giae_chile_v1_api_token";
// Ultima sesion que se verifico con exito contra el servidor. Permite seguir
// trabajando sin conexion despues de haber iniciado sesion una vez; nunca guarda la
// contrasena, solo los datos ya verificados (nombre, correo, tipo, permisos).
const LAST_SESSION_KEY = "giae_chile_v1_last_validated_session";

function apiUrl(path){ return API_BASE + path; }

export function getApiToken(){
  try{ return sessionStorage.getItem(API_TOKEN_KEY) || ""; }catch{ return ""; }
}

export function setApiToken(token){
  sessionStorage.setItem(API_TOKEN_KEY, String(token || "").trim());
}

export function clearApiToken(){
  sessionStorage.removeItem(API_TOKEN_KEY);
}

function rememberValidatedSession(user){
  localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({ user, validatedAt: Date.now() }));
}

function getLastValidatedSession(){
  try{
    const raw = localStorage.getItem(LAST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch{ return null; }
}

function isOnline(){
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

/**
 * Sube al Worker los paquetes de proyecto que quedaron pendientes en la cola
 * local (ver core/cloud/cloudWorkspaceEngine.js) mientras no habia conexion.
 * Requiere el token de administrador, igual que el resto de las escrituras -
 * hasta que exista autenticacion por usuario real (Fase 6), sincronizar
 * depende de que esta pestana tenga el token cargado.
 */
export async function flushSyncQueue(){
  if(!isOnline()) return { ok: false, error: "Sin conexión." };
  const token = getApiToken();
  if(!token) return { ok: false, error: "Falta el token de administrador para sincronizar." };
  const cloud = ensureCloudWorkspace(state);
  const pending = cloud.syncQueue.filter(item => item.status === "pendiente");
  let synced = 0;
  for(const item of pending){
    let response;
    try{
      response = await fetch(apiUrl(`/projects/${encodeURIComponent(item.projectId)}/sync`), {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(item.envelope)
      });
    }catch{
      break; // sigue sin conexion real (navigator.onLine puede mentir) - se reintenta despues
    }
    const payload = await response.json().catch(() => ({}));
    if(response.ok && payload.ok){
      item.status = "sincronizado";
      synced++;
    }
  }
  persist();
  return { ok: true, synced, pending: cloud.syncQueue.filter(item => item.status === "pendiente").length };
}

if(typeof window !== "undefined"){
  window.addEventListener("online", () => { flushSyncQueue().catch(() => {}); });
}

function nowStamp(){
  return new Date().toLocaleString("es-CL");
}

function createProjectId(){
  return "GIAE-" + new Date().toISOString().slice(0,10).replaceAll("-", "") + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
}

function defaultProject(){
  const created = nowStamp();
  return {
    id: createProjectId(),
    version: "1.0-alpha.043",
    name: "Proyecto sin nombre",
    code: "",
    client: "",
    installer: "",
    company: "",
    responsible: "",
    address: "",
    commune: "",
    region: "",
    supplyType: "monofasico",
    voltage: "220 V",
    distributor: "cge",
    serviceType: "instalacion-nueva",
    installedPowerKw: 0,
    demandPowerKw: 0,
    status: "En desarrollo",
    progress: {
      engineering: 0,
      documentation: 0,
      normative: "Pendiente"
    },
    loads: [],
    loadEngine: null,
    electricalEngine: null,
    loadBoard: [],
    protections: [],
    conductors: [],
    conduits: [],
    engineeringMaterials: [],
    phaseBalance: null,
    panelEngine: null,
    panel: null,
    panelMaterials: [],
    grounding: null,
    connection: null,
    connectionEngine: null,
    unilineal: null,
    guidedWorkflow: null,
    documentation: [],
    documentationEngine: null,
    budget: [],
    commercialEngine: null,
    commercialSettings: null,
    integralAudit: null,
    audit: [],
    checklist: [],
    history: [
      { date: created, action: "Proyecto activo creado", module: "Sistema" }
    ],
    revisions: [],
    gpe: null,
    createdAt: created,
    updatedAt: created
  };
}

export const state = {
  profile: null,
  currentProject: defaultProject(),
  projectLibrary: [],
  companyBrand: {
    name: "GIAE Chile",
    logoData: "",
    primaryColor: "#102033",
    accentColor: "#1456a0",
    backgroundColor: "#eef3f8",
    templateStyle: "tecnico"
  },
  normativePolicy: {
    allowedSources: ["RIC", "IEC", "DS8"],
    mode: "estricto",
    noInventar: true
  },
  // Se llena con la respuesta real del Worker al iniciar sesion o al listar
  // cuentas - ya no se crea una cuenta de administrador local por defecto aqui,
  // eso lo hace el Worker contra D1 la primera vez que arranca sin ninguna.
  companyAccess: {
    activeUserId: null,
    users: []
  }
};


/**
 * Verifica correo/contrasena contra el Worker (D1), no contra una copia local.
 * Devuelve { ok, user } en exito, { ok:false, error } si las credenciales no
 * sirven, o { ok:false, offline:true, error } si no se pudo ni siquiera
 * consultar el servidor (sin internet, Worker caido).
 */
export async function verifyCompanyUserCredentials(email, password, mode){
  let response;
  try{
    response = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, mode })
    });
  }catch{
    return { ok: false, offline: true, error: "No se pudo conectar con el servidor. Revisa tu conexión a internet." };
  }
  let payload;
  try{ payload = await response.json(); }catch{ payload = {}; }
  if(!response.ok || !payload.ok){
    return { ok: false, offline: false, error: payload.error || "Credenciales inválidas o usuario inactivo." };
  }
  const access = ensureCompanyAccess();
  access.users = [payload.user];
  access.activeUserId = payload.user.id;
  rememberValidatedSession(payload.user);
  persist();
  return { ok: true, user: payload.user };
}

/**
 * Restaura, sin red, la ultima sesion que alguna vez se valido con exito en
 * este dispositivo (nunca la contrasena). Se usa solo cuando esta pestana no
 * tiene sesion propia todavia y no hay conexion para verificar una nueva.
 * Devuelve el usuario restaurado o null si nunca hubo una sesion valida aqui.
 */
export function restoreLastValidatedSession(){
  const cached = getLastValidatedSession();
  if(!cached?.user) return null;
  const access = ensureCompanyAccess();
  access.users = [cached.user];
  access.activeUserId = cached.user.id;
  return cached.user;
}

export function ensureCompanyAccess(){
  state.companyAccess = state.companyAccess || {};
  state.companyAccess.users = Array.isArray(state.companyAccess.users) ? state.companyAccess.users : [];
  // Cuentas ya cargadas (via login o listado del servidor) que por alguna razon
  // llegaron sin permisos quedan con el menu vacio y sin forma de arreglarlo
  // desde la interfaz - se completan aqui mismo, igual que antes.
  state.companyAccess.users.forEach(user => {
    if(user.accountType !== "super_admin" && (!Array.isArray(user.permissions) || user.permissions.length === 0)){
      user.permissions = ALL_COMPANY_PERMISSIONS;
    }
  });
  if(!state.companyAccess.users.some(user => user.id === state.companyAccess.activeUserId)){
    state.companyAccess.activeUserId = state.companyAccess.users[0]?.id || null;
  }
  return state.companyAccess;
}

export function currentCompanyUser(){
  const access = ensureCompanyAccess();
  return access.users.find(user => user.id === access.activeUserId) || access.users[0];
}

export function hasCompanyPermission(permission){
  const user = currentCompanyUser();
  if(!permission) return true;
  if(user?.role === "super_admin" || user?.accountType === "super_admin") return true;
  return Array.isArray(user?.permissions) && user.permissions.includes(permission);
}

export function setActiveCompanyUser(userId){
  const access = ensureCompanyAccess();
  if(access.users.some(user => user.id === userId)) access.activeUserId = userId;
  persist();
  saveTabSession();
}

/**
 * Crea o edita una cuenta contra el Worker (D1). Requiere el token de
 * administrador (ver getApiToken/setApiToken) - sin el, el Worker rechaza la
 * escritura por diseno. Devuelve { ok, user } o { ok:false, error }.
 */
export async function upsertCompanyUser(user){
  const token = getApiToken();
  if(!token){
    return { ok: false, error: "Falta el token de administrador para esta acción. Pídelo al Administrador y pégalo en Cuentas corporativas." };
  }
  let response;
  try{
    response = await fetch(apiUrl("/auth/users"), {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(user)
    });
  }catch{
    return { ok: false, offline: true, error: "No se pudo conectar con el servidor. Revisa tu conexión a internet." };
  }
  let payload;
  try{ payload = await response.json(); }catch{ payload = {}; }
  if(!response.ok || !payload.ok){
    return { ok: false, error: payload.error || "No se pudo guardar la cuenta." };
  }
  return { ok: true, user: payload.user };
}

/** Trae el listado real de cuentas desde el Worker y actualiza la copia local usada por las tablas. */
export async function listCompanyUsersFromServer(){
  const token = getApiToken();
  if(!token){
    return { ok: false, error: "Falta el token de administrador para ver las cuentas." };
  }
  let response;
  try{
    response = await fetch(apiUrl("/auth/users"), { headers: { authorization: `Bearer ${token}` } });
  }catch{
    return { ok: false, offline: true, error: "No se pudo conectar con el servidor. Revisa tu conexión a internet." };
  }
  let payload;
  try{ payload = await response.json(); }catch{ payload = {}; }
  if(!response.ok || !payload.ok){
    return { ok: false, error: payload.error || "No se pudo obtener el listado de cuentas." };
  }
  const access = ensureCompanyAccess();
  const keepActive = access.activeUserId;
  access.users = payload.users;
  access.activeUserId = payload.users.some(user => user.id === keepActive) ? keepActive : (payload.users[0]?.id || null);
  persist();
  return { ok: true, users: payload.users };
}

/** Baja logica: desactiva la cuenta en el servidor (no se borra el historial). */
export async function deleteCompanyUser(userId){
  const access = ensureCompanyAccess();
  const user = access.users.find(item => item.id === userId);
  if(!user || user.accountType === "super_admin") return { ok: false, error: "No se puede eliminar esta cuenta." };
  const result = await upsertCompanyUser({ email: user.email, name: user.name, accountType: user.accountType, status: "Inactivo", permissions: user.permissions, role: user.role });
  if(result.ok) await listCompanyUsersFromServer();
  return result;
}
function normalizeProject(project){
  const base = defaultProject();
  const merged = { ...base, ...(project || {}) };
  merged.id = merged.id || createProjectId();
  merged.name = merged.name || merged.nombre || merged.projectName || "Proyecto sin nombre";
  merged.code = merged.code || "";
  merged.client = merged.client || "";
  merged.installer = merged.installer || "";
  merged.company = merged.company || "";
  merged.address = merged.address || "";
  merged.commune = merged.commune || "";
  merged.region = merged.region || "";
  merged.supplyType = merged.supplyType || "monofasico";
  merged.voltage = merged.supplyType === "trifasico" ? "380/220 V" : (merged.voltage || "220 V");
  merged.distributor = merged.distributor || "cge";
  merged.loads = Array.isArray(merged.loads) ? merged.loads : [];
  merged.history = Array.isArray(merged.history) ? merged.history : base.history;
  merged.checklist = calculateChecklist(merged);
  merged.updatedAt = merged.updatedAt || nowStamp();
  return merged;
}

export function setProfile(profile) {
  state.profile = profile;
  state.offlineSession = false;
  persist();
  saveTabSession();
}

export function clearProfile() {
  state.profile = null;
  state.offlineSession = false;
  persist();
  clearTabSession();
}

export function updateProject(patch, meta = {}) {
  const beforeName = state.currentProject?.name || "Proyecto sin nombre";
  state.currentProject = normalizeProject({ ...state.currentProject, ...patch, updatedAt: nowStamp() });
  addHistory(meta.action || `Datos del proyecto actualizados${beforeName !== state.currentProject.name ? "" : ""}`, meta.module || "Proyecto", false);
  recalculateProject();
  persist();
}

export function newProject(seed = {}){
  state.currentProject = normalizeProject({ ...defaultProject(), ...seed });
  addHistory("Nuevo proyecto activo iniciado", "Proyecto", false);
  persist();
}

export function addLoad(load) {
  const normalized = {
    id: "C" + String((state.currentProject.loads || []).length + 1).padStart(2, "0"),
    name: load.name || load.description || "Carga sin nombre",
    powerW: Number(load.powerW || load.power || load.watts || 0),
    quantity: Number(load.quantity || load.qty || 1),
    phase: load.phase || "Auto",
    type: load.type || "General",
    demandFactor: Number(load.demandFactor ?? load.fd ?? 1),
    simultaneityFactor: Number(load.simultaneityFactor ?? load.fs ?? 1),
    fp: Number(load.fp ?? load.powerFactor ?? 0.95),
    system: load.system || "auto",
    observations: load.observations || ""
  };
  state.currentProject.loads.push(normalized);
  addHistory(`Carga agregada: ${normalized.name}`, "Cargas", false);
  recalculateProject();
  persist();
}

export function clearLoads() {
  state.currentProject.loads = [];
  addHistory("Cargas eliminadas", "Cargas", false);
  recalculateProject();
  persist();
}

export function updateProjectSection(section, value, moduleName = "Sistema"){
  state.currentProject[section] = value;
  addHistory(`Se actualizó ${section}`, moduleName, false);
  recalculateProject();
  persist();
}

export function addHistory(action, module = "Sistema", shouldPersist = true){
  state.currentProject.history = state.currentProject.history || [];
  state.currentProject.history.push({ date: nowStamp(), action, module });
  state.currentProject.history = state.currentProject.history.slice(-80);
  state.currentProject.updatedAt = nowStamp();
  if(shouldPersist) persist();
}

export function calculateChecklist(project = state.currentProject){
  const loads = project.loads || [];
  const hasProjectData = Boolean(project.name && project.client && project.address && project.supplyType && project.distributor);
  const hasResponsible = Boolean(project.installer || project.responsible || project.company);
  const hasLoads = loads.length > 0;
  const hasLoadBoard = Array.isArray(project.loadBoard) ? project.loadBoard.length > 0 : hasLoads;
  const hasGrounding = Boolean(project.grounding);
  const hasUnilineal = Boolean(project.unilineal || hasLoads);
  const hasDocs = (Array.isArray(project.documentation) && project.documentation.length > 0) || Boolean(project.documentationEngine?.summary?.active);
  const hasAudit = Array.isArray(project.audit) && project.audit.length > 0;
  const hasBudget = Array.isArray(project.budget) && project.budget.length > 0;
  return [
    { id: "datos", label: "Datos generales", done: hasProjectData },
    { id: "responsable", label: "Empresa / instalador responsable", done: hasResponsible },
    { id: "cargas", label: "Cargas ingresadas", done: hasLoads },
    { id: "cuadro", label: "Cuadro de carga", done: hasLoadBoard },
    { id: "tierra", label: "Puesta a tierra", done: hasGrounding },
    { id: "unilineal", label: "Unilineal", done: hasUnilineal },
    { id: "documentacion", label: "Documentación", done: hasDocs },
    { id: "auditoria", label: "Auditoría normativa", done: hasAudit },
    { id: "presupuesto", label: "Presupuesto", done: hasBudget }
  ];
}

export function recalculateProject(){
  const p = state.currentProject;
  p.loads = Array.isArray(p.loads) ? p.loads : [];
  const totalW = p.loads.reduce((sum, load) => sum + Number(load.powerW || load.power || 0) * Number(load.quantity || 1), 0);
  const loadResult = calculateLoadProject(p);
  const electricalResult = calculateElectricalProject(p);
  p.loadEngine = loadResult;
  p.electricalEngine = electricalResult;
  p.loadBoard = electricalResult.loadBoard;
  p.protections = electricalResult.protections;
  p.conductors = electricalResult.conductors;
  p.conduits = electricalResult.conduits;
  p.engineeringMaterials = electricalResult.materials;
  p.phaseBalance = electricalResult.phaseBalance;
  const panelResult = calculatePanelProject(p);
  p.panelEngine = panelResult;
  p.panel = panelResult;
  p.panelMaterials = panelResult.materials || [];
  p.connectionEngine = calculateConnectionProject(p);
  p.documentationEngine = calculateDocumentationProject(p);
  p.installedPowerKw = electricalResult.summary.installedKw || Number((totalW / 1000).toFixed(3));
  p.demandPowerKw = electricalResult.summary.demandKw;
  p.currentA = electricalResult.summary.projectCurrentA;
  p.engineeringStatus = electricalResult.summary.status;
  p.voltage = p.supplyType === "trifasico" ? "380/220 V" : "220 V";
  p.checklist = calculateChecklist(p);
  const done = p.checklist.filter(item => item.done).length;
  const total = p.checklist.length || 1;
  const criticalEngine = (electricalResult.observations || []).some(item => item.level === "critico");
  p.progress = {
    engineering: Math.round((done / total) * 100),
    documentation: Math.round((p.checklist.filter(item => ["documentacion", "auditoria", "presupuesto"].includes(item.id) && item.done).length / 3) * 100),
    normative: criticalEngine || (Array.isArray(p.audit) && p.audit.some(item => item.level === "critico")) ? "Con observaciones" : "Sin observaciones críticas"
  };
  p.commercialEngine = calculateCommercialProject(p);
  p.budget = p.commercialEngine?.materials || [];
  p.integralAudit = runIntegralAudit(p);
  p.audit = p.integralAudit?.issues || [];
  p.gpe = runProjectEngine(p);
  p.guidedWorkflow = evaluateGuidedWorkflow(p);
  return p;
}

export function createRevision(reason = "Revisión creada"){
  recalculateProject();
  const revision = createProjectRevision(state.currentProject, reason);
  persist();
  return revision;
}


function projectSummary(project){
  const p = normalizeProject(project);
  return {
    id: p.id,
    name: p.name,
    code: p.code || p.id,
    client: p.client || "",
    company: p.company || "",
    installer: p.installer || p.responsible || "",
    status: p.status || "En desarrollo",
    distributor: p.distributor || "",
    supplyType: p.supplyType || "monofasico",
    installedPowerKw: Number(p.installedPowerKw || 0),
    commune: p.commune || "",
    region: p.region || "",
    updatedAt: p.updatedAt || nowStamp(),
    createdAt: p.createdAt || nowStamp(),
    archived: Boolean(p.archived)
  };
}

function normalizeLibrary(list){
  return (Array.isArray(list) ? list : []).map(project => normalizeProject(project));
}

export function saveCurrentProjectToLibrary(action = "Proyecto guardado en biblioteca local"){
  recalculateProject();
  state.projectLibrary = normalizeLibrary(state.projectLibrary);
    ensureCompanyAccess();
  const idx = state.projectLibrary.findIndex(project => project.id === state.currentProject.id);
  const snapshot = normalizeProject(JSON.parse(JSON.stringify(state.currentProject)));
  snapshot.updatedAt = nowStamp();
  if(idx >= 0) state.projectLibrary[idx] = snapshot;
  else state.projectLibrary.unshift(snapshot);
  state.projectLibrary = state.projectLibrary
    .sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 200);
  addHistory(action, "Proyectos", false);
  persist();
  return snapshot;
}

export function listProjects(options = {}){
  state.projectLibrary = normalizeLibrary(state.projectLibrary);
    ensureCompanyAccess();
  const includeArchived = Boolean(options.includeArchived);
  return state.projectLibrary
    .filter(project => includeArchived || !project.archived)
    .map(projectSummary);
}

export function openProject(projectId){
  state.projectLibrary = normalizeLibrary(state.projectLibrary);
    ensureCompanyAccess();
  const found = state.projectLibrary.find(project => project.id === projectId);
  if(!found) return false;
  saveCurrentProjectToLibrary("Proyecto anterior guardado antes de abrir otro");
  state.currentProject = normalizeProject(JSON.parse(JSON.stringify(found)));
  addHistory("Proyecto abierto desde administrador local", "Proyectos", false);
  recalculateProject();
  persist();
  return true;
}

export function duplicateProject(projectId){
  state.projectLibrary = normalizeLibrary(state.projectLibrary);
    ensureCompanyAccess();
  const source = state.projectLibrary.find(project => project.id === projectId) || state.currentProject;
  const copy = normalizeProject(JSON.parse(JSON.stringify(source)));
  copy.id = createProjectId();
  copy.name = `${copy.name || "Proyecto"} - copia`;
  copy.code = "";
  copy.createdAt = nowStamp();
  copy.updatedAt = nowStamp();
  copy.history = [{ date: nowStamp(), action: "Proyecto duplicado", module: "Proyectos" }];
  state.projectLibrary.unshift(copy);
  persist();
  return copy;
}

export function deleteProject(projectId){
  state.projectLibrary = normalizeLibrary(state.projectLibrary).filter(project => project.id !== projectId);
  if(state.currentProject.id === projectId) newProject({ name: "Proyecto sin nombre" });
  persist();
}

export function archiveProject(projectId){
  state.projectLibrary = normalizeLibrary(state.projectLibrary).map(project => {
    if(project.id === projectId){
      project.archived = true;
      project.updatedAt = nowStamp();
    }
    return project;
  });
  persist();
}

export function renameProject(projectId, name){
  state.projectLibrary = normalizeLibrary(state.projectLibrary).map(project => {
    if(project.id === projectId){
      project.name = name || project.name;
      project.updatedAt = nowStamp();
    }
    return project;
  });
  if(state.currentProject.id === projectId){
    updateProject({ name }, { module: "Proyectos", action: "Proyecto renombrado" });
  }
  persist();
}

export function exportProjectById(projectId){
  state.projectLibrary = normalizeLibrary(state.projectLibrary);
    ensureCompanyAccess();
  const project = state.projectLibrary.find(project => project.id === projectId) || state.currentProject;
  return {
    fileType: "GIAE_PROJECT",
    fileVersion: "1.0-alpha.050",
    exportedAt: nowStamp(),
    author: "Julio Guillermo Vera",
    project: normalizeProject(project)
  };
}

export function importProjectToLibrary(payload, openAfter = true){
  const incoming = normalizeProject(payload?.project || payload);
  incoming.updatedAt = nowStamp();
  incoming.history = incoming.history || [];
  incoming.history.push({ date: nowStamp(), action: "Proyecto importado a biblioteca local", module: "Proyectos" });
  state.projectLibrary = normalizeLibrary(state.projectLibrary).filter(project => project.id !== incoming.id);
  state.projectLibrary.unshift(incoming);
  if(openAfter) state.currentProject = normalizeProject(JSON.parse(JSON.stringify(incoming)));
  persist();
  return incoming;
}

export function exportProjectFile(){
  recalculateProject();
  return {
    fileType: "GIAE_PROJECT",
    fileVersion: "1.0-alpha.050",
    exportedAt: nowStamp(),
    author: "Julio Guillermo Vera",
    project: state.currentProject
  };
}

export function importProjectFile(payload){
  const incoming = payload?.project || payload;
  state.currentProject = normalizeProject(incoming);
  addHistory("Proyecto importado desde archivo .giae", "Proyecto", false);
  recalculateProject();
  persist();
}

export function persist() {
  recalculateProject();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function restore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    ensureCompanyAccess();
    recalculateProject();
    applyTabSession();
    return state;
  }
  try {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    state.currentProject = normalizeProject(state.currentProject);
    state.projectLibrary = normalizeLibrary(state.projectLibrary);
    ensureCompanyAccess();
    if(state.normativePolicy?.allowedSources?.includes("DL8")){
      state.normativePolicy.allowedSources = state.normativePolicy.allowedSources.map(x => x === "DL8" ? "DS8" : x);
    }
    recalculateProject();
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    recalculateProject();
  }
  applyTabSession();
  return state;
}

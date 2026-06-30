import { calculateLoadProject } from "./engineering/loadEngine.js";
import { calculateElectricalProject } from "./engineering/electricalEngine.js";
const STORAGE_KEY = "giae_chile_v1_workspace";
const LIBRARY_KEY = "giae_chile_v1_project_library";

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
    version: "1.0-alpha.040",
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
    grounding: null,
    connection: null,
    unilineal: null,
    documentation: [],
    budget: [],
    audit: [],
    checklist: [],
    history: [
      { date: created, action: "Proyecto activo creado", module: "Sistema" }
    ],
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
  }
};

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
  persist();
}

export function clearProfile() {
  state.profile = null;
  persist();
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
  const hasDocs = Array.isArray(project.documentation) && project.documentation.length > 0;
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
  return p;
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
  const includeArchived = Boolean(options.includeArchived);
  return state.projectLibrary
    .filter(project => includeArchived || !project.archived)
    .map(projectSummary);
}

export function openProject(projectId){
  state.projectLibrary = normalizeLibrary(state.projectLibrary);
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
  const project = state.projectLibrary.find(project => project.id === projectId) || state.currentProject;
  return {
    fileType: "GIAE_PROJECT",
    fileVersion: "1.0-alpha.027",
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
    fileVersion: "1.0-alpha.027",
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
    recalculateProject();
    return state;
  }
  try {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    state.currentProject = normalizeProject(state.currentProject);
    state.projectLibrary = normalizeLibrary(state.projectLibrary);
    if(state.normativePolicy?.allowedSources?.includes("DL8")){
      state.normativePolicy.allowedSources = state.normativePolicy.allowedSources.map(x => x === "DL8" ? "DS8" : x);
    }
    recalculateProject();
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    recalculateProject();
  }
  return state;
}

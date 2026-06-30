const STORAGE_KEY = "giae_chile_v1_workspace";

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
    version: "1.0-alpha.025",
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
    loadBoard: [],
    protections: [],
    conductors: [],
    conduits: [],
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
    type: load.type || "General"
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
  p.installedPowerKw = Number((totalW / 1000).toFixed(3));
  p.demandPowerKw = Number((p.installedPowerKw * 0.85).toFixed(3));
  p.voltage = p.supplyType === "trifasico" ? "380/220 V" : "220 V";
  p.checklist = calculateChecklist(p);
  const done = p.checklist.filter(item => item.done).length;
  const total = p.checklist.length || 1;
  p.progress = {
    engineering: Math.round((done / total) * 100),
    documentation: Math.round((p.checklist.filter(item => ["documentacion", "auditoria", "presupuesto"].includes(item.id) && item.done).length / 3) * 100),
    normative: (Array.isArray(p.audit) && p.audit.some(item => item.level === "critico")) ? "Con observaciones" : "Sin observaciones críticas"
  };
  return p;
}

export function exportProjectFile(){
  recalculateProject();
  return {
    fileType: "GIAE_PROJECT",
    fileVersion: "1.0-alpha.025",
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

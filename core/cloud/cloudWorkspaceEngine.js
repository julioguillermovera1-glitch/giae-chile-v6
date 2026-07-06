export const CLOUD_CONTRACT_SCHEMA = "giae.cloud.contract.v1";

export const WORKER_ENDPOINTS = [
  { id: "health", method: "GET", path: "/api/giae/health", scope: "publico", purpose: "Estado del Worker y version de contrato." },
  { id: "session-start", method: "POST", path: "/api/giae/session/start", scope: "auth", purpose: "Iniciar sesion y registrar dispositivo autorizado." },
  { id: "license-check", method: "POST", path: "/api/giae/license/check", scope: "auth", purpose: "Validar licencia, plan, asientos y vigencia." },
  { id: "workspace-read", method: "GET", path: "/api/giae/workspaces/:workspaceId", scope: "workspace.read", purpose: "Leer empresa, roles y configuracion." },
  { id: "project-sync", method: "POST", path: "/api/giae/projects/:projectId/sync", scope: "project.write", purpose: "Sincronizar cambios del proyecto y guardar auditoria." },
  { id: "project-open", method: "GET", path: "/api/giae/projects/:projectId", scope: "project.read", purpose: "Abrir ultimo estado de un proyecto compartido." },
  { id: "file-presign", method: "POST", path: "/api/giae/files/presign", scope: "file.write", purpose: "Crear autorizacion temporal para respaldos y evidencias R2." },
  { id: "audit-search", method: "GET", path: "/api/giae/audit", scope: "audit.read", purpose: "Consultar actividad por usuario, proyecto y empresa." }
];

export const D1_TABLES = [
  { name: "companies", purpose: "Empresas, instaladores y marca blanca.", keys: ["id", "rut", "name", "status", "created_at", "updated_at"] },
  { name: "users", purpose: "Usuarios autorizados por empresa.", keys: ["id", "company_id", "email", "name", "role_id", "status", "last_seen_at"] },
  { name: "roles", purpose: "Roles y permisos declarados.", keys: ["id", "company_id", "name", "permissions_json", "status"] },
  { name: "licenses", purpose: "Planes, asientos y vigencia comercial.", keys: ["id", "company_id", "plan", "seats", "status", "valid_until"] },
  { name: "projects", purpose: "Metadatos de proyectos GIAE.", keys: ["id", "company_id", "owner_user_id", "name", "status", "updated_at"] },
  { name: "project_revisions", purpose: "Historial estructurado de cambios y versiones .giae.", keys: ["id", "project_id", "revision", "hash", "author_user_id", "created_at"] },
  { name: "file_assets", purpose: "Indice de archivos guardados en R2.", keys: ["id", "project_id", "kind", "r2_key", "sha256", "created_at"] },
  { name: "audit_events", purpose: "Auditoria multiusuario.", keys: ["id", "company_id", "project_id", "user_id", "action", "created_at"] },
  { name: "sync_queue", purpose: "Cola declarativa para sincronizacion segura.", keys: ["id", "project_id", "status", "operation", "payload_hash", "created_at"] }
];

export const R2_BUCKETS = [
  { binding: "GIAE_PROJECT_BACKUPS", kind: "project_backup", stores: [".giae", "revisiones", "paquetes sincronizacion"] },
  { binding: "GIAE_PROJECT_DOCUMENTS", kind: "documents", stores: ["informes", "PDF", "memorias", "evidencias"] },
  { binding: "GIAE_BRAND_ASSETS", kind: "brand", stores: ["logos", "plantillas", "firmas"] },
  { binding: "GIAE_FIELD_MEDIA", kind: "field_media", stores: ["fotos terreno", "planos", "imagenes de materiales"] }
];

export const ROLE_MATRIX = [
  { id: "owner", label: "Administrador empresa", profile: "administrador", permissions: ["workspace.manage", "license.manage", "user.manage", "project.read", "project.write", "file.write", "audit.read"] },
  { id: "supervisor", label: "Supervisor tecnico", profile: "empresa", permissions: ["project.read", "project.write", "file.write", "audit.read"] },
  { id: "installer", label: "Instalador autorizado", profile: "independiente", permissions: ["project.read", "project.write", "file.write"] },
  { id: "quote", label: "Cotizador", profile: "empresa", permissions: ["project.read", "budget.write"] },
  { id: "readonly", label: "Solo lectura", profile: "empresa", permissions: ["project.read"] },
  { id: "student", label: "Estudiante", profile: "estudiante", permissions: ["learning.read", "demo.write"] }
];

const DEFAULT_LICENSE = {
  plan: "local-preparacion",
  status: "preparacion_local",
  seats: 1,
  validUntil: "",
  features: ["modo_local", "exportacion_giae", "cola_sync", "contrato_cloud"]
};

function stamp(){ return new Date().toISOString(); }
function localStamp(){ return new Date().toLocaleString("es-CL"); }
function clone(value){ return JSON.parse(JSON.stringify(value || {})); }
function arr(value){ return Array.isArray(value) ? value : []; }
function makeId(prefix){ return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }
function asNumber(value, fallback = 0){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function companyFrom(state = {}){
  const adminCompany = state.admin?.company || {};
  const project = state.currentProject || {};
  return {
    id: adminCompany.id || state.cloudWorkspace?.workspace?.companyId || "local-company",
    name: adminCompany.name || project.company || "GIAE Chile",
    rut: adminCompany.rut || "",
    email: adminCompany.email || "",
    phone: adminCompany.phone || ""
  };
}

export function buildCloudContract(overrides = {}){
  return {
    schema: CLOUD_CONTRACT_SCHEMA,
    status: "preparacion_local",
    generatedAt: stamp(),
    worker: {
      apiBase: overrides.apiBase || "/api/giae",
      endpoints: WORKER_ENDPOINTS,
      requiredBindings: ["GIAE_DB", "GIAE_PROJECT_BACKUPS", "GIAE_PROJECT_DOCUMENTS", "GIAE_BRAND_ASSETS", "GIAE_FIELD_MEDIA"]
    },
    d1: { binding: "GIAE_DB", tables: D1_TABLES },
    r2: { buckets: R2_BUCKETS },
    roles: ROLE_MATRIX,
    license: DEFAULT_LICENSE,
    security: {
      browserStoresSecrets: false,
      portableFormatKept: true,
      auditRequired: true,
      note: "La app local prepara paquetes. Tokens, sesiones y validacion real deben vivir en Worker."
    }
  };
}

export function ensureCloudWorkspace(state = {}){
  const company = companyFrom(state);
  state.cloudWorkspace = state.cloudWorkspace || {};
  const cloud = state.cloudWorkspace;
  cloud.schema = "giae.cloud.workspace.v1";
  cloud.mode = cloud.mode || "local_preparado";
  cloud.apiBaseUrl = cloud.apiBaseUrl || "/api/giae";
  cloud.workspace = {
    id: cloud.workspace?.id || "workspace-local",
    companyId: cloud.workspace?.companyId || company.id,
    name: cloud.workspace?.name || company.name,
    region: cloud.workspace?.region || "Chile",
    updatedAt: cloud.workspace?.updatedAt || localStamp()
  };
  cloud.license = { ...DEFAULT_LICENSE, ...(cloud.license || {}) };
  cloud.syncQueue = arr(cloud.syncQueue);
  cloud.auditTrail = arr(cloud.auditTrail);
  cloud.lastReadiness = cloud.lastReadiness || null;
  cloud.contract = buildCloudContract({ apiBase: cloud.apiBaseUrl });
  return cloud;
}

export function licenseState(license = DEFAULT_LICENSE){
  const seats = Math.max(1, asNumber(license.seats, 1));
  const hasExpiry = Boolean(license.validUntil);
  const expired = hasExpiry && new Date(license.validUntil).getTime() < Date.now();
  if(expired) return { status: "vencida", label: "Licencia vencida", seats };
  if(license.status === "activa") return { status: "activa", label: "Licencia activa", seats };
  if(license.status === "suspendida") return { status: "suspendida", label: "Licencia suspendida", seats };
  return { status: "preparacion_local", label: "Preparacion local", seats };
}

export function buildCloudReadiness(state = {}){
  const cloud = ensureCloudWorkspace(state);
  const users = arr(state.admin?.users);
  const project = state.currentProject || {};
  const license = licenseState(cloud.license);
  const checks = [
    { id: "company", label: "Empresa o instalador identificado", ok: Boolean(companyFrom(state).name), level: "alto" },
    { id: "users", label: "Modelo de usuarios local disponible", ok: users.length > 0 || Boolean(state.profile), level: "alto" },
    { id: "roles", label: "Matriz de roles declarada", ok: ROLE_MATRIX.length >= 5, level: "critico" },
    { id: "license", label: "Estado de licencia declarado", ok: Boolean(cloud.license?.plan && cloud.license?.status), level: "critico" },
    { id: "project", label: "Proyecto activo con ID portable", ok: Boolean(project.id && project.name), level: "alto" },
    { id: "d1", label: "Modelo D1 cubre datos principales", ok: D1_TABLES.length >= 8, level: "critico" },
    { id: "r2", label: "Buckets R2 cubren archivos clave", ok: R2_BUCKETS.length >= 4, level: "critico" },
    { id: "worker", label: "Contrato Worker tiene endpoints base", ok: WORKER_ENDPOINTS.length >= 7, level: "critico" },
    { id: "audit", label: "Historial local disponible para auditoria", ok: arr(project.history).length > 0, level: "medio" },
    { id: "queue", label: "Cola de sincronizacion preparada", ok: Array.isArray(cloud.syncQueue), level: "alto" },
    { id: "portable", label: "Formato .giae se mantiene como respaldo", ok: true, level: "critico" },
    { id: "secrets", label: "Sin tokens ni secretos guardados en cliente", ok: !cloud.apiToken && !cloud.secret && !cloud.workerSecret, level: "critico" }
  ];
  const criticalFails = checks.filter(check => !check.ok && check.level === "critico");
  const highFails = checks.filter(check => !check.ok && check.level === "alto");
  const okCount = checks.filter(check => check.ok).length;
  const score = Math.round((okCount / checks.length) * 100);
  const status = criticalFails.length ? "bloqueado" : highFails.length ? "preparacion_incompleta" : "listo_para_worker";
  const report = { schema: "giae.cloud.readiness.v1", generatedAt: stamp(), score, status, license, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, checks };
  cloud.lastReadiness = report;
  return report;
}

export function createProjectSyncEnvelope(project = {}, state = {}, options = {}){
  const cloud = ensureCloudWorkspace(state);
  const snapshot = clone(project);
  const revision = arr(snapshot.revisions).length + 1;
  return {
    schema: "giae.cloud.sync-envelope.v1",
    createdAt: stamp(),
    operation: options.operation || "project.upsert",
    workspaceId: cloud.workspace.id,
    companyId: cloud.workspace.companyId,
    projectId: snapshot.id || "sin-id",
    projectName: snapshot.name || "Proyecto sin nombre",
    revision,
    authorProfile: state.profile || "sin_sesion",
    apiBaseUrl: cloud.apiBaseUrl,
    d1Targets: ["projects", "project_revisions", "audit_events", "sync_queue"],
    r2Targets: ["GIAE_PROJECT_BACKUPS"],
    projectSnapshot: snapshot,
    portableBackupRequired: true,
    audit: {
      id: makeId("audit"),
      action: options.action || "Preparar sincronizacion de proyecto",
      module: "Nube y licencias",
      createdAt: stamp(),
      note: options.note || "Paquete local preparado. El Worker debe validar permisos antes de aceptar cambios."
    },
    safety: {
      containsSecret: false,
      finalComplianceCertification: false,
      note: "Paquete de sincronizacion. No reemplaza revision profesional ni validacion de servidor."
    }
  };
}

export function queueProjectSync(state = {}, options = {}){
  const cloud = ensureCloudWorkspace(state);
  const project = state.currentProject || {};
  const envelope = createProjectSyncEnvelope(project, state, options);
  const item = {
    id: makeId("sync"),
    status: "pendiente",
    operation: envelope.operation,
    projectId: envelope.projectId,
    projectName: envelope.projectName,
    createdAt: localStamp(),
    attempts: 0,
    envelope
  };
  cloud.syncQueue.unshift(item);
  cloud.syncQueue = cloud.syncQueue.slice(0, 50);
  cloud.auditTrail.unshift({ id: makeId("cloud-audit"), createdAt: localStamp(), action: item.operation, projectId: item.projectId, status: item.status });
  cloud.auditTrail = cloud.auditTrail.slice(0, 100);
  return item;
}

export function clearSyncQueue(state = {}){
  const cloud = ensureCloudWorkspace(state);
  const removed = cloud.syncQueue.length;
  cloud.syncQueue = [];
  cloud.auditTrail.unshift({ id: makeId("cloud-audit"), createdAt: localStamp(), action: "Cola de sincronizacion limpiada", status: "local" });
  return removed;
}

export function cloudSummary(state = {}){
  const cloud = ensureCloudWorkspace(state);
  const readiness = buildCloudReadiness(state);
  return {
    mode: cloud.mode,
    workspace: cloud.workspace,
    apiBaseUrl: cloud.apiBaseUrl,
    license: licenseState(cloud.license),
    pendingSync: cloud.syncQueue.filter(item => item.status === "pendiente").length,
    readyScore: readiness.score,
    status: readiness.status
  };
}
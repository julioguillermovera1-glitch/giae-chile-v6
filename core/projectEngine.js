const ENGINE_VERSION = "GPE-01.0";
import calculateGroundingProject from "./engineering/groundingEngine.js";

function stamp(){
  return new Date().toLocaleString("es-CL");
}

function arr(value){
  return Array.isArray(value) ? value : [];
}

function doneStatus(done, labelOk = "Completo", labelPending = "Pendiente"){
  return done ? { state: "ok", label: labelOk } : { state: "pending", label: labelPending };
}

function warningStatus(done, labelOk = "Sin observaciones críticas", labelWarn = "Requiere revisión"){
  return done ? { state: "ok", label: labelOk } : { state: "warning", label: labelWarn };
}

function hashProject(project){
  const payload = {
    name: project.name,
    client: project.client,
    supplyType: project.supplyType,
    distributor: project.distributor,
    loads: project.loads,
    loadBoard: project.loadBoard,
    panel: project.panel,
    grounding: project.grounding,
    connection: project.connection,
    documentation: project.documentation,
    budget: project.budget,
    audit: project.audit
  };
  const text = JSON.stringify(payload);
  let hash = 0;
  for(let i = 0; i < text.length; i++){
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

function buildModuleStatus(project){
  const loads = arr(project.loads);
  const board = arr(project.loadBoard);
  const docs = project.documentationEngine?.documents || arr(project.documentation);
  const hasProject = Boolean(project.name && project.client && project.supplyType && project.distributor);
  const hasResponsible = Boolean(project.installer || project.responsible || project.company);
  const hasLoads = loads.length > 0;
  const hasBoard = board.length > 0;
  const hasPanel = Boolean(project.panelEngine?.summary || project.panel?.summary || project.panel);
  const hasGround = Boolean(project.grounding);
  const hasConnection = Boolean(project.connection);
  const hasUnilineal = Boolean(project.unilineal || hasPanel);
  const hasDocs = arr(docs).length > 0 || Boolean(project.documentationEngine?.summary?.total);
  const hasBudget = arr(project.budget).length > 0 || arr(project.engineeringMaterials).length > 0 || arr(project.panelMaterials).length > 0;
  const hasAudit = arr(project.audit).length > 0;
  const normativeClear = project.progress?.normative === "Sin observaciones críticas";

  return [
    { id: "datos", name: "Datos generales", ...doneStatus(hasProject) },
    { id: "responsable", name: "Responsable técnico", ...doneStatus(hasResponsible) },
    { id: "cargas", name: "Cargas", ...doneStatus(hasLoads) },
    { id: "ingenieria", name: "Ingeniería eléctrica", ...doneStatus(Boolean(project.electricalEngine?.summary) && hasLoads) },
    { id: "balance", name: "Balance de fases", ...doneStatus(Boolean(project.phaseBalance) || project.supplyType !== "trifasico", project.supplyType === "trifasico" ? "Calculado" : "No aplica") },
    { id: "cuadro", name: "Cuadro de carga", ...doneStatus(hasBoard) },
    { id: "tablero", name: "Tablero", ...doneStatus(hasPanel) },
    { id: "tierra", name: "Puesta a tierra", ...warningStatus(hasGround, "Registrada", "Pendiente / requiere medición") },
    { id: "empalme", name: "Empalme", ...warningStatus(hasConnection, "Definido", "Pendiente") },
    { id: "unilineal", name: "Unilineal", ...doneStatus(hasUnilineal, "Preparado", "Pendiente") },
    { id: "documentacion", name: "Documentación", ...doneStatus(hasDocs) },
    { id: "presupuesto", name: "Presupuesto", ...doneStatus(hasBudget, "Materiales preparados", "Pendiente") },
    { id: "auditoria", name: "Auditoría", ...warningStatus(hasAudit || normativeClear, normativeClear ? "Sin críticas" : "Registrada", "Pendiente") }
  ];
}

function buildIssues(project, moduleStatus){
  const issues = [];
  const loads = arr(project.loads);
  if(!project.name || project.name === "Proyecto sin nombre") issues.push({ level: "medio", area: "Proyecto", message: "Asignar un nombre real al proyecto." });
  if(!project.client) issues.push({ level: "medio", area: "Proyecto", message: "Falta cliente del proyecto." });
  if(!project.address) issues.push({ level: "medio", area: "Proyecto", message: "Falta dirección del proyecto." });
  if(!loads.length) issues.push({ level: "alto", area: "Cargas", message: "No existen cargas ingresadas. Los motores posteriores no pueden generar resultados confiables." });
  if(project.supplyType === "trifasico" && project.phaseBalance?.summary?.unbalancePercent > 15){
    issues.push({ level: "medio", area: "Balance", message: `Desbalance estimado ${project.phaseBalance.summary.unbalancePercent}%. Revisar distribución de fases.` });
  }
  if(project.panelEngine?.summary?.status === "requiere-revision"){
    issues.push({ level: "medio", area: "Tablero", message: "El tablero requiere revisión por capacidad, reserva o datos incompletos." });
  }
  if(!project.grounding){
    issues.push({ level: "medio", area: "Puesta a tierra", message: "Falta diseño o registro de puesta a tierra. El resultado final requiere medición en terreno." });
  }
  if(!project.connection){
    issues.push({ level: "bajo", area: "Empalme", message: "Empalme pendiente. Se completará con el Motor de Empalmes." });
  }
  if(project.progress?.normative === "Con observaciones"){
    issues.push({ level: "alto", area: "Normativa", message: "Existen observaciones normativas críticas o pendientes." });
  }
  const pending = moduleStatus.filter(item => item.state !== "ok").length;
  if(pending) issues.push({ level: "info", area: "GPE", message: `${pending} áreas del proyecto siguen pendientes o requieren revisión.` });
  return issues;
}

function buildDependencies(project){
  return [
    { from: "Cargas", to: "Ingeniería eléctrica", status: arr(project.loads).length ? "activo" : "pendiente" },
    { from: "Ingeniería eléctrica", to: "Cuadro de carga", status: arr(project.loadBoard).length ? "activo" : "pendiente" },
    { from: "Cuadro de carga", to: "Tableros", status: project.panelEngine ? "activo" : "pendiente" },
    { from: "Tableros", to: "Unilineal", status: project.panelEngine ? "preparado" : "pendiente" },
    { from: "Cargas", to: "Empalme", status: Number(project.demandPowerKw || 0) > 0 ? "preparado" : "pendiente" },
    { from: "Ingeniería", to: "Puesta a tierra", status: Number(project.currentA || 0) > 0 ? "preparado" : "pendiente" },
    { from: "Proyecto activo", to: "Documentación", status: project.documentationEngine ? "activo" : "pendiente" },
    { from: "Materiales", to: "Presupuesto", status: arr(project.engineeringMaterials).length || arr(project.panelMaterials).length ? "preparado" : "pendiente" }
  ];
}

function buildNextActions(status, issues){
  const actions = [];
  const firstPending = status.find(item => item.state !== "ok");
  if(firstPending) actions.push(`Completar o revisar: ${firstPending.name}.`);
  const high = issues.find(item => item.level === "alto");
  if(high) actions.push(`Prioridad alta: ${high.area} - ${high.message}`);
  if(!actions.length) actions.push("Proyecto sin bloqueos críticos. Continuar con documentación, presupuesto o auditoría final.");
  return actions;
}

export function runProjectEngine(project){
  const previous = project.gpe || {};
  project.grounding = calculateGroundingProject(project);
  const status = buildModuleStatus(project);
  const issues = buildIssues(project, status);
  const dependencies = buildDependencies(project);
  const completed = status.filter(item => item.state === "ok").length;
  const readiness = Math.round((completed / (status.length || 1)) * 100);
  const hash = hashProject(project);
  const eventLog = arr(previous.eventLog).slice(-40);
  if(previous.hash && previous.hash !== hash){
    eventLog.push({ date: stamp(), type: "project.changed", message: "El GPE detectó cambios y actualizó el estado del proyecto." });
  }
  if(!previous.hash){
    eventLog.push({ date: stamp(), type: "gpe.initialized", message: "GIAE Project Engine iniciado para este proyecto." });
  }
  return {
    version: ENGINE_VERSION,
    hash,
    lastRun: stamp(),
    readiness,
    status,
    issues,
    dependencies,
    nextActions: buildNextActions(status, issues),
    eventLog,
    metrics: {
      loads: arr(project.loads).length,
      circuits: arr(project.loadBoard).length,
      materials: arr(project.engineeringMaterials).length + arr(project.panelMaterials).length,
      warnings: issues.filter(item => ["alto", "medio"].includes(item.level)).length,
      completedAreas: completed,
      totalAreas: status.length
    }
  };
}

export function createProjectRevision(project, reason = "Revisión creada"){
  const revisions = arr(project.revisions).slice(-15);
  const snapshot = {
    id: "REV-" + new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0,14),
    date: stamp(),
    reason,
    hash: hashProject(project),
    summary: {
      name: project.name,
      installedPowerKw: project.installedPowerKw,
      demandPowerKw: project.demandPowerKw,
      loads: arr(project.loads).length,
      circuits: arr(project.loadBoard).length,
      panel: project.panelEngine?.summary?.recommendedCabinet || "Pendiente",
      readiness: project.gpe?.readiness || 0
    }
  };
  revisions.push(snapshot);
  project.revisions = revisions;
  return snapshot;
}

export const GUIDED_WORKFLOW_SCHEMA = "giae.workflow.guided.v1";

export const GUIDED_WORKFLOW_STEPS = [
  { id: "proyecto", order: 1, label: "Proyecto", moduleId: "proyecto", area: "base", required: true },
  { id: "cliente", order: 2, label: "Cliente", moduleId: "proyecto", area: "base", required: true },
  { id: "instalacion", order: 3, label: "Datos tecnicos", moduleId: "proyecto", area: "base", required: true },
  { id: "cargas", order: 4, label: "Cargas", moduleId: "cargas", area: "ingenieria", required: true },
  { id: "cuadro-carga", order: 5, label: "Cuadro de carga", moduleId: "cuadro-carga", area: "ingenieria", required: true },
  { id: "tableros", order: 6, label: "Tablero", moduleId: "tableros", area: "ingenieria", required: true },
  { id: "tierra", order: 7, label: "Puesta a tierra", moduleId: "tierra", area: "ingenieria", required: true },
  { id: "empalme", order: 8, label: "Empalme", moduleId: "empalme", area: "ingenieria", required: true },
  { id: "plano", order: 9, label: "Plano CAD", moduleId: "cad-electrico", area: "grafico", required: true },
  { id: "unilineal", order: 10, label: "Unilineal", moduleId: "unilineal", area: "grafico", required: true },
  { id: "documentacion", order: 11, label: "Documentacion SEC", moduleId: "documentacion", area: "documental", required: true },
  { id: "auditoria", order: 12, label: "Auditoria", moduleId: "auditoria", area: "control", required: true },
  { id: "presupuesto", order: 13, label: "Presupuesto", moduleId: "presupuesto", area: "comercial", required: true },
  { id: "exportacion", order: 14, label: "Exportacion", moduleId: "proyecto", area: "salida", required: true }
];

const STATUS_WEIGHT = { completado: 1, revisable: 0.85, observado: 0.65, pendiente: 0, bloqueado: 0 };

function text(value){ return String(value ?? "").trim(); }
function hasText(value){ return text(value).length > 0; }
function hasNumber(value){ const n = Number(value); return Number.isFinite(n) && n > 0; }
function list(value){ return Array.isArray(value) ? value : []; }
function issue(level, message, action, source = "GIAE"){ return { level, message, action, source }; }
function completionFromIssues(blockers, warnings){ if(blockers.length) return "bloqueado"; if(warnings.length) return "observado"; return "completado"; }
function stepResult(step, status, detail, blockers = [], warnings = [], evidence = []){
  return { ...step, status, done: ["completado", "revisable"].includes(status), detail, blockers, warnings, evidence, scoreWeight: STATUS_WEIGHT[status] ?? 0 };
}

function evaluateProject(project, step){
  const blockers = [];
  const warnings = [];
  if(!hasText(project.name) || text(project.name).toLowerCase() === "proyecto sin nombre") blockers.push(issue("alto", "Falta nombre real del proyecto.", "Completar nombre en Proyecto activo.", "Motor de flujo"));
  if(!hasText(project.code)) warnings.push(issue("medio", "No hay codigo interno del proyecto.", "Asignar codigo interno si la empresa lo usa.", "Motor de flujo"));
  return stepResult(step, completionFromIssues(blockers, warnings), "Identidad base del proyecto", blockers, warnings, [{ key: "id", value: project.id || "" }, { key: "name", value: project.name || "" }, { key: "code", value: project.code || "" }]);
}

function evaluateClient(project, step){
  const blockers = [];
  const warnings = [];
  if(!hasText(project.client)) blockers.push(issue("alto", "Falta cliente.", "Completar cliente en Proyecto activo.", "Motor de flujo"));
  if(!hasText(project.address)) blockers.push(issue("alto", "Falta direccion de la instalacion.", "Completar direccion antes de documentar.", "Motor de flujo"));
  if(!hasText(project.commune)) warnings.push(issue("medio", "Falta comuna.", "Agregar comuna para documentos y distribuidora.", "Motor de flujo"));
  if(!hasText(project.region)) warnings.push(issue("medio", "Falta region.", "Agregar region para trazabilidad territorial.", "Motor de flujo"));
  return stepResult(step, completionFromIssues(blockers, warnings), "Datos del cliente y ubicacion", blockers, warnings, [{ key: "client", value: project.client || "" }, { key: "address", value: project.address || "" }, { key: "commune", value: project.commune || "" }]);
}

function evaluateInstallation(project, step){
  const blockers = [];
  const warnings = [];
  if(!hasText(project.supplyType)) blockers.push(issue("alto", "Falta tipo de suministro.", "Definir monofasico o trifasico.", "Motor de flujo"));
  if(!hasText(project.distributor)) blockers.push(issue("alto", "Falta distribuidora.", "Seleccionar distribuidora antes de empalme.", "Motor de flujo"));
  if(!hasText(project.serviceType)) warnings.push(issue("medio", "Falta tipo de servicio.", "Definir instalacion nueva, regularizacion o aumento.", "Motor de flujo"));
  return stepResult(step, completionFromIssues(blockers, warnings), "Datos tecnicos base", blockers, warnings, [{ key: "supplyType", value: project.supplyType || "" }, { key: "voltage", value: project.voltage || "" }, { key: "distributor", value: project.distributor || "" }]);
}

function evaluateLoads(project, step){
  const loads = list(project.loads);
  const blockers = [];
  const warnings = [];
  if(!loads.length) blockers.push(issue("critico", "No hay cargas ingresadas.", "Agregar cargas antes de calcular cuadro, tablero, tierra o empalme.", "Motor de flujo"));
  const invalid = loads.filter(load => !hasNumber(load.powerW || load.power || load.watts) || !hasNumber(load.quantity || load.qty || 1));
  if(invalid.length) blockers.push(issue("alto", `${invalid.length} carga(s) tienen potencia o cantidad invalida.`, "Corregir cargas con potencia y cantidad validas.", "Motor de flujo"));
  if(loads.some(load => !hasText(load.type))) warnings.push(issue("medio", "Hay cargas sin tipo definido.", "Clasificar alumbrado, enchufes, fuerza u otro tipo.", "Motor de flujo"));
  return stepResult(step, completionFromIssues(blockers, warnings), `${loads.length} carga(s) registradas`, blockers, warnings, [{ key: "loads", value: loads.length }, { key: "installedPowerKw", value: Number(project.installedPowerKw || 0).toFixed(3) }]);
}

function evaluateLoadBoard(project, step){
  const board = list(project.loadBoard);
  const blockers = [];
  const warnings = [];
  if(!board.length) blockers.push(issue("critico", "No existe cuadro de carga calculado.", "Revisar cargas y abrir Cuadro de carga.", "Motor de flujo"));
  const critical = list(project.electricalEngine?.observations).filter(item => ["critico", "alto"].includes(item.level));
  if(critical.length) warnings.push(issue("alto", "El motor electrico tiene observaciones relevantes.", "Revisar conductores, protecciones y demanda.", "Motor electrico"));
  return stepResult(step, completionFromIssues(blockers, warnings), `${board.length} circuito(s) en cuadro`, blockers, warnings, [{ key: "loadBoard", value: board.length }, { key: "demandPowerKw", value: Number(project.demandPowerKw || 0).toFixed(3) }]);
}

function evaluatePanel(project, step){
  const protections = list(project.protections);
  const blockers = [];
  const warnings = [];
  if(!project.panelEngine && !project.panel) blockers.push(issue("alto", "No hay propuesta de tablero.", "Abrir Tableros y revisar la propuesta.", "Motor de flujo"));
  if(!protections.length) blockers.push(issue("alto", "No hay protecciones calculadas.", "Revisar cargas y cuadro para generar protecciones.", "Motor de flujo"));
  const panelWarnings = list(project.panelEngine?.observations).filter(item => ["critico", "alto", "medio"].includes(item.level));
  if(panelWarnings.length) warnings.push(issue("medio", "Tablero con observaciones pendientes.", "Revisar IGA, diferenciales, barras, DPS y gabinete.", "Motor de tableros"));
  return stepResult(step, completionFromIssues(blockers, warnings), `${protections.length} proteccion(es)`, blockers, warnings, [{ key: "panelReady", value: Boolean(project.panelEngine || project.panel) }, { key: "protections", value: protections.length }]);
}

function evaluateGrounding(project, step){
  const grounding = project.grounding || project.earth || null;
  const blockers = [];
  const warnings = [];
  if(!grounding) blockers.push(issue("alto", "No hay diseno de puesta a tierra guardado.", "Abrir Puesta a tierra y guardar el diseno.", "Motor de flujo"));
  const measured = grounding?.measurementOhm || grounding?.measuredOhm || grounding?.summary?.measuredOhm;
  if(grounding && !measured) warnings.push(issue("alto", "Falta medicion real de puesta a tierra.", "Registrar medicion real o marcar requiere revision profesional.", "Motor de tierra"));
  return stepResult(step, completionFromIssues(blockers, warnings), grounding ? "Diseno de tierra disponible" : "Sin tierra", blockers, warnings, [{ key: "grounding", value: Boolean(grounding) }, { key: "measurementOhm", value: measured || "" }]);
}

function evaluateConnection(project, step){
  const connection = project.connection || project.connectionEngine || null;
  const blockers = [];
  const warnings = [];
  if(!connection) blockers.push(issue("alto", "No hay empalme evaluado.", "Abrir Empalme y revisar distribuidora, suministro y potencia.", "Motor de flujo"));
  const observations = list(connection?.observations).filter(item => ["critico", "alto", "medio"].includes(item.level));
  if(connection && observations.length) warnings.push(issue("alto", "Empalme con observaciones.", "Revisar potencia contratada, limitador y criterios de distribuidora.", "Motor de empalmes"));
  return stepResult(step, completionFromIssues(blockers, warnings), connection?.status || "Empalme pendiente", blockers, warnings, [{ key: "connection", value: Boolean(connection) }, { key: "status", value: connection?.status || "" }]);
}

function evaluateCad(project, step){
  const cad = project.cad2d || project.cad || null;
  const entities = list(cad?.entities);
  const blockers = [];
  const warnings = [];
  if(!cad || !entities.length) blockers.push(issue("alto", "No hay plano CAD electrico.", "Abrir CAD electrico y generar plano desde Proyecto Activo.", "Motor de flujo"));
  const validation = cad?.validation;
  if(cad && validation?.issues?.length) warnings.push(issue("medio", "Plano CAD con observaciones.", "Validar capas, simbolos, circuitos, tierra y leyenda.", "Motor CAD"));
  return stepResult(step, completionFromIssues(blockers, warnings), `${entities.length} entidad(es) CAD`, blockers, warnings, [{ key: "entities", value: entities.length }, { key: "validationScore", value: validation?.score ?? "" }]);
}

function evaluateUnilineal(project, step){
  const blockers = [];
  const warnings = [];
  const inferred = Boolean(project.panelEngine && list(project.protections).length);
  if(!project.unilineal && !inferred) blockers.push(issue("alto", "No hay unilineal generado.", "Abrir Unilineal y regenerar desde tablero y cuadro de carga.", "Motor de flujo"));
  if(!project.unilineal && inferred) warnings.push(issue("medio", "Unilineal inferido desde tablero, no guardado como documento final.", "Generar y exportar unilineal antes de entregar.", "Motor unilineal"));
  return stepResult(step, completionFromIssues(blockers, warnings), project.unilineal ? "Unilineal guardado" : inferred ? "Unilineal preparable" : "Sin unilineal", blockers, warnings, [{ key: "unilineal", value: Boolean(project.unilineal) }, { key: "panelEngine", value: Boolean(project.panelEngine) }]);
}

function evaluateDocumentation(project, step){
  const engine = project.documentationEngine || null;
  const active = list(engine?.requiredNow);
  const ready = active.filter(doc => doc.result === "listo");
  const blockers = [];
  const warnings = [];
  if(!engine) blockers.push(issue("alto", "No hay evaluacion documental.", "Abrir Centro de Documentacion SEC.", "Motor de flujo"));
  if(engine && active.length && ready.length < active.length) warnings.push(issue("alto", `${active.length - ready.length} documento(s) activos incompletos.`, "Completar antecedentes antes de exportar.", "Motor documental"));
  if(engine && list(engine.futureDocuments).length) warnings.push(issue("medio", "Existen formularios SEC preparados para fase futura.", "Mantenerlos como requiere revision hasta cargar reglas completas.", "Motor documental"));
  return stepResult(step, completionFromIssues(blockers, warnings), `${ready.length}/${active.length || 0} documento(s) activo(s) listos`, blockers, warnings, [{ key: "ready", value: ready.length }, { key: "active", value: active.length }]);
}

function evaluateAudit(project, step){
  const audit = project.integralAudit || null;
  const issues = list(audit?.issues || project.audit);
  const blockers = [];
  const warnings = [];
  if(!audit && !issues.length) blockers.push(issue("alto", "No hay auditoria integral ejecutada.", "Abrir Auditoria y revisar el proyecto completo.", "Motor de flujo"));
  const critical = issues.filter(item => ["critico", "alto"].includes(item.level));
  if(critical.length) warnings.push(issue("alto", `${critical.length} observacion(es) criticas o altas.`, "Corregir observaciones antes de documentar como listo.", "Auditoria integral"));
  return stepResult(step, completionFromIssues(blockers, warnings), audit?.status || `${issues.length} observacion(es)`, blockers, warnings, [{ key: "issues", value: issues.length }, { key: "score", value: audit?.score ?? "" }]);
}

function evaluateBudget(project, step){
  const budget = list(project.budget);
  const blockers = [];
  const warnings = [];
  if(!budget.length) blockers.push(issue("medio", "No hay presupuesto generado.", "Abrir Presupuesto para generar materiales y mano de obra preliminar.", "Motor de flujo"));
  if(project.commercialEngine?.summary?.total <= 0) warnings.push(issue("medio", "Presupuesto sin valores comerciales configurados.", "Configurar precios y mano de obra por empresa.", "Motor comercial"));
  return stepResult(step, completionFromIssues(blockers, warnings), `${budget.length} item(s) comerciales`, blockers, warnings, [{ key: "budgetItems", value: budget.length }, { key: "total", value: project.commercialEngine?.summary?.total || 0 }]);
}

function evaluateExport(project, step, previousSteps){
  const blockers = [];
  const warnings = [];
  const previousBlockers = previousSteps.flatMap(item => item.blockers.map(blocker => ({ ...blocker, stepId: item.id, stepLabel: item.label })));
  const previousWarnings = previousSteps.flatMap(item => item.warnings.map(warning => ({ ...warning, stepId: item.id, stepLabel: item.label })));
  if(previousBlockers.length) blockers.push(issue("critico", "Hay etapas bloqueadas antes de exportar.", "Corregir bloqueos del flujo maestro.", "Motor de flujo"));
  if(previousWarnings.length) warnings.push(issue("alto", "Hay observaciones antes de exportar.", "Exportar solo como revision preliminar o corregir observaciones.", "Motor de flujo"));
  return stepResult(step, completionFromIssues(blockers, warnings), previousBlockers.length ? "Exportacion bloqueada" : previousWarnings.length ? "Exportacion preliminar" : "Listo para exportar", blockers, warnings, [{ key: "previousBlockers", value: previousBlockers.length }, { key: "previousWarnings", value: previousWarnings.length }]);
}

const EVALUATORS = { proyecto: evaluateProject, cliente: evaluateClient, instalacion: evaluateInstallation, cargas: evaluateLoads, "cuadro-carga": evaluateLoadBoard, tableros: evaluatePanel, tierra: evaluateGrounding, empalme: evaluateConnection, plano: evaluateCad, unilineal: evaluateUnilineal, documentacion: evaluateDocumentation, auditoria: evaluateAudit, presupuesto: evaluateBudget };

export function evaluateGuidedWorkflow(project = {}){
  const evaluated = [];
  for(const step of GUIDED_WORKFLOW_STEPS){
    if(step.id === "exportacion") evaluated.push(evaluateExport(project, step, evaluated));
    else evaluated.push((EVALUATORS[step.id] || (() => stepResult(step, "pendiente", "Etapa sin evaluador")))(project, step));
  }
  let firstOpenIndex = evaluated.findIndex(step => step.status !== "completado" && step.status !== "revisable");
  if(firstOpenIndex < 0) firstOpenIndex = evaluated.length - 1;
  const firstOpen = evaluated[firstOpenIndex] || evaluated[0];
  const steps = evaluated.map((step, index) => ({ ...step, lockedByPrevious: index > firstOpenIndex && firstOpen?.status === "bloqueado" }));
  const blockers = steps.flatMap(step => step.blockers.map(item => ({ ...item, stepId: step.id, stepLabel: step.label })));
  const warnings = steps.flatMap(step => step.warnings.map(item => ({ ...item, stepId: step.id, stepLabel: step.label })));
  const score = Math.round((steps.reduce((sum, step) => sum + step.scoreWeight, 0) / (steps.length || 1)) * 100);
  const completed = steps.filter(step => step.status === "completado").length;
  const revisable = steps.filter(step => step.status === "revisable").length;
  let status = "en_progreso";
  if(blockers.length) status = "bloqueado";
  else if(warnings.length) status = "con_observaciones";
  else if(completed + revisable >= steps.length) status = "listo_para_exportar";
  const currentStep = steps.find(step => ["bloqueado", "observado", "pendiente"].includes(step.status)) || steps[steps.length - 1];
  const nextIssue = blockers[0] || warnings[0] || null;
  return {
    schema: GUIDED_WORKFLOW_SCHEMA,
    generatedAt: new Date().toISOString(),
    score,
    status,
    summary: { total: steps.length, completed, revisable, observed: steps.filter(step => step.status === "observado").length, blocked: steps.filter(step => step.status === "bloqueado").length, pending: steps.filter(step => step.status === "pendiente").length, blockers: blockers.length, warnings: warnings.length },
    currentStep: currentStep ? { id: currentStep.id, label: currentStep.label, moduleId: currentStep.moduleId, status: currentStep.status } : null,
    nextAction: nextIssue?.action || "Proyecto listo para exportacion preliminar y revision profesional.",
    blockers,
    warnings,
    steps,
    policy: { doesNotCertify: true, requiresProfessionalReview: true, finalAuthority: "Profesional competente, SEC o distribuidora segun corresponda" }
  };
}

export function createGuidedWorkflowReport(project = {}){
  return { fileType: "GIAE_GUIDED_WORKFLOW_REPORT", schema: "giae.workflow.report.v1", exportedAt: new Date().toISOString(), project: { id: project.id || "", name: project.name || "", client: project.client || "", address: project.address || "", distributor: project.distributor || "", supplyType: project.supplyType || "" }, workflow: evaluateGuidedWorkflow(project) };
}
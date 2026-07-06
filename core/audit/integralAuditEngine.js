const VERSION = "AUDIT-10.0";

function stamp(){ return new Date().toLocaleString("es-CL"); }
function arr(value){ return Array.isArray(value) ? value : []; }
function n(value){ return Number(value || 0); }

function item(id, area, label, ok, level, message, action, source = "GPE"){
  return {
    id, area, label,
    status: ok ? "cumple" : level,
    ok: Boolean(ok),
    level: ok ? "ok" : level,
    message: ok ? "Verificado" : message,
    action: ok ? "Sin acción requerida" : action,
    source
  };
}

function score(items){
  const weights = { critico: 0, alto: 25, medio: 55, bajo: 75, pendiente: 65, info: 85, ok: 100, cumple: 100 };
  if(!items.length) return 0;
  const total = items.reduce((sum, it) => sum + (weights[it.level] ?? weights[it.status] ?? 60), 0);
  return Math.round(total / items.length);
}

function classify(items){
  const critical = items.filter(i => i.level === "critico" || i.level === "alto").length;
  const medium = items.filter(i => i.level === "medio" || i.level === "pendiente").length;
  if(critical > 0) return { state: "no-listo", label: "No listo para emisión", level: "alto" };
  if(medium > 0) return { state: "revision", label: "Listo con revisión pendiente", level: "medio" };
  return { state: "aprobado", label: "Listo para revisión final", level: "ok" };
}

function auditProjectData(p){
  return [
    item("PRJ-001", "Proyecto", "Nombre del proyecto", Boolean(p.name && p.name !== "Proyecto sin nombre"), "medio", "El proyecto no tiene un nombre definitivo.", "Asignar un nombre identificable al proyecto."),
    item("PRJ-002", "Proyecto", "Cliente", Boolean(p.client), "medio", "Falta el cliente del proyecto.", "Completar datos del cliente."),
    item("PRJ-003", "Proyecto", "Dirección", Boolean(p.address), "medio", "Falta dirección de la instalación.", "Ingresar dirección, comuna y región."),
    item("PRJ-004", "Proyecto", "Tipo de suministro", Boolean(p.supplyType), "alto", "No se definió si el proyecto es monofásico o trifásico.", "Seleccionar tipo de suministro."),
    item("PRJ-005", "Proyecto", "Distribuidora", Boolean(p.distributor), "medio", "Falta distribuidora asociada.", "Seleccionar distribuidora para preparar empalme y documentación.")
  ];
}

function auditLoads(p){
  const loads = arr(p.loads);
  const invalid = loads.filter(load => n(load.powerW) <= 0 || n(load.quantity) <= 0);
  return [
    item("LOAD-001", "Cargas", "Cargas ingresadas", loads.length > 0, "critico", "No existen cargas ingresadas.", "Ingresar cargas antes de generar tablero, empalme o presupuesto.", "Motor de Cargas"),
    item("LOAD-002", "Cargas", "Potencias válidas", loads.length > 0 && invalid.length === 0, "alto", `${invalid.length} carga(s) tienen potencia o cantidad inválida.`, "Corregir potencia y cantidad de cada carga.", "Motor de Cargas"),
    item("LOAD-003", "Cargas", "Potencia instalada", n(p.installedPowerKw) > 0, "alto", "La potencia instalada no está calculada.", "Recalcular el proyecto desde el Motor de Cargas.", "Motor de Cargas"),
    item("LOAD-004", "Cargas", "Demanda estimada", n(p.demandPowerKw) > 0, "medio", "La demanda estimada no está disponible.", "Revisar factores de demanda/simultaneidad.", "RIC 3")
  ];
}

function auditEngineering(p){
  const board = arr(p.loadBoard);
  const protections = arr(p.protections);
  const conductors = arr(p.conductors);
  const obs = arr(p.electricalEngine?.observations);
  const criticalObs = obs.filter(o => ["critico", "alto"].includes(o.level)).length;
  return [
    item("ENG-001", "Ingeniería", "Cuadro de carga generado", board.length > 0, "alto", "No existe cuadro de carga automático.", "Generar cuadro desde el Motor de Ingeniería.", "Motor de Ingeniería"),
    item("ENG-002", "Ingeniería", "Protecciones propuestas", protections.length > 0, "alto", "No hay protecciones propuestas por circuito.", "Revisar Motor de Protecciones y datos de cargas.", "RIC 5"),
    item("ENG-003", "Ingeniería", "Conductores propuestos", conductors.length > 0, "alto", "No hay conductores propuestos por circuito.", "Revisar Motor de Conductores.", "RIC 4"),
    item("ENG-004", "Ingeniería", "Observaciones críticas", criticalObs === 0, "alto", `Existen ${criticalObs} observación(es) crítica(s) en ingeniería.`, "Resolver observaciones antes de documentar.", "Motor Normativo")
  ];
}

function auditBalance(p){
  if(p.supplyType !== "trifasico"){
    return [item("BAL-001", "Balance", "Balance de fases", true, "ok", "No aplica a proyecto monofásico.", "Sin acción.", "Motor de Balance")];
  }
  const percent = n(p.phaseBalance?.summary?.unbalancePercent);
  return [
    item("BAL-001", "Balance", "Balance trifásico calculado", Boolean(p.phaseBalance), "medio", "No se calculó balance de fases.", "Ejecutar balance de fases.", "Motor de Balance"),
    item("BAL-002", "Balance", "Desbalance controlado", Boolean(p.phaseBalance) && percent <= 15, "medio", `Desbalance estimado: ${percent}%.`, "Revisar redistribución de circuitos R/S/T.", "Motor de Balance")
  ];
}

function auditPanel(p){
  const panel = p.panelEngine || p.panel;
  return [
    item("PAN-001", "Tablero", "Tablero generado", Boolean(panel), "alto", "No existe tablero generado.", "Generar tablero desde cargas y cuadro de carga.", "RIC 2"),
    item("PAN-002", "Tablero", "Gabinete sugerido", Boolean(panel?.summary?.recommendedCabinet || panel?.recommendedCabinet), "medio", "No hay gabinete sugerido.", "Calcular gabinete considerando circuitos y reserva.", "RIC 2"),
    item("PAN-003", "Tablero", "Reserva considerada", Boolean(panel?.summary?.reserveModules || panel?.reserveModules), "medio", "No se evidencia reserva de espacio.", "Verificar reserva de módulos para ampliación.", "RIC 2"),
    item("PAN-004", "Tablero", "Barras preparadas", Boolean(panel?.bars || panel?.summary?.bars), "medio", "No se identifican barras PE/neutro/repartidora.", "Completar barras del tablero.", "RIC 2")
  ];
}

function auditGrounding(p){
  const g = p.grounding;
  const measuredOhm = Number(g?.measuredOhm || g?.measurementOhm || g?.summary?.measuredOhm || g?.inputs?.measuredOhm || g?.measurement?.ohm || 0);
  return [
    item("GND-001", "Puesta a tierra", "Diseño de puesta a tierra", Boolean(g), "medio", "No hay diseño/registro de puesta a tierra.", "Completar módulo de Puesta a Tierra.", "RIC 6"),
    item("GND-002", "Puesta a tierra", "Medición en terreno", measuredOhm > 0, "medio", "Falta medición real de resistencia de puesta a tierra.", "Registrar medición en terreno con instrumento adecuado.", "RIC 6"),
    item("GND-003", "Puesta a tierra", "Advertencia técnica", true, "ok", "La medición de tierra no puede ser reemplazada por cálculo preliminar.", "Mantener advertencia en informe.", "RIC 6")
  ];
}

function auditConnection(p){
  const c = p.connection;
  return [
    item("CON-001", "Empalme", "Empalme definido", Boolean(c), "medio", "No existe propuesta de empalme.", "Ejecutar Motor de Empalmes.", "RIC 1"),
    item("CON-002", "Empalme", "Potencia normalizada", Boolean(c?.normalizedPowerKw || c?.normalizedPower), "medio", "Falta potencia normalizada del empalme.", "Seleccionar potencia normalizada válida según reglas cargadas.", "RIC 1"),
    item("CON-003", "Empalme", "Distribuidora vinculada", Boolean(p.distributor), "medio", "No se vinculó distribuidora.", "Seleccionar distribuidora y revisar estándar aplicable.", "RIC 1")
  ];
}

function auditOutputs(p){
  const docs = p.documentationEngine?.documents || p.documentation || [];
  const hasBudget = arr(p.budget).length > 0 || Boolean(p.commercialEngine?.summary);
  return [
    item("OUT-001", "Unilineal", "Unilineal preparado", Boolean(p.unilineal || p.panelEngine), "medio", "No se evidencia unilineal actualizado.", "Generar unilineal desde tablero y cargas.", "Motor Unilineal"),
    item("OUT-002", "Documentación", "Centro documental activo", arr(docs).length > 0 || Boolean(p.documentationEngine), "medio", "No hay documentos preparados.", "Abrir Centro de Documentación SEC.", "Motor Documental"),
    item("OUT-003", "Presupuesto", "Presupuesto generado", hasBudget, "bajo", "No hay presupuesto generado.", "Ejecutar Motor Comercial si se requiere cotización.", "Motor Comercial")
  ];
}

export function runIntegralAudit(project){
  const p = project || {};
  const checks = [
    ...auditProjectData(p),
    ...auditLoads(p),
    ...auditEngineering(p),
    ...auditBalance(p),
    ...auditPanel(p),
    ...auditGrounding(p),
    ...auditConnection(p),
    ...auditOutputs(p)
  ];
  const areas = [...new Set(checks.map(c => c.area))].map(area => {
    const areaChecks = checks.filter(c => c.area === area);
    return {
      area,
      score: score(areaChecks),
      ok: areaChecks.every(c => c.ok),
      total: areaChecks.length,
      pending: areaChecks.filter(c => !c.ok).length
    };
  });
  const overallScore = score(checks);
  const classification = classify(checks);
  const issues = checks.filter(c => !c.ok).map(c => ({
    level: c.level,
    area: c.area,
    label: c.label,
    message: c.message,
    action: c.action,
    source: c.source
  }));
  const blockers = issues.filter(i => ["critico", "alto"].includes(i.level));
  return {
    version: VERSION,
    generatedAt: stamp(),
    projectId: p.id || "sin-id",
    projectName: p.name || "Proyecto sin nombre",
    score: overallScore,
    state: classification.state,
    label: classification.label,
    level: classification.level,
    areas,
    checks,
    issues,
    blockers,
    summary: {
      totalChecks: checks.length,
      ok: checks.filter(c => c.ok).length,
      pending: checks.filter(c => !c.ok).length,
      critical: blockers.length,
      installedPowerKw: n(p.installedPowerKw),
      demandPowerKw: n(p.demandPowerKw),
      circuits: arr(p.loadBoard).length,
      loads: arr(p.loads).length
    },
    nextActions: blockers.length
      ? blockers.slice(0, 5).map(i => `${i.area}: ${i.action}`)
      : issues.slice(0, 5).map(i => `${i.area}: ${i.action}`).concat(issues.length ? [] : ["Proyecto sin bloqueos críticos. Preparar revisión final y documentación."])
  };
}

export function buildAuditTextReport(audit){
  const lines = [];
  lines.push("AUDITORÍA INTEGRAL GIAE");
  lines.push("Proyecto: " + audit.projectName);
  lines.push("Fecha: " + audit.generatedAt);
  lines.push("Estado: " + audit.label);
  lines.push("Puntaje: " + audit.score + "%");
  lines.push("");
  lines.push("Resumen");
  lines.push("Verificaciones: " + audit.summary.totalChecks);
  lines.push("Correctas: " + audit.summary.ok);
  lines.push("Pendientes: " + audit.summary.pending);
  lines.push("Críticas/altas: " + audit.summary.critical);
  lines.push("");
  lines.push("Áreas");
  audit.areas.forEach(a => lines.push(`- ${a.area}: ${a.score}% (${a.pending} pendiente/s)`));
  lines.push("");
  lines.push("Observaciones");
  if(!audit.issues.length) lines.push("Sin observaciones pendientes.");
  audit.issues.forEach(i => lines.push(`- [${i.level}] ${i.area}: ${i.message} Acción: ${i.action}`));
  lines.push("");
  lines.push("Nota: Esta auditoría se basa en reglas implementadas en GIAE. No reemplaza la revisión profesional ni las verificaciones exigidas en terreno.");
  return lines.join("\n");
}

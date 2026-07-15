import { calculateElectricalProject } from "../engineering/electricalEngine.js";
import { evaluateNormative } from "../normative/engine.js";
import { buildReport } from "../reportEngine.js";

const ACTIVE_NORMATIVE_SOURCES = ["DS8", "RIC", "IEC"];

function esc(value = ""){
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function summarizeProject(project){
  const loadCount = Array.isArray(project.loads) ? project.loads.length : 0;
  return {
    name: project.name || "Proyecto sin nombre",
    client: project.client || "Sin cliente",
    location: `${project.address || "Dirección no definida"}, ${project.commune || "Comuna no definida"}`,
    supplyType: project.supplyType || "monofasico",
    voltage: project.supplyType === "trifasico" ? "380/220 V" : "220 V",
    distributor: project.distributor || "Distribuidora no definida",
    loads: loadCount,
    installedKw: project.installedPowerKw || 0,
    demandKw: project.demandPowerKw || 0
  };
}

function buildElectricalNarrative(project, electrical){
  const summary = summarizeProject(project);
  const observations = electrical.observations || [];
  const rules = observations.map(obs => `- ${obs.message}`).join("\n");
  return `Informe técnico preliminar:\n\nProyecto: ${summary.name}\nCliente: ${summary.client}\nUbicación: ${summary.location}\nSuministro: ${summary.supplyType} · ${summary.voltage}\nDistribuidora: ${summary.distributor}\nCargas registradas: ${summary.loads}\nPotencia instalada: ${summary.installedKw} kW\nPotencia demandada: ${summary.demandKw} kW\n\nResultados eléctricos:\n- Estado general: ${electrical.summary.status}\n- Número de circuitos: ${electrical.loadBoard.length}\n- Protección sugerida: ${electrical.protections.length} circuitos\n- Conductores sugeridos: ${electrical.conductors.length}\n- Canalizaciones sugeridas: ${electrical.conduits.length}\n\nObservaciones:\n${rules || "No se detectaron observaciones técnicas preliminares."}\n\nEste informe se basa en cálculos de motor eléctrico y reglas de RIC preimplementadas. No reemplaza un estudio final de oficina técnica ni la firma de un instalador autorizado.`;
}

export async function analyzeElectricalProject(project){
  const electrical = calculateElectricalProject(project);
  const normative = await evaluateNormative(
    { modulo: "cargas", categoria: "Protecciones", ib: electrical.loadBoard[0]?.currentA || 0, in: electrical.loadBoard[0]?.protection?.ampere || 0, iz: electrical.loadBoard[0]?.conductorIzA || 0 },
    { moduleId: "cargas", sources: ACTIVE_NORMATIVE_SOURCES, includeDraft: true }
  );
  return { electrical, normative };
}

export function buildProjectReport(project, advice, request = ""){
  const summary = summarizeProject(project);
  const fields = {
    Proyecto: summary.name,
    Cliente: summary.client,
    Ubicación: summary.location,
    Suministro: summary.supplyType,
    Voltaje: summary.voltage,
    Distribuidora: summary.distributor,
    Circuitos: advice.details.circuits.length,
    Protecciones: advice.details.protections.length,
    Conductores: advice.details.conductors.length,
    Canalizaciones: advice.details.conduits.length,
    Estado: advice.electricalStatus,
    Normativa: advice.normativeStatus
  };
  const points = [];
  if(request) points.push(`Solicitud IA: ${request}`);
  points.push(`El análisis se basa exclusivamente en normativa chilena vigente: DS8, RIC y referencias IEC aplicables. Ninguna norma NCh obsoleta es usada como criterio activo.`);
  points.push(`Resumen eléctrico: ${advice.advice}`);
  points.push(`Observaciones principales: ${advice.details.circuits.map(c => `${c.id}: ${c.name}`).join("; ")}`);

  return buildReport({
    type: "Informe Técnico Eléctrico",
    title: `Informe Técnico GIAE - ${summary.name}`,
    author: "Asistente Eléctrico GIAE",
    institution: "GIAE Chile",
    audience: "Equipo técnico",
    style: "Técnico",
    language: "es-CL",
    description: `Análisis preliminar de cargas, protecciones y conductores para proyecto eléctrico en Chile, con normativa vigente.`,
    fields,
    points
  });
}

export function buildAdvice(project, electrical, normative){
  const mitigation = normative.status === "no_cumple" ? "Revisar reglas normativas y ajustar circuito, conductor o protecciones." : normative.status === "requiere_revision" ? "Verificar datos de carga y condiciones de instalación. Ajustar si corresponde." : "El proyecto cumple preliminarmente con las reglas cargadas.";
  return {
    summary: summarizeProject(project),
    electricalStatus: electrical.summary.status,
    normativeStatus: normative.status,
    advice: `Estado preliminar: ${electrical.summary.status}. Estado normativo: ${normative.status}. ${mitigation}`,
    details: {
      circuits: electrical.loadBoard,
      protections: electrical.protections,
      conductors: electrical.conductors,
      conduits: electrical.conduits,
      materials: electrical.materials
    }
  };
}

export function buildFriendlyResponse(project, advice){
  const summary = advice.summary;
  return `IA Eléctrica GIAE:\n\nProyecto ${summary.name} (${summary.voltage}, ${summary.distributor}).\nEstado eléctrico: ${advice.electricalStatus}.\nEstado normativo: ${advice.normativeStatus}.\n\nRecomendación:\n${advice.advice}\n\nNormativa aplicada: DS8 + RIC + IEC (sin normas NCh obsoletas).\n\nComponentes claves:\n- ${advice.details.circuits.length} circuitos definidos\n- ${advice.details.protections.length} protecciones sugeridas\n- ${advice.details.conductors.length} conductores sugeridos\n- ${advice.details.conduits.length} tramos de canalización\n\nEsta es una evaluación preliminar. Para obra real, confirmar con instalador autorizado y normativa chilena vigente.`;
}

export function buildWorkPlan(project, advice){
  return [
    "Revisar datos generales del proyecto y validar cliente, dirección, tipo de suministro y distribuidora.",
    `Validar las ${advice.details.circuits.length} cargas y circuitos registrados, incluyendo potencias, factores de simultaneidad y fases.`,
    "Dimensionar las protecciones sugeridas con curvas, polos y capacidad de corte adecuada.",
    "Seleccionar conductores según corriente admisible, caída de tensión y condiciones de instalación.",
    "Generar el plano eléctrico preliminar en el módulo CAD y revisar el trazado de tableros y circuitos.",
    "Preparar el informe técnico y la memoria de cálculo con énfasis en cumplimiento de DS8/RIC y referencias IEC.",
    "Coordinar la revisión final con instalador autorizado y la distribuidora antes de ejecutar obra."
  ];
}

export function rememberIaInteraction(project, request, advice, report){
  if(!project) return [];
  project.iaMemory = Array.isArray(project.iaMemory) ? project.iaMemory : [];
  const entry = {
    date: new Date().toLocaleString("es-CL"),
    request: request || "Diagnóstico general",
    status: advice?.electricalStatus || "Desconocido",
    normative: advice?.normativeStatus || "Desconocido",
    summary: advice?.advice || "",
    report: report?.metadata?.title || ""
  };
  project.iaMemory.unshift(entry);
  project.iaMemory = project.iaMemory.slice(0, 20);
  return project.iaMemory;
}

export function formatEngineStatus(){
  return {
    title: "Asistente Eléctrico IA",
    description: "Motor local de razonamiento eléctrico y normativo para proyectos GIAE. Usa cálculo determinista, reglas RIC y un asistente textual gratuito. Exclusivo para Chile y sin NCh obsoleta.",
    capabilities: [
      "Analizar cargas y dimensionar protección y conductores",
      "Revisar caída de tensión preliminar",
      "Validar datos con reglas normativas básicas",
      "Generar informes técnicos eléctricos",
      "Construir un plan de trabajo eléctrico preliminar"
    ]
  };
}

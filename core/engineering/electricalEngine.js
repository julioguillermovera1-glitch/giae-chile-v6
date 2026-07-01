// GIAE Chile v1.0 · Etapa 4.0.2
// Motor de Ingeniería Eléctrica.
// Toma el resultado del Motor de Cargas y lo transforma en datos reutilizables
// para cuadro de carga, unilineal, protecciones, conductores, presupuesto,
// auditoría y documentación.

import { calculateLoadProject } from "./loadEngine.js";
import { calculatePhaseBalance } from "./phaseBalanceEngine.js";

const DEFAULT_LENGTH_M = 20;
const COPPER_RESISTANCE = {
  1.5: 12.1,
  2.5: 7.41,
  4: 4.61,
  6: 3.08,
  10: 1.83,
  16: 1.15,
  25: 0.727,
  35: 0.524,
  50: 0.387,
  70: 0.268,
  95: 0.193,
  120: 0.153
};

const BREAKING_CAPACITY_KA = [6, 10, 15, 25, 36, 50];

function n(value, fallback = 0){
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value, digits = 2){
  return Number(n(value).toFixed(digits));
}

function normalizeText(value = ""){
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function projectVoltage(project){
  return project?.supplyType === "trifasico" ? 380 : 220;
}

function selectBreakingCapacity(project){
  const icc = n(project?.iccKa ?? project?.shortCircuitKa, 6);
  return BREAKING_CAPACITY_KA.find(value => value >= icc) || 50;
}

function isPeopleGathering(project){
  const text = normalizeText(`${project?.serviceType || ""} ${project?.useType || ""} ${project?.observations || ""}`);
  return text.includes("reunion") || text.includes("educacional") || text.includes("escuela") || text.includes("publico") || text.includes("local comercial");
}

function loadLength(circuit, project){
  return n(circuit.lengthM ?? circuit.distanceM ?? project?.defaultCircuitLengthM, DEFAULT_LENGTH_M);
}

function voltageDropPercent(circuit, project){
  const section = String(circuit.conductorSectionMm2 || 2.5);
  const resistanceOhmKm = COPPER_RESISTANCE[section] || COPPER_RESISTANCE[2.5];
  const lengthKm = loadLength(circuit, project) / 1000;
  const fp = n(circuit.fp, 0.95);
  const voltage = projectVoltage(project);
  if(project?.supplyType === "trifasico" && circuit.phase === "R-S-T"){
    const drop = Math.sqrt(3) * circuit.currentA * resistanceOhmKm * lengthKm * fp;
    return round((drop / voltage) * 100, 2);
  }
  const drop = 2 * circuit.currentA * resistanceOhmKm * lengthKm * fp;
  return round((drop / 220) * 100, 2);
}

function confidenceFrom(circuit, project, vdPercent){
  const missing = [];
  if(!project?.supplyType) missing.push("tipo de suministro");
  if(!project?.distributor) missing.push("distribuidora");
  if(!circuit.powerW) missing.push("potencia por unidad");
  if(!circuit.fp) missing.push("factor de potencia");
  if(missing.length){
    return {
      level: "informacion_insuficiente",
      label: "Información insuficiente",
      reason: `Faltan datos para validar completamente: ${missing.join(", ")}.`
    };
  }
  if((circuit.warnings || []).length || vdPercent > 3){
    return {
      level: "requiere_revision",
      label: "Requiere revisión",
      reason: vdPercent > 3 ? "La caída de tensión preliminar supera 3% en el tramo calculado." : "Existen advertencias del motor de cargas."
    };
  }
  return {
    level: "validada_preliminar",
    label: "Validada preliminar",
    reason: "Recomendación generada con reglas RIC 3, RIC 4, RIC 5 y RIC 6 implementadas en GIAE."
  };
}

function differentialType(circuit){
  const text = normalizeText(`${circuit.name} ${circuit.type}`);
  if(text.includes("variador") || text.includes("inversor") || text.includes("fotovolta") || text.includes("cargador")) return "Tipo A/B según fabricante y corriente residual prevista";
  if(text.includes("comput") || text.includes("electron") || text.includes("climat")) return "Tipo A 30 mA recomendado";
  return "Tipo AC/A 30 mA según carga";
}

function conduitMaterial(project){
  return isPeopleGathering(project) ? "Canalización y conductores con características de baja emisión de humos/libres de halógenos donde aplique" : "Canalización EMT/PVC según ambiente y método de instalación";
}

function enrichCircuit(circuit, project, index){
  const vdPercent = voltageDropPercent(circuit, project);
  const breakingCapacityKa = selectBreakingCapacity(project);
  const confidence = confidenceFrom(circuit, project, vdPercent);
  const poleType = project?.supplyType === "trifasico" && circuit.phase === "R-S-T" ? "3P" : "1P+N";
  const protection = {
    circuit: circuit.id,
    label: `${poleType} ${circuit.suggestedBreakerA} A curva C`,
    ampere: circuit.suggestedBreakerA,
    curve: "C",
    poles: poleType,
    breakingCapacityKa,
    differential: differentialType(circuit),
    normativeStatus: confidence.label
  };
  const conductor = {
    circuit: circuit.id,
    sectionMm2: circuit.conductorSectionMm2,
    label: circuit.suggestedConductor,
    material: "Cobre",
    izA: circuit.conductorIzA,
    insulation: isPeopleGathering(project) ? "Libre de halógenos / baja emisión de humos donde aplique" : "Aislación conforme al ambiente de instalación",
    voltageDropPercent: vdPercent,
    normativeStatus: confidence.label
  };
  const conduit = {
    circuit: circuit.id,
    label: circuit.suggestedConduit,
    material: conduitMaterial(project),
    lengthM: loadLength(circuit, project),
    normativeStatus: vdPercent <= 3 ? "Preliminar aceptable" : "Requiere revisar sección/longitud"
  };
  const loadBoardRow = {
    number: index + 1,
    id: circuit.id,
    description: circuit.name,
    type: circuit.type,
    quantity: circuit.quantity,
    unitPowerW: circuit.powerW,
    installedW: circuit.installedW,
    demandW: circuit.demandW,
    currentA: circuit.currentA,
    phase: circuit.phase,
    protection: protection.label,
    differential: protection.differential,
    conductor: conductor.label,
    conductorIzA: conductor.izA,
    conduit: conduit.label,
    voltageDropPercent: vdPercent,
    confidence: confidence.label,
    confidenceReason: confidence.reason
  };
  const materials = [
    { family: "Protección", item: protection.label, qty: 1, unit: "un", circuit: circuit.id },
    { family: "Diferencial", item: protection.differential, qty: 1, unit: "un", circuit: circuit.id },
    { family: "Conductor", item: conductor.label, qty: conduit.lengthM, unit: "m", circuit: circuit.id },
    { family: "Canalización", item: conduit.label, qty: conduit.lengthM, unit: "m", circuit: circuit.id }
  ];
  return {
    ...circuit,
    voltageDropPercent: vdPercent,
    breakingCapacityKa,
    protection,
    conductor,
    conduit,
    loadBoardRow,
    materials,
    confidence,
    engineeringTrace: [
      ...(circuit.normativeTrace || []),
      { source: "Motor Ingeniería", rule: "GEC-402-VD", result: `Caída de tensión preliminar ${vdPercent}%.` },
      { source: "Motor Ingeniería", rule: "GEC-402-ICC", result: `Poder de corte sugerido ≥ ${breakingCapacityKa} kA, sujeto a Icc real.` },
      { source: "Motor Ingeniería", rule: "GEC-402-CONFIANZA", result: confidence.reason }
    ]
  };
}

function summarizeMaterials(circuits){
  const map = new Map();
  circuits.flatMap(c => c.materials || []).forEach(item => {
    const key = `${item.family}|${item.item}|${item.unit}`;
    const previous = map.get(key) || { ...item, qty: 0, circuits: [] };
    previous.qty += n(item.qty, 0);
    previous.circuits.push(item.circuit);
    map.set(key, previous);
  });
  return [...map.values()].map(item => ({
    family: item.family,
    item: item.item,
    qty: round(item.qty, item.unit === "m" ? 1 : 0),
    unit: item.unit,
    circuits: [...new Set(item.circuits)]
  }));
}

function aggregateStatus(circuits, loadResult){
  const critical = circuits.filter(c => c.confidence.level === "informacion_insuficiente" || c.currentA > c.conductorIzA);
  const review = circuits.filter(c => c.confidence.level === "requiere_revision");
  if(critical.length) return "Información insuficiente";
  if(review.length || (loadResult.validations || []).length) return "Requiere revisión";
  return "Validado preliminar";
}

export function calculateElectricalProject(project = {}){
  const loadResult = calculateLoadProject(project);
  const circuits = (loadResult.circuits || []).map((circuit, index) => enrichCircuit(circuit, project, index));
  const phaseBalance = calculatePhaseBalance(circuits, project);
  const loadBoard = circuits.map(c => c.loadBoardRow);
  const protections = circuits.map(c => c.protection);
  const conductors = circuits.map(c => c.conductor);
  const conduits = circuits.map(c => c.conduit);
  const materials = summarizeMaterials(circuits);
  const observations = [];
  circuits.forEach(c => {
    if(c.voltageDropPercent > 3) observations.push({ level: "advertencia", circuit: c.id, message: `Caída de tensión preliminar ${c.voltageDropPercent}% en ${c.name}. Revisar sección o longitud.` });
    if(c.confidence.level === "informacion_insuficiente") observations.push({ level: "informacion", circuit: c.id, message: c.confidence.reason });
  });
  return {
    version: "4.0.3",
    generatedAt: new Date().toISOString(),
    loadResult,
    summary: {
      installedKw: loadResult.installedKw,
      demandKw: loadResult.demandKw,
      demandPercent: loadResult.demandPercent,
      projectCurrentA: loadResult.projectCurrentA,
      maxCircuitCurrentA: loadResult.maxCircuitCurrentA,
      balance: loadResult.balance,
      phaseBalance,
      status: aggregateStatus(circuits, loadResult)
    },
    circuits,
    loadBoard,
    protections,
    conductors,
    conduits,
    materials,
    observations: [...(loadResult.validations || []), ...observations],
    phaseBalance,
    normativeTrace: [...circuits.flatMap(c => c.engineeringTrace || []), ...(phaseBalance.trace || [])],
    outputs: {
      loadBoardReady: loadBoard.length > 0,
      unilinealReady: circuits.length > 0,
      budgetReady: materials.length > 0,
      groundingInputReady: Boolean(loadResult.demandKw || loadResult.installedKw),
      connectionInputReady: Boolean(loadResult.demandKw)
    }
  };
}

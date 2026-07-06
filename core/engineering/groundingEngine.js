// GIAE Chile v6
// Motor inteligente de puesta a tierra.
// Base activa: DS8 + RIC 6 + referencias IEC citadas por el marco vigente.
// NCh4 queda excluida como norma activa de validacion.
// Todo resultado es preliminar hasta registrar medicion real en terreno.

const ENGINE_VERSION = "1.1.0";
const DEFAULT_TOUCH_VOLTAGE = 50;

function n(value, fallback = 0){
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value, digits = 2){
  return Number(n(value).toFixed(digits));
}

function clamp(value, min, max){
  return Math.min(Math.max(n(value, min), min), max);
}

function normalizeText(value = ""){
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function totalPowerW(project){
  if(Number(project.installedPowerKw) > 0) return Number(project.installedPowerKw) * 1000;
  return (project.loads || []).reduce((sum, load) => {
    const power = n(load.powerW || load.power || load.watts, 0);
    const qty = n(load.quantity || load.qty, 1);
    return sum + power * qty;
  }, 0);
}

function projectCurrentA(project){
  if(Number(project.currentA) > 0) return Number(project.currentA);
  const power = totalPowerW(project);
  if(project.supplyType === "trifasico") return power ? power / (Math.sqrt(3) * 380) : 0;
  return power ? power / 220 : 0;
}

function conductorPE(phaseSection){
  const section = n(phaseSection, 6);
  if(section <= 16) return section;
  if(section <= 35) return 16;
  return round(section / 2, 1);
}

function conductorGround(sectionPE){
  return Math.max(16, n(sectionPE, 6));
}

function designTarget(project, input){
  const override = n(input.targetOhm || input.objectiveOhm, 0);
  if(override > 0) return { value: override, basis: "Objetivo definido por el usuario/proyecto." };
  const power = totalPowerW(project);
  const demanding = project.supplyType === "trifasico" || power >= 10000 || normalizeText(project.serviceType).includes("reunion");
  return {
    value: demanding ? 5 : 10,
    basis: demanding
      ? "Objetivo de diseno GIAE para proyecto trifasico, mayor potencia o mayor criticidad."
      : "Objetivo de diseno GIAE para proyecto de baja complejidad."
  };
}

function ttLimit(input){
  const touchVoltage = n(input.touchVoltageLimit || DEFAULT_TOUCH_VOLTAGE, DEFAULT_TOUCH_VOLTAGE);
  const rcdMa = n(input.rcdMilliamp || input.differentialMilliamp, 30);
  if(rcdMa <= 0) return null;
  return round(touchVoltage / (rcdMa / 1000), 2);
}

function verticalRodResistance(input){
  const rho = Math.max(n(input.resistivity, 100), 1);
  const length = Math.max(n(input.rodLength, 2.4), 0.5);
  const diameter = Math.max(n(input.rodDiameter, 0.016), 0.006);
  return (rho / (2 * Math.PI * length)) * (Math.log((4 * length) / diameter) - 1);
}

function coupledResistance(single, quantity, factor){
  const qty = Math.max(Math.round(n(quantity, 1)), 1);
  const coupling = clamp(factor, 0.35, 1);
  return single / (1 + (qty - 1) * coupling);
}

function horizontalConductorResistance(input){
  const rho = Math.max(n(input.resistivity, 100), 1);
  const length = Math.max(n(input.horizontalLength, 10), 1);
  const diameter = Math.max(n(input.groundConductorDiameter, 0.008), 0.004);
  const depth = Math.max(n(input.burialDepth, 0.6), 0.2);
  const logArg = Math.max((2 * length * length) / (diameter * depth), 1.1);
  return (rho / (2 * Math.PI * length)) * (Math.log(logArg) - 1);
}

function ringResistance(input){
  const perimeter = Math.max(n(input.ringPerimeter, 20), 4);
  const equivalent = horizontalConductorResistance({ ...input, horizontalLength: perimeter });
  return equivalent * 0.85;
}

function meshResistance(input){
  const rho = Math.max(n(input.resistivity, 100), 1);
  const width = Math.max(n(input.meshWidth, 6), 1);
  const length = Math.max(n(input.meshLength, 6), 1);
  const spacing = Math.max(n(input.meshSpacing, 3), 0.5);
  const area = width * length;
  const widthRuns = Math.floor(width / spacing) + 1;
  const lengthRuns = Math.floor(length / spacing) + 1;
  const conductorLength = widthRuns * length + lengthRuns * width;
  const gridTerm = rho / (4 * Math.sqrt(area));
  const conductorTerm = rho / Math.max(conductorLength, 1);
  return (gridTerm + conductorTerm) * 0.75;
}

function foundationElectrodeResistance(input){
  const length = Math.max(n(input.foundationLength, input.ringPerimeter || 20), 4);
  return horizontalConductorResistance({ ...input, horizontalLength: length }) * 0.7;
}

function buildMaterialsFor(method, input, pe, electrodeConductor){
  const rodQty = Math.max(Math.round(n(input.rods, 1)), 1);
  const rodLength = n(input.rodLength, 2.4);
  const materials = [
    { family: "Conductor", item: `Conductor PE cobre ${pe} mm2`, qty: 1, unit: "gl" },
    { family: "Conductor", item: `Conductor a electrodo cobre ${electrodeConductor} mm2`, qty: 1, unit: "gl" },
    { family: "Tablero", item: "Barra PE", qty: 1, unit: "un" },
    { family: "Puesta a tierra", item: "Camara de registro de tierra", qty: 1, unit: "un" }
  ];
  if(method === "vertical-simple" || method === "vertical-multiple" || method === "vertical-mejorado"){
    materials.unshift({ family: "Puesta a tierra", item: `Electrodo copperweld 5/8 x ${rodLength} m`, qty: rodQty, unit: "un" });
  }
  if(method === "horizontal"){
    materials.unshift({ family: "Puesta a tierra", item: `Conductor horizontal enterrado ${n(input.horizontalLength, 10)} m`, qty: n(input.horizontalLength, 10), unit: "m" });
  }
  if(method === "anillo"){
    materials.unshift({ family: "Puesta a tierra", item: `Anillo perimetral enterrado ${n(input.ringPerimeter, 20)} m`, qty: n(input.ringPerimeter, 20), unit: "m" });
  }
  if(method === "malla"){
    materials.unshift({ family: "Puesta a tierra", item: `Malla de tierra ${n(input.meshWidth, 6)} x ${n(input.meshLength, 6)} m`, qty: 1, unit: "gl" });
  }
  if(method === "fundacion"){
    materials.unshift({ family: "Puesta a tierra", item: "Electrodo de fundacion / armadura equipotencial", qty: 1, unit: "gl" });
  }
  return materials;
}

function classifyEstimate(ohm, target, measuredOhm = 0){
  const value = measuredOhm > 0 ? measuredOhm : ohm;
  if(value <= target) return { status: measuredOhm > 0 ? "Medicion dentro de objetivo" : "Diseno preliminar viable", level: measuredOhm > 0 ? "ok" : "warning" };
  if(value <= target * 1.5) return { status: measuredOhm > 0 ? "Medicion requiere mejora" : "Diseno cercano al objetivo", level: "warning" };
  return { status: measuredOhm > 0 ? "Medicion fuera de objetivo" : "Requiere redisenar", level: "danger" };
}

function actionFor(method, result, target){
  if(result.estimatedOhm <= target){
    return `${result.label}: alternativa preliminar dentro del objetivo de diseno. Confirmar con medicion real en terreno.`;
  }
  if(method === "vertical-simple") return "Agregar electrodos separados, pasar a banco de electrodos o evaluar anillo/malla.";
  if(method === "vertical-multiple") return "Aumentar separacion/cantidad, mejorar terreno o evaluar malla/anillo.";
  if(method === "horizontal") return "Aumentar longitud enterrada o combinar con electrodos verticales.";
  if(method === "anillo") return "Aumentar perimetro efectivo o complementar con electrodos/malla.";
  if(method === "malla") return "Revisar dimensiones, reticula, resistividad real y diseno especial.";
  if(method === "fundacion") return "Usar solo si existe continuidad verificable y respaldo constructivo.";
  return "Requiere revision profesional y medicion en terreno.";
}

function candidate(method, label, description, estimatedOhm, input, target, pe, electrodeConductor){
  const estimated = round(estimatedOhm, 2);
  const cls = classifyEstimate(estimated, target.value, n(input.measuredOhm || input.measured, 0));
  const result = {
    id: method,
    label,
    description,
    estimatedOhm: estimated,
    targetOhm: target.value,
    status: cls.status,
    level: cls.level,
    materials: buildMaterialsFor(method, input, pe, electrodeConductor)
  };
  result.action = actionFor(method, result, target.value);
  return result;
}

function buildAlternatives(input, target, pe, electrodeConductor){
  const single = verticalRodResistance({ ...input, rods: 1 });
  const rods = Math.max(Math.round(n(input.rods, 1)), 1);
  const factor = clamp(input.meshFactor || input.couplingFactor, 0.35, 1);
  const enhancedFactor = clamp(n(input.soilImprovementFactor, 0.75), 0.45, 1);
  return [
    candidate("vertical-simple", "Electrodo vertical simple", "Una varilla vertical como solucion base o punto de partida.", single, { ...input, rods: 1 }, target, pe, electrodeConductor),
    candidate("vertical-multiple", "Banco de electrodos verticales", "Varias varillas separadas, acopladas y unidas a barra PE/equipotencial.", coupledResistance(single, rods, factor), { ...input, rods }, target, pe, electrodeConductor),
    candidate("vertical-mejorado", "Electrodos con mejoramiento de terreno", "Banco de electrodos con mejoramiento del entorno. Requiere validacion de material y durabilidad.", coupledResistance(single, rods, factor) * enhancedFactor, { ...input, rods }, target, pe, electrodeConductor),
    candidate("horizontal", "Conductor horizontal enterrado", "Conductor desnudo enterrado o electrodo horizontal equivalente.", horizontalConductorResistance(input), input, target, pe, electrodeConductor),
    candidate("anillo", "Anillo perimetral", "Conductor enterrado alrededor de la instalacion, util para equipotencialidad.", ringResistance(input), input, target, pe, electrodeConductor),
    candidate("malla", "Malla de puesta a tierra", "Reticula enterrada para mejorar equipotencialidad y reducir resistencia.", meshResistance(input), input, target, pe, electrodeConductor),
    candidate("fundacion", "Electrodo de fundacion", "Uso de armaduras o conductor embebido, solo con continuidad y respaldo constructivo.", foundationElectrodeResistance(input), input, target, pe, electrodeConductor)
  ].sort((a, b) => a.estimatedOhm - b.estimatedOhm);
}

function recommendedRodCount(input, target){
  const single = verticalRodResistance({ ...input, rods: 1 });
  const factor = clamp(input.meshFactor || input.couplingFactor, 0.35, 1);
  let qty = 1;
  let estimated = coupledResistance(single, qty, factor);
  while(estimated > target.value && qty < 12){
    qty += 1;
    estimated = coupledResistance(single, qty, factor);
  }
  return { rodsNeeded: qty, estimatedOhm: round(estimated, 2) };
}

function buildObservations(project, input, selected, recommended, target){
  const measuredOhm = n(input.measuredOhm || input.measured, 0);
  const observations = [];
  if(!input.designRegistered){
    observations.push({ level: "medio", message: "No existe diseno de puesta a tierra guardado por el usuario; el resultado es propuesta automatica." });
  }
  if(!measuredOhm){
    observations.push({ level: "medio", message: "Falta medicion real de resistencia de puesta a tierra. El calculo no debe marcarse como verificado." });
  }
  if(measuredOhm && measuredOhm > target.value){
    observations.push({ level: "alto", message: `La medicion ingresada (${measuredOhm} ohm) supera el objetivo de diseno (${target.value} ohm).` });
  }
  if(n(input.resistivity, 100) > 500){
    observations.push({ level: "alto", message: "Resistividad de terreno alta. Conviene evaluar malla, anillo, mejoramiento o diseno especial." });
  }
  if(selected.estimatedOhm > target.value && recommended.estimatedOhm > target.value){
    observations.push({ level: "alto", message: "Ninguna alternativa inicial llega al objetivo de diseno. Se requiere ingenieria especial y medicion." });
  }
  if(normalizeText(`${project.normativeBase || ""} ${input.normativeBase || ""}`).includes("nch4")){
    observations.push({ level: "alto", message: "NCh4 fue detectada como referencia. GIAE no la usa como norma activa de validacion." });
  }
  observations.push({ level: "info", message: "Base normativa activa declarada: DS8 + RIC 6 + IEC aplicable citada. NCh4 excluida." });
  return observations;
}

function normativeTrace(target, selected, recommended, input){
  const tt = ttLimit(input);
  return [
    { source: "DS8", rule: "Marco reglamentario vigente", result: "El proyecto se evalua bajo DS8 y sus pliegos tecnicos RIC aplicables." },
    { source: "RIC 6", rule: "Puesta a tierra y enlace equipotencial", result: "Se exigen antecedentes de SPT, conductor PE, electrodos, conexiones, equipotencialidad y medicion." },
    { source: "RIC 6", rule: "Medicion real", result: "El calculo queda como preliminar hasta registrar medicion con instrumento/procedimiento apropiado." },
    { source: "RIC 5 + RIC 6", rule: "Coordinacion de protecciones", result: tt ? `Para TT se muestra referencia de tension/contacto y diferencial: RA teorico maximo ${tt} ohm; no reemplaza objetivo de diseno ni medicion.` : "Coordinar diferenciales/protecciones con el esquema de tierra declarado." },
    { source: "IEC", rule: "Conductores y criterios tecnicos citados", result: "IEC se usa solo como referencia tecnica aplicable cuando el marco chileno vigente la cita o permite." },
    { source: "GIAE", rule: "Objetivo de diseno", result: `${target.value} ohm. ${target.basis}` },
    { source: "GIAE", rule: "Alternativa seleccionada", result: `${selected.label}: ${selected.estimatedOhm} ohm estimados.` },
    { source: "GIAE", rule: "Alternativa recomendada", result: `${recommended.label}: ${recommended.estimatedOhm} ohm estimados.` },
    { source: "GIAE", rule: "Norma obsoleta excluida", result: "NCh4 no se usa para validacion activa en este motor." }
  ];
}

function normalizeInput(project, input = {}){
  const saved = project.grounding || project.earth || project.puestaTierra || {};
  const merged = { ...saved, ...input };
  const phaseSection = n(project.mainConductorSectionMm2 || project.conductorSectionMm2 || merged.phaseSectionMm2, 6);
  return {
    ...merged,
    method: merged.method || merged.systemType || "vertical-multiple",
    groundingScheme: merged.groundingScheme || "TT",
    phaseSectionMm2: phaseSection,
    resistivity: n(merged.resistivity || merged.soilResistivity || merged.resistividadTerreno, 100),
    rodLength: n(merged.rodLength, 2.4),
    rodDiameter: n(merged.rodDiameter, 0.016),
    rods: Math.max(Math.round(n(merged.rods || merged.quantity, 1)), 1),
    meshFactor: clamp(merged.meshFactor || merged.couplingFactor, 0.35, 1),
    measuredOhm: n(merged.measuredOhm || merged.measured || merged.resistenciaMedida, 0),
    horizontalLength: n(merged.horizontalLength, 10),
    ringPerimeter: n(merged.ringPerimeter, 20),
    meshWidth: n(merged.meshWidth, 6),
    meshLength: n(merged.meshLength, 6),
    meshSpacing: n(merged.meshSpacing, 3),
    burialDepth: n(merged.burialDepth, 0.6),
    foundationLength: n(merged.foundationLength, 20),
    rcdMilliamp: n(merged.rcdMilliamp, 30),
    touchVoltageLimit: n(merged.touchVoltageLimit, DEFAULT_TOUCH_VOLTAGE),
    notes: merged.notes || "",
    designRegistered: Boolean(merged.designRegistered || merged.savedAt || input.designRegistered)
  };
}

export function calculateGroundingProject(project = {}, input = {}){
  const normalized = normalizeInput(project, input);
  const target = designTarget(project, normalized);
  const pe = conductorPE(normalized.phaseSectionMm2);
  const electrodeConductor = conductorGround(pe);
  const alternatives = buildAlternatives(normalized, target, pe, electrodeConductor);
  const selected = alternatives.find(item => item.id === normalized.method) || alternatives[0];
  const recommended = alternatives.find(item => item.estimatedOhm <= target.value) || alternatives[0];
  const rodRecommendation = recommendedRodCount(normalized, target);
  const measuredOhm = normalized.measuredOhm;
  const selectedClassification = classifyEstimate(selected.estimatedOhm, target.value, measuredOhm);
  const observations = buildObservations(project, normalized, selected, recommended, target);
  const hasHigh = observations.some(item => item.level === "alto");
  const status = measuredOhm > 0
    ? selectedClassification.status
    : hasHigh
      ? "Requiere revision"
      : "Diseno preliminar requiere medicion";

  return {
    version: ENGINE_VERSION,
    generatedAt: new Date().toLocaleString("es-CL"),
    source: "Motor inteligente de puesta a tierra RIC 6",
    status,
    statusLevel: selectedClassification.level,
    inputs: normalized,
    summary: {
      phaseSectionMm2: normalized.phaseSectionMm2,
      peSectionMm2: pe,
      electrodeConductorMm2: electrodeConductor,
      measuredOhm,
      soilResistivity: normalized.resistivity,
      targetOhm: target.value,
      targetBasis: target.basis,
      selectedMethod: selected.id,
      selectedEstimateOhm: selected.estimatedOhm,
      recommendedMethod: recommended.id,
      recommendedEstimateOhm: recommended.estimatedOhm,
      recommendedRods: rodRecommendation.rodsNeeded,
      recommendedRodsEstimateOhm: rodRecommendation.estimatedOhm,
      groundingScheme: normalized.groundingScheme,
      ttTheoreticalLimitOhm: ttLimit(normalized),
      targetMetBySelectedDesign: selected.estimatedOhm <= target.value,
      targetMetByRecommendedDesign: recommended.estimatedOhm <= target.value,
      verifiedByMeasurement: measuredOhm > 0 && measuredOhm <= target.value,
      measurementRequired: measuredOhm <= 0,
      excludedActiveNorms: ["NCh4"]
    },
    selectedDesign: selected,
    recommendedDesign: recommended,
    alternatives,
    electrode: {
      method: selected.id,
      quantity: normalized.rods,
      diameter: `${round(normalized.rodDiameter * 1000, 1)} mm`,
      length: `${normalized.rodLength} m`,
      estimatedOhm: selected.estimatedOhm
    },
    peConductors: [
      { item: "Conductor PE", sectionMm2: pe, material: "Cobre", status: "Propuesto" },
      { item: "Conductor hacia electrodo", sectionMm2: electrodeConductor, material: "Cobre", status: "Propuesto" }
    ],
    equipotentialBonding: [
      { item: "Barra PE", required: true, status: "Requerida" },
      { item: "Union equipotencial principal", required: true, status: "Requerida" },
      { item: "Conexiones permanentes y accesibles para inspeccion", required: true, status: "Requerida" }
    ],
    materials: selected.materials,
    observations,
    normativeTrace: normativeTrace(target, selected, recommended, normalized)
  };
}

export default calculateGroundingProject;

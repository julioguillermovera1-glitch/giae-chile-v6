// GIAE Chile v1.0 · Etapa 4.0.1
// Motor de Cálculo de Cargas v1.0 inicial.
// Diseñado para alimentar Proyecto Activo, cuadro de carga, unilineal,
// empalme, puesta a tierra, presupuesto y auditoría.

const BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

const COPPER_CAPACITY = [
  { sectionMm2: 1.5, izA: 15 },
  { sectionMm2: 2.5, izA: 21 },
  { sectionMm2: 4, izA: 28 },
  { sectionMm2: 6, izA: 36 },
  { sectionMm2: 10, izA: 50 },
  { sectionMm2: 16, izA: 68 },
  { sectionMm2: 25, izA: 89 },
  { sectionMm2: 35, izA: 110 },
  { sectionMm2: 50, izA: 134 },
  { sectionMm2: 70, izA: 171 },
  { sectionMm2: 95, izA: 207 },
  { sectionMm2: 120, izA: 239 }
];

const LOAD_TYPE_DEFAULTS = {
  alumbrado: { minSectionMm2: 1.5, demandFactor: 1, simultaneityFactor: 1, defaultFp: 0.95, circuitUse: "Iluminación", rule: "RIC4-CON-ILU-001" },
  enchufes: { minSectionMm2: 2.5, demandFactor: 0.7, simultaneityFactor: 1, defaultFp: 0.95, circuitUse: "Enchufes", rule: "RIC4-CON-ENF-001" },
  mixto: { minSectionMm2: 2.5, demandFactor: 0.8, simultaneityFactor: 1, defaultFp: 0.95, circuitUse: "Mixto", rule: "RIC4-CON-MIX-001" },
  fuerza: { minSectionMm2: 2.5, demandFactor: 0.85, simultaneityFactor: 1, defaultFp: 0.9, circuitUse: "Fuerza", rule: "RIC4-CON-GEN-001" },
  climatizacion: { minSectionMm2: 2.5, demandFactor: 0.9, simultaneityFactor: 1, defaultFp: 0.9, circuitUse: "Climatización", rule: "RIC4-CON-GEN-001" },
  especial: { minSectionMm2: 2.5, demandFactor: 1, simultaneityFactor: 1, defaultFp: 0.9, circuitUse: "Especial", rule: "RIC4-CON-GEN-001" }
};

function norm(value = ""){
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function typeKey(type = ""){
  const t = norm(type);
  if(t.includes("alumbr") || t.includes("ilumin")) return "alumbrado";
  if(t.includes("ench")) return "enchufes";
  if(t.includes("mixto")) return "mixto";
  if(t.includes("clima") || t.includes("aire") || t.includes("calef")) return "climatizacion";
  if(t.includes("fuerza") || t.includes("motor")) return "fuerza";
  return "especial";
}

function nextBreaker(currentA){
  return BREAKERS.find(value => value >= currentA) || BREAKERS[BREAKERS.length - 1];
}

function conductorFor(currentA, minSectionMm2 = 1.5){
  return COPPER_CAPACITY.find(item => item.sectionMm2 >= minSectionMm2 && item.izA >= currentA) || COPPER_CAPACITY[COPPER_CAPACITY.length - 1];
}

function voltageForProject(project){
  return project?.supplyType === "trifasico" ? 380 : 220;
}

function currentForPower(watts, project, fp = 0.95, loadSystem = "auto"){
  const supply = loadSystem === "trifasico" || loadSystem === "tri" ? "trifasico" : project?.supplyType;
  if(supply === "trifasico") return watts / (Math.sqrt(3) * 380 * fp);
  return watts / (220 * fp);
}

function safeNumber(value, fallback = 0){
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeLoad(load = {}, index = 0){
  const key = typeKey(load.type || load.tipo || load.category);
  const defaults = LOAD_TYPE_DEFAULTS[key] || LOAD_TYPE_DEFAULTS.especial;
  const quantity = Math.max(1, safeNumber(load.quantity ?? load.qty ?? load.cantidad, 1));
  const powerW = Math.max(0, safeNumber(load.powerW ?? load.power ?? load.watts ?? load.w, 0));
  const demandFactor = Math.min(1, Math.max(0, safeNumber(load.demandFactor ?? load.fd, defaults.demandFactor)));
  const simultaneityFactor = Math.min(1, Math.max(0, safeNumber(load.simultaneityFactor ?? load.fs, defaults.simultaneityFactor)));
  const fp = Math.min(1, Math.max(0.1, safeNumber(load.fp ?? load.powerFactor, defaults.defaultFp)));
  return {
    id: load.id || `C${String(index + 1).padStart(2, "0")}`,
    name: load.name || load.description || load.desc || "Carga sin nombre",
    type: load.type || defaults.circuitUse,
    typeKey: key,
    quantity,
    powerW,
    demandFactor,
    simultaneityFactor,
    fp,
    phase: load.phase || "Auto",
    system: load.system || load.sistema || "auto",
    observations: load.observations || load.obs || ""
  };
}

function assignPhases(circuits, project){
  if(project?.supplyType !== "trifasico"){
    return circuits.map(c => ({...c, phase: "R"}));
  }
  const balance = { R: 0, S: 0, T: 0 };
  return circuits.map(circuit => {
    let phase = circuit.phase;
    if(phase === "R-S-T" || circuit.system === "trifasico"){
      const third = circuit.demandW / 3;
      balance.R += third; balance.S += third; balance.T += third;
      return {...circuit, phase: "R-S-T", phaseLoadW: { R: third, S: third, T: third }};
    }
    if(!["R", "S", "T"].includes(phase)){
      phase = Object.entries(balance).sort((a,b) => a[1] - b[1])[0][0];
    }
    balance[phase] += circuit.demandW;
    return {...circuit, phase, phaseLoadW: { R: phase === "R" ? circuit.demandW : 0, S: phase === "S" ? circuit.demandW : 0, T: phase === "T" ? circuit.demandW : 0 }};
  });
}

function summarizeBalance(circuits, project){
  const phases = { R: 0, S: 0, T: 0 };
  circuits.forEach(circuit => {
    const p = circuit.phaseLoadW || {};
    phases.R += safeNumber(p.R, 0);
    phases.S += safeNumber(p.S, 0);
    phases.T += safeNumber(p.T, 0);
  });
  if(project?.supplyType !== "trifasico"){
    return { phases: { R: phases.R, S: 0, T: 0 }, maxW: phases.R, minW: phases.R, imbalancePercent: 0, recommendation: "Proyecto monofásico: no aplica balance trifásico." };
  }
  const values = Object.values(phases);
  const maxW = Math.max(...values);
  const minW = Math.min(...values);
  const avgW = values.reduce((a,b) => a+b, 0) / 3 || 1;
  const imbalancePercent = ((maxW - minW) / avgW) * 100;
  let recommendation = "Balance aceptable preliminar.";
  if(imbalancePercent > 15){
    const high = Object.entries(phases).sort((a,b) => b[1] - a[1])[0][0];
    const low = Object.entries(phases).sort((a,b) => a[1] - b[1])[0][0];
    recommendation = `Revisar balance: mover cargas desde fase ${high} hacia fase ${low}.`;
  }
  return { phases, maxW, minW, imbalancePercent: Number(imbalancePercent.toFixed(1)), recommendation };
}

function buildNormativeTrace(load, conductor, breaker){
  return [
    { source: "RIC 3", rule: "RIC3-DEM-001", result: "Demanda calculada según factores ingresados en el proyecto." },
    { source: "RIC 4", rule: LOAD_TYPE_DEFAULTS[load.typeKey]?.rule || "RIC4-CON-GEN-001", result: `Sección mínima base ${LOAD_TYPE_DEFAULTS[load.typeKey]?.minSectionMm2 || 2.5} mm².` },
    { source: "RIC 4", rule: "RIC4-CON-CAP-001", result: `Conductor propuesto Cu ${conductor.sectionMm2} mm² con Iz preliminar ${conductor.izA} A.` },
    { source: "RIC 5", rule: "RIC5-DIF-001", result: "Protección diferencial complementaria sugerida ≤ 30 mA cuando corresponda." },
    { source: "RIC 6", rule: "RIC6-MED-001", result: "La puesta a tierra requiere verificación mediante medición en terreno." }
  ];
}

function calculateCircuit(load, project, index){
  const installedW = load.quantity * load.powerW;
  const demandW = installedW * load.demandFactor * load.simultaneityFactor;
  const currentA = currentForPower(demandW, project, load.fp, load.system);
  const defaults = LOAD_TYPE_DEFAULTS[load.typeKey] || LOAD_TYPE_DEFAULTS.especial;
  const conductor = conductorFor(currentA, defaults.minSectionMm2);
  const breakerA = nextBreaker(currentA);
  const suggestedConduit = breakerA <= 20 ? "EMT/PVC 20 mm preliminar" : breakerA <= 32 ? "EMT/PVC 25 mm preliminar" : "Dimensionar canalización según ocupación y método de instalación";
  const warnings = [];
  if(breakerA > conductor.izA) warnings.push("La protección sugerida supera Iz preliminar del conductor. Revisar sección.");
  if(load.powerW === 0) warnings.push("Carga sin potencia asignada.");
  return {
    ...load,
    circuitNumber: index + 1,
    installedW: Number(installedW.toFixed(2)),
    demandW: Number(demandW.toFixed(2)),
    currentA: Number(currentA.toFixed(2)),
    suggestedBreakerA: breakerA,
    suggestedBreaker: `${project?.supplyType === "trifasico" && load.phase === "R-S-T" ? "3P" : "1P+N"} ${breakerA} A curva C`,
    suggestedDifferential: "30 mA tipo A/AC según tipo de carga",
    suggestedConductor: `Cu ${conductor.sectionMm2} mm²`,
    conductorSectionMm2: conductor.sectionMm2,
    conductorIzA: conductor.izA,
    suggestedConduit,
    normativeTrace: buildNormativeTrace(load, conductor, breakerA),
    warnings
  };
}

export function calculateLoadProject(project = {}){
  const normalized = (project.loads || []).map(normalizeLoad);
  const rawCircuits = normalized.map((load, index) => calculateCircuit(load, project, index));
  const circuits = assignPhases(rawCircuits, project);
  const installedW = circuits.reduce((sum, c) => sum + c.installedW, 0);
  const demandW = circuits.reduce((sum, c) => sum + c.demandW, 0);
  const maxCircuitCurrentA = circuits.reduce((max, c) => Math.max(max, c.currentA), 0);
  const projectCurrentA = currentForPower(demandW, project, 0.95, "auto");
  const balance = summarizeBalance(circuits, project);
  const validations = [];
  circuits.forEach(c => {
    if(c.warnings.length) validations.push({ level: "advertencia", circuit: c.id, message: c.warnings.join(" ") });
    if(c.currentA > c.conductorIzA) validations.push({ level: "critico", circuit: c.id, message: "Ib supera Iz preliminar del conductor." });
  });
  if(project?.supplyType === "trifasico" && balance.imbalancePercent > 15){
    validations.push({ level: "advertencia", circuit: "balance", message: balance.recommendation });
  }
  return {
    version: "4.0.1",
    generatedAt: new Date().toISOString(),
    totalLoads: circuits.length,
    installedW: Number(installedW.toFixed(2)),
    installedKw: Number((installedW / 1000).toFixed(3)),
    demandW: Number(demandW.toFixed(2)),
    demandKw: Number((demandW / 1000).toFixed(3)),
    demandPercent: installedW ? Number(((demandW / installedW) * 100).toFixed(1)) : 0,
    projectCurrentA: Number(projectCurrentA.toFixed(2)),
    maxCircuitCurrentA: Number(maxCircuitCurrentA.toFixed(2)),
    balance,
    circuits,
    validations,
    status: validations.some(v => v.level === "critico") ? "Con observaciones críticas" : validations.length ? "Con advertencias" : "Calculado"
  };
}

export function createLoadFromForm(input = {}){
  return normalizeLoad(input, 0);
}

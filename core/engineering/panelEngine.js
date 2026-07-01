// GIAE Chile v1.0 · Etapa 5.0
// Motor de Tableros Inteligente (RIC 2).
// Genera una propuesta de tablero desde el Proyecto Activo y el Motor de Ingeniería.
// No reemplaza revisión de instalador autorizado ni certificación de fabricante.

import { calculateElectricalProject } from "./electricalEngine.js";

const STANDARD_BREAKERS = [6,10,16,20,25,32,40,50,63,80,100,125,160,200];
const STANDARD_CABINETS = [12,18,24,36,54,72,96,120];

function n(value, fallback = 0){
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function round(value, digits = 2){ return Number(n(value).toFixed(digits)); }
function nextStandard(value){ return STANDARD_BREAKERS.find(item => item >= value) || STANDARD_BREAKERS.at(-1); }
function nextCabinet(value){ return STANDARD_CABINETS.find(item => item >= value) || STANDARD_CABINETS.at(-1); }
function norm(value=""){
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function isThree(project){ return project?.supplyType === "trifasico"; }
function poles(project, circuit){
  if(isThree(project) && (circuit?.phase === "R-S-T" || circuit?.protection?.poles === "3P")) return "3P";
  return isThree(project) ? "1P+N" : "1P+N";
}
function modulesForDevice(device){
  if(device.kind === "IGA") return device.poles === "3P+N" ? 4 : 2;
  if(device.kind === "DPS") return device.poles === "3P+N" ? 4 : 2;
  if(device.kind === "Diferencial") return device.poles === "4P" ? 4 : 2;
  if(device.kind === "Automático") return device.poles === "3P" ? 3 : 1;
  if(device.kind === "Reserva") return device.modules || 0;
  return 1;
}
function circuitGroup(type=""){
  const t = norm(type);
  if(t.includes("alumbr")) return "Alumbrado";
  if(t.includes("enchuf")) return "Enchufes";
  if(t.includes("fuerza") || t.includes("motor")) return "Fuerza";
  if(t.includes("climat")) return "Climatización";
  if(t.includes("especial")) return "Especial";
  return "Generales";
}
function groupCircuits(circuits){
  const map = new Map();
  circuits.forEach(circuit => {
    const group = circuitGroup(circuit.type);
    if(!map.has(group)) map.set(group, []);
    map.get(group).push(circuit);
  });
  return [...map.entries()].map(([name, items]) => ({ name, items }));
}
function differentialForGroup(group, project){
  const totalBreaker = group.items.reduce((sum, c) => sum + n(c.protection?.ampere || c.suggestedBreakerA, 0), 0);
  const maxBreaker = Math.max(...group.items.map(c => n(c.protection?.ampere || c.suggestedBreakerA, 0)), 16);
  const nominal = nextStandard(Math.max(25, Math.min(63, Math.ceil(Math.max(maxBreaker, totalBreaker * 0.45)))));
  const hasThreePole = group.items.some(c => c.phase === "R-S-T");
  const diffPoles = isThree(project) && hasThreePole ? "4P" : "2P";
  const type = group.name === "Climatización" || group.name === "Especial" ? "Tipo A" : "Tipo AC/A";
  return {
    id: `ID-${group.name.toUpperCase().replace(/\s+/g,"-")}`,
    kind: "Diferencial",
    label: `ID ${diffPoles} ${nominal} A 30 mA ${type}`,
    group: group.name,
    ampere: nominal,
    poles: diffPoles,
    sensitivity: "30 mA",
    type,
    modules: diffPoles === "4P" ? 4 : 2,
    normativeTrace: [
      { source:"RIC 5", rule:"Protección diferencial", result:"Sensibilidad 30 mA como criterio de protección complementaria cuando corresponda." },
      { source:"RIC 2", rule:"Tablero", result:"Dispositivo incorporado como protección y maniobra dentro del tablero." }
    ]
  };
}
function mainBreaker(project, electrical){
  const current = n(electrical?.summary?.projectCurrentA || project?.currentA, 0);
  const ampere = nextStandard(Math.max(current, 6));
  const p = isThree(project) ? "3P+N" : "1P+N";
  return {
    id:"IGA-001",
    kind:"IGA",
    label:`IGA ${p} ${ampere} A curva C`,
    ampere,
    poles:p,
    curve:"C",
    modules:p === "3P+N" ? 4 : 2,
    normativeTrace:[
      { source:"RIC 2", rule:"Tablero general", result:"Se incorpora protección general y maniobra para el tablero." },
      { source:"Motor Ingeniería", rule:"Corriente proyecto", result:`Corriente de proyecto estimada ${round(current,2)} A.` }
    ]
  };
}
function surgeProtection(project){
  const p = isThree(project) ? "3P+N" : "1P+N";
  return {
    id:"DPS-001",
    kind:"DPS",
    label:`DPS ${p} tipo 2, Imax según estudio`,
    poles:p,
    modules:p === "3P+N" ? 4 : 2,
    status:"Requiere confirmación según evaluación de riesgo y exigencias del proyecto",
    normativeTrace:[
      { source:"RIC 2 / RIC 5", rule:"Protección", result:"DPS preparado como elemento de protección; requiere confirmación normativa del caso." }
    ]
  };
}
function circuitBreaker(circuit, project, index){
  const pole = poles(project, circuit);
  const amp = n(circuit.protection?.ampere || circuit.suggestedBreakerA, 10);
  return {
    id:`QF-${String(index + 1).padStart(2,"0")}`,
    kind:"Automático",
    label:`QF${index + 1} ${pole} ${amp} A curva C`,
    circuitId:circuit.id,
    circuitName:circuit.name,
    group:circuitGroup(circuit.type),
    ampere:amp,
    poles:pole,
    phase:circuit.phase,
    modules:pole === "3P" ? 3 : 1,
    conductor:circuit.conductor?.label || circuit.suggestedConductor,
    currentA:round(circuit.currentA,2),
    normativeStatus:circuit.confidence?.label || "Preliminar",
    normativeTrace:[
      { source:"RIC 2", rule:"Identificación de circuitos", result:`Circuito ${index + 1} asociado a ${circuit.name}.` },
      { source:"RIC 4", rule:"Conductor", result:`Conductor sugerido: ${circuit.conductor?.label || circuit.suggestedConductor}.` },
      { source:"RIC 5", rule:"Protección", result:`Protección sugerida: ${amp} A curva C.` }
    ]
  };
}
function bars(project, circuits){
  const three = isThree(project);
  const maxA = nextStandard(Math.max(n(project?.currentA,0), ...circuits.map(c => n(c.protection?.ampere || c.suggestedBreakerA, 0)), 40));
  return [
    { id:"BR-REP", kind:"Barra repartidora", label: three ? `Barra repartidora tetrapolar 4x${Math.max(63,maxA)} A` : `Barra repartidora bipolar 2x${Math.max(40,maxA)} A`, poles: three ? "4P" : "2P", status:"Preliminar" },
    { id:"BR-N", kind:"Barra neutro", label:"Barra de neutro identificada", status:"Requerida" },
    { id:"BR-PE", kind:"Barra PE", label:"Barra de protección PE identificada", status:"Requerida" }
  ];
}
function validatePanel(panel){
  const observations = [];
  if(!panel.devices.some(d => d.kind === "IGA")) observations.push({ level:"critico", message:"El tablero no tiene interruptor general automático definido." });
  if(!panel.bars.some(b => b.kind === "Barra PE")) observations.push({ level:"critico", message:"El tablero no tiene barra PE definida." });
  if(!panel.bars.some(b => b.kind === "Barra neutro")) observations.push({ level:"advertencia", message:"Verificar barra de neutro según configuración del tablero." });
  if(panel.reservePercent < 20) observations.push({ level:"advertencia", message:"La reserva de módulos es inferior al 20% recomendado para futuras ampliaciones." });
  if(panel.circuits.length && !panel.groups.length) observations.push({ level:"advertencia", message:"No se generaron grupos de circuitos para diferenciales." });
  if(!panel.circuits.length) observations.push({ level:"informacion", message:"No hay circuitos calculados; el tablero queda como plantilla preliminar." });
  return observations;
}
function panelStatus(observations){
  if(observations.some(o => o.level === "critico")) return "No conforme preliminar";
  if(observations.length) return "Requiere revisión";
  return "Validado preliminar";
}
export function calculatePanelProject(project = {}){
  const electrical = project.electricalEngine || calculateElectricalProject(project);
  const circuits = electrical.circuits || [];
  const groups = groupCircuits(circuits).map(group => ({ ...group, differential: differentialForGroup(group, project) }));
  const devices = [mainBreaker(project, electrical), surgeProtection(project)];
  groups.forEach(group => {
    devices.push(group.differential);
    group.items.forEach(circuit => devices.push(circuitBreaker(circuit, project, circuits.indexOf(circuit))));
  });
  const usedModules = devices.reduce((sum, device) => sum + (device.modules ?? modulesForDevice(device)), 0);
  const reserveModules = Math.max(2, Math.ceil(usedModules * 0.2));
  const requiredModules = usedModules + reserveModules;
  const cabinetModules = nextCabinet(requiredModules);
  const reservePercent = usedModules ? round((cabinetModules - usedModules) / usedModules * 100, 1) : 100;
  const panel = {
    version:"5.0",
    generatedAt:new Date().toISOString(),
    name: project.panelName || "Tablero General",
    supplyType: project.supplyType || "monofasico",
    circuits,
    groups: groups.map(group => ({ name:group.name, circuitCount:group.items.length, differential:group.differential, circuitIds:group.items.map(i => i.id) })),
    devices,
    bars: bars(project, circuits),
    usedModules,
    reserveModules,
    requiredModules,
    cabinetModules,
    reservePercent,
    cabinetLabel:`Gabinete ${cabinetModules} módulos DIN`,
    materials:[
      { family:"Tablero", item:`Gabinete ${cabinetModules} módulos DIN`, qty:1, unit:"un" },
      ...devices.map(device => ({ family:device.kind, item:device.label, qty:1, unit:"un" })),
      ...bars(project, circuits).map(bar => ({ family:"Barras", item:bar.label, qty:1, unit:"un" }))
    ],
    normativeTrace:[
      { source:"RIC 2", rule:"Tableros eléctricos", result:"Propuesta de tablero generada con protecciones, maniobra, barras e identificación preliminar." },
      { source:"RIC 2", rule:"Espacio disponible", result:`Reserva calculada: ${reservePercent}% (${cabinetModules - usedModules} módulos libres).` },
      { source:"Motor Ingeniería", rule:"Circuitos", result:`Se tomaron ${circuits.length} circuitos desde el Proyecto Activo.` }
    ]
  };
  panel.observations = validatePanel(panel);
  panel.status = panelStatus(panel.observations);
  return panel;
}

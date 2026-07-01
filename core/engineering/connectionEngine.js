import { safeRound } from "../calculations.js";

const ENGINE_VERSION = "8.0.0";

const MONO_STANDARD = [
  { breakerA: 6, nominalKw: 1, maxKva: 1.3, type: "A-6 o S-6" },
  { breakerA: 10, nominalKw: 2, maxKva: 2.2, type: "A-6 o S-6" },
  { breakerA: 16, nominalKw: 3, maxKva: 3.5, type: "A-9 o S-9" },
  { breakerA: 20, nominalKw: 4, maxKva: 4.4, type: "A-9 o S-9" },
  { breakerA: 25, nominalKw: 5, maxKva: 5.5, type: "A-16 o S-16" },
  { breakerA: 30, nominalKw: 6, maxKva: 6.6, type: "A-16 o S-16" },
  { breakerA: 32, nominalKw: 6.5, maxKva: 7.0, type: "A-16 o S-16" },
  { breakerA: 35, nominalKw: 7, maxKva: 7.7, type: "A-16 o S-16" },
  { breakerA: 40, nominalKw: 8, maxKva: 8.8, type: "A-16 o S-16" },
  { breakerA: 50, nominalKw: 10, maxKva: 11, type: "A-16 o S-16" },
  { breakerA: 63, nominalKw: 13, maxKva: 13.8, type: "A-16 o S-16" }
];

const TRI_STANDARD = [
  { breakerA: 6, nominalKw: 3.6, maxKva: 3.95, type: "A/S según estándar constructivo" },
  { breakerA: 10, nominalKw: 6, maxKva: 6.58, type: "A/S según estándar constructivo" },
  { breakerA: 16, nominalKw: 9.7, maxKva: 10.53, type: "A-16 / S-16" },
  { breakerA: 20, nominalKw: 12, maxKva: 13.16, type: "A-16 / S-16" },
  { breakerA: 25, nominalKw: 15, maxKva: 16.45, type: "A-27 o S-27" },
  { breakerA: 30, nominalKw: 18, maxKva: 19.75, type: "A-27 o S-27" },
  { breakerA: 32, nominalKw: 19, maxKva: 21.06, type: "A-27 o S-27" },
  { breakerA: 35, nominalKw: 21, maxKva: 23.04, type: "A-27 o S-27" },
  { breakerA: 40, nominalKw: 24, maxKva: 26.33, type: "A-27 o S-27" },
  { breakerA: 50, nominalKw: 30, maxKva: 32.91, type: "AR-48 o SR-48" },
  { breakerA: 63, nominalKw: 38, maxKva: 41.47, type: "AR-48 o SR-48" },
  { breakerA: 80, nominalKw: 48, maxKva: 52.65, type: "AR-75 o SR-75" },
  { breakerA: 90, nominalKw: 55, maxKva: 59.24, type: "AR-75 o SR-75" },
  { breakerA: 100, nominalKw: 61, maxKva: 65.82, type: "AR-100 o SR-100" },
  { breakerA: 125, nominalKw: 76, maxKva: 82.27, type: "AR-100 o SR-100" },
  { breakerA: 150, nominalKw: 91, maxKva: 98.7, type: "AR-150 o SR-150" },
  { breakerA: 160, nominalKw: 97, maxKva: 105.31, type: "AR-150 o SR-150" },
  { breakerA: 200, nominalKw: 122, maxKva: 131.64, type: "AR-225 o SR-225" },
  { breakerA: 225, nominalKw: 137, maxKva: 148.1, type: "AR-225 o SR-225" },
  { breakerA: 250, nominalKw: 153, maxKva: 164.54, type: "AR-250 o SR-250" },
  { breakerA: 320, nominalKw: 195, maxKva: 210.62, type: "AR-350 o SR-350" },
  { breakerA: 350, nominalKw: 214, maxKva: 230.4, type: "AR-350 o SR-350" },
  { breakerA: 400, nominalKw: 244, maxKva: 263.27, type: "AR-350 o SR-350" },
  { breakerA: 450, nominalKw: 275, maxKva: 296.2, type: "AR-750 o SR-750" },
  { breakerA: 500, nominalKw: 306, maxKva: 329.09, type: "AR-750 o SR-750" },
  { breakerA: 630, nominalKw: 385, maxKva: 414.65, type: "AR-750 o SR-750" },
  { breakerA: 800, nominalKw: 489, maxKva: 526.54, type: "AR-750 o SR-750" },
  { breakerA: 1000, nominalKw: 612, maxKva: 658.18, type: "AR-750 o SR-750" }
];

function normalizeDistributor(value){
  const id = String(value || "").trim().toLowerCase();
  const map = { cge:"CGE", copelec:"Copelec", frontel:"Frontel", saesa:"Saesa", chilquinta:"Chilquinta", coelcha:"Coelcha" };
  return map[id] || value || "No definida";
}

function findStandard(table, installedKw){
  const kw = Number(installedKw || 0);
  if(!kw) return { selected: null, next: table[0] || null, underMinimum: false, overCatalog: false };
  const selected = [...table].reverse().find(item => item.nominalKw <= kw);
  const next = table.find(item => item.nominalKw >= kw) || null;
  return {
    selected: selected || table[0] || null,
    next,
    underMinimum: kw < (table[0]?.nominalKw || 0),
    overCatalog: kw > (table[table.length - 1]?.nominalKw || Infinity)
  };
}

function buildObservations(project, standard, selected, demandKw){
  const obs = [];
  if(!project.distributor) obs.push({ level:"medio", message:"Distribuidora no definida. El empalme debe revisarse con el estándar constructivo de la empresa distribuidora." });
  if(!project.address) obs.push({ level:"medio", message:"Falta dirección del proyecto. La ubicación del equipo de medida depende de las condiciones del predio y acceso." });
  if(!selected) obs.push({ level:"alto", message:"No fue posible seleccionar una potencia normalizada con los datos actuales." });
  if(standard.underMinimum) obs.push({ level:"medio", message:"La potencia instalada está bajo el primer valor normalizado disponible. Revisar si corresponde el mínimo de empalme." });
  if(standard.overCatalog) obs.push({ level:"alto", message:"La potencia instalada supera el catálogo inicial cargado en GIAE. Requiere revisión normativa y con distribuidora." });
  if(selected && demandKw > selected.nominalKw){
    obs.push({ level:"medio", message:"La demanda calculada supera la potencia nominal seleccionada. Revisar factores, demanda y capacidad del empalme antes de documentar." });
  }
  if(project.supplyType === "trifasico" && Number(project.installedPowerKw || 0) > 0 && Number(project.installedPowerKw) < 3.6){
    obs.push({ level:"alto", message:"Empalme trifásico bajo 3,6 kW no corresponde al primer valor trifásico normalizado cargado." });
  }
  return obs;
}

function normativeTrace(project){
  return [
    { source:"RIC 1", rule:"RIC1-EMP-001", result:"El empalme conecta la unidad de medida con la red de distribución." },
    { source:"RIC 1", rule:"RIC1-EMP-002", result:"La capacidad se determina con la potencia total instalada y se ajusta a valores normalizados." },
    { source:"RIC 1", rule:"RIC1-EMP-003", result:"Toda energización requiere instalación ejecutada conforme a normativa y comunicación inscrita ante SEC." },
    { source:"RIC 1", rule:"RIC1-EMP-004", result:"La distribuidora puede aplicar estándares constructivos propios de libre acceso cuando corresponda." },
    { source:"GIAE", rule:"GIAE-EMP-001", result:`Sistema ${project.supplyType === "trifasico" ? "trifásico" : "monofásico"} evaluado con tabla normalizada inicial.` }
  ];
}

export function calculateConnectionProject(project = {}){
  const supplyType = project.supplyType === "trifasico" ? "trifasico" : "monofasico";
  const table = supplyType === "trifasico" ? TRI_STANDARD : MONO_STANDARD;
  const installedKw = safeRound(Number(project.installedPowerKw || project.electricalEngine?.summary?.installedKw || 0), 3);
  const demandKw = safeRound(Number(project.demandPowerKw || project.electricalEngine?.summary?.demandKw || 0), 3);
  const standard = findStandard(table, installedKw);
  const selected = standard.selected;
  const currentA = selected?.breakerA || Number(project.currentA || project.electricalEngine?.summary?.projectCurrentA || 0);
  const observations = buildObservations(project, standard, selected, demandKw);
  const confidence = observations.some(o => o.level === "alto") ? "requiere_revision" : (observations.length ? "en_revision" : "validado_preliminar");
  const installationMode = project.connectionInstallation || "definir-en-terreno";
  const normalizedType = selected?.type || "Requiere revisión";
  const documentationData = {
    distributor: normalizeDistributor(project.distributor),
    supplyType,
    serviceType: project.serviceType || "instalacion-nueva",
    installedKw,
    demandKw,
    normalizedPowerKw: selected?.nominalKw || 0,
    maxKva: selected?.maxKva || 0,
    limiterA: selected?.breakerA || 0,
    normalizedType,
    installationMode,
    address: project.address || ""
  };

  return {
    version: ENGINE_VERSION,
    source: "Motor de Empalmes RIC 1",
    generatedAt: new Date().toLocaleString("es-CL"),
    status: confidence,
    summary: {
      distributor: documentationData.distributor,
      supplyType,
      serviceType: documentationData.serviceType,
      installedKw,
      demandKw,
      currentA: safeRound(currentA, 2),
      normalizedPowerKw: selected?.nominalKw || 0,
      maxKva: selected?.maxKva || 0,
      limiterA: selected?.breakerA || 0,
      normalizedType,
      installationMode,
      confidence
    },
    selected,
    nextHigher: standard.next,
    tableName: supplyType === "trifasico" ? "Empalmes trifásicos" : "Empalmes monofásicos",
    observations,
    documentationData,
    normativeTrace: normativeTrace(project),
    budgetItems: selected ? [
      { family:"Empalme", item:`Empalme ${supplyType === "trifasico" ? "trifásico" : "monofásico"} ${selected.nominalKw} kW`, qty:1, unit:"gl", source:"Motor de Empalmes" },
      { family:"Protección", item:`Limitador / termomagnético ${selected.breakerA} A`, qty:1, unit:"un", source:"RIC 1 Anexo 1.3" },
      { family:"Documentación", item:"Antecedentes para solicitud/factibilidad de empalme", qty:1, unit:"gl", source:"Centro Documental" }
    ] : [],
    standards: table
  };
}

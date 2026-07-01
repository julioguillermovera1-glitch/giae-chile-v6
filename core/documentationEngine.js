const EMBEDDED_DOCUMENT_CATALOG = {
  version: "1.0-alpha.044",
  documents: [
    { id:"TE1", name:"TE1", title:"Declaración de instalación eléctrica interior", category:"SEC", status:"activo_inicial", appliesTo:["monofasico","trifasico"], requiredData:["datos_proyecto","cliente","instalador","cargas","cuadro_carga","unilineal","puesta_tierra","memoria_tecnica"], confidence:"preparado" },
    { id:"TE2", name:"TE2", title:"Documento eléctrico SEC TE2", category:"SEC", status:"pendiente_implementacion_normativa", appliesTo:["por_definir"], requiredData:[], confidence:"requiere_revision" },
    { id:"TE3", name:"TE3", title:"Documento eléctrico SEC TE3", category:"SEC", status:"pendiente_implementacion_normativa", appliesTo:["por_definir"], requiredData:[], confidence:"requiere_revision" },
    { id:"TE3_4", name:"TE3.4", title:"Documento eléctrico SEC TE3.4", category:"SEC", status:"pendiente_implementacion_normativa", appliesTo:["por_definir"], requiredData:[], confidence:"requiere_revision" },
    { id:"TE4", name:"TE4", title:"Documento eléctrico SEC TE4", category:"SEC", status:"pendiente_implementacion_normativa", appliesTo:["por_definir"], requiredData:[], confidence:"requiere_revision" },
    { id:"TE6", name:"TE6", title:"Documento eléctrico SEC TE6", category:"SEC", status:"pendiente_implementacion_normativa", appliesTo:["por_definir"], requiredData:[], confidence:"requiere_revision" },
    { id:"MEMORIA_TECNICA", name:"Memoria técnica", title:"Memoria técnica del proyecto eléctrico", category:"informe", status:"preparado", appliesTo:["monofasico","trifasico"], requiredData:["datos_proyecto","cargas","calculos","normativa"], confidence:"preparado" },
    { id:"INFORME_TIERRA", name:"Informe puesta a tierra", title:"Informe de puesta a tierra y enlace equipotencial", category:"informe", status:"preparado", appliesTo:["monofasico","trifasico"], requiredData:["puesta_tierra","medicion_terreno","responsable"], confidence:"preparado" },
    { id:"SOLICITUD_EMPAlME", name:"Solicitud de empalme", title:"Antecedentes para solicitud de empalme o factibilidad", category:"distribuidora", status:"preparado_parcial", appliesTo:["monofasico","trifasico"], requiredData:["potencia","demanda","distribuidora","tipo_suministro","direccion"], confidence:"requiere_revision" }
  ]
};

function has(value){ return value !== undefined && value !== null && String(value).trim() !== ""; }
function hasLoads(project){ return Array.isArray(project.loads) && project.loads.length > 0; }
function hasLoadBoard(project){ return Array.isArray(project.loadBoard) && project.loadBoard.length > 0; }
function hasGrounding(project){ return Boolean(project.grounding || project.groundingEngine || project.tierra); }
function hasUnilineal(project){ return Boolean(project.unilineal || hasLoadBoard(project)); }
function hasCalculations(project){ return Boolean(project.electricalEngine || project.loadEngine || hasLoadBoard(project)); }

export function getDocumentCatalog(){
  return JSON.parse(JSON.stringify(EMBEDDED_DOCUMENT_CATALOG));
}

export function evaluateRequiredData(project, requiredData = []){
  const checks = {
    datos_proyecto: Boolean(has(project.name) && has(project.address) && has(project.supplyType)),
    cliente: has(project.client),
    instalador: Boolean(has(project.installer) || has(project.responsible) || has(project.company)),
    cargas: hasLoads(project),
    cuadro_carga: hasLoadBoard(project),
    unilineal: hasUnilineal(project),
    puesta_tierra: hasGrounding(project),
    memoria_tecnica: hasCalculations(project),
    calculos: hasCalculations(project),
    normativa: Boolean(project.electricalEngine || project.normativeTrace || project.audit),
    medicion_terreno: Boolean(project.grounding?.measurementOhm || project.grounding?.measuredOhm),
    responsable: Boolean(has(project.installer) || has(project.responsible)),
    potencia: Number(project.installedPowerKw || project.demandPowerKw || 0) > 0,
    demanda: Number(project.demandPowerKw || 0) > 0,
    distribuidora: has(project.distributor),
    tipo_suministro: has(project.supplyType),
    direccion: has(project.address)
  };
  return requiredData.map(id => ({ id, ok: Boolean(checks[id]), label: labelForRequirement(id) }));
}

function labelForRequirement(id){
  const labels = {
    datos_proyecto:"Datos generales del proyecto", cliente:"Cliente", instalador:"Instalador o responsable", cargas:"Cargas", cuadro_carga:"Cuadro de carga", unilineal:"Unilineal", puesta_tierra:"Puesta a tierra", memoria_tecnica:"Memoria técnica", calculos:"Cálculos eléctricos", normativa:"Trazabilidad normativa", medicion_terreno:"Medición real en terreno", responsable:"Responsable de medición/documento", potencia:"Potencia instalada", demanda:"Demanda", distribuidora:"Distribuidora", tipo_suministro:"Tipo de suministro", direccion:"Dirección"
  };
  return labels[id] || id;
}

function appliesBySupply(document, project){
  const supply = project.supplyType || "monofasico";
  return !document.appliesTo || document.appliesTo.includes(supply) || document.appliesTo.includes("general") || document.appliesTo.includes("por_definir");
}

export function evaluateDocument(project, document){
  const requirements = evaluateRequiredData(project, document.requiredData || []);
  const total = requirements.length || 1;
  const complete = requirements.filter(item => item.ok).length;
  const completion = Math.round((complete / total) * 100);
  const applicable = appliesBySupply(document, project);
  let status = document.status || "pendiente_implementacion_normativa";
  let result = "pendiente";
  if(!applicable){
    result = "no_aplica";
  } else if(status.includes("pendiente")){
    result = "preparado_futuro";
  } else if(completion >= 100){
    result = "listo";
  } else if(completion >= 50){
    result = "incompleto";
  } else {
    result = "pendiente_datos";
  }
  return { ...document, applicable, requirements, completion, result };
}

export function calculateDocumentationProject(project){
  const catalog = getDocumentCatalog();
  const evaluated = catalog.documents.map(doc => evaluateDocument(project, doc));
  const active = evaluated.filter(doc => doc.applicable && !String(doc.status).includes("pendiente_implementacion_normativa"));
  const future = evaluated.filter(doc => String(doc.status).includes("pendiente_implementacion_normativa"));
  const ready = active.filter(doc => doc.result === "listo");
  const missing = active.filter(doc => doc.result !== "listo");
  return {
    version: catalog.version,
    generatedAt: new Date().toLocaleString("es-CL"),
    summary: {
      total: evaluated.length,
      active: active.length,
      ready: ready.length,
      missing: missing.length,
      future: future.length,
      status: missing.length ? "Documentación incompleta" : "Documentación base lista"
    },
    documents: evaluated,
    requiredNow: active,
    futureDocuments: future,
    warning: "El Centro de Documentación SEC no emite documentos cuya regla normativa o formulario aún esté pendiente de implementación."
  };
}

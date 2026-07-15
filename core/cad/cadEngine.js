export const CAD_SCHEMA = "giae.cad.document.v1";

export const CAD_LAYERS = [
  { id: "arquitectura", label: "Referencia", color: "#64748b", locked: false },
  { id: "alumbrado", label: "Alumbrado", color: "#f59e0b", locked: false },
  { id: "enchufes", label: "Enchufes", color: "#2563eb", locked: false },
  { id: "fuerza", label: "Fuerza", color: "#7c3aed", locked: false },
  { id: "canalizacion", label: "Canalizacion", color: "#0f766e", locked: false },
  { id: "tablero", label: "Tablero", color: "#111827", locked: false },
  { id: "tierra", label: "Tierra", color: "#15803d", locked: false },
  { id: "notas", label: "Notas", color: "#334155", locked: false },
  { id: "revision", label: "Revision", color: "#b42318", locked: false }
];

export const CAD_SYMBOLS = [
  { id: "panel", label: "Tablero", layer: "tablero", kind: "equipment", ports: ["in", "out", "pe"] },
  { id: "breaker", label: "Proteccion", layer: "tablero", kind: "protection", ports: ["in", "out"] },
  { id: "light", label: "Punto luz", layer: "alumbrado", kind: "load", ports: ["phase", "neutral", "pe"] },
  { id: "switch", label: "Interruptor", layer: "alumbrado", kind: "control", ports: ["in", "out"] },
  { id: "outlet", label: "Enchufe", layer: "enchufes", kind: "load", ports: ["phase", "neutral", "pe"] },
  { id: "motor", label: "Motor/carga fuerza", layer: "fuerza", kind: "load", ports: ["phase", "neutral", "pe"] },
  { id: "junction", label: "Caja derivacion", layer: "canalizacion", kind: "connection", ports: ["a", "b", "c", "d"] },
  { id: "ground", label: "Puesta a tierra", layer: "tierra", kind: "ground", ports: ["pe"] },
  { id: "note", label: "Nota", layer: "notas", kind: "annotation", ports: [] },
  { id: "dimension", label: "Dimension", layer: "revision", kind: "annotation", ports: [] }
];

function stamp(){ return new Date().toISOString(); }
function localStamp(){ return new Date().toLocaleString("es-CL"); }
function clone(value){ return JSON.parse(JSON.stringify(value || {})); }
function arr(value){ return Array.isArray(value) ? value : []; }
function makeId(prefix){ return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }
function n(value, fallback = 0){ const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function parseScale(scale = "1:50"){ const parts = String(scale).split(":").map(part => Number(part.trim())); return parts.length === 2 && parts[0] > 0 && parts[1] > 0 ? parts[0] / parts[1] : 1 / 50; }
function formatDistance(value = 0, units = "mm"){ const distance = Number(value) || 0; if(units === "cm") return `${(distance / 10).toFixed(1)} cm`; if(units === "m") return `${(distance / 1000).toFixed(2)} m`; return `${Math.round(distance)} mm`; }
function dxfTextString(value = ""){ return String(value || "").replace(/\r/g, "").replace(/\n/g, " "); }
function symbolById(id){ return CAD_SYMBOLS.find(symbol => symbol.id === id) || CAD_SYMBOLS.find(symbol => symbol.id === "note"); }
function layerById(id){ return CAD_LAYERS.find(layer => layer.id === id) || CAD_LAYERS[0]; }
function loadLayer(load = {}){
  const text = String(load.type || load.name || "").toLowerCase();
  if(text.includes("alumbr") || text.includes("luz")) return "alumbrado";
  if(text.includes("motor") || text.includes("fuerza") || text.includes("bomba")) return "fuerza";
  if(text.includes("enchufe") || text.includes("toma")) return "enchufes";
  return "enchufes";
}
function loadSymbol(load = {}){
  const layer = loadLayer(load);
  if(layer === "alumbrado") return "light";
  if(layer === "fuerza") return "motor";
  return "outlet";
}
function safeText(value, fallback = ""){
  const text = String(value || fallback || "").trim();
  return text || fallback;
}

export function createCadExportDxf(project = {}, document = {}){
  const doc = normalizeCadDocument(document, project);
  const layerTable = doc.layers.map(layer => [
    "0", "LAYER",
    "2", layer.id,
    "70", "0",
    "62", "7",
    "6", "CONTINUOUS"
  ].join("\r\n")).join("\r\n");

  const entityLines = doc.entities.flatMap(entity => {
    const layer = entity.layer || "notas";
    if(entity.type === "wire"){
      const from = entity.from || { x: 0, y: 0 };
      const to = entity.to || { x: 0, y: 0 };
      return [
        "0", "LINE",
        "8", layer,
        "10", String(n(from.x, 0)),
        "20", String(n(from.y, 0)),
        "30", "0.0",
        "11", String(n(to.x, 0)),
        "21", String(n(to.y, 0)),
        "31", "0.0"
      ];
    }
    const text = dxfTextString(entity.label || symbolById(entity.symbolId || entity.type).label || "");
    const pos = { x: n(entity.x, 0), y: n(entity.y, 0) };
    return [
      "0", "TEXT",
      "8", layer,
      "10", String(pos.x),
      "20", String(pos.y),
      "30", "0.0",
      "40", "10.0",
      "1", text
    ];
  }).join("\r\n");

  return [
    "0", "SECTION",
    "2", "HEADER",
    "0", "ENDSEC",
    "0", "SECTION",
    "2", "TABLES",
    "0", "TABLE",
    "2", "LAYER",
    layerTable,
    "0", "ENDTAB",
    "0", "ENDSEC",
    "0", "SECTION",
    "2", "ENTITIES",
    entityLines,
    "0", "ENDSEC",
    "0", "EOF"
  ].join("\r\n");
}

export function parseCadDxf(text = "", project = {}){
  const doc = createCadDocument(project);
  const lines = String(text || "").split(/\r?\n/).map(line => line.trim());
  const entities = [];
  let index = 0;
  while(index < lines.length){
    const code = lines[index++]?.toUpperCase();
    const value = lines[index++] || "";
    if(code !== "0") continue;
    if(value.toUpperCase() === "LINE"){
      const item = { layer: "notas", from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
      while(index < lines.length){
        const group = lines[index++]?.toUpperCase();
        const groupValue = lines[index++] || "";
        if(group === "0"){ index -= 2; break; }
        if(group === "8") item.layer = groupValue || item.layer;
        if(group === "10") item.from.x = parseFloat(groupValue) || item.from.x;
        if(group === "20") item.from.y = parseFloat(groupValue) || item.from.y;
        if(group === "11") item.to.x = parseFloat(groupValue) || item.to.x;
        if(group === "21") item.to.y = parseFloat(groupValue) || item.to.y;
      }
      entities.push(createCadEntity("wire", { layer: item.layer, from: item.from, to: item.to, label: "Importado DXF", source: "import" }));
      continue;
    }
    if(value.toUpperCase() === "TEXT" || value.toUpperCase() === "MTEXT"){
      const item = { layer: "notas", x: 0, y: 0, text: "Texto" };
      while(index < lines.length){
        const group = lines[index++]?.toUpperCase();
        const groupValue = lines[index++] || "";
        if(group === "0"){ index -= 2; break; }
        if(group === "8") item.layer = groupValue || item.layer;
        if(group === "10") item.x = parseFloat(groupValue) || item.x;
        if(group === "20") item.y = parseFloat(groupValue) || item.y;
        if(group === "1") item.text = groupValue || item.text;
      }
      entities.push(createCadEntity("note", { x: item.x, y: item.y, layer: item.layer, label: item.text, source: "import" }));
      continue;
    }
  }
  doc.entities = entities;
  doc.validation = validateCadDocument(doc);
  return doc;
}

export function importCadSymbols(document = {}, definitions = []){
  const doc = normalizeCadDocument(document);
  const custom = arr(definitions).filter(symbol => symbol.id && symbol.label).map(symbol => ({
    id: String(symbol.id),
    label: String(symbol.label),
    layer: String(symbol.layer || "notas"),
    kind: String(symbol.kind || "custom"),
    ports: arr(symbol.ports)
  }));
  const filtered = doc.symbols.filter(symbol => !custom.some(customSymbol => customSymbol.id === symbol.id));
  doc.symbols = filtered.concat(custom);
  doc.updatedAt = stamp();
  return doc;
}

export function createCadDocument(project = {}, seed = {}){
  const createdAt = seed.createdAt || stamp();
  return {
    schema: CAD_SCHEMA,
    id: seed.id || makeId("cad"),
    name: seed.name || (project.name ? "Plano electrico - " + project.name : "Plano electrico GIAE"),
    projectId: project.id || seed.projectId || "sin-proyecto",
    createdAt,
    updatedAt: stamp(),
    units: "mm",
    scale: seed.scale || "1:50",
    canvas: { width: n(seed.canvas?.width, 1200), height: n(seed.canvas?.height, 760), grid: n(seed.canvas?.grid, 20) },
    layers: clone(seed.layers || CAD_LAYERS),
    symbols: clone(seed.symbols || CAD_SYMBOLS),
    entities: arr(seed.entities),
    circuits: arr(seed.circuits),
    legend: seed.legend || { visible: true, x: 930, y: 560 },
    validation: seed.validation || null,
    history: arr(seed.history).concat([{ date: localStamp(), action: "Plano CAD creado", module: "CAD electrico" }]),
    policy: {
      original: true,
      copiedAutocad: false,
      note: "Formato propio GIAE para planos electricos. No copia AutoCAD ni formatos propietarios."
    }
  };
}

export function createCadEntity(type, options = {}){
  const symbol = type === "wire" ? null : symbolById(options.symbolId || type);
  const layer = options.layer || symbol?.layer || "notas";
  const base = {
    id: options.id || makeId(type),
    type,
    layer,
    label: safeText(options.label, symbol?.label || type),
    x: n(options.x, 120),
    y: n(options.y, 120),
    rotation: n(options.rotation, 0),
    circuitId: options.circuitId || "",
    source: options.source || "manual",
    data: clone(options.data || {})
  };
  if(type === "wire"){
    return { ...base, from: options.from || { x: base.x, y: base.y }, to: options.to || { x: base.x + 120, y: base.y }, route: arr(options.route), label: safeText(options.label, "Canalizacion") };
  }
  return { ...base, symbolId: symbol?.id || "note" };
}

export function addCadEntity(document, entity){
  const doc = normalizeCadDocument(document);
  doc.entities.push(entity);
  doc.updatedAt = stamp();
  doc.validation = validateCadDocument(doc);
  return doc;
}

export function removeCadEntity(document, entityId){
  const doc = normalizeCadDocument(document);
  doc.entities = doc.entities.filter(entity => entity.id !== entityId);
  doc.updatedAt = stamp();
  doc.validation = validateCadDocument(doc);
  return doc;
}

export function normalizeCadDocument(document = {}, project = {}){
  const doc = document?.schema === CAD_SCHEMA ? clone(document) : createCadDocument(project, document);
  doc.layers = arr(doc.layers).length ? doc.layers : clone(CAD_LAYERS);
  doc.symbols = arr(doc.symbols).length ? doc.symbols : clone(CAD_SYMBOLS);
  doc.entities = arr(doc.entities);
  doc.circuits = arr(doc.circuits);
  doc.canvas = { width: n(doc.canvas?.width, 1200), height: n(doc.canvas?.height, 760), grid: n(doc.canvas?.grid, 20) };
  doc.legend = doc.legend || { visible: true, x: 930, y: 560 };
  doc.policy = doc.policy || { original: true, copiedAutocad: false };
  return doc;
}

export function buildCadFromProject(project = {}){
  const doc = createCadDocument(project);
  const loads = arr(project.loads);
  const panel = createCadEntity("panel", { x: 120, y: 130, label: project.panel?.name || "TG", layer: "tablero", source: "project", data: { supplyType: project.supplyType || "monofasico" } });
  const ground = createCadEntity("ground", { x: 120, y: 560, label: "PAT", layer: "tierra", source: "project", data: project.grounding || {} });
  doc.entities.push(panel, ground, createCadEntity("wire", { layer: "tierra", from: { x: 120, y: 170 }, to: { x: 120, y: 530 }, label: "PE principal", source: "project" }));
  const usableLoads = loads.length ? loads : [
    { id: "CAD-LUZ-1", name: "Alumbrado reserva", type: "Alumbrado", powerW: 0 },
    { id: "CAD-ENCH-1", name: "Enchufe reserva", type: "Enchufes", powerW: 0 }
  ];
  usableLoads.forEach((load, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const x = 330 + col * 205;
    const y = 150 + row * 150;
    const circuitId = load.id || "C" + String(index + 1).padStart(2, "0");
    const layer = loadLayer(load);
    const symbolId = loadSymbol(load);
    const label = safeText(load.name, "Carga " + (index + 1));
    doc.circuits.push({ id: circuitId, name: label, layer, sourceLoadId: load.id || "", powerW: n(load.powerW || load.power || load.totalPowerW, 0), phase: load.phase || "Auto", status: "preliminar" });
    doc.entities.push(createCadEntity(symbolId, { x, y, layer, label, circuitId, source: loads.length ? "project" : "reserve", data: { powerW: n(load.powerW || load.power || load.totalPowerW, 0), quantity: n(load.quantity, 1), type: load.type || "General" } }));
    doc.entities.push(createCadEntity("wire", { layer: "canalizacion", from: { x: 160, y: 130 + Math.min(row, 2) * 24 }, to: { x, y }, label: circuitId, circuitId, source: loads.length ? "project" : "reserve" }));
  });
  doc.entities.push(createCadEntity("note", { x: 820, y: 70, layer: "notas", label: "Plano preliminar generado desde Proyecto Activo", source: "project" }));
  doc.validation = validateCadDocument(doc);
  return doc;
}

export function validateCadDocument(document = {}){
  const doc = normalizeCadDocument(document);
  const issues = [];
  const entities = arr(doc.entities);
  const circuits = arr(doc.circuits);
  const panels = entities.filter(entity => entity.symbolId === "panel");
  const grounds = entities.filter(entity => entity.symbolId === "ground");
  const loads = entities.filter(entity => ["light", "outlet", "motor"].includes(entity.symbolId));
  const wires = entities.filter(entity => entity.type === "wire");
  const notes = entities.filter(entity => entity.symbolId === "note" || entity.layer === "notas");
  const activeLayers = new Set(entities.map(entity => entity.layer));
  if(!panels.length) issues.push({ level: "alto", area: "tablero", message: "El plano no tiene tablero electrico principal.", action: "Agregar simbolo Tablero." });
  if(!grounds.length) issues.push({ level: "alto", area: "tierra", message: "El plano no tiene simbolo de puesta a tierra.", action: "Agregar PAT y conductor PE." });
  if(panels.length && grounds.length && !wires.some(wire => wire.layer === "tierra")) issues.push({ level: "medio", area: "tierra", message: "Existe tablero y PAT, pero falta conductor PE dibujado.", action: "Agregar canalizacion o conductor PE." });
  if(!loads.length) issues.push({ level: "medio", area: "cargas", message: "No hay cargas electricas dibujadas.", action: "Agregar luces, enchufes o cargas de fuerza." });
  loads.filter(entity => !entity.circuitId).forEach(entity => issues.push({ level: "medio", area: "circuito", message: "Carga sin circuito: " + entity.label, action: "Asignar circuito a la carga." }));
  circuits.filter(circuit => !loads.some(entity => entity.circuitId === circuit.id)).forEach(circuit => issues.push({ level: "medio", area: "circuito", message: "Circuito sin simbolo asociado: " + circuit.name, action: "Dibujar al menos una carga del circuito." }));
  if(!wires.length) issues.push({ level: "medio", area: "canalizacion", message: "No hay canalizaciones o conductores dibujados.", action: "Conectar tablero y cargas." });
  if(!notes.length && !doc.legend?.visible) issues.push({ level: "bajo", area: "leyenda", message: "Falta leyenda o nota tecnica del plano.", action: "Agregar leyenda o nota." });
  if(!activeLayers.has("tablero")) issues.push({ level: "alto", area: "capas", message: "La capa tablero no tiene entidades.", action: "Dibujar tablero principal." });
  const critical = issues.filter(issue => issue.level === "alto").length;
  const medium = issues.filter(issue => issue.level === "medio").length;
  const score = Math.max(0, Math.round(100 - critical * 22 - medium * 9 - issues.filter(issue => issue.level === "bajo").length * 4));
  const status = critical ? "requiere_revision" : medium ? "incompleto" : "listo_para_revision";
  return { schema: "giae.cad.validation.v1", generatedAt: stamp(), status, score, summary: { entities: entities.length, circuits: circuits.length, layers: activeLayers.size, issues: issues.length, critical, medium }, issues };
}

export function summarizeCadDocument(document = {}){
  const doc = normalizeCadDocument(document);
  const validation = doc.validation || validateCadDocument(doc);
  const byLayer = doc.entities.reduce((acc, entity) => { acc[entity.layer] = (acc[entity.layer] || 0) + 1; return acc; }, {});
  return { name: doc.name, projectId: doc.projectId, entities: doc.entities.length, circuits: doc.circuits.length, byLayer, validation };
}

export function createCadExportPackage(project = {}, document = {}){
  const doc = normalizeCadDocument(document, project);
  doc.validation = validateCadDocument(doc);
  return {
    fileType: "GIAE_CAD_PLAN",
    fileVersion: "2.0-alpha.1",
    exportedAt: stamp(),
    project: { id: project.id || doc.projectId, name: project.name || doc.name, client: project.client || "" },
    cad: doc,
    policy: {
      format: ".giaecad",
      original: true,
      copiedAutocad: false,
      note: "Formato JSON propio de GIAE para planos electricos."
    }
  };
}

export function symbolCatalog(){
  return CAD_SYMBOLS.map(symbol => ({ ...symbol, layer: layerById(symbol.layer) }));
}
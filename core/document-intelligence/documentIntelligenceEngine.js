const DOCUMENT_TYPE_RULES = [
  { id: "proyecto_giae", label: "Proyecto GIAE", weight: 34, terms: ["GIAE_PROJECT", "currentProject", "projectLibrary", ".giae"], requiredSignals: ["project_data", "loads_or_power"] },
  { id: "memoria_tecnica", label: "Memoria tecnica", weight: 26, terms: ["memoria tecnica", "calculo", "potencia", "demanda", "tablero", "proteccion", "conductor"], requiredSignals: ["project_data", "loads_or_power", "normative_trace"] },
  { id: "informe_tierra", label: "Informe puesta a tierra", weight: 28, terms: ["puesta a tierra", "tierra", "ohm", "resistividad", "electrodo", "malla", "medicion"], requiredSignals: ["grounding", "measurement"] },
  { id: "plano_electrico", label: "Plano electrico", weight: 20, terms: ["plano", "unilineal", "circuito", "tablero", "canalizacion", "lamina", "escala"], requiredSignals: ["project_data", "loads_or_power", "drawing_reference"] },
  { id: "presupuesto", label: "Presupuesto o cotizacion", weight: 18, terms: ["presupuesto", "cotizacion", "material", "precio", "total", "mano de obra", "iva"], requiredSignals: ["project_data", "commercial"] },
  { id: "normativa", label: "Fuente normativa o regla", weight: 24, terms: ["ric", "iec", "ds8", "decreto supremo", "sec", "articulo", "pliego tecnico"], requiredSignals: ["normative_trace", "source_reference"] }
];

const SIGNALS = {
  project_data: ["proyecto", "cliente", "direccion", "comuna", "region", "instalador"],
  loads_or_power: ["carga", "potencia", "kw", "watt", "demanda", "corriente"],
  normative_trace: ["ric", "iec", "ds8", "sec", "decreto supremo", "pliego"],
  grounding: ["tierra", "electrodo", "malla", "resistividad", "ohm"],
  measurement: ["medicion", "medido", "instrumento", "telur", "ohm"],
  drawing_reference: ["plano", "unilineal", "lamina", "escala", "simbolo"],
  commercial: ["presupuesto", "precio", "total", "iva", "material"],
  source_reference: ["fuente", "articulo", "capitulo", "version", "fecha"]
};

function normalizeText(text = ""){
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function safeSnippet(text = "", limit = 420){ return String(text).replace(/\s+/g, " ").trim().slice(0, limit); }
function countTermHits(normalized, terms = []){ return terms.reduce((sum, term) => normalized.includes(normalizeText(term)) ? sum + 1 : sum, 0); }
function detectSignals(normalized){
  return Object.entries(SIGNALS).map(([id, terms]) => {
    const hits = terms.filter(term => normalized.includes(normalizeText(term)));
    return { id, ok: hits.length > 0, hits };
  });
}
function classifyDocument(normalized, file = {}){
  const fileName = normalizeText(file.name || "");
  const scores = DOCUMENT_TYPE_RULES.map(rule => {
    const textHits = countTermHits(normalized, rule.terms);
    const nameHits = countTermHits(fileName, rule.terms);
    const score = textHits * rule.weight + nameHits * Math.round(rule.weight * 1.25);
    return { id: rule.id, label: rule.label, score, requiredSignals: rule.requiredSignals };
  }).sort((a, b) => b.score - a.score);
  const best = scores[0] || { id: "desconocido", label: "Documento no clasificado", score: 0, requiredSignals: [] };
  if(best.score <= 0) return { id: "desconocido", label: "Documento no clasificado", confidence: 12, scores };
  const second = scores[1]?.score || 0;
  const confidence = Math.max(25, Math.min(96, 45 + best.score - Math.floor(second / 2)));
  return { ...best, confidence, scores };
}
function fileKind(file = {}, text = ""){
  const name = String(file.name || "").toLowerCase();
  const type = String(file.type || "").toLowerCase();
  if(name.endsWith(".giae")) return "giae";
  if(type.includes("pdf") || text.startsWith("%PDF")) return "pdf";
  if(type.includes("json") || name.endsWith(".json")) return "json";
  if(type.includes("text") || name.endsWith(".txt") || name.endsWith(".md")) return "texto";
  if(type.includes("image") || /\.(png|jpg|jpeg|webp)$/i.test(name)) return "imagen";
  return "archivo";
}
function tryParseJson(text){ try{ return JSON.parse(text); }catch{ return null; } }
function inspectStructuredPayload(payload){
  if(!payload || typeof payload !== "object") return [];
  const findings = [];
  const project = payload.project || payload.currentProject || payload;
  if(project.name || project.client || project.address) findings.push({ id: "project_data", label: "Contiene datos de proyecto" });
  if(Array.isArray(project.loads) && project.loads.length) findings.push({ id: "loads", label: "Contiene " + project.loads.length + " carga(s)" });
  if(project.grounding || project.earth) findings.push({ id: "grounding", label: "Contiene datos de puesta a tierra" });
  if(project.documentation || project.documentationEngine) findings.push({ id: "documentation", label: "Contiene estado documental" });
  if(project.audit || project.integralAudit) findings.push({ id: "audit", label: "Contiene auditoria o revision" });
  return findings;
}
function buildGaps(classification, signals){
  const signalMap = Object.fromEntries(signals.map(signal => [signal.id, signal.ok]));
  return (classification.requiredSignals || []).filter(id => !signalMap[id]).map(id => ({ id, label: gapLabel(id), severity: id === "normative_trace" || id === "measurement" ? "alto" : "medio" }));
}
function gapLabel(id){
  const labels = {
    project_data: "Faltan datos claros de proyecto, cliente o direccion",
    loads_or_power: "Faltan cargas, potencia o demanda verificable",
    normative_trace: "Falta trazabilidad normativa RIC, DS8 o IEC",
    grounding: "Faltan datos de puesta a tierra",
    measurement: "Falta medicion real o evidencia de instrumento",
    drawing_reference: "Falta referencia de plano, lamina, escala o circuito",
    commercial: "Faltan valores comerciales, materiales o total",
    source_reference: "Falta fuente, articulo, version o fecha"
  };
  return labels[id] || "Falta senal requerida: " + id;
}
function buildRecommendations(classification, gaps, kind){
  const items = [];
  if(kind === "pdf") items.push("PDF detectado: registrar fuente, fecha, autor y extraer texto con herramienta autorizada antes de convertir a reglas.");
  if(kind === "imagen") items.push("Imagen detectada: requiere OCR o revision visual antes de evaluar cumplimiento.");
  if(classification.id === "desconocido") items.push("Clasificar manualmente el documento antes de usarlo como evidencia.");
  gaps.forEach(gap => items.push(gap.label));
  if(!items.length) items.push("Documento apto para revision asistida; aun requiere criterio profesional antes de validar cumplimiento.");
  return items;
}
function statusFrom(gaps, confidence){
  if(gaps.some(gap => gap.severity === "alto")) return "requiere_revision";
  if(confidence < 45) return "clasificacion_debil";
  if(gaps.length) return "incompleto";
  return "listo_para_revision";
}
export function analyzeDocumentContent({ text = "", file = {}, hash = "" } = {}){
  const rawText = String(text || "");
  const normalized = normalizeText(rawText + " " + (file.name || ""));
  const kind = fileKind(file, rawText);
  const classification = classifyDocument(normalized, file);
  const signals = detectSignals(normalized);
  const structured = inspectStructuredPayload(tryParseJson(rawText));
  const gaps = buildGaps(classification, signals);
  const recommendations = buildRecommendations(classification, gaps, kind);
  const status = statusFrom(gaps, classification.confidence || 0);
  return {
    schema: "giae.document-intelligence.analysis.v1",
    analyzedAt: new Date().toISOString(),
    file: { name: file.name || "documento", type: file.type || "desconocido", size: Number(file.size || rawText.length || 0), kind, hash },
    classification: { id: classification.id, label: classification.label, confidence: classification.confidence || 0, candidates: (classification.scores || []).slice(0, 5).map(item => ({ id: item.id, label: item.label, score: item.score })) },
    signals: signals.filter(signal => signal.ok),
    structuredFindings: structured,
    gaps,
    recommendations,
    status,
    trace: { sourcesAllowed: ["DS8", "RIC", "IEC", "SEC"], copiedNormativeText: false, note: "Analisis propio de senales. No certifica cumplimiento ni copia textos normativos completos." },
    preview: safeSnippet(rawText)
  };
}
export function summarizeDocumentAnalyses(analyses = []){
  const list = Array.isArray(analyses) ? analyses : [];
  const ready = list.filter(item => item.status === "listo_para_revision").length;
  const review = list.filter(item => item.status === "requiere_revision" || item.status === "clasificacion_debil").length;
  const incomplete = list.filter(item => item.status === "incompleto").length;
  const byType = list.reduce((acc, item) => { const key = item.classification?.id || "desconocido"; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  return { total: list.length, ready, review, incomplete, byType, status: review ? "requiere_revision" : incomplete ? "incompleto" : ready ? "listo_para_revision" : "sin_documentos" };
}

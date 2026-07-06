import { persist, addHistory } from "../../core/store.js";
import { analyzeDocumentContent, summarizeDocumentAnalyses } from "../../core/document-intelligence/documentIntelligenceEngine.js";

function esc(value = ""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function statusLabel(status){
  const labels = { listo_para_revision: "Listo para revision", requiere_revision: "Requiere revision", clasificacion_debil: "Clasificacion debil", incompleto: "Incompleto", sin_documentos: "Sin documentos" };
  return labels[status] || status;
}
function statusClass(status){ if(status === "listo_para_revision") return "ok"; if(status === "incompleto") return "warn"; return "danger"; }
function getStored(project){ return Array.isArray(project.documentIntelligence?.analyses) ? project.documentIntelligence.analyses : []; }
async function hashBuffer(buffer){
  if(!globalThis.crypto?.subtle) return "sin-hash";
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2,"0")).join("");
}
async function readFileAsText(file){
  const buffer = await file.arrayBuffer();
  const hash = await hashBuffer(buffer);
  const bytes = new Uint8Array(buffer);
  const pdf = bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if(pdf) return { text: "%PDF archivo detectado. Nombre: " + file.name + ". El texto completo requiere extraccion autorizada antes de convertir a reglas.", hash };
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return { text: decoder.decode(buffer), hash };
}
function renderSummary(summary){
  return '<section class="admin-kpis compact-kpis document-ai-kpis">' +
    '<div><strong>' + summary.total + '</strong><span>Analizados</span></div>' +
    '<div><strong>' + summary.ready + '</strong><span>Listos revision</span></div>' +
    '<div><strong>' + summary.incomplete + '</strong><span>Incompletos</span></div>' +
    '<div><strong>' + summary.review + '</strong><span>Requieren revision</span></div>' +
  '</section>';
}
function renderRows(analyses){
  return analyses.map((item, index) => {
    const signals = item.signals.map(signal => esc(signal.id + ": " + signal.hits.join(", "))).join("<br>") || "Sin senales claras";
    const gaps = item.gaps.map(gap => esc(gap.label)).join("<br>") || "Sin faltantes principales";
    const recs = item.recommendations.map(esc).join("<br>");
    return '<article class="document-ai-card ' + statusClass(item.status) + '">' +
      '<div class="document-ai-head"><div><p class="eyebrow">' + esc(item.file.kind) + ' - ' + esc(item.classification.label) + '</p><h4>' + esc(item.file.name) + '</h4></div>' +
      '<span class="doc-status ' + statusClass(item.status) + '">' + esc(statusLabel(item.status)) + '</span></div>' +
      '<p><b>Confianza:</b> ' + Number(item.classification.confidence || 0) + '% - <b>Hash:</b> ' + esc(String(item.file.hash || '').slice(0, 16)) + '</p>' +
      '<p class="muted"><b>Vista previa:</b> ' + esc(item.preview || 'Sin texto visible.') + '</p>' +
      '<details class="normative-details"><summary>Senales, faltantes y recomendaciones</summary><div class="notice-list">' +
      '<article class="notice-line ok"><strong>Senales detectadas</strong><br>' + signals + '</article>' +
      '<article class="notice-line ' + (item.gaps.length ? 'medio' : 'ok') + '"><strong>Faltantes</strong><br>' + gaps + '</article>' +
      '<article class="notice-line"><strong>Accion recomendada</strong><br>' + recs + '</article>' +
      '</div></details><div class="row-actions"><button class="ghost danger-text" data-remove-doc-analysis="' + index + '">Quitar</button></div></article>';
  }).join("");
}
function downloadReport(project, analyses){
  const summary = summarizeDocumentAnalyses(analyses);
  const lines = ["LECTOR DOCUMENTAL INTELIGENTE - GIAE CHILE", "", "Proyecto: " + (project.name || "Sin nombre"), "Cliente: " + (project.client || "Pendiente"), "Documentos analizados: " + summary.total, "Estado: " + statusLabel(summary.status), ""];
  analyses.forEach(item => { lines.push("- " + item.file.name + ": " + item.classification.label + " (" + item.classification.confidence + "%) - " + statusLabel(item.status)); item.gaps.forEach(gap => lines.push("  Pendiente: " + gap.label)); });
  lines.push("", "Nota: analisis de senales; no certifica cumplimiento ni copia textos normativos completos.");
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "GIAE_Lector_Documental.txt";
  link.click();
  URL.revokeObjectURL(url);
}
export function render(host, state){
  const project = state.currentProject;
  project.documentIntelligence = project.documentIntelligence || { analyses: [] };
  const analyses = getStored(project);
  const summary = summarizeDocumentAnalyses(analyses);
  host.innerHTML = '<section class="module-window document-ai-module">' +
    '<div class="workspace-title-row"><div><p class="eyebrow">Fase 3 - Inteligencia documental</p><h3>Lector Documental Inteligente</h3><p>Analiza archivos del proyecto, detecta tipo documental, senales tecnicas, faltantes y trazabilidad. No copia textos normativos completos ni certifica cumplimiento final.</p></div>' +
    '<div class="status-strip"><span>Proyecto: ' + esc(project.name || 'Sin nombre') + '</span><span>' + esc(statusLabel(summary.status)) + '</span></div></div>' +
    renderSummary(summary) +
    '<div class="policy-box"><b>Alcance:</b> lectura local de texto, JSON, .giae y metadatos PDF. Imagenes y PDF complejos quedan marcados para OCR o extraccion autorizada.</div>' +
    '<div class="admin-card"><h4>Cargar documentos para evaluar</h4><div class="form-grid"><label>Archivos tecnicos<input id="documentAiFiles" type="file" multiple accept=".txt,.md,.json,.giae,.pdf,.png,.jpg,.jpeg,.webp,application/json,text/plain,application/pdf,image/*"></label><label>Nota de revision<input id="documentAiNote" placeholder="Ej: antecedentes cliente, informe terreno, plano recibido"></label></div>' +
    '<div class="row-actions"><button id="documentAiAnalyze">Analizar archivos</button><button id="documentAiDownload" class="secondary">Descargar reporte</button><button id="documentAiClear" class="ghost danger-text">Limpiar analisis</button></div></div>' +
    '<section class="document-ai-list" id="documentAiList">' + (renderRows(analyses) || '<div class="workspace-empty">Aun no hay documentos analizados.</div>') + '</section></section>';
  host.querySelector("#documentAiAnalyze").addEventListener("click", async () => {
    const files = [...(host.querySelector("#documentAiFiles").files || [])];
    if(!files.length) return alert("Selecciona uno o mas documentos.");
    const note = host.querySelector("#documentAiNote").value.trim();
    for(const file of files){
      const data = await readFileAsText(file);
      const analysis = analyzeDocumentContent({ text: data.text, file: { name: file.name, type: file.type, size: file.size }, hash: data.hash });
      analysis.reviewNote = note;
      project.documentIntelligence.analyses.unshift(analysis);
    }
    project.documentIntelligence.analyses = project.documentIntelligence.analyses.slice(0, 80);
    project.documentIntelligence.summary = summarizeDocumentAnalyses(project.documentIntelligence.analyses);
    addHistory("Documentos analizados por Lector Documental", "Lector documental", false);
    persist();
    render(host, state);
  });
  host.querySelector("#documentAiDownload").addEventListener("click", () => downloadReport(project, getStored(project)));
  host.querySelector("#documentAiClear").addEventListener("click", () => {
    if(!confirm("Limpiar analisis documentales del proyecto activo?")) return;
    project.documentIntelligence = { analyses: [], summary: summarizeDocumentAnalyses([]) };
    addHistory("Analisis documentales limpiados", "Lector documental", false);
    persist();
    render(host, state);
  });
  host.querySelectorAll("[data-remove-doc-analysis]").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.removeDocAnalysis);
    project.documentIntelligence.analyses.splice(index, 1);
    project.documentIntelligence.summary = summarizeDocumentAnalyses(project.documentIntelligence.analyses);
    persist();
    render(host, state);
  }));
}

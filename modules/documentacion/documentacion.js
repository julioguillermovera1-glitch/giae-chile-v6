import { recalculateProject, updateProjectSection, persist } from "../../core/store.js";
import { calculateDocumentationProject } from "../../core/documentationEngine.js";

function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function statusText(result){
  const labels = {
    listo: "Listo",
    incompleto: "Incompleto",
    pendiente_datos: "Pendiente de datos",
    preparado_futuro: "Preparado futuro",
    no_aplica: "No aplica",
    pendiente: "Pendiente"
  };
  return labels[result] || result;
}
function statusClass(result){
  if(result === "listo") return "ok";
  if(result === "preparado_futuro") return "warn";
  if(result === "no_aplica") return "muted";
  return "danger";
}
function docCards(docEngine){
  return docEngine.documents.map(doc => `
    <article class="dashboard-card document-card ${statusClass(doc.result)}">
      <div class="document-card-head">
        <div>
          <p class="eyebrow">${esc(doc.category || "documento")}</p>
          <h4>${esc(doc.name)}</h4>
        </div>
        <span class="doc-status ${statusClass(doc.result)}">${esc(statusText(doc.result))}</span>
      </div>
      <p><strong>${esc(doc.title)}</strong></p>
      <p class="muted">${esc(doc.description || "Documento preparado para el Motor Documental.")}</p>
      <div class="progress-line"><span style="width:${Number(doc.completion || 0)}%"></span></div>
      <small>${Number(doc.completion || 0)}% de datos requeridos disponibles · Estado: ${esc(doc.status)}</small>
      <details class="normative-details">
        <summary>Ver requisitos</summary>
        <ul>${(doc.requirements || []).map(req => `<li>${req.ok ? "Completo" : "Pendiente"}: ${esc(req.label)}</li>`).join("") || "<li>Requisitos pendientes de modelar.</li>"}</ul>
        <p class="muted">${esc(doc.notes || "")}</p>
      </details>
    </article>
  `).join("");
}
function requiredTable(docEngine){
  const rows = docEngine.requiredNow.map(doc => `
    <tr>
      <td><strong>${esc(doc.name)}</strong><br><small>${esc(doc.title)}</small></td>
      <td>${esc(statusText(doc.result))}</td>
      <td>${Number(doc.completion || 0)}%</td>
      <td>${(doc.requirements || []).filter(r => !r.ok).map(r => esc(r.label)).join("<br>") || "Sin pendientes"}</td>
    </tr>`).join("");
  return `<div class="data-table-wrap"><table><thead><tr><th>Documento</th><th>Estado</th><th>Avance</th><th>Pendientes</th></tr></thead><tbody>${rows || `<tr><td colspan="4">No hay documentos activos para este proyecto.</td></tr>`}</tbody></table></div>`;
}
function generateReport(project, docEngine){
  return `CENTRO DE DOCUMENTACIÓN SEC - GIAE CHILE\n\nProyecto: ${project.name}\nCliente: ${project.client || "Pendiente"}\nSistema: ${project.supplyType || "Pendiente"}\nDistribuidora: ${project.distributor || "Pendiente"}\n\nEstado documental: ${docEngine.summary.status}\nDocumentos activos: ${docEngine.summary.active}\nListos: ${docEngine.summary.ready}\nPendientes: ${docEngine.summary.missing}\nPreparados para futuro: ${docEngine.summary.future}\n\n${docEngine.requiredNow.map(doc => `${doc.name}: ${statusText(doc.result)} (${doc.completion}%)`).join("\n")}\n\nAdvertencia: ${docEngine.warning}`;
}

export function render(host, state) {
  recalculateProject();
  const project = state.currentProject;
  const docEngine = calculateDocumentationProject(project);
  project.documentationEngine = docEngine;

  host.innerHTML = `
    <section class="module-window real-workspace documentation-center">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">Etapa 4.0.4 · Motor Documental</p>
          <h3>Centro de Documentación SEC</h3>
          <p>GIAE no queda limitado a TE1. Este centro identifica documentos aplicables al Proyecto Activo y deja preparados documentos futuros sin emitirlos hasta tener reglas normativas implementadas.</p>
        </div>
        <div class="status-strip">
          <span>Proyecto: ${esc(project.name)}</span>
          <span>Sistema: ${esc(project.supplyType || "Pendiente")}</span>
          <span>${docEngine.summary.ready}/${docEngine.summary.active} activos listos</span>
        </div>
      </div>

      <div class="kpi-grid engineering-kpis">
        <div class="kpi-card"><span>Documentos activos</span><strong>${docEngine.summary.active}</strong></div>
        <div class="kpi-card"><span>Listos</span><strong>${docEngine.summary.ready}</strong></div>
        <div class="kpi-card"><span>Pendientes</span><strong>${docEngine.summary.missing}</strong></div>
        <div class="kpi-card"><span>Futuros preparados</span><strong>${docEngine.summary.future}</strong></div>
      </div>

      <div class="notice-warn"><strong>Regla documental:</strong> TE1 es el primer documento activo. TE2, TE3, TE3.4, TE4 y TE6 quedan preparados como catálogo futuro hasta cargar sus reglas, campos y alcance oficial.</div>

      <div class="module-toolbar">
        <button id="saveDocState" class="primary-action">Guardar estado documental</button>
        <button id="downloadDocReport" class="secondary">Descargar informe documental</button>
        <button id="refreshDocs" class="secondary">Recalcular documentación</button>
      </div>

      <div class="dashboard-card">
        <h4>Documentación requerida ahora</h4>
        ${requiredTable(docEngine)}
      </div>

      <div class="card-grid document-grid">
        ${docCards(docEngine)}
      </div>
    </section>`;

  host.querySelector("#saveDocState").addEventListener("click", () => {
    updateProjectSection("documentation", docEngine.requiredNow.map(doc => ({ id: doc.id, name: doc.name, result: doc.result, completion: doc.completion })), "Documentación");
    alert("Estado documental guardado en el Proyecto Activo.");
    render(host, state);
  });
  host.querySelector("#refreshDocs").addEventListener("click", () => { recalculateProject(); persist(); render(host, state); });
  host.querySelector("#downloadDocReport").addEventListener("click", () => {
    const blob = new Blob([generateReport(project, docEngine)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Informe_Documental_GIAE_${(project.name || "proyecto").replace(/[^a-z0-9]+/gi,"_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

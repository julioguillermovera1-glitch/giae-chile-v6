import { evaluateGuidedWorkflow, createGuidedWorkflowReport } from "../../core/workflow/guidedWorkflowEngine.js";

function esc(value = ""){
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function statusLabel(status){
  const labels = {
    listo_para_exportar: "Listo para exportar",
    con_observaciones: "Con observaciones",
    en_progreso: "En progreso",
    bloqueado: "Bloqueado",
    completado: "Completado",
    observado: "Observado",
    pendiente: "Pendiente",
    revisable: "Revisable"
  };
  return labels[status] || status || "Pendiente";
}

function statusClass(status){
  if(["listo_para_exportar", "completado", "revisable"].includes(status)) return "ok";
  if(["con_observaciones", "observado"].includes(status)) return "warn";
  if(["bloqueado"].includes(status)) return "danger";
  return "pending";
}

function issueList(title, issues, emptyText){
  return `<article class="dashboard-card flow-issues-card">
    <h4>${esc(title)}</h4>
    <div class="flow-issue-list">
      ${issues.length ? issues.slice(0, 12).map(item => `<div class="flow-issue ${esc(item.level)}">
        <strong>${esc(item.stepLabel || item.source || "GIAE")}</strong>
        <span>${esc(item.message)}</span>
        <small>${esc(item.action)}</small>
      </div>`).join("") : `<p class="muted-note">${esc(emptyText)}</p>`}
    </div>
  </article>`;
}

function stepCard(step){
  const issues = [...(step.blockers || []), ...(step.warnings || [])];
  return `<article class="flow-step ${statusClass(step.status)} ${step.lockedByPrevious ? "locked" : ""}">
    <div class="flow-step-number">${step.order}</div>
    <div class="flow-step-body">
      <div class="flow-step-head">
        <strong>${esc(step.label)}</strong>
        <span>${esc(statusLabel(step.status))}</span>
      </div>
      <p>${esc(step.detail)}</p>
      ${issues.length ? `<ul>${issues.slice(0, 3).map(item => `<li>${esc(item.message)}</li>`).join("")}</ul>` : `<small>Sin faltantes principales en esta etapa.</small>`}
      <button type="button" class="secondary" data-open-step="${esc(step.moduleId)}">Abrir ${esc(step.label)}</button>
    </div>
  </article>`;
}

function downloadReport(project){
  const report = createGuidedWorkflowReport(project);
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = (project.name || "proyecto-giae").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "proyecto-giae";
  link.href = url;
  link.download = `${safeName}-flujo-guiado.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state){
  const project = state.currentProject || {};
  const workflow = project.guidedWorkflow || evaluateGuidedWorkflow(project);
  const current = workflow.currentStep || {};
  host.innerHTML = `
    <section class="module-window guided-flow-module">
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Fase 5.6 - Asistente maestro</p>
          <h3>Flujo guiado del Proyecto</h3>
          <p>GIAE revisa el avance de principio a fin y muestra que falta, que bloquea y cual es la siguiente accion tecnica.</p>
        </div>
        <div class="project-state-card ${statusClass(workflow.status)}">
          <small>Estado del flujo</small>
          <strong>${esc(statusLabel(workflow.status))}</strong>
          <span>${workflow.score}% avance guiado</span>
        </div>
      </div>

      <section class="dashboard-grid kpi-row flow-kpis">
        <article><small>Etapas</small><strong>${workflow.summary.completed}/${workflow.summary.total}</strong></article>
        <article><small>Bloqueos</small><strong>${workflow.summary.blockers}</strong></article>
        <article><small>Observaciones</small><strong>${workflow.summary.warnings}</strong></article>
        <article><small>Etapa actual</small><strong>${esc(current.label || "Proyecto")}</strong></article>
      </section>

      <section class="dashboard-card flow-next-action">
        <h4>Siguiente accion</h4>
        <p>${esc(workflow.nextAction)}</p>
        <div class="row-actions">
          <button type="button" data-open-step="${esc(current.moduleId || "proyecto")}">Abrir etapa actual</button>
          <button type="button" class="secondary" id="downloadFlowReport">Descargar reporte de faltantes</button>
        </div>
      </section>

      <section class="dashboard-grid two">
        ${issueList("Bloqueos", workflow.blockers, "No hay bloqueos criticos registrados.")}
        ${issueList("Observaciones", workflow.warnings, "No hay observaciones principales.")}
      </section>

      <section class="dashboard-card">
        <h4>Ruta completa del proyecto</h4>
        <div class="flow-steps-grid">${workflow.steps.map(stepCard).join("")}</div>
      </section>

      <div class="policy-box"><b>Limite honesto:</b> este flujo guia y prevalida. No reemplaza mediciones reales, revision profesional, respuesta de distribuidora ni autoridad SEC.</div>
    </section>`;

  host.querySelectorAll("[data-open-step]").forEach(button => {
    button.addEventListener("click", () => {
      if(window.GIAE?.openModule) window.GIAE.openModule(button.dataset.openStep);
    });
  });
  host.querySelector("#downloadFlowReport")?.addEventListener("click", () => downloadReport(project));
}
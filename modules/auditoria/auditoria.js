import { runIntegralAudit, buildAuditTextReport } from "../../core/audit/integralAuditEngine.js";
import { updateProjectSection } from "../../core/store.js";

function badge(level){
  const labels = { ok: "Cumple", bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico", pendiente: "Pendiente" };
  return `<span class="status-pill ${level}">${labels[level] || level}</span>`;
}

function download(filename, content, type = "application/json"){
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state) {
  const project = state.currentProject || {};
  const audit = runIntegralAudit(project);
  updateProjectSection("integralAudit", audit, "Auditoría Integral");

  const areas = audit.areas.map(area => `
    <tr>
      <td>${area.area}</td>
      <td>${area.score}%</td>
      <td>${area.total}</td>
      <td>${area.pending}</td>
      <td>${area.ok ? badge("ok") : badge(area.score < 50 ? "alto" : "medio")}</td>
    </tr>`).join("");

  const issues = audit.issues.length ? audit.issues.map(issue => `
    <tr>
      <td>${badge(issue.level)}</td>
      <td>${issue.area}</td>
      <td>${issue.message}</td>
      <td>${issue.action}</td>
      <td>${issue.source}</td>
    </tr>`).join("") : `<tr><td colspan="5">Sin observaciones pendientes.</td></tr>`;

  host.innerHTML = `
    <section class="module-window audit-integral">
      <div class="module-header-block">
        <p class="eyebrow">Etapa 10.0</p>
        <h3>Auditoría Integral del Proyecto</h3>
        <p>Revisión cruzada de proyecto, cargas, ingeniería, tablero, tierra, empalme, documentación y presupuesto. La auditoría no inventa resultados: solo evalúa datos disponibles y reglas implementadas.</p>
      </div>

      <div class="summary-grid">
        <div class="result-box"><strong>Estado general</strong><span>${audit.label}</span></div>
        <div class="result-box"><strong>Puntaje</strong><span>${audit.score}%</span></div>
        <div class="result-box"><strong>Verificaciones</strong><span>${audit.summary.ok}/${audit.summary.totalChecks}</span></div>
        <div class="result-box ${audit.summary.critical ? "danger" : "ok"}"><strong>Críticas/altas</strong><span>${audit.summary.critical}</span></div>
      </div>

      <div class="progress-shell"><div class="progress-bar" style="width:${audit.score}%"></div></div>

      <div class="actions-row">
        <button class="primary" id="downloadAuditJson">Descargar JSON</button>
        <button id="downloadAuditTxt">Descargar informe TXT</button>
        <button id="refreshAudit">Actualizar auditoría</button>
      </div>

      <div class="two-column">
        <div>
          <h4>Estado por área</h4>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Área</th><th>Puntaje</th><th>Total</th><th>Pendientes</th><th>Estado</th></tr></thead>
              <tbody>${areas}</tbody>
            </table>
          </div>
        </div>
        <div>
          <h4>Próximas acciones</h4>
          <div class="policy-box">
            ${audit.nextActions.map(action => `<p>${action}</p>`).join("")}
          </div>
          <h4>Datos técnicos resumidos</h4>
          <div class="result-box">
            <p>Potencia instalada: <b>${audit.summary.installedPowerKw} kW</b></p>
            <p>Demanda: <b>${audit.summary.demandPowerKw} kW</b></p>
            <p>Cargas: <b>${audit.summary.loads}</b></p>
            <p>Circuitos: <b>${audit.summary.circuits}</b></p>
          </div>
        </div>
      </div>

      <h4>Observaciones y pendientes</h4>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Nivel</th><th>Área</th><th>Observación</th><th>Acción recomendada</th><th>Origen</th></tr></thead>
          <tbody>${issues}</tbody>
        </table>
      </div>

      <div class="policy-box">
        <b>Regla de seguridad técnica:</b> la auditoría integral es una ayuda de control interno. Las decisiones finales y mediciones en terreno deben ser verificadas por el profesional competente.
      </div>
    </section>`;

  host.querySelector("#downloadAuditJson").addEventListener("click", () => {
    download(`auditoria-integral-${(project.name || "proyecto").toLowerCase().replace(/[^a-z0-9]+/g,"-")}.json`, JSON.stringify(audit, null, 2));
  });
  host.querySelector("#downloadAuditTxt").addEventListener("click", () => {
    download(`auditoria-integral-${(project.name || "proyecto").toLowerCase().replace(/[^a-z0-9]+/g,"-")}.txt`, buildAuditTextReport(audit), "text/plain;charset=utf-8");
  });
  host.querySelector("#refreshAudit").addEventListener("click", () => window.GIAE?.refreshActiveModule?.());
}

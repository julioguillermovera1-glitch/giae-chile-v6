import { getNormativeEngine, normativeSummary, evaluateNormative, resetNormativeCache } from "../../core/normative/engine.js";
import { importRulesFromText } from "../../core/normative/ruleLoader.js";
import { buildNormativeReport } from "../../core/normative/reportGenerator.js";

function esc(value=""){
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function human(value=""){
  return String(value || "").replaceAll("_"," ").replaceAll(/([A-Z])/g," $1").trim();
}
function pill(value){
  const normalized = String(value || "").toLowerCase();
  const cls = normalized.includes("validada") || normalized.includes("cumple") || normalized.includes("alta") ? "ok" : normalized.includes("critico") || normalized.includes("no_cumple") || normalized.includes("obsoleta") ? "danger" : "warning";
  return `<span class="pill ${cls}">${esc(human(value))}</span>`;
}
function downloadJson(filename, payload){
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
function renderRulesTable(rules){
  if(!rules.length) return `<div class="workspace-empty">No hay reglas para este filtro.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>ID</th><th>Regla</th><th>Fuente</th><th>Categoría</th><th>Estado</th><th>Referencia</th><th>Acción</th></tr></thead>
    <tbody>${rules.map(rule => `<tr>
      <td><code>${esc(rule.id)}</code></td>
      <td><strong>${esc(rule.nombre)}</strong><br><small>${esc(rule.descripcion)}</small></td>
      <td>${pill(rule.fuente)}</td>
      <td>${esc(rule.categoria)}</td>
      <td>${pill(rule.estado)}</td>
      <td><strong>${esc(rule.referencia.documento)}</strong><br><small>${esc(rule.referencia.apartado)}</small></td>
      <td><button class="secondary mini-action" data-rule-open="${esc(rule.id)}">Ver ficha</button></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}
function renderRuleDetail(rule){
  return `<article class="admin-card knowledge-detail">
    <div class="workspace-title-row compact">
      <div>
        <p class="eyebrow">Ficha normativa</p>
        <h4>${esc(rule.id)} · ${esc(rule.nombre)}</h4>
        <p>${esc(rule.descripcion || "Sin descripción.")}</p>
      </div>
      <div>${pill(rule.estado)}</div>
    </div>
    <div class="admin-kpis compact-kpis">
      <div><strong>${esc(rule.fuente)}</strong><span>Fuente</span></div>
      <div><strong>${esc(rule.categoria)}</strong><span>Categoría</span></div>
      <div><strong>${esc(rule.version)}</strong><span>Versión</span></div>
      <div><strong>${esc(rule.severidad)}</strong><span>Severidad</span></div>
    </div>
    <div class="data-table-wrap"><table><tbody>
      <tr><th>Referencia</th><td>${esc(rule.referencia.documento)} · ${esc(rule.referencia.apartado)}<br><small>${esc(rule.referencia.nota)}</small></td></tr>
      <tr><th>Aplica a</th><td>${esc((rule.aplicaA || []).join(", ") || "General")}</td></tr>
      <tr><th>Entradas requeridas</th><td>${esc((rule.entradasRequeridas || []).join(", ") || "Sin entradas")}</td></tr>
      <tr><th>Condición ejecutable</th><td><code>${esc(JSON.stringify(rule.condicion))}</code></td></tr>
      <tr><th>Acción recomendada</th><td>${esc(rule.accion)}</td></tr>
    </tbody></table></div>
    <h4>Mensajes</h4>
    <div class="data-table-wrap"><table><tbody>
      <tr><th>Cumple</th><td>${esc(rule.mensajes.cumple)}</td></tr>
      <tr><th>No cumple</th><td>${esc(rule.mensajes.noCumple)}</td></tr>
      <tr><th>Requiere revisión</th><td>${esc(rule.mensajes.requiereRevision)}</td></tr>
      <tr><th>Información insuficiente</th><td>${esc(rule.mensajes.informacionInsuficiente)}</td></tr>
    </tbody></table></div>
  </article>`;
}
function renderEvaluation(report){
  return `<section class="admin-card">
    <div class="workspace-title-row compact">
      <div><h4>Resultado de validación</h4><p>Evaluación ejecutada sobre el contexto de prueba.</p></div>
      <div>${pill(report.status)}</div>
    </div>
    <div class="admin-kpis compact-kpis">
      <div><strong>${esc(report.moduleId)}</strong><span>Módulo</span></div>
      <div><strong>${report.evaluated}</strong><span>Reglas evaluadas</span></div>
      <div><strong>${esc(report.status)}</strong><span>Estado</span></div>
      <div><strong>${new Date().toLocaleTimeString("es-CL")}</strong><span>Hora</span></div>
    </div>
    <div class="data-table-wrap"><table>
      <thead><tr><th>Regla</th><th>Resultado</th><th>Mensaje</th><th>Acción</th><th>Referencia</th></tr></thead>
      <tbody>${report.results.map(item => `<tr>
        <td><code>${esc(item.rule.id)}</code><br><small>${esc(item.rule.nombre)}</small></td>
        <td>${pill(item.evaluation.result)}</td>
        <td>${esc(item.evaluation.message)}<br><small>${esc(item.evaluation.detail)}</small></td>
        <td>${esc(item.evaluation.action)}</td>
        <td>${esc(item.evaluation.reference.documento)}<br><small>${esc(item.evaluation.reference.apartado)}</small></td>
      </tr>`).join("") || `<tr><td colspan="5">No se evaluaron reglas aplicables.</td></tr>`}</tbody>
    </table></div>
  </section>`;
}

export async function render(host, state){
  host.innerHTML = `<section class="module-window real-workspace"><p>Cargando Motor Normativo GIAE...</p></section>`;
  const engine = await getNormativeEngine();
  const summary = await normativeSummary();
  const sources = [...new Set(engine.rules.map(rule => rule.fuente))];
  const categories = [...new Set(engine.rules.map(rule => rule.categoria))];

  host.innerHTML = `<section class="module-window real-workspace normative-workspace">
    <div class="workspace-title-row">
      <div>
        <p class="eyebrow">Etapa 3.0.1</p>
        <h3>Motor Normativo GIAE</h3>
        <p>Motor de reglas preparado para RIC, IEC eléctrica y DS N°8. No contiene textos completos de normas; trabaja con reglas de ingeniería referenciadas.</p>
      </div>
      <div class="status-strip"><span>v3.0.1</span><span>${summary.total} reglas</span><span>${summary.diagnostics.length} diagnósticos</span></div>
    </div>

    <div class="result-box warning">
      <b>Regla de seguridad:</b> una regla solo puede declarar cumplimiento normativo si está implementada, validada y tiene referencia documental cargada. Si no, debe quedar como requiere revisión.
    </div>

    <section class="admin-kpis compact-kpis">
      <div><strong>${summary.total}</strong><span>Reglas cargadas</span></div>
      <div><strong>${summary.bySource.RIC || 0}</strong><span>RIC</span></div>
      <div><strong>${summary.bySource.IEC || 0}</strong><span>IEC eléctrica</span></div>
      <div><strong>${summary.bySource.DS8 || 0}</strong><span>DS N°8</span></div>
    </section>

    <section class="admin-card">
      <h4>Gestor de reglas</h4>
      <div class="grid two">
        <label>Buscar regla<input id="normSearch" placeholder="Ej: RIC-02, protección, tierra"></label>
        <label>Fuente<select id="normSource"><option value="todos">Todas</option>${sources.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select></label>
        <label>Categoría<select id="normCategory"><option value="todos">Todas</option>${categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select></label>
        <label>Estado<select id="normStatus"><option value="todos">Todos</option><option value="borrador">Borrador</option><option value="en_revision">En revisión</option><option value="validada">Validada</option><option value="obsoleta">Obsoleta</option></select></label>
      </div>
      <div id="normRulesView"></div>
      <div id="normDetailView"></div>
    </section>

    <section class="admin-card">
      <h4>Validador de contexto</h4>
      <p class="small-muted">Prueba el motor con datos JSON. Este validador es para administrador/desarrollador.</p>
      <textarea id="normContext" style="min-height:150px;width:100%">{
  "modulo": "cargas",
  "categoria": "Protecciones",
  "ib": 14.2,
  "in": 16,
  "iz": 21
}</textarea>
      <div class="module-toolbar"><button id="runNormativeBtn">Ejecutar validación</button><button id="downloadNormativeReportBtn" class="secondary">Descargar último reporte</button></div>
      <div id="normEvaluationView"></div>
    </section>

    <section class="admin-card">
      <h4>Importador normativo</h4>
      <p>Permite revisar paquetes JSON antes de incorporarlos al repositorio. La carga definitiva debe quedar versionada en <code>data/rules/</code>.</p>
      <input id="normImportFile" type="file" accept="application/json,.json">
      <div id="normImportResult" class="small-muted">Sin archivo cargado.</div>
    </section>

    <section class="admin-card">
      <h4>Diagnósticos del motor</h4>
      <div class="data-table-wrap"><table><thead><tr><th>Nivel</th><th>ID</th><th>Detalle</th></tr></thead><tbody>
        ${summary.diagnostics.length ? summary.diagnostics.map(d => `<tr><td>${pill(d.level)}</td><td><code>${esc(d.id || "general")}</code></td><td>${esc([...(d.errors || []), ...(d.warnings || []), d.message || ""].filter(Boolean).join(" · "))}</td></tr>`).join("") : `<tr><td colspan="3">Sin diagnósticos.</td></tr>`}
      </tbody></table></div>
    </section>
  </section>`;

  const rulesView = host.querySelector("#normRulesView");
  const detailView = host.querySelector("#normDetailView");
  let lastReport = null;

  function applyFilter(){
    const text = host.querySelector("#normSearch").value.toLowerCase();
    const source = host.querySelector("#normSource").value;
    const category = host.querySelector("#normCategory").value;
    const status = host.querySelector("#normStatus").value;
    const filtered = engine.rules.filter(rule => {
      const hay = `${rule.id} ${rule.nombre} ${rule.descripcion} ${rule.categoria} ${rule.fuente}`.toLowerCase();
      return (!text || hay.includes(text)) && (source === "todos" || rule.fuente === source) && (category === "todos" || rule.categoria === category) && (status === "todos" || rule.estado === status);
    });
    rulesView.innerHTML = renderRulesTable(filtered);
    detailView.innerHTML = "";
    rulesView.querySelectorAll("[data-rule-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const rule = engine.rules.find(item => item.id === btn.dataset.ruleOpen);
        detailView.innerHTML = rule ? renderRuleDetail(rule) : "";
        detailView.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  ["#normSearch", "#normSource", "#normCategory", "#normStatus"].forEach(selector => {
    const el = host.querySelector(selector);
    el.addEventListener(el.tagName === "INPUT" ? "input" : "change", applyFilter);
  });
  applyFilter();

  host.querySelector("#runNormativeBtn").addEventListener("click", async () => {
    try{
      const context = JSON.parse(host.querySelector("#normContext").value);
      const result = await evaluateNormative(context, { moduleId: context.modulo, category: context.categoria, includeDraft: true });
      lastReport = buildNormativeReport(result);
      host.querySelector("#normEvaluationView").innerHTML = renderEvaluation(result);
    }catch(error){
      host.querySelector("#normEvaluationView").innerHTML = `<div class="result-box danger"><b>Error:</b> ${esc(error.message)}</div>`;
    }
  });

  host.querySelector("#downloadNormativeReportBtn").addEventListener("click", () => {
    if(!lastReport){ alert("Primero ejecuta una validación."); return; }
    downloadJson("reporte-motor-normativo-giae.json", lastReport);
  });

  host.querySelector("#normImportFile").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if(!file) return;
    try{
      const text = await file.text();
      const validations = importRulesFromText(text);
      const ok = validations.filter(v => v.ok).length;
      const errors = validations.length - ok;
      host.querySelector("#normImportResult").innerHTML = `<div class="result-box ${errors ? "warning" : "ok"}"><b>Paquete revisado:</b> ${validations.length} reglas · ${ok} válidas · ${errors} con errores.</div>`;
    }catch(error){
      host.querySelector("#normImportResult").innerHTML = `<div class="result-box danger"><b>Error al importar:</b> ${esc(error.message)}</div>`;
    }
  });
}

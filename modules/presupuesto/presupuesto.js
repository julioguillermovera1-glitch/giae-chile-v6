import { recalculateProject, persist, addHistory, state as globalState } from "../../core/store.js";
import { calculateCommercialProject, exportCommercialReport } from "../../core/commercial/budgetEngine.js";

function esc(value=""){
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function clp(value){ return `$${Math.round(Number(value || 0)).toLocaleString("es-CL")}`; }
function num(value, digits=0){ return Number(value || 0).toLocaleString("es-CL", { maximumFractionDigits:digits, minimumFractionDigits:digits }); }
function downloadJson(filename, payload){
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function materialRows(items){
  if(!items?.length) return `<tr><td colspan="6">Sin materiales generados. Ingresa cargas y genera tablero/empalme.</td></tr>`;
  return items.map(item => `<tr>
    <td>${esc(item.source)}</td>
    <td><strong>${esc(item.item)}</strong><br><small>${esc(item.family)}</small></td>
    <td>${num(item.qty, item.unit === "m" ? 1 : 0)} ${esc(item.unit)}</td>
    <td>${clp(item.unitPrice)}</td>
    <td>${clp(item.total)}</td>
    <td>${esc((item.circuits || []).join(", "))}</td>
  </tr>`).join("");
}

function laborRows(items){
  if(!items?.length) return `<tr><td colspan="5">Sin partidas de mano de obra generadas.</td></tr>`;
  return items.map(item => `<tr>
    <td>${esc(item.concept)}</td>
    <td>${num(item.qty, item.unit === "m" ? 1 : 0)} ${esc(item.unit)}</td>
    <td>${clp(item.unitPrice)}</td>
    <td>${clp(item.total)}</td>
    <td>${esc(item.id)}</td>
  </tr>`).join("");
}

function quotePreview(project, commercial, state){
  const brand = state.companyBrand || state.admin?.company?.brand || {};
  const company = state.admin?.company || {};
  const primary = brand.primaryColor || "#102033";
  const accent = brand.accentColor || "#1456a0";
  return `<div class="budget-preview commercial-preview" style="border:1px solid var(--line);border-radius:20px;background:#fff;overflow:hidden">
    <div style="display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:1rem 1.2rem;border-bottom:4px solid ${accent}">
      <div>
        <strong style="font-size:1.25rem;color:${primary}">${esc(company.name || brand.name || project.company || "GIAE Chile")}</strong><br>
        <span class="small">Cotización preliminar · ${esc(project.name || "Proyecto sin nombre")}</span>
      </div>
      <div class="quote-total" style="text-align:right">
        <span class="small">Total</span><br><strong style="font-size:1.45rem;color:${primary}">${clp(commercial.totals.total)}</strong>
      </div>
    </div>
    <div style="padding:1rem 1.2rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem">
      <div><span class="small">Cliente</span><br><strong>${esc(project.client || "Sin cliente")}</strong></div>
      <div><span class="small">Fecha</span><br><strong>${esc(commercial.generatedAt)}</strong></div>
      <div><span class="small">Estado</span><br><strong>${esc(commercial.status)}</strong></div>
      <div><span class="small">Trazabilidad</span><br><strong>${esc(commercial.trace.join(" · "))}</strong></div>
    </div>
  </div>`;
}

export function render(host, state) {
  recalculateProject();
  const project = state.currentProject;
  const commercial = project.commercialEngine || calculateCommercialProject(project);
  const settings = commercial.settings || {};

  host.innerHTML = `
    <section class="module-window real-workspace presupuesto-workspace">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">Etapa 9.0 · Motor Comercial GIAE</p>
          <h3>Presupuestos inteligentes</h3>
          <p>Genera una cotización preliminar desde el Proyecto Activo, BUCE y los motores técnicos. Los precios y mano de obra deben ser configurados por cada empresa.</p>
        </div>
        <div class="status-strip"><span>${esc(project.name)}</span><span>${esc(commercial.version)}</span><span>${esc(commercial.status)}</span></div>
      </div>

      ${quotePreview(project, commercial, state)}

      <div class="kpi-grid engineering-kpis">
        <div class="kpi-card"><span>Materiales</span><strong>${clp(commercial.totals.materialsSubtotal)}</strong></div>
        <div class="kpi-card"><span>Mano de obra</span><strong>${clp(commercial.totals.laborSubtotal)}</strong></div>
        <div class="kpi-card"><span>Neto</span><strong>${clp(commercial.totals.net)}</strong></div>
        <div class="kpi-card"><span>Total con IVA</span><strong>${clp(commercial.totals.total)}</strong></div>
      </div>

      <div class="dashboard-card">
        <h4>Parámetros comerciales</h4>
        <div class="form-grid compact">
          <label>Margen % <input id="marginPercent" type="number" min="0" step="0.1" value="${esc(settings.marginPercent ?? 18)}"></label>
          <label>Descuento % <input id="discountPercent" type="number" min="0" step="0.1" value="${esc(settings.discountPercent ?? 0)}"></label>
          <label>IVA % <input id="ivaPercent" type="number" min="0" step="0.1" value="${esc(settings.ivaPercent ?? 19)}"></label>
          <label>Mano obra circuito $ <input id="circuitBase" type="number" min="0" value="${esc(project.commercialSettings?.laborRates?.circuitBase ?? 18000)}"></label>
        </div>
        <div class="module-toolbar">
          <button id="saveCommercialSettings" class="primary-action">Guardar parámetros</button>
          <button id="downloadCommercialReport" class="secondary">Descargar reporte</button>
          <button id="refreshCommercial" class="secondary">Recalcular</button>
        </div>
        <p class="muted">Regla comercial: GIAE calcula cantidades desde motores técnicos; los precios reales deben ser mantenidos por la empresa o instalador.</p>
      </div>

      ${commercial.observations?.length ? `<div class="notice-warn"><strong>Observaciones comerciales:</strong><ul>${commercial.observations.map(o=>`<li>${esc(o)}</li>`).join("")}</ul></div>` : `<div class="notice-ok"><strong>Presupuesto:</strong> partidas generadas correctamente desde el proyecto.</div>`}

      <div class="dashboard-card">
        <h4>Materiales automáticos</h4>
        <div class="data-table-wrap wide-table"><table><thead><tr><th>Origen</th><th>Material</th><th>Cantidad</th><th>Precio unit.</th><th>Total</th><th>Circuitos</th></tr></thead><tbody>${materialRows(commercial.materials)}</tbody></table></div>
      </div>

      <div class="dashboard-card">
        <h4>Mano de obra automática</h4>
        <div class="data-table-wrap"><table><thead><tr><th>Partida</th><th>Cantidad</th><th>Precio unit.</th><th>Total</th><th>ID</th></tr></thead><tbody>${laborRows(commercial.labor)}</tbody></table></div>
      </div>

      <div class="dashboard-card">
        <h4>Resumen</h4>
        <div class="data-table-wrap"><table><tbody>
          <tr><th>Subtotal directo</th><td>${clp(commercial.totals.directCost)}</td></tr>
          <tr><th>Margen</th><td>${clp(commercial.totals.margin)}</td></tr>
          <tr><th>Descuento</th><td>${clp(commercial.totals.discount)}</td></tr>
          <tr><th>Neto</th><td>${clp(commercial.totals.net)}</td></tr>
          <tr><th>IVA</th><td>${clp(commercial.totals.iva)}</td></tr>
          <tr><th>Total</th><td><strong>${clp(commercial.totals.total)}</strong></td></tr>
        </tbody></table></div>
      </div>
    </section>`;

  host.querySelector("#saveCommercialSettings").addEventListener("click", () => {
    project.commercialSettings = project.commercialSettings || {};
    project.commercialSettings.marginPercent = Number(host.querySelector("#marginPercent").value || 0);
    project.commercialSettings.discountPercent = Number(host.querySelector("#discountPercent").value || 0);
    project.commercialSettings.ivaPercent = Number(host.querySelector("#ivaPercent").value || 19);
    project.commercialSettings.laborRates = project.commercialSettings.laborRates || {};
    project.commercialSettings.laborRates.circuitBase = Number(host.querySelector("#circuitBase").value || 0);
    addHistory("Parámetros comerciales actualizados", "Motor Comercial", false);
    recalculateProject();
    persist();
    render(host, globalState);
  });

  host.querySelector("#refreshCommercial").addEventListener("click", () => { recalculateProject(); persist(); render(host, globalState); });
  host.querySelector("#downloadCommercialReport").addEventListener("click", () => {
    const safeName = (project.name || "presupuesto-giae").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "presupuesto-giae";
    downloadJson(`${safeName}-presupuesto-giae.json`, exportCommercialReport(project));
  });
}

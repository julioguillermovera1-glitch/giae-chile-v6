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

// Abre SOLO el documento de la cotizacion (sin el titulo del panel, KPIs
// ni tablas internas duplicadas) en una pestana aparte, lista para
// imprimir o guardar como PDF con el propio navegador. Disponible para
// cualquier perfil que use este modulo (empresa e instalador independiente).
function openPrintableQuote(project, commercial, state, documentHtml){
  const win = window.open("", "_blank");
  if(!win){
    alert("El navegador bloqueó la ventana de impresión. Habilita las ventanas emergentes para este sitio e inténtalo de nuevo.");
    return;
  }
  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
    <title>Presupuesto - ${esc(project.name || "GIAE Chile")}</title>
    <link rel="stylesheet" href="${location.origin}/css/platform.css">
    <style>
      @page { size: A4; margin: 14mm; }
      body{ background:#fff; margin:0; padding:16px; }
    </style>
  </head><body>${documentHtml}</body></html>`);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
}

const DEFAULT_QUOTE_TEMPLATE = `COTIZACIÓN

{{empresa}}
RUT {{rut_empresa}} · {{direccion_empresa}} · {{telefono_empresa}} · {{correo_empresa}}

Cliente: {{cliente}}
Proyecto: {{proyecto}}
Dirección del trabajo: {{direccion_trabajo}}
Fecha de emisión: {{fecha}}
Válido hasta: {{validez}}

MATERIALES
{{materiales_tabla}}

MANO DE OBRA
{{mano_obra_tabla}}

RESUMEN
Materiales: {{materiales_subtotal}}
Mano de obra: {{mano_obra_subtotal}}
Otros gastos: {{otros_gastos}}
Subtotal directo: {{subtotal_directo}}
Margen: {{margen}}
Descuento: {{descuento}}
Neto: {{neto}}
IVA: {{iva}}
TOTAL: {{total}}`;

// Variables reales disponibles para la plantilla propia de cada empresa o
// instalador independiente. Todo viene del proyecto/motor comercial real,
// nada inventado.
function buildTemplateVars(project, commercial, state){
  const brand = state.companyBrand || state.admin?.company?.brand || {};
  const company = state.admin?.company || {};
  const materialsText = (commercial.materials || []).length
    ? commercial.materials.map(item => `- ${item.item} (${num(item.qty, item.unit === "m" ? 1 : 0)} ${item.unit}) x ${clp(item.unitPrice)} = ${clp(item.total)}`).join("\n")
    : "Sin materiales generados.";
  const laborText = (commercial.labor || []).length
    ? commercial.labor.map(item => `- ${item.concept} (${num(item.qty, item.unit === "m" ? 1 : 0)} ${item.unit}) x ${clp(item.unitPrice)} = ${clp(item.total)}`).join("\n")
    : "Sin partidas de mano de obra generadas.";
  const workAddress = [project.address, project.commune, project.region].filter(Boolean).join(", ") || "Sin dirección registrada";
  return {
    empresa: company.name || brand.name || project.company || "GIAE Chile",
    rut_empresa: company.rut || "Sin RUT registrado",
    direccion_empresa: company.address || "Sin dirección registrada",
    telefono_empresa: company.phone || "Sin teléfono registrado",
    correo_empresa: company.email || "Sin correo registrado",
    cliente: project.client || "Sin cliente",
    proyecto: project.name || "Proyecto sin nombre",
    direccion_trabajo: workAddress,
    fecha: commercial.generatedAt || "",
    validez: commercial.validUntil || "Sin plazo definido",
    materiales_tabla: materialsText,
    mano_obra_tabla: laborText,
    materiales_subtotal: clp(commercial.totals.materialsSubtotal),
    mano_obra_subtotal: clp(commercial.totals.laborSubtotal),
    otros_gastos: clp(commercial.totals.otherExpenses || 0),
    subtotal_directo: clp(commercial.totals.directCost),
    margen: clp(commercial.totals.margin),
    descuento: clp(commercial.totals.discount),
    neto: clp(commercial.totals.net),
    iva: clp(commercial.totals.iva),
    total: clp(commercial.totals.total)
  };
}

function renderQuoteTemplate(templateText, project, commercial, state){
  const vars = buildTemplateVars(project, commercial, state);
  let text = templateText;
  for(const [key, value] of Object.entries(vars)){
    text = text.replaceAll(`{{${key}}}`, value);
  }
  return text;
}

function customTemplateDocument(templateText, project, commercial, state){
  const filled = renderQuoteTemplate(templateText, project, commercial, state);
  return `<div class="budget-preview commercial-preview template-custom" style="border:1px solid var(--line);border-radius:16px;background:#fff;padding:1.4rem;white-space:pre-wrap;line-height:1.6">${esc(filled)}</div>`;
}

// Decide si usar la plantilla propia de la empresa/instalador (si definio
// una) o los 4 estilos incorporados. Se usa tanto en pantalla como al
// imprimir, para que ambos muestren siempre lo mismo.
function buildQuoteDocument(project, commercial, state){
  const customTemplate = (state.admin?.company?.quoteTemplate || "").trim();
  if(customTemplate) return customTemplateDocument(customTemplate, project, commercial, state);
  return quotePreview(project, commercial, state);
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

// Tabla de detalle (materiales + mano de obra + resumen con IVA) que se
// agrega a los 4 estilos de plantilla. Antes solo mostraban el encabezado
// con el total, sin desglose - un presupuesto real necesita el detalle.
function quoteDetailBlock(commercial, accent){
  const materialRowsHtml = commercial.materials?.length
    ? commercial.materials.map(item => `<tr style="border-bottom:1px solid #eef1f5">
        <td style="padding:.35rem .3rem;color:#66758a">${esc(item.source)}</td>
        <td style="padding:.35rem .3rem">${esc(item.item)}</td>
        <td style="padding:.35rem .3rem;text-align:right">${num(item.qty, item.unit === "m" ? 1 : 0)} ${esc(item.unit)}</td>
        <td style="padding:.35rem .3rem;text-align:right">${clp(item.unitPrice)}</td>
        <td style="padding:.35rem .3rem;text-align:right"><strong>${clp(item.total)}</strong></td>
      </tr>`).join("")
    : `<tr><td colspan="5" style="padding:.5rem .3rem;color:#66758a">Sin materiales generados. Ingresa cargas y genera tablero/empalme.</td></tr>`;

  const laborRowsHtml = commercial.labor?.length
    ? commercial.labor.map(item => `<tr style="border-bottom:1px solid #eef1f5">
        <td style="padding:.35rem .3rem">${esc(item.concept)}</td>
        <td style="padding:.35rem .3rem;text-align:right">${num(item.qty, item.unit === "m" ? 1 : 0)} ${esc(item.unit)}</td>
        <td style="padding:.35rem .3rem;text-align:right">${clp(item.unitPrice)}</td>
        <td style="padding:.35rem .3rem;text-align:right"><strong>${clp(item.total)}</strong></td>
      </tr>`).join("")
    : `<tr><td colspan="4" style="padding:.5rem .3rem;color:#66758a">Sin partidas de mano de obra generadas.</td></tr>`;

  return `
    <table style="width:100%;border-collapse:collapse;font-size:.85rem">
      <caption style="text-align:left;font-weight:700;padding:0 0 .3rem;caption-side:top">Materiales</caption>
      <thead><tr style="border-bottom:2px solid ${accent}">
        <th style="text-align:left;padding:.4rem .3rem">Origen</th>
        <th style="text-align:left;padding:.4rem .3rem">Material</th>
        <th style="text-align:right;padding:.4rem .3rem">Cant.</th>
        <th style="text-align:right;padding:.4rem .3rem">Precio unit.</th>
        <th style="text-align:right;padding:.4rem .3rem">Total</th>
      </tr></thead>
      <tbody>${materialRowsHtml}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:.85rem;margin-top:1rem">
      <caption style="text-align:left;font-weight:700;padding:0 0 .3rem;caption-side:top">Mano de obra</caption>
      <thead><tr style="border-bottom:2px solid ${accent}">
        <th style="text-align:left;padding:.4rem .3rem">Partida</th>
        <th style="text-align:right;padding:.4rem .3rem">Cant.</th>
        <th style="text-align:right;padding:.4rem .3rem">Precio unit.</th>
        <th style="text-align:right;padding:.4rem .3rem">Total</th>
      </tr></thead>
      <tbody>${laborRowsHtml}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:.9rem;margin-top:1rem">
      <caption style="text-align:left;font-weight:700;padding:0 0 .3rem;caption-side:top">Resumen</caption>
      <tbody>
        <tr><td style="padding:.3rem .3rem">Materiales</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.materialsSubtotal)}</td></tr>
        <tr><td style="padding:.3rem .3rem">Mano de obra</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.laborSubtotal)}</td></tr>
        ${commercial.totals.otherExpenses ? `<tr><td style="padding:.3rem .3rem">${esc(commercial.otherExpensesLabel || "Otros gastos")}</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.otherExpenses)}</td></tr>` : ""}
        <tr style="border-top:1px solid #eef1f5"><td style="padding:.3rem .3rem">Subtotal directo</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.directCost)}</td></tr>
        <tr><td style="padding:.3rem .3rem">Margen</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.margin)}</td></tr>
        <tr><td style="padding:.3rem .3rem">Descuento</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.discount)}</td></tr>
        <tr style="border-top:1px solid #eef1f5"><td style="padding:.3rem .3rem">Neto</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.net)}</td></tr>
        <tr><td style="padding:.3rem .3rem">IVA</td><td style="padding:.3rem .3rem;text-align:right">${clp(commercial.totals.iva)}</td></tr>
        <tr style="border-top:2px solid ${accent}"><td style="padding:.5rem .3rem;font-weight:700">Total</td><td style="padding:.5rem .3rem;text-align:right;font-weight:700">${clp(commercial.totals.total)}</td></tr>
        ${commercial.validUntil ? `<tr><td style="padding:.5rem .3rem;color:#66758a" colspan="2">Presupuesto válido hasta el <strong style="color:inherit">${esc(commercial.validUntil)}</strong>.</td></tr>` : ""}
      </tbody>
    </table>`;
}

function quotePreview(project, commercial, state){
  const brand = state.companyBrand || state.admin?.company?.brand || {};
  const company = state.admin?.company || {};
  const primary = brand.primaryColor || "#102033";
  const accent = brand.accentColor || "#1456a0";
  const style = brand.templateStyle || "tecnico";
  const companyName = esc(company.name || brand.name || project.company || "GIAE Chile");
  const projectName = esc(project.name || "Proyecto sin nombre");
  const totalValue = clp(commercial.totals.total);
  // Datos reales de quien emite el presupuesto (ya cargados en Panel de
  // reparacion -> Empresa y logo), antes solo se mostraba el nombre.
  const issuerParts = [
    company.rut ? `RUT ${company.rut}` : "",
    company.address || "",
    company.phone || "",
    company.email || ""
  ].filter(Boolean).map(esc).join(" · ");
  // Direccion donde se hara el trabajo (unico dato de ubicacion del cliente
  // que existe en el proyecto - no hay un campo separado de "domicilio
  // del cliente" en el formulario de proyecto).
  const workAddress = [project.address, project.commune, project.region].filter(Boolean).map(esc).join(", ") || "Sin dirección registrada";
  const infoGrid = `<div style="padding:1rem 1.2rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem">
      <div><span class="small">Cliente</span><br><strong>${esc(project.client || "Sin cliente")}</strong></div>
      <div><span class="small">Dirección del trabajo</span><br><strong>${workAddress}</strong></div>
      <div><span class="small">Fecha de emisión</span><br><strong>${esc(commercial.generatedAt)}</strong></div>
      <div><span class="small">Válido hasta</span><br><strong>${esc(commercial.validUntil || "Sin plazo definido")}</strong></div>
      <div><span class="small">Estado</span><br><strong>${esc(commercial.status)}</strong></div>
      <div><span class="small">Trazabilidad</span><br><strong>${esc(commercial.trace.join(" · "))}</strong></div>
    </div>`;

  // Cada "Estilo de plantilla" cambia de verdad la disposicion de este
  // documento (no solo un valor guardado sin efecto). Los 4 estilos usan
  // los mismos colores corporativos reales de la empresa (primary/accent).
  if(style === "empresa"){
    return `<div class="budget-preview commercial-preview template-empresa" style="border-radius:20px;background:#fff;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08)">
      <div style="padding:1.2rem 1.4rem;background:${primary};color:#fff;display:flex;justify-content:space-between;align-items:center;gap:1rem">
        <div>
          <strong style="font-size:1.4rem">${companyName}</strong><br>
          <span style="opacity:.85">Cotización preliminar · ${projectName}</span>
          ${issuerParts ? `<br><span style="opacity:.75;font-size:.8rem">${issuerParts}</span>` : ""}
        </div>
        <div style="text-align:right;background:${accent};padding:.6rem 1rem;border-radius:12px">
          <span style="font-size:.8rem;opacity:.9">Total</span><br><strong style="font-size:1.6rem">${totalValue}</strong>
        </div>
      </div>
      ${infoGrid}
      <div style="padding:0 1.4rem 1.4rem">${quoteDetailBlock(commercial, accent)}</div>
    </div>`;
  }

  if(style === "minimal"){
    return `<div class="budget-preview commercial-preview template-minimal" style="border-left:3px solid ${accent};padding-left:1rem">
      <div style="display:flex;justify-content:space-between;gap:1rem;align-items:baseline;padding:.4rem 0">
        <span>${companyName} — ${projectName}</span>
        <strong>${totalValue}</strong>
      </div>
      ${issuerParts ? `<div style="font-size:.8rem;color:#8a97a6">${issuerParts}</div>` : ""}
      <div style="padding:.4rem 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.3rem;font-size:.9rem;color:#526173">
        <span>Cliente: ${esc(project.client || "Sin cliente")}</span>
        <span>Dirección del trabajo: ${workAddress}</span>
        <span>Fecha de emisión: ${esc(commercial.generatedAt)}</span>
        <span>Válido hasta: ${esc(commercial.validUntil || "Sin plazo definido")}</span>
        <span>Estado: ${esc(commercial.status)}</span>
        <span>Trazabilidad: ${esc(commercial.trace.join(" · "))}</span>
      </div>
      <div style="padding:.6rem 0 0">${quoteDetailBlock(commercial, accent)}</div>
    </div>`;
  }

  if(style === "sobrio"){
    return `<div class="budget-preview commercial-preview template-sobrio" style="border:1px solid var(--line);border-radius:10px;background:#fff">
      <div style="padding:1rem 1.2rem;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:1rem">
        <div>
          <strong style="font-size:1.1rem;color:${primary}">${companyName}</strong><br>
          <span class="small">Cotización preliminar · ${projectName}</span>
          ${issuerParts ? `<br><span class="small">${issuerParts}</span>` : ""}
        </div>
        <div style="text-align:right"><span class="small">Total</span><br><strong style="font-size:1.2rem;color:${primary}">${totalValue}</strong></div>
      </div>
      ${infoGrid}
      <div style="padding:0 1.2rem 1.2rem">${quoteDetailBlock(commercial, accent)}</div>
    </div>`;
  }

  // "tecnico" (estilo por defecto)
  return `<div class="budget-preview commercial-preview template-tecnico" style="border:1px solid var(--line);border-radius:20px;background:#fff;overflow:hidden">
    <div style="display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:1rem 1.2rem;border-bottom:4px solid ${accent}">
      <div>
        <strong style="font-size:1.25rem;color:${primary}">${companyName}</strong><br>
        <span class="small">Cotización preliminar · ${projectName}</span>
        ${issuerParts ? `<br><span class="small">${issuerParts}</span>` : ""}
      </div>
      <div class="quote-total" style="text-align:right">
        <span class="small">Total</span><br><strong style="font-size:1.45rem;color:${primary}">${totalValue}</strong>
      </div>
    </div>
    ${infoGrid}
    <div style="padding:0 1.2rem 1.2rem">${quoteDetailBlock(commercial, accent)}</div>
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

      ${buildQuoteDocument(project, commercial, state)}
      <div class="module-toolbar"><button id="printQuoteBtn" class="secondary">Imprimir / Descargar PDF</button></div>

      <div class="dashboard-card">
        <h4>Mi plantilla de presupuesto</h4>
        <p class="muted">Si prefieres tu propio formato en vez de los 4 estilos incorporados (técnico/sobrio/empresa/minimal), escríbelo aquí usando estas variables — se reemplazan por los datos reales de este proyecto: <code>{{empresa}}</code> <code>{{rut_empresa}}</code> <code>{{direccion_empresa}}</code> <code>{{telefono_empresa}}</code> <code>{{correo_empresa}}</code> <code>{{cliente}}</code> <code>{{proyecto}}</code> <code>{{direccion_trabajo}}</code> <code>{{fecha}}</code> <code>{{validez}}</code> <code>{{materiales_tabla}}</code> <code>{{mano_obra_tabla}}</code> <code>{{materiales_subtotal}}</code> <code>{{mano_obra_subtotal}}</code> <code>{{otros_gastos}}</code> <code>{{subtotal_directo}}</code> <code>{{margen}}</code> <code>{{descuento}}</code> <code>{{neto}}</code> <code>{{iva}}</code> <code>{{total}}</code>.</p>
        <textarea id="quoteTemplateText" rows="12" class="template-editor" placeholder="Deja vacío para usar el estilo de plantilla elegido en Empresa y logo.">${esc(state.admin?.company?.quoteTemplate || "")}</textarea>
        <div class="module-toolbar">
          <button id="saveQuoteTemplate" class="primary-action">Guardar mi plantilla</button>
          <button id="loadDefaultQuoteTemplate" class="secondary">Ver plantilla de ejemplo</button>
          <button id="clearQuoteTemplate" class="secondary">Quitar (volver a los 4 estilos)</button>
        </div>
      </div>

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
          <label>Otros gastos $ <input id="otherExpensesAmount" type="number" min="0" value="${esc(settings.otherExpensesAmount ?? 0)}"></label>
          <label>Descripción de otros gastos <input id="otherExpensesLabel" value="${esc(settings.otherExpensesLabel ?? "Gastos varios (transporte, permisos, certificación)")}"></label>
          <label>Validez del presupuesto (días) <input id="validityDays" type="number" min="0" value="${esc(settings.validityDays ?? 15)}"></label>
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
          <tr><th>Materiales</th><td>${clp(commercial.totals.materialsSubtotal)}</td></tr>
          <tr><th>Mano de obra</th><td>${clp(commercial.totals.laborSubtotal)}</td></tr>
          ${commercial.totals.otherExpenses ? `<tr><th>${esc(commercial.otherExpensesLabel || "Otros gastos")}</th><td>${clp(commercial.totals.otherExpenses)}</td></tr>` : ""}
          <tr><th>Subtotal directo</th><td>${clp(commercial.totals.directCost)}</td></tr>
          <tr><th>Margen</th><td>${clp(commercial.totals.margin)}</td></tr>
          <tr><th>Descuento</th><td>${clp(commercial.totals.discount)}</td></tr>
          <tr><th>Neto</th><td>${clp(commercial.totals.net)}</td></tr>
          <tr><th>IVA</th><td>${clp(commercial.totals.iva)}</td></tr>
          <tr><th>Total</th><td><strong>${clp(commercial.totals.total)}</strong></td></tr>
          ${commercial.validUntil ? `<tr><th>Válido hasta</th><td>${esc(commercial.validUntil)}</td></tr>` : ""}
        </tbody></table></div>
      </div>
    </section>`;

  host.querySelector("#printQuoteBtn").addEventListener("click", () => {
    openPrintableQuote(project, commercial, state, buildQuoteDocument(project, commercial, state));
  });

  host.querySelector("#saveQuoteTemplate").addEventListener("click", () => {
    state.admin = state.admin || {};
    state.admin.company = state.admin.company || {};
    state.admin.company.quoteTemplate = host.querySelector("#quoteTemplateText").value;
    addHistory("Plantilla propia de presupuesto guardada", "Motor Comercial", false);
    persist();
    render(host, globalState);
  });

  host.querySelector("#loadDefaultQuoteTemplate").addEventListener("click", () => {
    host.querySelector("#quoteTemplateText").value = DEFAULT_QUOTE_TEMPLATE;
  });

  host.querySelector("#clearQuoteTemplate").addEventListener("click", () => {
    state.admin = state.admin || {};
    state.admin.company = state.admin.company || {};
    state.admin.company.quoteTemplate = "";
    addHistory("Plantilla propia de presupuesto quitada, vuelve a estilos incorporados", "Motor Comercial", false);
    persist();
    render(host, globalState);
  });

  host.querySelector("#saveCommercialSettings").addEventListener("click", () => {
    project.commercialSettings = project.commercialSettings || {};
    project.commercialSettings.marginPercent = Number(host.querySelector("#marginPercent").value || 0);
    project.commercialSettings.discountPercent = Number(host.querySelector("#discountPercent").value || 0);
    project.commercialSettings.ivaPercent = Number(host.querySelector("#ivaPercent").value || 19);
    project.commercialSettings.otherExpensesAmount = Number(host.querySelector("#otherExpensesAmount").value || 0);
    project.commercialSettings.otherExpensesLabel = host.querySelector("#otherExpensesLabel").value.trim() || "Otros gastos";
    project.commercialSettings.validityDays = Number(host.querySelector("#validityDays").value || 0);
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

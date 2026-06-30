import { loadTechnicalLibrary, getTechnicalSummary, searchKnowledge } from "../../core/technicalLibrary.js";

function esc(value=""){
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

function human(value=""){
  return String(value || "").replaceAll("_"," ").replaceAll(/([A-Z])/g," $1").trim();
}

function estadoBase(item){
  return String(item.estado_conocimiento || item.estado_normativo || item.estado || "sin_estado");
}

function labelEstado(item){
  const estado = estadoBase(item);
  const normalized = estado.toLowerCase();
  const danger = normalized.includes("obsoleto") || normalized.includes("rechazado");
  const warn = normalized.includes("pendiente") || normalized.includes("requiere") || normalized.includes("revision") || normalized.includes("revisión") || normalized.includes("cargar");
  return `<span class="pill ${danger ? "danger" : warn ? "warning" : "ok"}">${esc(human(estado))}</span>`;
}

function itemDescription(item){
  return item.uso_referencial || item.uso || item.descripcion || item.observacion || "Sin descripción cargada";
}

function fichaItem(item){
  const aplicaciones = Array.isArray(item.aplicable_a) ? item.aplicable_a.join(", ") : (item.aplicable_a || "Pendiente");
  const historial = Array.isArray(item.historial) ? item.historial : [];
  return `<article class="admin-card knowledge-detail">
    <div class="workspace-title-row compact">
      <div>
        <p class="eyebrow">Ficha técnica</p>
        <h4>${esc(item.nombre || item.id)}</h4>
        <p>${esc(itemDescription(item))}</p>
      </div>
      <div>${labelEstado(item)}</div>
    </div>
    <div class="admin-kpis compact-kpis">
      <div><strong>${esc(item.id || "-")}</strong><span>ID</span></div>
      <div><strong>${esc(human(item.categoria || "-"))}</strong><span>Categoría</span></div>
      <div><strong>${esc(item.ultima_revision || "pendiente")}</strong><span>Última revisión</span></div>
      <div><strong>${esc(item.fuente_normativa || "pendiente")}</strong><span>Fuente normativa</span></div>
    </div>
    <div class="data-table-wrap"><table>
      <tbody>
        <tr><th>Uso técnico</th><td>${esc(itemDescription(item))}</td></tr>
        <tr><th>Aplicable a</th><td>${esc(aplicaciones)}</td></tr>
        <tr><th>Sección / corriente</th><td>${esc(item.seccion_mm2 ? item.seccion_mm2 + " mm²" : item.corriente_A ? item.corriente_A + " A" : "No aplica")}</td></tr>
        <tr><th>Observación</th><td>${esc(item.observacion || "Sin observación específica.")}</td></tr>
      </tbody>
    </table></div>
    <h4>Historial</h4>
    <div class="data-table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Acción</th></tr></thead>
      <tbody>${historial.length ? historial.map(h => `<tr><td>${esc(h.fecha || "-")}</td><td>${esc(h.accion || "-")}</td></tr>`).join("") : `<tr><td colspan="2">Sin historial cargado.</td></tr>`}</tbody>
    </table></div>
  </article>`;
}

function renderItems(items=[]){
  if(!items.length) return `<div class="workspace-empty">No hay elementos para los filtros seleccionados.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>ID</th><th>Elemento</th><th>Uso / descripción</th><th>Estado</th><th>Acción</th></tr></thead>
    <tbody>${items.map(item => `
      <tr>
        <td><code>${esc(item.id)}</code></td>
        <td><strong>${esc(item.nombre)}</strong>${item.seccion_mm2 ? `<br><small>Sección: ${esc(item.seccion_mm2)} mm²</small>` : ""}${item.corriente_A ? `<br><small>Corriente: ${esc(item.corriente_A)} A</small>` : ""}</td>
        <td>${esc(itemDescription(item))}</td>
        <td>${labelEstado(item)}</td>
        <td><button class="secondary mini-action" data-kb-open="${esc(item.id)}">Ver ficha</button></td>
      </tr>`).join("")}</tbody>
  </table></div>`;
}

function referencesTable(library){
  return `<section class="admin-card">
    <h4>Referencias autorizadas</h4>
    <p class="small-muted">Solo estas fuentes pueden alimentar decisiones normativas automáticas: RIC, IEC eléctrica aplicable y DS N°8 cuando corresponda.</p>
    <div class="data-table-wrap"><table>
      <thead><tr><th>Prioridad</th><th>Referencia</th><th>Alcance</th><th>Estado</th></tr></thead>
      <tbody>${(library.referenciasAutorizadas || []).map(ref => `<tr><td>${esc(ref.prioridad)}</td><td><strong>${esc(ref.nombre)}</strong></td><td>${esc(ref.alcance)}</td><td>${labelEstado(ref)}</td></tr>`).join("")}</tbody>
    </table></div>
  </section>`;
}

export async function render(host, state){
  host.innerHTML = `<section class="module-window real-workspace"><p>Cargando Base de Conocimiento GIAE...</p></section>`;
  let library;
  let summary;
  try{
    library = await loadTechnicalLibrary();
    summary = await getTechnicalSummary();
  }catch(error){
    host.innerHTML = `<section class="module-window real-workspace"><div class="result-box danger"><b>Error al cargar base.</b><br>${esc(error.message)}</div></section>`;
    return;
  }

  const categories = library.categorias || {};
  const names = Object.keys(categories);

  host.innerHTML = `
    <section class="module-window real-workspace biblioteca-workspace">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">Etapa 2.9b</p>
          <h3>Base de Conocimiento GIAE</h3>
          <p>Base técnica, normativa y educativa para los motores de cálculo, auditoría, documentación, presupuesto y Aula Técnica.</p>
        </div>
        <div class="status-strip">
          <span>${esc(summary.version)}</span>
          <span>${summary.totalItems} elementos</span>
          <span>${summary.references} referencias</span>
        </div>
      </div>

      <section class="admin-kpis compact-kpis">
        <div><strong>${summary.categories}</strong><span>Categorías</span></div>
        <div><strong>${summary.totalItems}</strong><span>Elementos técnicos</span></div>
        <div><strong>${summary.pending}</strong><span>En revisión</span></div>
        <div><strong>${summary.references}</strong><span>Fuentes autorizadas</span></div>
      </section>

      <div class="result-box warning">
        <b>Regla de seguridad normativa:</b> ningún elemento técnico debe pasar a estado validado si no tiene respaldo cargado en RIC, IEC eléctrica aplicable o DS N°8 cuando corresponda.
      </div>

      <section class="admin-card knowledge-search">
        <div class="grid two">
          <label>Buscar en la base<input id="kbSearch" placeholder="Ej: conductor, automático, diferencial, EMT, tierra"></label>
          <label>Categoría<select id="kbCategory"><option value="todos">Todas</option>${names.map(name => `<option value="${esc(name)}">${esc(human(name))}</option>`).join("")}</select></label>
          <label>Estado<select id="kbStatus"><option value="todos">Todos</option><option value="validado">Validado</option><option value="revision">En revisión</option><option value="pendiente">Pendiente</option><option value="obsoleto">Obsoleto</option></select></label>
          <label>Uso<select id="kbUse"><option value="todos">Todos</option><option value="Ingeniería">Ingeniería</option><option value="Aula Técnica">Aula Técnica</option><option value="Motor Normativo">Motor Normativo</option></select></label>
        </div>
      </section>

      <section id="knowledgeResultView" class="admin-card"></section>
      <section id="knowledgeDetailView"></section>
      ${referencesTable(library)}

      <div class="module-toolbar">
        <button id="downloadLibraryBtn" class="secondary">Descargar base JSON</button>
      </div>
    </section>`;

  const resultView = host.querySelector("#knowledgeResultView");
  const detailView = host.querySelector("#knowledgeDetailView");
  const controls = ["#kbSearch", "#kbCategory", "#kbStatus", "#kbUse"].map(selector => host.querySelector(selector));

  const apply = () => {
    const filters = {
      category: host.querySelector("#kbCategory").value,
      estado: host.querySelector("#kbStatus").value === "todos" ? "" : host.querySelector("#kbStatus").value
    };
    let items = searchKnowledge(library, host.querySelector("#kbSearch").value, filters);
    const use = host.querySelector("#kbUse").value;
    if(use !== "todos") items = items.filter(item => Array.isArray(item.aplicable_a) ? item.aplicable_a.includes(use) : String(item.aplicable_a || "").includes(use));
    resultView.innerHTML = `<div class="workspace-title-row compact"><div><h4>Resultados</h4><p>${items.length} elemento(s) encontrados.</p></div></div>${renderItems(items)}`;
    detailView.innerHTML = "";
    resultView.querySelectorAll("[data-kb-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = items.find(entry => entry.id === btn.dataset.kbOpen);
        detailView.innerHTML = item ? fichaItem(item) : "";
        detailView.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  controls.forEach(control => control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply));
  apply();

  host.querySelector("#downloadLibraryBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "base-conocimiento-giae.json";
    link.click();
    URL.revokeObjectURL(url);
  });
}

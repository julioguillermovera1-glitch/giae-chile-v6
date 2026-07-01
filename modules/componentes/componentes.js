import { loadComponentLibrary, getComponentSummary, searchComponents, getSymbol } from "../../core/componentLibrary.js";

function esc(value=""){
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function human(value=""){
  return String(value || "").replaceAll("_"," ").replaceAll(/([A-Z])/g," $1").trim();
}
function pillEstado(estado=""){
  const normalized = String(estado || "").toLowerCase();
  const ok = normalized.includes("validado");
  const warn = normalized.includes("revision") || normalized.includes("revisión") || normalized.includes("requiere");
  return `<span class="pill ${ok ? "ok" : warn ? "warning" : ""}">${esc(human(estado || "sin estado"))}</span>`;
}
function joinList(values){
  return Array.isArray(values) ? values.join(", ") : (values || "-");
}
function renderTable(items){
  if(!items.length) return `<div class="workspace-empty">No hay componentes para los filtros seleccionados.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>ID</th><th>Componente</th><th>Uso en GIAE</th><th>Símbolo</th><th>Estado</th><th>Acción</th></tr></thead>
    <tbody>${items.map(item => `<tr>
      <td><code>${esc(item.id)}</code></td>
      <td><strong>${esc(item.nombre)}</strong><br><small>${esc(human(item.tipo))} · ${esc(human(item.familia))}</small></td>
      <td>${esc(joinList(item.usaEn))}</td>
      <td><code>${esc(item.simboloIEC || "pendiente")}</code></td>
      <td>${pillEstado(item.estado)}</td>
      <td><button class="secondary mini-action" data-component-open="${esc(item.id)}">Ver objeto</button></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}
function renderCompatibility(item){
  const entries = Object.entries(item.compatibilidad || {});
  if(!entries.length) return "Sin compatibilidad cargada.";
  return `<ul class="compact-list">${entries.map(([key, value]) => `<li><strong>${esc(human(key))}:</strong> ${esc(Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : value)}</li>`).join("")}</ul>`;
}
function renderDetail(library, item){
  const symbol = getSymbol(library, item.simboloIEC);
  return `<article class="admin-card knowledge-detail">
    <div class="workspace-title-row compact">
      <div>
        <p class="eyebrow">Objeto eléctrico BUCE</p>
        <h4>${esc(item.nombre)}</h4>
        <p>${esc(item.observacion || "Componente registrado en la Biblioteca Universal de Componentes Eléctricos.")}</p>
      </div>
      <div>${pillEstado(item.estado)}</div>
    </div>
    <section class="admin-kpis compact-kpis">
      <div><strong>${esc(item.id)}</strong><span>ID</span></div>
      <div><strong>${esc(human(item.familia))}</strong><span>Familia</span></div>
      <div><strong>${esc(item.simboloIEC || "-")}</strong><span>Símbolo</span></div>
      <div><strong>${esc(joinList(item.referencias))}</strong><span>Referencias</span></div>
    </section>
    <div class="grid two">
      <section class="result-box">
        <b>Propiedades técnicas</b><br>
        Tipo: ${esc(human(item.tipo))}<br>
        ${item.corriente_A ? `Corriente: ${esc(item.corriente_A)} A<br>` : ""}
        ${item.polos ? `Polos: ${esc(item.polos)}<br>` : ""}
        ${item.curva ? `Curva: ${esc(item.curva)}<br>` : ""}
        ${item.seccion_mm2 ? `Sección: ${esc(item.seccion_mm2)} mm²<br>` : ""}
        ${item.diametro_mm ? `Diámetro: ${esc(item.diametro_mm)} mm<br>` : ""}
        Uso técnico: ${esc(joinList(item.uso))}
      </section>
      <section class="result-box">
        <b>Símbolo asociado</b><br>
        ${symbol ? `${esc(symbol.nombre)}<br>Tipo: ${esc(human(symbol.tipo))}<br>Formato: ${esc(symbol.formato)}<br>Estado: ${esc(symbol.estado)}` : "Símbolo pendiente."}
      </section>
    </div>
    <h4>Compatibilidad</h4>
    ${renderCompatibility(item)}
    <h4>Uso dentro de GIAE</h4>
    <p>${esc(joinList(item.usaEn))}</p>
    <div class="result-box warning"><b>Regla de seguridad:</b> si el componente no tiene estado validado, los motores deben tratarlo como recomendación preliminar o requerir revisión normativa.</div>
  </article>`;
}

export async function render(host, state){
  host.innerHTML = `<section class="module-window real-workspace"><p>Cargando BUCE...</p></section>`;
  let library;
  let summary;
  try{
    library = await loadComponentLibrary();
    summary = await getComponentSummary();
  }catch(error){
    host.innerHTML = `<section class="module-window real-workspace"><div class="result-box danger"><b>Error al cargar BUCE.</b><br>${esc(error.message)}</div></section>`;
    return;
  }
  const familias = Object.keys(library.familias || {});
  host.innerHTML = `<section class="module-window real-workspace">
    <div class="workspace-title-row">
      <div>
        <p class="eyebrow">Etapa 7.0 base</p>
        <h3>BUCE · Biblioteca Universal de Componentes Eléctricos</h3>
        <p>Catálogo central de objetos eléctricos para tableros, unilineal, presupuesto, documentación, auditoría y Aula Técnica.</p>
      </div>
      <div class="status-strip"><span>${esc(summary.version)}</span><span>${summary.components} componentes</span><span>${summary.symbols} símbolos</span></div>
    </div>
    <section class="admin-kpis compact-kpis">
      <div><strong>${summary.families}</strong><span>Familias</span></div>
      <div><strong>${summary.components}</strong><span>Objetos eléctricos</span></div>
      <div><strong>${summary.symbols}</strong><span>Símbolos</span></div>
      <div><strong>${summary.review}</strong><span>En revisión</span></div>
    </section>
    <div class="result-box warning"><b>Uso arquitectónico:</b> desde esta biblioteca deben salir los componentes que usen Tableros, Unilineal, Presupuesto, Documentación y Aula Técnica. Ningún motor debería crear componentes duplicados por su cuenta.</div>
    <section class="admin-card">
      <div class="grid two">
        <label>Buscar componente<input id="buceSearch" placeholder="Ej: automático, diferencial, conductor, EMT, barra PE"></label>
        <label>Familia<select id="buceFamily"><option value="todos">Todas</option>${familias.map(f => `<option value="${esc(f)}">${esc(human(f))}</option>`).join("")}</select></label>
        <label>Uso en GIAE<select id="buceUse"><option value="todos">Todos</option><option value="tablero">Tablero</option><option value="unilineal">Unilineal</option><option value="presupuesto">Presupuesto</option><option value="documentacion">Documentación</option><option value="aula_tecnica">Aula Técnica</option></select></label>
        <label>Estado<select id="buceStatus"><option value="todos">Todos</option><option value="validado">Validado</option><option value="revision">Requiere revisión</option></select></label>
      </div>
    </section>
    <section id="buceResults" class="admin-card"></section>
    <section id="buceDetail"></section>
    <div class="module-toolbar"><button id="downloadBuce" class="secondary">Descargar BUCE JSON</button></div>
  </section>`;

  const results = host.querySelector("#buceResults");
  const detail = host.querySelector("#buceDetail");
  function apply(){
    const items = searchComponents(library, host.querySelector("#buceSearch").value, {
      familia: host.querySelector("#buceFamily").value,
      uso: host.querySelector("#buceUse").value,
      estado: host.querySelector("#buceStatus").value
    });
    results.innerHTML = `<div class="workspace-title-row compact"><div><h4>Componentes</h4><p>${items.length} objeto(s) encontrados.</p></div></div>${renderTable(items)}`;
    detail.innerHTML = "";
    results.querySelectorAll("[data-component-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = items.find(entry => entry.id === btn.dataset.componentOpen);
        detail.innerHTML = item ? renderDetail(library, item) : "";
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
  ["#buceSearch", "#buceFamily", "#buceUse", "#buceStatus"].forEach(selector => {
    const element = host.querySelector(selector);
    element.addEventListener(element.tagName === "INPUT" ? "input" : "change", apply);
  });
  apply();
  host.querySelector("#downloadBuce").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buce-componentes-electricos-giae.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

import { loadTechnicalLibrary, getTechnicalSummary } from "../../core/technicalLibrary.js";

function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

function labelEstado(item){
  const estado = item.estado_normativo || item.estado || "sin_estado";
  const danger = String(estado).includes("requiere");
  const warn = String(estado).includes("pendiente") || String(estado).includes("cargar");
  return `<span class="pill ${danger ? "danger" : warn ? "warning" : "ok"}">${esc(estado.replaceAll("_"," "))}</span>`;
}

function renderItems(items=[]){
  if(!items.length) return `<div class="workspace-empty">Esta categoría aún no tiene elementos cargados.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>ID</th><th>Elemento</th><th>Uso / descripción</th><th>Estado</th></tr></thead>
    <tbody>${items.map(item => `
      <tr>
        <td><code>${esc(item.id)}</code></td>
        <td><strong>${esc(item.nombre)}</strong>${item.seccion_mm2 ? `<br><small>Sección: ${item.seccion_mm2} mm²</small>` : ""}${item.corriente_A ? `<br><small>Corriente: ${item.corriente_A} A</small>` : ""}</td>
        <td>${esc(item.uso_referencial || item.uso || item.descripcion || item.observacion || "")}</td>
        <td>${labelEstado(item)}</td>
      </tr>`).join("")}</tbody>
  </table></div>`;
}

export async function render(host, state){
  host.innerHTML = `<section class="module-window real-workspace"><p>Cargando Biblioteca Técnica GIAE...</p></section>`;
  let library;
  let summary;
  try{
    library = await loadTechnicalLibrary();
    summary = await getTechnicalSummary();
  }catch(error){
    host.innerHTML = `<section class="module-window real-workspace"><div class="result-box danger"><b>Error al cargar biblioteca.</b><br>${esc(error.message)}</div></section>`;
    return;
  }

  const categories = library.categorias || {};
  const names = Object.keys(categories);
  const first = names[0] || "";

  host.innerHTML = `
    <section class="module-window real-workspace biblioteca-workspace">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">Etapa 2.9</p>
          <h3>Biblioteca Técnica GIAE</h3>
          <p>Fuente interna para motores de cálculo, auditoría, presupuesto, documentación y Aula Técnica. No aprueba datos sin respaldo normativo cargado.</p>
        </div>
        <div class="status-strip">
          <span>${esc(summary.version)}</span>
          <span>${summary.totalItems} elementos</span>
          <span>${summary.references} referencias autorizadas</span>
        </div>
      </div>

      <section class="admin-kpis compact-kpis">
        <div><strong>${summary.categories}</strong><span>Categorías</span></div>
        <div><strong>${summary.totalItems}</strong><span>Elementos técnicos</span></div>
        <div><strong>${summary.pending}</strong><span>Pendientes de validación</span></div>
        <div><strong>${summary.references}</strong><span>Fuentes autorizadas</span></div>
      </section>

      <div class="result-box warning">
        <b>Regla de seguridad normativa:</b> esta biblioteca es una base inicial. Si un valor no está respaldado por RIC, IEC eléctrica aplicable o DS N°8 cuando corresponda, GIAE debe marcarlo como “requiere revisión normativa”.
      </div>

      <section class="admin-tabs" aria-label="Categorías biblioteca">
        ${names.map((name, index) => `<button class="${index===0 ? "active" : ""}" data-lib-tab="${esc(name)}">${esc(name.replaceAll(/([A-Z])/g," $1").replaceAll("_"," "))}</button>`).join("")}
      </section>

      <section id="libraryCategoryView" class="admin-card"></section>

      <section class="admin-card">
        <h4>Referencias autorizadas</h4>
        <div class="data-table-wrap"><table>
          <thead><tr><th>Prioridad</th><th>Referencia</th><th>Alcance</th><th>Estado</th></tr></thead>
          <tbody>${(library.referenciasAutorizadas || []).map(ref => `<tr><td>${ref.prioridad}</td><td><strong>${esc(ref.nombre)}</strong></td><td>${esc(ref.alcance)}</td><td>${labelEstado(ref)}</td></tr>`).join("")}</tbody>
        </table></div>
      </section>

      <div class="module-toolbar">
        <button id="downloadLibraryBtn" class="secondary">Descargar biblioteca JSON</button>
      </div>
    </section>`;

  const view = host.querySelector("#libraryCategoryView");
  const paint = category => {
    view.innerHTML = `<h4>${esc(category.replaceAll(/([A-Z])/g," $1").replaceAll("_"," "))}</h4>${renderItems(categories[category] || [])}`;
    host.querySelectorAll("[data-lib-tab]").forEach(button => button.classList.toggle("active", button.dataset.libTab === category));
  };
  paint(first);
  host.querySelectorAll("[data-lib-tab]").forEach(button => button.addEventListener("click", () => paint(button.dataset.libTab)));
  host.querySelector("#downloadLibraryBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "biblioteca-tecnica-giae.json";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function esc(value=""){
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
async function loadJSON(path, fallback){
  try{
    const response = await fetch(path);
    if(!response.ok) throw new Error(path);
    return await response.json();
  }catch(error){
    console.warn("NORMA-CHILE: no se pudo cargar", path, error);
    return fallback;
  }
}
function badge(value="", kind=""){
  const text = String(value || "sin estado");
  const lower = text.toLowerCase();
  const cls = kind || (lower.includes("crit") || lower.includes("bloq") ? "danger" : lower.includes("pend") || lower.includes("rev") || lower.includes("advert") ? "warning" : "ok");
  return `<span class="pill ${cls}">${esc(text)}</span>`;
}
function normalizeBaseRule(rule){
  return {
    id: rule.id,
    origen: rule.origen || "DS8",
    documento: rule.documento || "DS8",
    categoria: rule.categoria || "Marco legal",
    validacion: rule.validacion || rule.mensaje_usuario || rule.descripcion || "Regla base NORMA-CHILE",
    severidad: rule.nivel || rule.severidad || "informativa",
    motores: rule.motores || ["Auditoría"],
    estado: rule.estado || "base",
    referencia: rule.referencia || rule.articulo_o_apartado || "",
    version: rule.version || "1.0"
  };
}
function renderRulesTable(reglas){
  if(!reglas.length) return `<div class="workspace-empty">No hay reglas para este filtro.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>ID</th><th>Origen</th><th>Categoría</th><th>Validación</th><th>Severidad</th><th>Motores</th><th>Estado</th></tr></thead>
    <tbody>${reglas.map(r => `<tr>
      <td><code>${esc(r.id)}</code></td>
      <td>${esc(r.origen || "")}</td>
      <td>${esc(r.categoria || "")}</td>
      <td>${esc(r.validacion || r.mensaje_usuario || "")}<br><small>${esc(r.referencia || "")}</small></td>
      <td>${badge(r.severidad || "info")}</td>
      <td>${esc((r.motores || []).join(" · "))}</td>
      <td>${badge(r.estado || "")}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}
function renderCoverage(cobertura){
  if(!cobertura.length) return `<div class="workspace-empty">Sin tabla de cobertura cargada.</div>`;
  return `<div class="grid three">${cobertura.map(item => `<article class="admin-card compact-card">
    <strong>${esc(item.id)}</strong>
    <p>${esc(item.nombre)}</p>
    <div>${badge(item.cobertura || "sin porcentaje")} ${badge(item.estado || "pendiente")}</div>
  </article>`).join("")}</div>`;
}
function renderDefinitions(definiciones){
  if(!definiciones.length) return `<div class="workspace-empty">Sin definiciones cargadas.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>Término</th><th>Fuente</th><th>Uso</th><th>Estado</th></tr></thead>
    <tbody>${definiciones.map(d => `<tr><td><strong>${esc(d.termino)}</strong></td><td>${esc(d.fuente)}</td><td>${esc(d.uso)}</td><td>${badge(d.estado || "")}</td></tr>`).join("")}</tbody>
  </table></div>`;
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
export async function render(host, state){
  host.innerHTML = `<section class="module-window real-workspace"><p>Cargando NORMA-CHILE...</p></section>`;
  const [catalogo, ds8, ricIndex, reglasV11, definiciones, coberturaData, relaciones] = await Promise.all([
    loadJSON("data/norma-chile/catalogo-normativo.json", { documentos: [] }),
    loadJSON("data/norma-chile/reglas/ds8/reglas-ds8-base.json", { reglas: [] }),
    loadJSON("data/norma-chile/reglas/ric/indice-ric-1-19.json", { items: [] }),
    loadJSON("data/norma-chile/reglas/ric/reglas-norma-chile-v11.json", []),
    loadJSON("data/norma-chile/definiciones/diccionario-normativo-v11.json", []),
    loadJSON("data/norma-chile/tablas/cobertura-normativa-v11.json", { documentos: [] }),
    loadJSON("data/norma-chile/relaciones/motores-reglas.json", { motores: {} })
  ]);
  const reglas = [...(ds8.reglas || []).map(normalizeBaseRule), ...(Array.isArray(reglasV11) ? reglasV11 : [])];
  const motores = Object.keys(relaciones.motores || {});
  const origenes = [...new Set(reglas.map(r => r.origen).filter(Boolean))].sort();
  const cobertura = coberturaData.documentos || [];

  host.innerHTML = `<section class="module-window real-workspace normative-workspace">
    <div class="workspace-title-row">
      <div>
        <p class="eyebrow">Administrador · Motor Normativo Chile</p>
        <h3>NORMA-CHILE v1.1 · Motor de Reglas</h3>
        <p>Base normativa digital para GIAE. Está integrada dentro del programa principal; no reemplaza la plataforma ni el cierre de sesión.</p>
      </div>
      <div class="status-strip"><span>DS N°8</span><span>RIC 1 al 19</span><span>v1.1</span></div>
    </div>

    <div class="result-box ok">
      <b>Integración reparada:</b> NORMA-CHILE ahora vive dentro de Administración. La navegación principal, los módulos GIAE y el botón Cerrar sesión se mantienen activos.
    </div>

    <section class="admin-kpis compact-kpis">
      <div><strong>${catalogo.documentos?.length || 0}</strong><span>Documentos catalogados</span></div>
      <div><strong>${reglas.length}</strong><span>Reglas estructuradas</span></div>
      <div><strong>${definiciones.length}</strong><span>Definiciones base</span></div>
      <div><strong>${motores.length}</strong><span>Motores relacionados</span></div>
    </section>

    <section class="admin-card">
      <h4>Editor Normativo</h4>
      <div class="grid three">
        <label>Buscar<input id="normaQ" placeholder="ID, RIC, categoría, motor, referencia..."></label>
        <label>Origen<select id="normaOrigen"><option value="">Todos los orígenes</option>${origenes.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join("")}</select></label>
        <label>Motor<select id="normaMotor"><option value="">Todos los motores</option>${[...new Set(reglas.flatMap(r=>r.motores||[]))].sort().map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("")}</select></label>
      </div>
      <div class="module-toolbar"><button id="downloadNormaBtn" class="secondary">Descargar diagnóstico NORMA-CHILE</button></div>
    </section>

    <section class="admin-card">
      <h4>Biblioteca de Reglas</h4>
      <div id="normaRules"></div>
    </section>

    <section class="admin-card">
      <h4>Biblioteca de Cobertura Normativa</h4>
      <div id="normaCoverage"></div>
    </section>

    <section class="admin-card">
      <h4>Biblioteca de Definiciones</h4>
      <div id="normaDefinitions"></div>
    </section>
  </section>`;

  const rulesNode = host.querySelector("#normaRules");
  const coverageNode = host.querySelector("#normaCoverage");
  const defsNode = host.querySelector("#normaDefinitions");
  const q = host.querySelector("#normaQ");
  const origen = host.querySelector("#normaOrigen");
  const motor = host.querySelector("#normaMotor");
  function apply(){
    const text = q.value.toLowerCase();
    const org = origen.value;
    const mot = motor.value;
    const list = reglas.filter(r => {
      const hay = JSON.stringify(r).toLowerCase();
      return (!text || hay.includes(text)) && (!org || r.origen === org) && (!mot || (r.motores || []).includes(mot));
    });
    rulesNode.innerHTML = renderRulesTable(list);
  }
  [q, origen, motor].forEach(el => el.addEventListener(el.tagName === "INPUT" ? "input" : "change", apply));
  apply();
  coverageNode.innerHTML = renderCoverage(cobertura);
  defsNode.innerHTML = renderDefinitions(definiciones);
  host.querySelector("#downloadNormaBtn").addEventListener("click", () => {
    downloadJson("diagnostico-norma-chile-integrado.json", {
      fecha: new Date().toISOString(),
      documentos: catalogo.documentos?.length || 0,
      reglas: reglas.length,
      definiciones: definiciones.length,
      motores: motores.length,
      estado: "integrado_en_giae"
    });
  });
}

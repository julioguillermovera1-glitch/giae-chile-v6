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
  const cls = kind || (lower.includes("pend") || lower.includes("requiere") ? "warning" : lower.includes("avanz") || lower.includes("base legal") || lower.includes("parcial") ? "ok" : lower.includes("crit") || lower.includes("bloq") ? "danger" : "neutral");
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
function downloadJson(filename, payload){
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
function renderCoverageTable(documentos){
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>Documento</th><th>Materia</th><th>Avance</th><th>Reglas</th><th>Motores</th><th>Prioridad</th><th>Estado</th><th>Siguiente acción</th></tr></thead>
    <tbody>${documentos.map(d => `<tr>
      <td><strong>${esc(d.id)}</strong><br><small>${esc(d.documento)}</small></td>
      <td>${esc(d.materia || d.categoria || "")}</td>
      <td><strong>${esc(d.avance || "0%")}</strong></td>
      <td>${esc(d.reglas_estructuradas || 0)}</td>
      <td>${esc((d.motores || []).join(" · "))}</td>
      <td>${badge(d.prioridad || "Media")}</td>
      <td>${badge(d.estado || "pendiente")}</td>
      <td>${esc(d.proximo_trabajo || "")}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}
function renderRelations(relaciones){
  if(!relaciones.length) return `<div class="workspace-empty">Sin relaciones DS8 → RIC cargadas.</div>`;
  return `<div class="grid three">${relaciones.map(r => `<article class="admin-card compact-card">
    <strong>${esc(r.marco_legal)} → ${esc(r.documento)}</strong>
    <p>${esc(r.materia)}</p>
    <small>Motores: ${esc((r.motores || []).join(" · "))}</small><br>
    ${badge(r.estado || "pendiente")} ${badge(`${r.reglas || 0} reglas`, "neutral")}
  </article>`).join("")}</div>`;
}
function renderDefinitions(definiciones){
  if(!definiciones.length) return `<div class="workspace-empty">Sin definiciones cargadas.</div>`;
  return `<div class="data-table-wrap"><table>
    <thead><tr><th>Término</th><th>Fuente</th><th>Uso</th><th>Estado</th></tr></thead>
    <tbody>${definiciones.map(d => `<tr><td><strong>${esc(d.termino)}</strong></td><td>${esc(d.fuente)}</td><td>${esc(d.uso)}</td><td>${badge(d.estado || "")}</td></tr>`).join("")}</tbody>
  </table></div>`;
}
export async function render(host, state){
  host.innerHTML = `<section class="module-window real-workspace"><p>Cargando NORMA-CHILE...</p></section>`;
  const [catalogo, ds8, reglasV11, ric18Rules, ric18Docs, definiciones, coberturaData, relacionesBase, relacionesV12] = await Promise.all([
    loadJSON("data/norma-chile/catalogo-normativo.json", { documentos: [] }),
    loadJSON("data/norma-chile/reglas/ds8/reglas-ds8-base.json", { reglas: [] }),
    loadJSON("data/norma-chile/reglas/ric/reglas-norma-chile-v11.json", []),
    loadJSON("data/norma-chile/reglas/ric/reglas-ric18-v13.json", []),
    loadJSON("data/norma-chile/tablas/documentos-ric18-v13.json", { documentos_requeridos: [] }),
    loadJSON("data/norma-chile/definiciones/diccionario-normativo-v11.json", []),
    loadJSON("data/norma-chile/tablas/cobertura-normativa-v12.json", { documentos: [] }),
    loadJSON("data/norma-chile/relaciones/motores-reglas.json", { motores: {} }),
    loadJSON("data/norma-chile/relaciones/ds8-ric-motores-v12.json", { relaciones: [] })
  ]);
  const reglas = [...(ds8.reglas || []).map(normalizeBaseRule), ...(Array.isArray(reglasV11) ? reglasV11 : []), ...(Array.isArray(ric18Rules) ? ric18Rules : [])];
  const documentos = coberturaData.documentos || [];
  const relaciones = relacionesV12.relaciones || [];
  const motores = [...new Set(documentos.flatMap(d => d.motores || []))].filter(Boolean).sort();
  const origenes = [...new Set(reglas.map(r => r.origen).filter(Boolean))].sort();
  const diag = {
    fecha: new Date().toISOString(),
    version: "1.3.0",
    documentos_catalogados: catalogo.documentos?.length || 0,
    documentos_cobertura: documentos.length,
    reglas_estructuradas: reglas.length,
    reglas_por_cobertura: documentos.reduce((acc,d)=>acc + (Number(d.reglas_estructuradas)||0),0),
    documentos_pendientes: documentos.filter(d => String(d.estado).includes("pendiente")).length,
    definiciones: definiciones.length,
    motores_relacionados: motores.length,
    estado: "integrado_en_administracion"
  };

  host.innerHTML = `<section class="module-window real-workspace normative-workspace">
    <div class="workspace-title-row">
      <div>
        <p class="eyebrow">Administrador · Motor Normativo Chile</p>
        <h3>NORMA-CHILE v1.3 · RIC 18 Presentación de Proyectos</h3>
        <p>Panel integrado para controlar DS N°8, RIC 1 al 19, cobertura y reglas RIC 18 para presentación de proyectos.</p>
      </div>
      <div class="status-strip"><span>DS N°8</span><span>RIC 1–19</span><span>v1.3</span></div>
    </div>

    <section class="admin-kpis compact-kpis">
      <div><strong>${diag.documentos_catalogados}</strong><span>Documentos catalogados</span></div>
      <div><strong>${diag.reglas_estructuradas}</strong><span>Reglas estructuradas</span></div>
      <div><strong>${Array.isArray(ric18Rules) ? ric18Rules.length : 0}</strong><span>Reglas RIC 18</span></div>
      <div><strong>${diag.documentos_pendientes}</strong><span>RIC pendientes</span></div>
      <div><strong>${diag.motores_relacionados}</strong><span>Motores relacionados</span></div>
    </section>

    <section class="admin-card">
      <h4>Diagnóstico Normativo</h4>
      <p>La cobertura muestra qué documentos tienen reglas iniciales y cuáles están pendientes de extracción técnica. Esto evita que GIAE emita recomendaciones sin respaldo implementado.</p>
      <div class="module-toolbar"><button id="downloadNormaBtn" class="secondary">Descargar diagnóstico normativo</button></div>
    </section>



    <section class="admin-card">
      <h4>RIC 18 · Validador documental inicial</h4>
      <p>Estas reglas revisan la base documental de un proyecto antes de exportar: memoria, planos, cálculos, cuadro de carga, puesta a tierra, informe de imágenes y responsable técnico.</p>
      <div class="grid three">
        <label>Potencia declarada kW<input id="ric18Kw" type="number" min="0" step="0.1" value="12"></label>
        <label>Tipo de proyecto<select id="ric18Tipo"><option value="normal">Normal</option><option value="edificio">Edificio o conjunto habitacional</option><option value="reunion">Lugar de reunión de personas</option><option value="explosivo">Ambiente explosivo</option><option value="mt">Empalme media tensión</option></select></label>
        <label>Documentos disponibles<select id="ric18DocsMode"><option value="basico">Básico</option><option value="completo">Completo</option><option value="incompleto">Incompleto</option></select></label>
      </div>
      <div class="module-toolbar"><button id="runRic18Validator" class="primary">Validar RIC 18</button><button id="downloadRic18Rules" class="secondary">Descargar reglas RIC 18</button></div>
      <div id="ric18Result"></div>
      <h5>Documentos requeridos por RIC 18</h5>
      <div class="data-table-wrap"><table>
        <thead><tr><th>Documento</th><th>Estado</th><th>Referencia</th></tr></thead>
        <tbody>${(ric18Docs.documentos_requeridos || []).map(d => `<tr><td>${esc(d.nombre)}</td><td>${badge(d.estado)}</td><td>${esc(d.referencia)}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>

    <section class="admin-card">
      <h4>Panel de Cobertura RIC 1–19</h4>
      <div class="grid three">
        <label>Buscar documento<input id="coverageQ" placeholder="RIC10, tableros, emergencia, motor..."></label>
        <label>Estado<select id="coverageEstado"><option value="">Todos</option><option value="pendiente">Pendiente</option><option value="base">Base</option><option value="parcial">Parcial</option><option value="avanzado">Avanzado</option></select></label>
        <label>Motor<select id="coverageMotor"><option value="">Todos los motores</option>${motores.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("")}</select></label>
      </div>
      <div id="coverageTable"></div>
    </section>

    <section class="admin-card">
      <h4>Relaciones DS8 → RIC → Motores GIAE</h4>
      <div id="relationsPanel"></div>
    </section>

    <section class="admin-card">
      <h4>Biblioteca de Reglas</h4>
      <div class="grid three">
        <label>Buscar<input id="normaQ" placeholder="ID, RIC, categoría, motor, referencia..."></label>
        <label>Origen<select id="normaOrigen"><option value="">Todos los orígenes</option>${origenes.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join("")}</select></label>
        <label>Motor<select id="normaMotor"><option value="">Todos los motores</option>${[...new Set(reglas.flatMap(r=>r.motores||[]))].sort().map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("")}</select></label>
      </div>
      <div id="normaRules"></div>
    </section>

    <section class="admin-card">
      <h4>Biblioteca de Definiciones</h4>
      <div id="normaDefinitions"></div>
    </section>
  </section>`;

  const coverageTable = host.querySelector("#coverageTable");
  const coverageQ = host.querySelector("#coverageQ");
  const coverageEstado = host.querySelector("#coverageEstado");
  const coverageMotor = host.querySelector("#coverageMotor");
  function applyCoverage(){
    const text = coverageQ.value.toLowerCase();
    const estado = coverageEstado.value;
    const motor = coverageMotor.value;
    const list = documentos.filter(d => {
      const hay = JSON.stringify(d).toLowerCase();
      return (!text || hay.includes(text)) && (!estado || String(d.estado).toLowerCase().includes(estado)) && (!motor || (d.motores || []).includes(motor));
    });
    coverageTable.innerHTML = renderCoverageTable(list);
  }
  [coverageQ, coverageEstado, coverageMotor].forEach(el => el.addEventListener(el.tagName === "INPUT" ? "input" : "change", applyCoverage));
  applyCoverage();

  host.querySelector("#relationsPanel").innerHTML = renderRelations(relaciones);
  host.querySelector("#normaDefinitions").innerHTML = renderDefinitions(definiciones);

  const rulesNode = host.querySelector("#normaRules");
  const q = host.querySelector("#normaQ");
  const origen = host.querySelector("#normaOrigen");
  const motor = host.querySelector("#normaMotor");
  function applyRules(){
    const text = q.value.toLowerCase();
    const org = origen.value;
    const mot = motor.value;
    const list = reglas.filter(r => {
      const hay = JSON.stringify(r).toLowerCase();
      return (!text || hay.includes(text)) && (!org || r.origen === org) && (!mot || (r.motores || []).includes(mot));
    });
    rulesNode.innerHTML = renderRulesTable(list);
  }
  [q, origen, motor].forEach(el => el.addEventListener(el.tagName === "INPUT" ? "input" : "change", applyRules));
  applyRules();


  const ric18Result = host.querySelector("#ric18Result");
  function renderRic18Validation(){
    const kw = Number(host.querySelector("#ric18Kw")?.value || 0);
    const tipo = host.querySelector("#ric18Tipo")?.value || "normal";
    const mode = host.querySelector("#ric18DocsMode")?.value || "basico";
    const memoriaObligatoria = kw > 10 || ["edificio", "reunion", "explosivo", "mt"].includes(tipo);
    const checks = [
      { id:"memoria", nombre:"Memoria explicativa", ok: !memoriaObligatoria || mode === "completo", severidad: memoriaObligatoria ? "critica" : "info", regla:"CHL-RIC18-MEM-001" },
      { id:"planos", nombre:"Planos", ok: mode !== "incompleto", severidad:"critica", regla:"CHL-RIC18-DOC-001" },
      { id:"cuadro", nombre:"Cuadro de cargas", ok: mode !== "incompleto", severidad:"critica", regla:"CHL-RIC18-CARG-001" },
      { id:"alimentadores", nombre:"Resumen alimentadores/subalimentadores", ok: mode === "completo", severidad:"critica", regla:"CHL-RIC18-ALI-001" },
      { id:"imagenes", nombre:"Informe de imágenes", ok: !memoriaObligatoria || mode === "completo", severidad:"advertencia", regla:"CHL-RIC18-IMG-001" },
      { id:"tierra", nombre:"Datos de puesta a tierra", ok: mode === "completo", severidad:"critica", regla:"CHL-RIC18-TIE-001" }
    ];
    const pendientes = checks.filter(c=>!c.ok);
    ric18Result.innerHTML = `<div class="data-table-wrap"><table>
      <thead><tr><th>Validación</th><th>Estado</th><th>Regla</th><th>Severidad</th></tr></thead>
      <tbody>${checks.map(c=>`<tr><td>${esc(c.nombre)}</td><td>${c.ok ? badge("Cumple","ok") : badge("Pendiente","warning")}</td><td><code>${esc(c.regla)}</code></td><td>${badge(c.severidad)}</td></tr>`).join("")}</tbody>
    </table></div><p><strong>Resultado:</strong> ${pendientes.length ? `${pendientes.length} observación(es) RIC 18 antes de exportar.` : "Proyecto documentalmente completo para esta validación base."}</p>`;
  }
  host.querySelector("#runRic18Validator")?.addEventListener("click", renderRic18Validation);
  host.querySelector("#downloadRic18Rules")?.addEventListener("click", () => downloadJson("reglas-ric18-v1-3.json", ric18Rules));
  renderRic18Validation();

  host.querySelector("#downloadNormaBtn").addEventListener("click", () => {
    downloadJson("diagnostico-norma-chile-v1-3.json", {
      ...diag,
      documentos,
      relaciones,
      nota: "NORMA-CHILE v1.3 integrado en Administración con reglas RIC 18. No reemplaza la aplicación principal."
    });
  });
}

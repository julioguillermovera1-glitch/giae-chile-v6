import { persist, addHistory } from "../../core/store.js";
import { buildCadFromProject, normalizeCadDocument, createCadEntity, addCadEntity, removeCadEntity, validateCadDocument, summarizeCadDocument, createCadExportPackage, createCadExportDxf, parseCadDxf, importCadSymbols, CAD_LAYERS, CAD_SYMBOLS } from "../../core/cad/cadEngine.js";

function esc(value = ""){
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function n(value, fallback = 0){ const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function statusClass(status){ if(status === "listo_para_revision") return "ok"; if(status === "incompleto") return "warn"; return "danger"; }
function layerColor(id){ return (CAD_LAYERS.find(layer => layer.id === id)?.color) || "#334155"; }
function symbolLabel(id, symbols = CAD_SYMBOLS){ return (symbols.find(symbol => symbol.id === id)?.label) || id; }
function safeFileName(name){ return (name || "plano-giae").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "plano-giae"; }
function parseScale(scale = "1:50"){ const parts = String(scale).split(":").map(part => Number(part.trim())); return parts.length === 2 && parts[0] > 0 && parts[1] > 0 ? parts[0] / parts[1] : 1 / 50; }
function formatDistance(length = 0, units = "mm"){ const distance = Number(length) || 0; if(units === "cm") return `${(distance / 10).toFixed(1)} cm`; if(units === "m") return `${(distance / 1000).toFixed(2)} m`; return `${Math.round(distance)} mm`; }
function safeJsonParse(value){ try { return JSON.parse(value); } catch { return null; } }
function ensureCad(project){
  project.cad2d = normalizeCadDocument(project.cad2d || buildCadFromProject(project), project);
  project.cad2d.validation = validateCadDocument(project.cad2d);
  return project.cad2d;
}
function downloadText(fileName, text, type = "application/json;charset=utf-8"){
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
function svgPoint(event, svg){
  const rect = svg.getBoundingClientRect();
  const view = svg.viewBox.baseVal;
  return {
    x: Math.round((event.clientX - rect.left) * view.width / rect.width),
    y: Math.round((event.clientY - rect.top) * view.height / rect.height)
  };
}
function snap(value, grid){ return Math.round(value / grid) * grid; }
function renderLayerToggles(doc){
  const used = new Set(doc.entities.map(entity => entity.layer));
  return CAD_LAYERS.map(layer => `<label class="cad-layer-toggle"><input type="checkbox" data-cad-layer="${esc(layer.id)}" ${layer.hidden ? "" : "checked"}><span style="--layer:${esc(layer.color)}"></span>${esc(layer.label)}<small>${used.has(layer.id) ? "en uso" : "vacia"}</small></label>`).join("");
}
function renderToolOptions(activeTool, docSymbols = []){
  const tools = [
    ["select", "Seleccionar"],
    ["wire", "Cablear"],
    ["dimension", "Dimension"],
    ["panel", "Tablero"],
    ["breaker", "Proteccion"],
    ["light", "Luz"],
    ["switch", "Interruptor"],
    ["outlet", "Enchufe"],
    ["motor", "Fuerza"],
    ["junction", "Derivacion"],
    ["ground", "Tierra"],
    ["note", "Nota"]
  ];
  const defaultIds = new Set(tools.map(([id]) => id));
  const customTools = Array.isArray(docSymbols) ? docSymbols.filter(symbol => !defaultIds.has(symbol.id)).map(symbol => [symbol.id, symbol.label || symbol.id]) : [];
  return tools.concat(customTools).map(([id, label]) => `<button type="button" class="cad-tool ${activeTool === id ? "active" : ""}" data-cad-tool="${id}">${label}</button>`).join("");
}
function renderSymbol(entity, symbols = CAD_SYMBOLS){
  const color = layerColor(entity.layer);
  const x = n(entity.x), y = n(entity.y);
  const label = esc(entity.label || symbolLabel(entity.symbolId, symbols));
  const base = `data-entity-id="${esc(entity.id)}" class="cad-entity cad-symbol"`;
  if(entity.symbolId === "panel") return `<g ${base} transform="translate(${x} ${y})"><rect x="-34" y="-42" width="68" height="84" rx="4" fill="#fff" stroke="${color}" stroke-width="3"/><line x1="-22" y1="-20" x2="22" y2="-20" stroke="${color}" stroke-width="2"/><line x1="-22" y1="0" x2="22" y2="0" stroke="${color}" stroke-width="2"/><line x1="-22" y1="20" x2="22" y2="20" stroke="${color}" stroke-width="2"/><text y="58" text-anchor="middle" font-size="13" font-weight="800">${label}</text></g>`;
  if(entity.symbolId === "breaker") return `<g ${base} transform="translate(${x} ${y})"><rect x="-22" y="-32" width="44" height="64" rx="3" fill="#fff" stroke="${color}" stroke-width="2.5"/><path d="M -10 8 C -2 -18 8 -18 14 -30" fill="none" stroke="${color}" stroke-width="2.5"/><text y="50" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
  if(entity.symbolId === "light") return `<g ${base} transform="translate(${x} ${y})"><circle r="25" fill="#fff" stroke="${color}" stroke-width="3"/><line x1="-17" y1="-17" x2="17" y2="17" stroke="${color}" stroke-width="2"/><line x1="17" y1="-17" x2="-17" y2="17" stroke="${color}" stroke-width="2"/><text y="46" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
  if(entity.symbolId === "switch") return `<g ${base} transform="translate(${x} ${y})"><circle r="18" fill="#fff" stroke="${color}" stroke-width="3"/><line x1="-7" y1="6" x2="16" y2="-15" stroke="${color}" stroke-width="3"/><text y="40" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
  if(entity.symbolId === "outlet") return `<g ${base} transform="translate(${x} ${y})"><circle r="24" fill="#fff" stroke="${color}" stroke-width="3"/><circle cx="-8" cy="0" r="3" fill="${color}"/><circle cx="8" cy="0" r="3" fill="${color}"/><path d="M -10 10 Q 0 17 10 10" fill="none" stroke="${color}" stroke-width="2"/><text y="45" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
  if(entity.symbolId === "motor") return `<g ${base} transform="translate(${x} ${y})"><circle r="27" fill="#fff" stroke="${color}" stroke-width="3"/><text y="7" text-anchor="middle" font-size="22" font-weight="900" fill="${color}">M</text><text y="50" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
  if(entity.symbolId === "junction") return `<g ${base} transform="translate(${x} ${y})"><rect x="-20" y="-20" width="40" height="40" rx="4" fill="#fff" stroke="${color}" stroke-width="3"/><circle r="5" fill="${color}"/><text y="42" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
  if(entity.symbolId === "ground") return `<g ${base} transform="translate(${x} ${y})"><line x1="0" y1="-28" x2="0" y2="0" stroke="${color}" stroke-width="3"/><line x1="-24" y1="0" x2="24" y2="0" stroke="${color}" stroke-width="3"/><line x1="-16" y1="10" x2="16" y2="10" stroke="${color}" stroke-width="3"/><line x1="-8" y1="20" x2="8" y2="20" stroke="${color}" stroke-width="3"/><text y="46" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
  return `<g ${base} transform="translate(${x} ${y})"><rect x="-70" y="-22" width="140" height="44" rx="4" fill="#fff" stroke="${color}" stroke-width="2"/><text y="5" text-anchor="middle" font-size="12" font-weight="800">${label}</text></g>`;
}
function renderWire(entity){
  const color = layerColor(entity.layer);
  const from = entity.from || { x: entity.x, y: entity.y };
  const to = entity.to || { x: entity.x + 120, y: entity.y };
  const mx = Math.round((from.x + to.x) / 2);
  const my = Math.round((from.y + to.y) / 2) - 7;
  return `<g data-entity-id="${esc(entity.id)}" class="cad-entity cad-wire"><line x1="${n(from.x)}" y1="${n(from.y)}" x2="${n(to.x)}" y2="${n(to.y)}" stroke="${color}" stroke-width="4" stroke-linecap="round"/><text x="${mx}" y="${my}" text-anchor="middle" font-size="11" font-weight="800" fill="${color}">${esc(entity.label)}</text></g>`;
}
function renderLegend(doc){
  if(!doc.legend?.visible) return "";
  const x = n(doc.legend.x, 930), y = n(doc.legend.y, 560);
  const rows = CAD_LAYERS.map((layer, index) => `<g transform="translate(${x + 14} ${y + 42 + index * 20})"><rect width="12" height="12" fill="${esc(layer.color)}"/><text x="20" y="10" font-size="11" font-weight="700">${esc(layer.label)}</text></g>`).join("");
  return `<g class="cad-legend"><rect x="${x}" y="${y}" width="230" height="238" rx="5" fill="#fff" stroke="#94a3b8"/><text x="${x + 14}" y="${y + 24}" font-size="13" font-weight="900">Leyenda GIAE CAD</text>${rows}</g>`;
}
function renderCadSvg(doc, selectedId = ""){
  const hidden = new Set(doc.layers.filter(layer => layer.hidden).map(layer => layer.id));
  const grid = n(doc.canvas.grid, 20);
  const width = n(doc.canvas.width, 1200), height = n(doc.canvas.height, 760);
  const gridLines = [];
  for(let x = 0; x <= width; x += grid) gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`);
  for(let y = 0; y <= height; y += grid) gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`);
  const wires = doc.entities.filter(entity => entity.type === "wire" && !hidden.has(entity.layer)).map(renderWire).join("");
  const symbols = doc.entities.filter(entity => entity.type !== "wire" && !hidden.has(entity.layer)).map(entity => renderSymbol(entity, doc.symbols)).join("");
  const selected = selectedId ? doc.entities.find(entity => entity.id === selectedId) : null;
  const selectBox = selected && selected.type !== "wire" ? `<rect class="cad-selected-box" x="${n(selected.x)-44}" y="${n(selected.y)-52}" width="88" height="104" rx="4"/>` : "";
  return `<svg id="cadCanvas" class="cad-canvas" viewBox="0 0 ${width} ${height}" role="img" aria-label="Plano CAD electrico GIAE"><defs><pattern id="cadGrid" width="${grid}" height="${grid}" patternUnits="userSpaceOnUse"><path d="M ${grid} 0 L 0 0 0 ${grid}" fill="none" stroke="#e2e8f0" stroke-width="1"/></pattern></defs><rect width="${width}" height="${height}" fill="#ffffff"/><rect width="${width}" height="${height}" fill="url(#cadGrid)"/><g class="cad-border"><rect x="24" y="24" width="${width-48}" height="${height-48}" fill="none" stroke="#94a3b8" stroke-dasharray="8 6"/></g>${wires}${symbols}${selectBox}${renderLegend(doc)}</svg>`;
}
function renderValidation(validation){
  const issues = validation.issues || [];
  if(!issues.length) return `<div class="result-box ok"><b>Plano listo para revision.</b><br>Sin bloqueos principales detectados.</div>`;
  return `<div class="notice-list">${issues.map(issue => `<article class="notice-line ${esc(issue.level)}"><strong>${esc(issue.area)}:</strong> ${esc(issue.message)}<br><span>${esc(issue.action)}</span></article>`).join("")}</div>`;
}
function renderEntities(doc, selectedId){
  if(!doc.entities.length) return `<div class="workspace-empty">El plano aun no tiene entidades.</div>`;
  return doc.entities.slice(0, 80).map(entity => `<button type="button" class="cad-entity-row ${entity.id === selectedId ? "active" : ""}" data-select-entity="${esc(entity.id)}"><span style="--layer:${esc(layerColor(entity.layer))}"></span><b>${esc(entity.label)}</b><small>${esc(entity.type)} - ${esc(entity.layer)}</small></button>`).join("");
}

export function render(host, state){
  const project = state.currentProject;
  let doc = ensureCad(project);
  const ui = project.cadUi || { tool: "select", layer: "enchufes", selectedId: "", wireStart: null };
  project.cadUi = ui;
  const validation = validateCadDocument(doc);
  doc.validation = validation;
  const summary = summarizeCadDocument(doc);
  host.innerHTML = `
    <section class="module-window cad-module">
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Fase 5 - CAD electrico GIAE 2.0</p>
          <h3>CAD Electrico</h3>
          <p>Editor 2D propio para planos electricos: capas, simbolos, circuitos, canalizaciones, tierra, leyenda y validacion preliminar.</p>
        </div>
        <div class="project-state-card ${statusClass(validation.status)}">
          <small>Estado plano</small>
          <strong>${validation.score}%</strong>
          <span>${esc(validation.status)}</span>
        </div>
      </div>

      <section class="admin-kpis compact-kpis cad-kpis">
        <div><strong>${summary.entities}</strong><span>Entidades</span></div>
        <div><strong>${summary.circuits}</strong><span>Circuitos</span></div>
        <div><strong>${Object.keys(summary.byLayer).length}</strong><span>Capas usadas</span></div>
        <div><strong>${validation.summary.issues}</strong><span>Observaciones</span></div>
      </section>

      <section class="cad-workspace">
        <aside class="cad-sidebar">
          <article class="admin-card">
            <h4>Herramientas</h4>
            <div class="cad-tools">${renderToolOptions(ui.tool)}</div>
            <label>Capa activa<select id="cadLayerSelect">${CAD_LAYERS.map(layer => `<option value="${layer.id}" ${ui.layer === layer.id ? "selected" : ""}>${esc(layer.label)}</option>`).join("")}</select></label>
            <label>Texto / nombre<input id="cadLabelInput" value="${esc(ui.label || "")}" placeholder="Nombre del simbolo o nota"></label>
            <label>Circuito<input id="cadCircuitInput" value="${esc(ui.circuitId || "")}" placeholder="Ej: C01"></label>
            <div class="row-actions"><button id="cadGenerateProject">Generar desde proyecto</button><button id="cadValidate" class="secondary">Validar</button></div>
          </article>

          <article class="admin-card">
            <h4>Configuracion</h4>
            <label>Escala<input id="cadScaleInput" value="${esc(doc.scale)}" placeholder="1:50"></label>
            <label>Unidades<select id="cadUnitsSelect"><option value="mm" ${doc.units === "mm" ? "selected" : ""}>mm</option><option value="cm" ${doc.units === "cm" ? "selected" : ""}>cm</option><option value="m" ${doc.units === "m" ? "selected" : ""}>m</option></select></label>
          </article>

          <article class="admin-card">
            <h4>Importar / Exportar</h4>
            <div class="row-actions"><button id="cadExportJson" class="secondary">Exportar .giaecad</button><button id="cadExportDxf" class="secondary">Exportar DXF</button></div>
            <div class="row-actions"><button id="cadImportDxf" class="secondary">Importar DXF</button><button id="cadImportSymbols" class="secondary">Cargar símbolos</button></div>
            <input id="cadImportDxfFile" type="file" accept=".dxf,text/plain" hidden>
            <input id="cadImportSymbolsFile" type="file" accept=".json,application/json" hidden>
          </article>

          <article class="admin-card">
            <h4>Capas</h4>
            <div class="cad-layer-list">${renderLayerToggles(doc)}</div>
          </article>

          <article class="admin-card">
            <h4>Entidades</h4>
            <div class="cad-entity-list">${renderEntities(doc, ui.selectedId)}</div>
            <div class="row-actions"><button id="cadDeleteSelected" class="ghost danger-text">Eliminar seleccionado</button></div>
          </article>
        </aside>

        <main class="cad-main">
          <div class="cad-topbar">
            <div><b>${esc(doc.name)}</b><span>${esc(doc.scale)} - ${esc(doc.units)} - ${esc(project.name || "Proyecto sin nombre")}</span></div>
            <div class="row-actions"><button id="cadExportJson" class="secondary">Exportar .giaecad</button><button id="cadExportSvg" class="secondary">Exportar SVG</button><button id="cadClear" class="ghost danger-text">Reiniciar plano</button></div>
          </div>
          <div class="cad-stage">${renderCadSvg(doc, ui.selectedId)}</div>
          <div class="policy-box"><b>Uso:</b> selecciona una herramienta y haz clic en el plano. En modo Cablear, dos clics crean una canalizacion. El plano es fuente de datos preliminar y requiere revision profesional.</div>
          <article class="admin-card"><h4>Validacion CAD</h4>${renderValidation(validation)}</article>
        </main>
      </section>
    </section>`;

  function saveAndRefresh(action = "Plano CAD actualizado"){
    doc.validation = validateCadDocument(doc);
    project.cad2d = doc;
    addHistory(action, "CAD electrico", false);
    persist();
    render(host, state);
  }

  host.querySelectorAll("[data-cad-tool]").forEach(button => button.addEventListener("click", () => { ui.tool = button.dataset.cadTool; ui.wireStart = null; project.cadUi = ui; render(host, state); }));
  host.querySelector("#cadScaleInput").addEventListener("change", event => {
    doc.scale = event.target.value.trim() || "1:50";
    project.cad2d = doc;
    persist();
    render(host, state);
  });
  host.querySelector("#cadUnitsSelect").addEventListener("change", event => {
    doc.units = event.target.value;
    project.cad2d = doc;
    persist();
    render(host, state);
  });
  host.querySelector("#cadExportDxf").addEventListener("click", () => downloadText(safeFileName(doc.name) + ".dxf", createCadExportDxf(project, doc), "application/dxf;charset=utf-8"));
  host.querySelector("#cadImportDxf").addEventListener("click", () => host.querySelector("#cadImportDxfFile").click());
  host.querySelector("#cadImportSymbols").addEventListener("click", () => host.querySelector("#cadImportSymbolsFile").click());
  host.querySelector("#cadImportDxfFile").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if(!file) return;
    const text = await file.text();
    const imported = parseCadDxf(text, project);
    doc.entities = doc.entities.concat(imported.entities);
    doc.validation = validateCadDocument(doc);
    project.cad2d = doc;
    addHistory(`Plano CAD importado desde ${file.name}`, "CAD electrico", false);
    persist();
    render(host, state);
  });
  host.querySelector("#cadImportSymbolsFile").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if(!file) return;
    const text = await file.text();
    const definitions = safeJsonParse(text) || [];
    doc = importCadSymbols(doc, definitions);
    project.cad2d = doc;
    addHistory(`Simbolos CAD cargados desde ${file.name}`, "CAD electrico", false);
    persist();
    render(host, state);
  });
  host.querySelector("#cadLayerSelect").addEventListener("change", event => { ui.layer = event.target.value; project.cadUi = ui; render(host, state); });
  host.querySelectorAll("[data-cad-layer]").forEach(input => input.addEventListener("change", () => {
    const layer = doc.layers.find(item => item.id === input.dataset.cadLayer);
    if(layer) layer.hidden = !input.checked;
    project.cad2d = doc;
    persist();
    render(host, state);
  }));
  host.querySelector("#cadCanvas").addEventListener("click", event => {
    const entityGroup = event.target.closest("[data-entity-id]");
    if(entityGroup && ui.tool === "select"){
      ui.selectedId = entityGroup.dataset.entityId;
      project.cadUi = ui;
      render(host, state);
      return;
    }
    const point = svgPoint(event, host.querySelector("#cadCanvas"));
    const grid = doc.canvas.grid || 20;
    const x = snap(point.x, grid), y = snap(point.y, grid);
    const label = host.querySelector("#cadLabelInput").value.trim();
    const circuitId = host.querySelector("#cadCircuitInput").value.trim();
    ui.label = label;
    ui.circuitId = circuitId;
    if(ui.tool === "select") return;
    if(ui.tool === "wire" || ui.tool === "dimension"){
      if(!ui.wireStart){ ui.wireStart = { x, y }; project.cadUi = ui; render(host, state); return; }
      const dx = x - ui.wireStart.x;
      const dy = y - ui.wireStart.y;
      const length = Math.hypot(dx, dy);
      const actualLength = length * parseScale(doc.scale);
      const dimensionLabel = ui.tool === "dimension" ? formatDistance(actualLength, doc.units) : (circuitId || "Canalizacion");
      doc = addCadEntity(doc, createCadEntity("wire", { layer: ui.tool === "dimension" ? "revision" : "canalizacion", from: ui.wireStart, to: { x, y }, label: dimensionLabel, circuitId, source: "manual" }));
      ui.wireStart = null;
      saveAndRefresh(ui.tool === "dimension" ? "Dimension agregada en CAD" : "Canalizacion agregada en CAD");
      return;
    }
    const symbol = doc.symbols.find(item => item.id === ui.tool) || CAD_SYMBOLS.find(item => item.id === ui.tool);
    const layer = ui.layer || symbol?.layer || "notas";
    doc = addCadEntity(doc, createCadEntity(ui.tool, { x, y, layer, label: label || symbolLabel(ui.tool, doc.symbols), circuitId, source: "manual" }));
    saveAndRefresh("Entidad CAD agregada: " + symbolLabel(ui.tool, doc.symbols));
  });
  host.querySelectorAll("[data-select-entity]").forEach(button => button.addEventListener("click", () => { ui.selectedId = button.dataset.selectEntity; project.cadUi = ui; render(host, state); }));
  host.querySelector("#cadDeleteSelected").addEventListener("click", () => {
    if(!ui.selectedId) return alert("Selecciona una entidad primero.");
    doc = removeCadEntity(doc, ui.selectedId);
    ui.selectedId = "";
    saveAndRefresh("Entidad CAD eliminada");
  });
  host.querySelector("#cadGenerateProject").addEventListener("click", () => {
    if(!confirm("Regenerar el plano desde el Proyecto Activo? Esto reemplaza el plano CAD actual.")) return;
    project.cad2d = buildCadFromProject(project);
    project.cadUi = { tool: "select", layer: "enchufes", selectedId: "", wireStart: null };
    addHistory("Plano CAD regenerado desde Proyecto Activo", "CAD electrico", false);
    persist();
    render(host, state);
  });
  host.querySelector("#cadValidate").addEventListener("click", () => saveAndRefresh("Plano CAD validado"));
  host.querySelector("#cadExportJson").addEventListener("click", () => downloadText(safeFileName(doc.name) + ".giaecad", JSON.stringify(createCadExportPackage(project, doc), null, 2)));
  host.querySelector("#cadExportSvg").addEventListener("click", () => downloadText(safeFileName(doc.name) + ".svg", host.querySelector("#cadCanvas").outerHTML, "image/svg+xml;charset=utf-8"));
  host.querySelector("#cadClear").addEventListener("click", () => {
    if(!confirm("Reiniciar el plano CAD actual?")) return;
    project.cad2d = buildCadFromProject({ ...project, loads: [] });
    project.cadUi = { tool: "select", layer: "enchufes", selectedId: "", wireStart: null };
    addHistory("Plano CAD reiniciado", "CAD electrico", false);
    persist();
    render(host, state);
  });
}
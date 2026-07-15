import { persist, addHistory } from "../../core/store.js";
import { CloudflareCADService } from "../../core/cad/cloudflare-service.js";
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
    ["house", "Casa"],
    ["wire", "Cablear"],
    ["dimension", "Dimension"],
    ["panel", "Tablero"],
    ["breaker", "Proteccion"],
    ["light", "Luz"],
    ["switch", "Interruptor"],
    ["outlet-simple", "Enchufe simple"],
    ["outlet-double", "Enchufe doble"],
    ["outlet-triple", "Enchufe triple"],
    ["motor", "Fuerza"],
    ["junction", "Derivacion"],
    ["ground", "Tierra"],
    ["canaleta", "Canaleta"],
    ["punto", "Punto"],
    ["medidor", "Medidor"],
    ["empalme", "Empalme"],
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
  if(entity.symbolId === "panel") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><rect x="-32" y="-40" width="64" height="80" rx="0" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-20" y1="-28" x2="20" y2="-28" stroke="${color}" stroke-width="1.5"/><line x1="-20" y1="-8" x2="20" y2="-8" stroke="${color}" stroke-width="1.5"/><line x1="-20" y1="12" x2="20" y2="12" stroke="${color}" stroke-width="1.5"/><circle cx="-26" cy="-34" r="2.5" fill="${color}"/><circle cx="26" cy="-34" r="2.5" fill="${color}"/><circle cx="-26" cy="34" r="2.5" fill="${color}"/><circle cx="26" cy="34" r="2.5" fill="${color}"/><text y="60" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">TDA</text></g>`;
  if(entity.symbolId === "breaker") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><rect x="-16" y="-20" width="32" height="40" rx="2" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-10" y1="-14" x2="10" y2="-14" stroke="${color}" stroke-width="2"/><line x1="-10" y1="-2" x2="10" y2="-2" stroke="${color}" stroke-width="2"/><line x1="-10" y1="10" x2="10" y2="10" stroke="${color}" stroke-width="2"/><text y="44" text-anchor="middle" font-size="9" font-weight="600" fill="${color}">DIF</text></g>`;
  if(entity.symbolId === "light") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><circle r="16" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-11" y1="-11" x2="11" y2="11" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="-11" x2="-11" y2="11" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="42" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">◦</text></g>`;
  if(entity.symbolId === "switch") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><circle r="16" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="0" y1="-14" x2="0" y2="2" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="0" y1="2" x2="10" y2="12" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><circle cx="0" cy="-14" r="2" fill="${color}"/><circle cx="10" cy="12" r="2" fill="${color}"/><text y="42" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">S</text></g>`;
  if(entity.symbolId === "outlet-simple") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><path d="M -18,0 A 18,18 0 0,1 18,0" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-18" y1="0" x2="18" y2="0" stroke="${color}" stroke-width="2.5"/><line x1="0" y1="-18" x2="0" y2="-28" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="42" text-anchor="middle" font-size="9" font-weight="600" fill="${color}">1</text></g>`;
  if(entity.symbolId === "outlet-double") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><path d="M -18,0 A 18,18 0 0,1 18,0" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-18" y1="0" x2="18" y2="0" stroke="${color}" stroke-width="2.5"/><line x1="-9" y1="-18" x2="-9" y2="-28" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="-18" x2="9" y2="-28" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="42" text-anchor="middle" font-size="9" font-weight="600" fill="${color}">2</text></g>`;
  if(entity.symbolId === "outlet-triple") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><path d="M -18,0 A 18,18 0 0,1 18,0" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-18" y1="0" x2="18" y2="0" stroke="${color}" stroke-width="2.5"/><line x1="-12" y1="-18" x2="-12" y2="-28" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="0" y1="-18" x2="0" y2="-28" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="-18" x2="12" y2="-28" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="42" text-anchor="middle" font-size="9" font-weight="600" fill="${color}">3</text></g>`;
  if(entity.symbolId === "motor") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><circle r="22" fill="none" stroke="${color}" stroke-width="2.5"/><circle cx="0" cy="0" r="3" fill="${color}"/><text y="8" text-anchor="middle" font-size="16" font-weight="900" fill="${color}">M</text><circle cx="-8" cy="-6" r="1.5" fill="${color}"/><circle cx="8" cy="-6" r="1.5" fill="${color}"/><text y="44" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "junction") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><circle r="7" fill="${color}"/><text y="38" text-anchor="middle" font-size="9" font-weight="600" fill="${color}">∩</text></g>`;
  if(entity.symbolId === "ground") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><line x1="0" y1="-28" x2="0" y2="-4" stroke="${color}" stroke-width="3" stroke-linecap="round"/><line x1="-20" y1="-4" x2="20" y2="-4" stroke="${color}" stroke-width="2.5"/><line x1="-14" y1="4" x2="14" y2="4" stroke="${color}" stroke-width="2"/><line x1="-8" y1="12" x2="8" y2="12" stroke="${color}" stroke-width="1.5"/><text y="40" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">GND</text></g>`;
  if(entity.symbolId === "canaleta") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><line x1="-24" y1="-6" x2="24" y2="-6" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-24" y1="6" x2="24" y2="6" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><text y="36" text-anchor="middle" font-size="8" font-weight="600" fill="${color}">C</text></g>`;
  if(entity.symbolId === "punto") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><circle r="14" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-10" y1="-10" x2="10" y2="10" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="-10" x2="-10" y2="10" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="40" text-anchor="middle" font-size="9" font-weight="600" fill="${color}">P</text></g>`;
  if(entity.symbolId === "medidor") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><rect x="-18" y="-18" width="36" height="36" rx="2" fill="none" stroke="${color}" stroke-width="2.5"/><circle cx="0" cy="-2" r="8" fill="none" stroke="${color}" stroke-width="1.5"/><line x1="0" y1="-2" x2="4" y2="-6" stroke="${color}" stroke-width="2" stroke-linecap="round"/><circle cx="-12" cy="-12" r="1.5" fill="${color}"/><circle cx="12" cy="-12" r="1.5" fill="${color}"/><circle cx="-12" cy="12" r="1.5" fill="${color}"/><circle cx="12" cy="12" r="1.5" fill="${color}"/><text y="40" text-anchor="middle" font-size="8" font-weight="600" fill="${color}">kWh</text></g>`;
  if(entity.symbolId === "empalme") return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><rect x="-18" y="-14" width="36" height="28" rx="1" fill="none" stroke="${color}" stroke-width="2.5"/><circle cx="-12" cy="-6" r="2.5" fill="${color}"/><circle cx="0" cy="-6" r="2.5" fill="${color}"/><circle cx="12" cy="-6" r="2.5" fill="${color}"/><circle cx="-12" cy="6" r="2.5" fill="${color}"/><circle cx="0" cy="6" r="2.5" fill="${color}"/><circle cx="12" cy="6" r="2.5" fill="${color}"/><text y="40" text-anchor="middle" font-size="8" font-weight="600" fill="${color}">BOX</text></g>`;
  return `<g ${base} transform="translate(${x} ${y})" filter="url(#shadowEffect)"><rect x="-70" y="-20" width="140" height="40" rx="2" fill="none" stroke="${color}" stroke-width="2"/><text y="6" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">${label}</text></g>`;
}
function renderWire(entity){
  const color = layerColor(entity.layer);
  const from = entity.from || { x: entity.x, y: entity.y };
  const to = entity.to || { x: entity.x + 120, y: entity.y };
  const mx = Math.round((from.x + to.x) / 2);
  const my = Math.round((from.y + to.y) / 2) - 7;
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.sqrt(dx*dx + dy*dy);
  const nx = dx/len, ny = dy/len;
  return `<g data-entity-id="${esc(entity.id)}" class="cad-entity cad-wire"><line x1="${n(from.x)}" y1="${n(from.y)}" x2="${n(to.x)}" y2="${n(to.y)}" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#shadowEffect)"/><circle cx="${n(from.x)}" cy="${n(from.y)}" r="2.5" fill="${color}"/><circle cx="${n(to.x)}" cy="${n(to.y)}" r="2.5" fill="${color}"/><text x="${mx}" y="${my}" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">${esc(entity.label)}</text></g>`;
}
function renderHouse(entity){
  const color = layerColor(entity.layer);
  const x = n(entity.x), y = n(entity.y);
  const w = n(entity.width, 400), h = n(entity.height, 300);
  const label = esc(entity.label || "Casa");
  return `<g data-entity-id="${esc(entity.id)}" class="cad-entity cad-house" filter="url(#shadowEffect)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="10 6" opacity="0.85"/><text x="${x + w/2}" y="${y - 15}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}" opacity="0.9">${label}</text></g>`;
}
function renderLegend(doc){
  if(!doc.legend?.visible) return "";
  const x = n(doc.legend.x, 930), y = n(doc.legend.y, 560);
  const rows = CAD_LAYERS.map((layer, index) => `<g transform="translate(${x + 14} ${y + 42 + index * 20})"><rect width="12" height="12" fill="${esc(layer.color)}"/><text x="20" y="10" font-size="11" font-weight="700">${esc(layer.label)}</text></g>`).join("");
  return `<g class="cad-legend"><rect x="${x}" y="${y}" width="230" height="238" rx="5" fill="#fff" stroke="#94a3b8"/><text x="${x + 14}" y="${y + 24}" font-size="13" font-weight="900">Leyenda GIAE CAD</text>${rows}</g>`;
}
function renderCadSvg(doc, selectedId = ""){
  const hidden = new Set(doc.layers.filter(layer => layer.hidden).map(layer => layer.id));
  const grid = n(doc.canvas.grid, 40);
  const width = n(doc.canvas.width, 1200), height = n(doc.canvas.height, 760);
  const smallGrid = grid / 4;
  const gridLines = [];
  for(let x = 0; x <= width; x += grid) gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#404a54" stroke-width="1.5" opacity="0.8"/>`);
  for(let y = 0; y <= height; y += grid) gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#404a54" stroke-width="1.5" opacity="0.8"/>`);
  for(let x = 0; x <= width; x += smallGrid) gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#3a3f48" stroke-width="0.5" opacity="0.4"/>`);
  for(let y = 0; y <= height; y += smallGrid) gridLines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#3a3f48" stroke-width="0.5" opacity="0.4"/>`);
  const houses = doc.entities.filter(entity => entity.type === "house" && !hidden.has(entity.layer)).map(renderHouse).join("");
  const wires = doc.entities.filter(entity => entity.type === "wire" && !hidden.has(entity.layer)).map(renderWire).join("");
  const symbols = doc.entities.filter(entity => entity.type !== "wire" && entity.type !== "house" && !hidden.has(entity.layer)).map(entity => renderSymbol(entity, doc.symbols)).join("");
  const selected = selectedId ? doc.entities.find(entity => entity.id === selectedId) : null;
  const selectBox = selected && selected.type !== "wire" ? `<rect class="cad-selected-box" x="${n(selected.x)-46}" y="${n(selected.y)-54}" width="92" height="108" rx="3"/>` : "";
  return `<svg id="cadCanvas" class="cad-canvas" viewBox="0 0 ${width} ${height}" role="img" aria-label="Plano CAD electrico GIAE"><defs><filter id="shadowEffect"><feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.3"/></filter></defs><rect width="${width}" height="${height}" fill="#3a4150"/><g class="grid-major">${gridLines.join("")}</g><g class="cad-border"><rect x="24" y="24" width="${width-48}" height="${height-48}" fill="none" stroke="#515a68" stroke-width="2" stroke-dasharray="6 4" opacity="0.9"/></g>${houses}${wires}${symbols}${selectBox}${renderLegend(doc)}</svg>`;
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
            <button id="cadCreateSymbol" class="secondary" style="width:100%;margin:0.8rem 0">+ Nuevo símbolo</button>
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
            <div class="row-actions"><button id="cadExportJsonSide" class="secondary">Exportar .giaecad</button><button id="cadExportDxf" class="secondary">Exportar DXF</button></div>
            <div class="row-actions"><button id="cadImportDxf" class="secondary">Importar DXF</button><button id="cadImportSymbols" class="secondary">Cargar símbolos</button></div>
            <input id="cadImportDxfFile" type="file" accept=".dxf,text/plain" hidden>
            <input id="cadImportSymbolsFile" type="file" accept=".json,application/json" hidden>
          </article>

          <article class="admin-card">
            <h4>☁️ Cloudflare (D1 + R2)</h4>
            <div id="cadCFStatus" style="padding:0.8rem;background:#0f2532;border-radius:6px;margin-bottom:0.8rem;font-size:0.85rem;text-align:center">
              <span id="cadCFStatusText">Verificando...</span>
            </div>
            <div class="row-actions"><button id="cadSaveCF" class="secondary">💾 Guardar en Cloud</button><button id="cadLoadCF" class="secondary">📥 Cargar de Cloud</button></div>
          </article>

          <article class="admin-card">
            <h4>Capas</h4>
            <div class="cad-layer-list">${renderLayerToggles(doc)}</div>
          </article>

          <article class="admin-card">
            <h4>Entidades</h4>
            <div class="cad-entity-list">${renderEntities(doc, ui.selectedId)}</div>
            <div class="row-actions"><button id="cadDeleteSelected" class="ghost danger-text">Eliminar seleccionado</button><small class="hint" style="margin-left:12px">Atajo: Ctrl+Suprimir</small></div>
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

      <dialog id="cadCreateSymbolDialog" class="admin-dialog">
        <form method="dialog">
          <h3>Crear símbolo personalizado</h3>
          <label>Nombre del símbolo<input id="cadSymbolNameInput" type="text" placeholder="Ej: Transformador, Contacto de gas, etc." required></label>
          <div style="display:flex;gap:0.8rem;margin-top:1rem">
            <button type="button" id="cadSymbolCreateBtn" class="primary">Crear</button>
            <button type="button" onclick="this.closest('dialog').close()" class="secondary">Cancelar</button>
          </div>
        </form>
      </dialog>
    </section>`;

  function saveAndRefresh(action = "Plano CAD actualizado"){
    doc.validation = validateCadDocument(doc);
    project.cad2d = doc;
    addHistory(action, "CAD electrico", false);
    persist();
    render(host, state);
  }

  host.querySelectorAll("[data-cad-tool]").forEach(button => button.addEventListener("click", () => { ui.tool = button.dataset.cadTool; ui.wireStart = null; project.cadUi = ui; render(host, state); }));
  
  // Crear símbolo personalizado
  host.querySelector("#cadCreateSymbol")?.addEventListener("click", () => {
    host.querySelector("#cadSymbolNameInput").value = "";
    host.querySelector("#cadCreateSymbolDialog").showModal();
  });
  
  host.querySelector("#cadSymbolCreateBtn")?.addEventListener("click", () => {
    const symbolName = host.querySelector("#cadSymbolNameInput").value.trim();
    if(!symbolName) return alert("Ingresa un nombre para el símbolo");
    const symbolId = "custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    const newSymbol = { id: symbolId, label: symbolName, layer: ui.layer || "notas", kind: "custom", ports: ["in", "out"] };
    if(!doc.symbols) doc.symbols = [];
    doc.symbols.push(newSymbol);
    ui.tool = symbolId;
    project.cad2d = doc;
    project.cadUi = ui;
    addHistory(`Símbolo personalizado creado: ${symbolName}`, "CAD electrico", false);
    persist();
    host.querySelector("#cadCreateSymbolDialog").close();
    render(host, state);
  });
  
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
  host.querySelector("#cadExportJsonSide")?.addEventListener("click", () => downloadText(safeFileName(doc.name) + ".giaecad", JSON.stringify(createCadExportPackage(project, doc), null, 2)));
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
    if(ui.tool === "house"){
      if(!ui.wireStart){ ui.wireStart = { x, y }; project.cadUi = ui; render(host, state); return; }
      const x2 = x, y2 = y;
      const width = Math.abs(x2 - ui.wireStart.x);
      const height = Math.abs(y2 - ui.wireStart.y);
      const startX = Math.min(ui.wireStart.x, x2);
      const startY = Math.min(ui.wireStart.y, y2);
      doc = addCadEntity(doc, createCadEntity("house", { x: startX, y: startY, width, height, layer: ui.layer || "estructura", label: label || "Casa", source: "manual" }));
      ui.wireStart = null;
      saveAndRefresh("Casa agregada en CAD");
      return;
    }
    if(ui.tool === "wire" || ui.tool === "dimension"){
      if(!ui.wireStart){ ui.wireStart = { x, y }; project.cadUi = ui; render(host, state); return; }
      const dx = x - ui.wireStart.x;
      const dy = y - ui.wireStart.y;
      const length = Math.hypot(dx, dy);
      if(length < 40){ ui.wireStart = null; return; }
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
  
  // Estado de arrastre
  let dragging = false, draggedEntity = null, dragStart = null;
  
  // Canvas events: Seleccionar, arrastrar y borrar
  const canvas = host.querySelector("#cadCanvas");
  canvas.addEventListener("mousedown", event => {
    const entityGroup = event.target.closest("[data-entity-id]");
    if(entityGroup){
      ui.selectedId = entityGroup.dataset.entityId;
      project.cadUi = ui;
      if(ui.tool === "select"){
        dragging = true;
        draggedEntity = doc.entities.find(e => e.id === ui.selectedId);
        dragStart = svgPoint(event, canvas);
        event.preventDefault();
      }
      render(host, state);
    }
  });
  
  canvas.addEventListener("mousemove", event => {
    if(dragging && draggedEntity && dragStart){
      const current = svgPoint(event, canvas);
      const grid = doc.canvas.grid || 20;
      const dx = snap(current.x - dragStart.x, grid);
      const dy = snap(current.y - dragStart.y, grid);
      if(Math.abs(dx) > 1 || Math.abs(dy) > 1){
        draggedEntity.x += dx;
        draggedEntity.y += dy;
        dragStart = current;
        project.cad2d = doc;
        render(host, state);
      }
    }
  });
  
  canvas.addEventListener("mouseup", () => {
    if(dragging && draggedEntity){
      dragging = false;
      draggedEntity = null;
      dragStart = null;
      saveAndRefresh("Entidad movida");
    }
  });
  
  canvas.addEventListener("mouseleave", () => {
    dragging = false;
    draggedEntity = null;
    dragStart = null;
  });
  
  // Listener para Delete key - solo Delete (sin requerir Ctrl)
  const deleteHandler = (e) => {
    if(e.key === "Delete" || e.key === "Backspace"){
      e.preventDefault();
      if(ui.selectedId && host.querySelector("#cadCanvas")){
        doc = removeCadEntity(doc, ui.selectedId);
        ui.selectedId = "";
        saveAndRefresh("Entidad CAD eliminada");
      }
    }
  };
  document.addEventListener("keydown", deleteHandler);
  
  // Cleanup: remover listener cuando se desmonta el componente
  const observer = new MutationObserver(() => {
    if(!host.querySelector("#cadCanvas")){
      document.removeEventListener("keydown", deleteHandler);
      observer.disconnect();
    }
  });
  observer.observe(host.parentElement || document.body, { childList: true, subtree: true });
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

  // Keyboard support: Suprimir / Backspace borra la entidad seleccionada cuando el módulo CAD está activo.
  try{
    if(window.__giae_cad_keydown_handler) window.removeEventListener('keydown', window.__giae_cad_keydown_handler);
  }catch(e){}
  window.__giae_cad_keydown_handler = function(ev){
    // Require Ctrl/Cmd + Delete (or Backspace) to avoid accidental removals
    if(!( (ev.key === 'Delete' || ev.key === 'Backspace') && (ev.ctrlKey || ev.metaKey) )) return;
    // Avoid deleting while typing in inputs or textareas
    const active = document.activeElement;
    if(active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    // Only act if CAD module is visible
    if(!document.querySelector('.cad-module')) return;
    if(!ui.selectedId) return;
    // Perform delete
    doc = removeCadEntity(doc, ui.selectedId);
    ui.selectedId = "";
    saveAndRefresh('Entidad CAD eliminada (tecla Suprimir)');
  };
  window.addEventListener('keydown', window.__giae_cad_keydown_handler);

  // ☁️ Cloudflare D1 + R2 Integration
  const cfService = new CloudflareCADService("/api/giae");
  
  // Verificar disponibilidad de Cloudflare
  cfService.checkHealth().then(health => {
    const statusEl = host.querySelector("#cadCFStatusText");
    if (statusEl) {
      statusEl.textContent = cfService.getStatusIcon(health);
      statusEl.style.color = health.available ? "#22c55e" : "#ef4444";
    }
  });

  // Guardar en Cloudflare (sin romper localStorage)
  host.querySelector("#cadSaveCF")?.addEventListener("click", async () => {
    const projectId = project.id || prompt("Ingresa el ID del proyecto:");
    if (!projectId) return;
    
    const btn = host.querySelector("#cadSaveCF");
    const original = btn.textContent;
    btn.textContent = "💾 Guardando...";
    btn.disabled = true;

    const result = await cfService.saveToCF(projectId, doc);
    
    if (result.success) {
      addHistory("Plano guardado en Cloudflare D1 + R2", "CAD electrico", false);
      persist();
      alert("✅ Plano guardado en la nube exitosamente!");
    } else {
      console.warn("⚠️ Cloudflare no disponible - usando localStorage");
      addHistory("Plano guardado localmente (nube no disponible)", "CAD electrico", false);
      persist();
    }
    
    btn.textContent = original;
    btn.disabled = false;
  });

  // Cargar desde Cloudflare (con fallback a localStorage)
  host.querySelector("#cadLoadCF")?.addEventListener("click", async () => {
    const planId = prompt("Ingresa el ID del plano a cargar:");
    if (!planId) return;
    
    const btn = host.querySelector("#cadLoadCF");
    const original = btn.textContent;
    btn.textContent = "📥 Cargando...";
    btn.disabled = true;

    const result = await cfService.loadFromCF(planId);
    
    if (result.success && result.plan) {
      doc = result.plan.contenido || doc;
      project.cad2d = doc;
      addHistory("Plano cargado desde Cloudflare R2", "CAD electrico", false);
      persist();
      render(host, state);
      alert("✅ Plano cargado desde la nube!");
    } else {
      console.warn("⚠️ No se pudo cargar desde Cloudflare");
      alert("⚠️ Plano no encontrado en la nube");
    }
    
    btn.textContent = original;
    btn.disabled = false;
  });
}
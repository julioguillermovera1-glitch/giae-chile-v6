import { persist, addHistory } from "../../core/store.js";
import { CloudflareCADService } from "../../core/cad/cloudflare-service.js";
import { buildCadFromProject, normalizeCadDocument, createCadEntity, addCadEntity, removeCadEntity, validateCadDocument, summarizeCadDocument, createCadExportPackage, createCadExportDxf, createCadExportDwt, parseCadDxf, importCadSymbols, CAD_LAYERS, CAD_SYMBOLS, getPerimeterSegments, perimeterSegmentLengthM, addPerimeterPoint, undoLastPerimeterPoint, closePerimeter, resetPerimeter, setPerimeterMeasurement, applyPerimeterMeasurements, nearestWallPoint, PERIMETER_PX_PER_METER } from "../../core/cad/cadEngine.js";

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
function nearestSymbolCenter(doc, point, thresholdPx = 28){
  let best = null;
  doc.entities.forEach(entity => {
    if(entity.type === "wire") return;
    const dist = Math.hypot(n(entity.x) - point.x, n(entity.y) - point.y);
    if(dist <= thresholdPx && (!best || dist < best.distance)) best = { x: n(entity.x), y: n(entity.y), distance: dist };
  });
  return best;
}
function renderLayerToggles(doc){
  const used = new Set(doc.entities.map(entity => entity.layer));
  return CAD_LAYERS.map(layer => `<label class="cad-layer-toggle"><input type="checkbox" data-cad-layer="${esc(layer.id)}" ${layer.hidden ? "" : "checked"}><span style="--layer:${esc(layer.color)}"></span>${esc(layer.label)}<small>${used.has(layer.id) ? "en uso" : "vacia"}</small></label>`).join("");
}
const CAD_MODE_TOOLS = [
  ["select", "Seleccionar"],
  ["pencil", "Lápiz"],
  ["perimeter", "Perímetro"],
  ["wire", "Cablear"],
  ["dimension", "Dimensión"],
  ["eraser", "Goma"]
];
function renderModeRow(activeTool){
  return CAD_MODE_TOOLS.map(([id, label]) => `<button type="button" class="cad-tool ${activeTool === id ? "active" : ""}" data-cad-tool="${id}">${label}</button>`).join("");
}
const CAD_RIBBON_UTILITY_PANELS = [
  ["etiqueta", "🏷️ Etiqueta"],
  ["perimetro", "📐 Medidas perímetro"],
  ["config", "⚙️ Configuración"],
  ["importexport", "📤 Importar / Exportar"],
  ["nube", "☁️ Nube"],
  ["capas", "🗂️ Capas"]
];
function cadSymbolCategories(doc){
  const all = (doc.symbols || []).filter(symbol => symbol.id !== "dimension");
  return CAD_LAYERS.map(layer => ({ layer, symbols: all.filter(symbol => symbol.layer === layer.id) })).filter(group => group.symbols.length);
}
function renderRibbon(ui, doc){
  const modeButtons = renderModeRow(ui.tool);
  const categories = cadSymbolCategories(doc);
  const categoryButtons = categories.map(group => `<button type="button" class="cad-ribbon-toggle ${ui.ribbonPanel === "cat-" + group.layer.id ? "active" : ""}" style="--layer-color:${esc(group.layer.color)}" data-ribbon-toggle="cat-${esc(group.layer.id)}">${esc(group.layer.label)} (${group.symbols.length}) ${ui.ribbonPanel === "cat-" + group.layer.id ? "▴" : "▾"}</button>`).join("");
  const utilityButtons = CAD_RIBBON_UTILITY_PANELS.map(([id, label]) => `<button type="button" class="cad-ribbon-toggle ${ui.ribbonPanel === id ? "active" : ""}" data-ribbon-toggle="${id}">${label} ${ui.ribbonPanel === id ? "▴" : "▾"}</button>`).join("");
  return `<div class="cad-ribbon">
    <div class="cad-ribbon-group">${modeButtons}</div>
    <div class="cad-ribbon-group">${categoryButtons}</div>
    <div class="cad-ribbon-group">${utilityButtons}</div>
  </div>`;
}
function renderRibbonPanelContent(panelId, doc, ui, perimeterSegments){
  if(panelId.startsWith("cat-")){
    const layerId = panelId.slice(4);
    const layer = CAD_LAYERS.find(item => item.id === layerId);
    const symbols = (doc.symbols || []).filter(symbol => symbol.layer === layerId && symbol.id !== "dimension");
    const query = String(ui.catSearch || "").trim().toLowerCase();
    const filtered = query ? symbols.filter(symbol => symbol.label.toLowerCase().includes(query)) : symbols;
    return `<label>Buscar en ${esc(layer?.label || layerId)}<input id="cadCatSearch" type="text" placeholder="Ej: interruptor, enchufe..." value="${esc(ui.catSearch || "")}"></label>
      <div class="cad-qet-results">
        ${filtered.length ? filtered.map(symbol => `<button type="button" class="cad-tool ${ui.tool === symbol.id ? "active" : ""}" style="--layer-color:${esc(layer?.color || "")}" data-cad-tool="${esc(symbol.id)}" title="${esc(symbol.label)}">${esc(symbol.label)}</button>`).join("") : `<p class="small">Sin resultados para esa búsqueda.</p>`}
      </div>`;
  }
  if(panelId === "etiqueta"){
    return `<label>Texto / nombre<input id="cadLabelInput" value="${esc(ui.label || "")}" placeholder="Nombre del simbolo o nota"></label>
      <label>Circuito<input id="cadCircuitInput" value="${esc(ui.circuitId || "")}" placeholder="Ej: C01"></label>
      <p class="small muted">Se aplica al próximo símbolo, cable o dimensión que agregues.</p>`;
  }
  if(panelId === "perimetro"){
    return `<p class="muted">Elige la herramienta "Perímetro" y haz clic en el plano para marcar cada esquina de la casa en orden. Luego ingresa el largo real de cada pared y aplica para escalar el dibujo.</p>
      <div class="row-actions">
        <button id="cadUndoPerimeterPoint" class="secondary">Deshacer último punto</button>
        <button id="cadClosePerimeter" class="secondary">Cerrar perímetro</button>
        <button id="cadResetPerimeter" class="ghost">Reiniciar perímetro</button>
      </div>
      ${perimeterSegments.length ? `
      <div class="cad-perimeter-measurements">
        ${perimeterSegments.map(segment => {
          const stored = doc.perimeter.measurementsM?.[segment.index];
          const value = Number.isFinite(stored) && stored > 0 ? stored : perimeterSegmentLengthM(segment.from, segment.to);
          return `<label>Pared ${segment.index + 1} - largo real (m)<input type="number" min="0" step="0.01" data-perimeter-measure="${segment.index}" value="${value.toFixed(2)}"></label>`;
        }).join("")}
      </div>
      <div class="row-actions"><button id="cadApplyPerimeterMeasurements" class="primary-action">Aplicar medidas y escalar</button></div>
      ` : `<p class="small">Aún no hay perímetro trazado. Usa la herramienta "Perímetro" y haz clic sobre el plano.</p>`}`;
  }
  if(panelId === "config"){
    return `<label>Escala<input id="cadScaleInput" value="${esc(doc.scale)}" placeholder="1:50"></label>
      <label>Unidades<select id="cadUnitsSelect"><option value="mm" ${doc.units === "mm" ? "selected" : ""}>mm</option><option value="cm" ${doc.units === "cm" ? "selected" : ""}>cm</option><option value="m" ${doc.units === "m" ? "selected" : ""}>m</option></select></label>`;
  }
  if(panelId === "importexport"){
    return `<div class="row-actions"><button id="cadExportJsonSide" class="secondary">Exportar .giaecad</button><button id="cadExportDxf" class="secondary">Exportar DXF</button><button id="cadExportDwtSide" class="secondary">Exportar .DWT</button></div>
      <div class="row-actions"><button id="cadImportDxf" class="secondary">Importar DXF</button><button id="cadImportSymbols" class="secondary">Cargar símbolos</button></div>
      <input id="cadImportDxfFile" type="file" accept=".dxf,text/plain" hidden>
      <input id="cadImportSymbolsFile" type="file" accept=".json,application/json" hidden>`;
  }
  if(panelId === "nube"){
    return `<div id="cadCFStatus" style="padding: 8px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
        <span id="cadCFStatusText">Verificando...</span>
      </div>
      <div class="row-actions">
        <button id="cadSaveCF" class="secondary">💾 Guardar en Cloud</button>
        <button id="cadLoadCF" class="secondary">📥 Cargar de Cloud</button>
      </div>`;
  }
  if(panelId === "capas") return `<div class="cad-layer-list">${renderLayerToggles(doc)}</div>`;
  return "";
}
function renderQetPrimitives(primitives, color){
  return primitives.map(p => {
    if(p.tag === "line") return `<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" stroke="${color}" stroke-width="1.6" fill="none"/>`;
    if(p.tag === "rect") return `<rect x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" fill="none" stroke="${color}" stroke-width="1.6"/>`;
    if(p.tag === "ellipse") return `<ellipse cx="${p.cx}" cy="${p.cy}" rx="${p.rx}" ry="${p.ry}" fill="none" stroke="${color}" stroke-width="1.6"/>`;
    if(p.tag === "polygon"){
      const pts = (p.points || []).map(([px, py]) => `${px} ${py}`).join(" L ");
      if(!pts) return "";
      return `<path d="M ${pts}${p.closed ? " Z" : ""}" fill="none" stroke="${color}" stroke-width="1.6"/>`;
    }
    if(p.tag === "arc"){
      const startRad = (p.start || 0) * Math.PI / 180;
      const endRad = ((p.start || 0) + (p.angle || 0)) * Math.PI / 180;
      const x1 = p.cx + p.rx * Math.cos(startRad), y1 = p.cy + p.ry * Math.sin(startRad);
      const x2 = p.cx + p.rx * Math.cos(endRad), y2 = p.cy + p.ry * Math.sin(endRad);
      const largeArc = Math.abs(p.angle || 0) > 180 ? 1 : 0;
      return `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${p.rx} ${p.ry} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" fill="none" stroke="${color}" stroke-width="1.6"/>`;
    }
    if(p.tag === "text") return `<text x="${p.x}" y="${p.y}" font-size="6" fill="${color}">${esc(p.text || "")}</text>`;
    return "";
  }).join("");
}
function renderSymbol(entity, symbols = CAD_SYMBOLS){
  const color = layerColor(entity.layer);
  const x = n(entity.x), y = n(entity.y);
  const rotation = n(entity.rotation, 0);
  const label = esc(entity.label || symbolLabel(entity.symbolId, symbols));
  const base = `data-entity-id="${esc(entity.id)}" class="cad-entity cad-symbol" data-draggable="true"`;
  if(String(entity.symbolId || "").startsWith("qet-")){
    const qetSymbol = symbols.find(item => item.id === entity.symbolId);
    if(qetSymbol && Array.isArray(qetSymbol.primitives)){
      return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})">${renderQetPrimitives(qetSymbol.primitives, color)}<text y="34" text-anchor="middle" font-size="10" font-weight="700" fill="${color}">${label}</text></g>`;
    }
  }
  if(entity.symbolId === "panel") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-34" y="-42" width="68" height="84" rx="4" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-22" y1="-20" x2="22" y2="-20" stroke="${color}" stroke-width="1.5"/><line x1="-22" y1="0" x2="22" y2="0" stroke="${color}" stroke-width="1.5"/><line x1="-22" y1="20" x2="22" y2="20" stroke="${color}" stroke-width="1.5"/><text y="58" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "sub-panel") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-28" y="-34" width="56" height="68" rx="4" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="6 3"/><line x1="-16" y1="-14" x2="16" y2="-14" stroke="${color}" stroke-width="1.5"/><line x1="-16" y1="8" x2="16" y2="8" stroke="${color}" stroke-width="1.5"/><text y="48" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "meter") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="22" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="0" y1="6" x2="10" y2="-10" stroke="${color}" stroke-width="2" stroke-linecap="round"/><circle r="2.5" fill="${color}"/><text y="42" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "breaker") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-22" y="-32" width="44" height="64" rx="3" fill="none" stroke="${color}" stroke-width="2"/><path d="M -10 8 C -2 -18 8 -18 14 -30" fill="none" stroke="${color}" stroke-width="2"/><text y="50" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "differential") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-22" y="-32" width="44" height="64" rx="3" fill="none" stroke="${color}" stroke-width="2"/><path d="M -10 8 C -2 -18 8 -18 14 -30" fill="none" stroke="${color}" stroke-width="2"/><circle cx="0" cy="20" r="5" fill="none" stroke="${color}" stroke-width="1.5"/><text y="50" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "light") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="25" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-17" y1="-17" x2="17" y2="17" stroke="${color}" stroke-width="1.5"/><line x1="17" y1="-17" x2="-17" y2="17" stroke="${color}" stroke-width="1.5"/><text y="46" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "emergency-light") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="25" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-17" y1="-17" x2="17" y2="17" stroke="${color}" stroke-width="1.5"/><line x1="17" y1="-17" x2="-17" y2="17" stroke="${color}" stroke-width="1.5"/><text y="6" text-anchor="middle" font-size="13" font-weight="900" fill="${color}">E</text><text y="46" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "switch") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="18" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-7" y1="6" x2="16" y2="-15" stroke="${color}" stroke-width="2"/><text y="40" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "three-way-switch") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="18" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-7" y1="6" x2="16" y2="-15" stroke="${color}" stroke-width="2"/><text x="8" y="-2" font-size="11" font-weight="800" fill="${color}">3</text><text y="40" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "dimmer") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="18" fill="none" stroke="${color}" stroke-width="2.5"/><line x1="-7" y1="6" x2="16" y2="-15" stroke="${color}" stroke-width="2"/><circle cx="0" cy="0" r="6" fill="none" stroke="${color}" stroke-width="1.5"/><text y="40" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "motion-sensor") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="18" fill="none" stroke="${color}" stroke-width="2.5"/><path d="M -12 -12 A 22 22 0 0 1 12 -12" fill="none" stroke="${color}" stroke-width="1.5"/><path d="M -16 -16 A 28 28 0 0 1 16 -16" fill="none" stroke="${color}" stroke-width="1.5"/><text y="40" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "doorbell") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><path d="M -14 6 A 14 14 0 0 1 14 6 L 16 12 L -16 12 Z" fill="none" stroke="${color}" stroke-width="2"/><circle cx="0" cy="16" r="2.5" fill="${color}"/><text y="38" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "outlet") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><path d="M -24 0 A 24 24 0 0 1 24 0" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-24" y1="0" x2="24" y2="0" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="0" y1="-24" x2="0" y2="-34" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="45" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "outlet-double") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><path d="M -26 0 A 26 26 0 0 1 26 0" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-26" y1="0" x2="26" y2="0" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-9" y1="-24" x2="-9" y2="-34" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="-24" x2="9" y2="-34" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="50" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "outlet-triple") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><path d="M -28 0 A 28 28 0 0 1 28 0" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-28" y1="0" x2="28" y2="0" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-12" y1="-24" x2="-12" y2="-35" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="0" y1="-28" x2="0" y2="-38" stroke="${color}" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="-24" x2="12" y2="-35" stroke="${color}" stroke-width="2" stroke-linecap="round"/><text y="52" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "outlet-exterior") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><path d="M -24 0 A 24 24 0 0 1 24 0" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-24" y1="0" x2="24" y2="0" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><path d="M -28 -6 L 28 -6 L 22 -18 L -22 -18 Z" fill="none" stroke="${color}" stroke-width="1.5"/><text y="45" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "outlet-special") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><path d="M -26 0 A 26 26 0 0 1 26 0" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/><line x1="-26" y1="0" x2="26" y2="0" stroke="${color}" stroke-width="3" stroke-linecap="round"/><line x1="0" y1="-26" x2="0" y2="-36" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><text y="16" text-anchor="middle" font-size="10" font-weight="800" fill="${color}">E</text><text y="50" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "outlet-tripolar") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><path d="M -28 0 A 28 28 0 0 1 28 0" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><line x1="-28" y1="0" x2="28" y2="0" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><text y="14" text-anchor="middle" font-size="11" font-weight="800" fill="${color}">3~</text><text y="52" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "motor") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="27" fill="none" stroke="${color}" stroke-width="2.5"/><text y="7" text-anchor="middle" font-size="20" font-weight="800" fill="${color}">M</text><text y="50" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "exhaust-fan") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="22" fill="none" stroke="${color}" stroke-width="2.5"/><path d="M 0 0 L 0 -18 A 9 9 0 0 1 9 -3 Z" fill="${color}" opacity="0.85"/><path d="M 0 0 L 15 9 A 9 9 0 0 1 -1 15 Z" fill="${color}" opacity="0.85"/><path d="M 0 0 L -15 9 A 9 9 0 0 1 1 -15 Z" fill="${color}" opacity="0.85"/><text y="42" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "water-heater") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-18" y="-30" width="36" height="60" rx="8" fill="none" stroke="${color}" stroke-width="2.5"/><path d="M 0 -14 C -6 -6 -6 2 0 6 C 6 2 6 -6 0 -14 Z" fill="none" stroke="${color}" stroke-width="1.5"/><text y="46" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "junction") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-20" y="-20" width="40" height="40" rx="4" fill="none" stroke="${color}" stroke-width="2.5"/><circle r="4" fill="${color}"/><text y="42" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "ground") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><line x1="0" y1="-28" x2="0" y2="0" stroke="${color}" stroke-width="2.5"/><line x1="-24" y1="0" x2="24" y2="0" stroke="${color}" stroke-width="2"/><line x1="-16" y1="10" x2="16" y2="10" stroke="${color}" stroke-width="1.5"/><line x1="-8" y1="20" x2="8" y2="20" stroke="${color}" stroke-width="1"/><text y="46" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "smoke-detector") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><circle r="20" fill="none" stroke="${color}" stroke-width="2.5"/><circle r="7" fill="none" stroke="${color}" stroke-width="1.5"/><circle r="2" fill="${color}"/><text y="40" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "data-point") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-16" y="-16" width="32" height="32" rx="4" fill="none" stroke="${color}" stroke-width="2.5"/><text y="6" text-anchor="middle" font-size="12" font-weight="800" fill="${color}">D</text><text y="38" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "tv-point") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-16" y="-16" width="32" height="32" rx="4" fill="none" stroke="${color}" stroke-width="2.5"/><text y="6" text-anchor="middle" font-size="11" font-weight="800" fill="${color}">TV</text><text y="38" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "window") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-40" y="-8" width="80" height="16" rx="2" fill="none" stroke="${color}" stroke-width="2"/><line x1="-20" y1="-8" x2="-20" y2="8" stroke="${color}" stroke-width="1.5"/><line x1="0" y1="-8" x2="0" y2="8" stroke="${color}" stroke-width="1.5"/><line x1="20" y1="-8" x2="20" y2="8" stroke="${color}" stroke-width="1.5"/><text y="28" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  if(entity.symbolId === "door") return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><line x1="0" y1="0" x2="0" y2="-32" stroke="${color}" stroke-width="2.5"/><path d="M 0 -32 A 32 32 0 0 1 32 0" fill="none" stroke="${color}" stroke-width="1.5"/><line x1="0" y1="0" x2="32" y2="0" stroke="${color}" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/><text y="46" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
  return `<g ${base} transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-70" y="-22" width="140" height="44" rx="4" fill="none" stroke="${color}" stroke-width="2"/><text y="5" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${label}</text></g>`;
}
function renderWire(entity){
  const color = layerColor(entity.layer);
  const from = entity.from || { x: entity.x, y: entity.y };
  const to = entity.to || { x: entity.x + 120, y: entity.y };
  const mx = Math.round((from.x + to.x) / 2);
  const my = Math.round((from.y + to.y) / 2) - 7;
  return `<g data-entity-id="${esc(entity.id)}" class="cad-entity cad-wire"><line x1="${n(from.x)}" y1="${n(from.y)}" x2="${n(to.x)}" y2="${n(to.y)}" stroke="${color}" stroke-width="4" stroke-linecap="round"/><text x="${mx}" y="${my}" text-anchor="middle" font-size="11" font-weight="800" fill="${color}">${esc(entity.label)}</text></g>`;
}
function renderPerimeter(perimeter){
  const points = perimeter?.points || [];
  if(!points.length) return "";
  const segments = getPerimeterSegments(perimeter);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${n(p.x)} ${n(p.y)}`).join(" ") + (perimeter.closed && points.length > 2 ? " Z" : "");
  const walls = `<path d="${path}" fill="none" stroke="#cbd5e1" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>`;
  const vertices = points.map(p => `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="4" fill="#94a3b8"/>`).join("");
  const labels = segments.map(segment => {
    const measurementM = perimeter.measurementsM?.[segment.index];
    const lengthM = Number.isFinite(measurementM) && measurementM > 0 ? measurementM : perimeterSegmentLengthM(segment.from, segment.to);
    const mx = Math.round((segment.from.x + segment.to.x) / 2);
    const my = Math.round((segment.from.y + segment.to.y) / 2) - 10;
    const applied = Number.isFinite(measurementM) && measurementM > 0;
    return `<text x="${mx}" y="${my}" text-anchor="middle" font-size="11" font-weight="800" fill="${applied ? "#16a34a" : "#f59e0b"}">${lengthM.toFixed(2)} m</text>`;
  }).join("");
  return `<g class="cad-perimeter">${walls}${vertices}${labels}</g>`;
}
function renderLegend(doc){
  if(!doc.legend?.visible) return "";
  const x = n(doc.legend.x, 930), y = n(doc.legend.y, 560);
  const rows = CAD_LAYERS.map((layer, index) => `<g transform="translate(${x + 14} ${y + 42 + index * 20})"><rect width="12" height="12" fill="${esc(layer.color)}"/><text x="20" y="10" font-size="11" font-weight="700" fill="#e2e8f0">${esc(layer.label)}</text></g>`).join("");
  return `<g class="cad-legend"><rect x="${x}" y="${y}" width="230" height="238" rx="5" fill="#0f172a" stroke="#404a54" stroke-width="2"/><text x="${x + 14}" y="${y + 24}" font-size="13" font-weight="900" fill="#94a3b8">Leyenda GIAE CAD</text>${rows}</g>`;
}
function renderCadSvg(doc, selectedId = "", ui = {}){
  const hidden = new Set(doc.layers.filter(layer => layer.hidden).map(layer => layer.id));
  const grid = n(doc.canvas.grid, 20);
  const width = n(doc.canvas.width, 1200), height = n(doc.canvas.height, 760);
  const zoom = Math.max(0.25, Math.min(4, n(ui.zoom, 1)));
  const viewW = width / zoom, viewH = height / zoom;
  const panX = Math.max(0, Math.min(width - viewW, n(ui.panX, 0)));
  const panY = Math.max(0, Math.min(height - viewH, n(ui.panY, 0)));
  const wires = doc.entities.filter(entity => entity.type === "wire" && !hidden.has(entity.layer)).map(renderWire).join("");
  const symbols = doc.entities.filter(entity => entity.type !== "wire" && !hidden.has(entity.layer)).map(entity => renderSymbol(entity, doc.symbols)).join("");
  const selected = selectedId ? doc.entities.find(entity => entity.id === selectedId) : null;
  const selectBox = selected && selected.type !== "wire" ? `<g transform="translate(${n(selected.x)} ${n(selected.y)}) rotate(${n(selected.rotation, 0)})"><rect class="cad-selected-box" x="-44" y="-52" width="88" height="104" rx="4" stroke="#22c55e" stroke-width="2" fill="none"/></g>` : "";
  return `<svg id="cadCanvas" class="cad-canvas" viewBox="${panX} ${panY} ${viewW} ${viewH}" role="img" aria-label="Plano CAD electrico GIAE"><defs><pattern id="cadGrid" width="${grid}" height="${grid}" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="${grid}" y2="0" stroke="#3a3f48" stroke-width="0.5"/><line x1="0" y1="0" x2="0" y2="${grid}" stroke="#3a3f48" stroke-width="0.5"/><line x1="${grid}" y1="0" x2="${grid}" y2="${grid}" stroke="#404a54" stroke-width="1.5"/><line x1="0" y1="${grid}" x2="${grid}" y2="${grid}" stroke="#404a54" stroke-width="1.5"/></pattern><filter id="shadowFilter" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/></filter></defs><rect width="${width}" height="${height}" fill="#1a1f27"/><rect width="${width}" height="${height}" fill="url(#cadGrid)" opacity="0.6"/><g class="cad-border"><rect x="24" y="24" width="${width-48}" height="${height-48}" fill="none" stroke="#404a54" stroke-width="2" stroke-dasharray="8 6"/></g>${renderPerimeter(doc.perimeter)}<g filter="url(#shadowFilter)">${wires}${symbols}</g>${selectBox}${renderLegend(doc)}</svg>`;
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

function renderRotationControl(doc, ui){
  const entity = ui.selectedId ? doc.entities.find(e => e.id === ui.selectedId) : null;
  if(!entity) return "";
  if(entity.type === "wire"){
    return `<article class="admin-card cad-rotation-card">
      <h4>Propiedades del elemento</h4>
      <label>Nombre / etiqueta<input id="cadPropLabel" value="${esc(entity.label || "")}"></label>
      <label>Circuito<input id="cadPropCircuit" value="${esc(entity.circuitId || "")}" placeholder="Ej: C01"></label>
    </article>`;
  }
  const currentRotation = n(entity.rotation, 0);
  return `<article class="admin-card cad-rotation-card">
    <h4>Propiedades del elemento</h4>
    <label>Nombre / etiqueta<input id="cadPropLabel" value="${esc(entity.label || "")}"></label>
    <label>Circuito<input id="cadPropCircuit" value="${esc(entity.circuitId || "")}" placeholder="Ej: C01"></label>
    <label>Capa<select id="cadPropLayer">${CAD_LAYERS.map(layer => `<option value="${esc(layer.id)}" ${entity.layer === layer.id ? "selected" : ""}>${esc(layer.label)}</option>`).join("")}</select></label>
    <label>Rotación (0-359°)<input id="cadRotationInput" type="number" min="0" max="359" step="1" value="${currentRotation}"></label>
    <div class="row-actions">
      <button id="cadRotateLeft90" class="secondary">↺ -90°</button>
      <button id="cadRotateRight90" class="secondary">↻ +90°</button>
    </div>
  </article>`;
}
function renderCadStartScreen(project, doc){
  const projectName = esc(project.name || "Proyecto sin nombre");
  return `<section class="module-window cad-module cad-start-screen">
    <div class="cad-start-shell">
      <aside class="cad-start-side">
        <p class="eyebrow">Fase 5 - CAD electrico GIAE 2.0</p>
        <h3>CAD Eléctrico</h3>
        <button id="cadStartNew" class="primary-action">+ Nuevo plano</button>
        <nav class="cad-start-nav">
          <button type="button" data-cad-start-nav="novedades" class="cad-start-nav-link active">Novedades</button>
          <button type="button" data-cad-start-nav="ayuda" class="cad-start-nav-link">Ayuda rápida</button>
        </nav>
      </aside>
      <main class="cad-start-main">
        <h2>Bienvenido a tu plano eléctrico</h2>
        <p class="muted">Proyecto activo: <b>${projectName}</b></p>
        <div class="cad-start-empty">
          <div class="cad-start-icon">🗄️</div>
          <p><b>Aún no hay dibujos en este proyecto.</b></p>
          <p class="small">Empieza trazando el perímetro de la casa a escala real, o genera el plano automáticamente desde las cargas ya cargadas en el proyecto. Ambas opciones están dentro del editor.</p>
        </div>
        <div id="cadStartNovedades" class="cad-start-panel">
          <h4>Novedades de esta versión</h4>
          <ul>
            <li>Biblioteca de 87 símbolos reales de instalación (QElectroTech, EN 60617)</li>
            <li>Perímetro de la casa a escala real, con medidas por pared</li>
            <li>Puertas y ventanas que se ajustan solas al muro más cercano</li>
            <li>Lápiz para dibujar líneas libres y Goma para borrar</li>
            <li>Zoom, paneo y coordenadas en vivo</li>
          </ul>
        </div>
        <div id="cadStartAyuda" class="cad-start-panel" hidden>
          <h4>Ayuda rápida</h4>
          <p class="small">Usa "Perímetro (paredes)" para trazar los muros y luego "Aplicar medidas y escalar" con las medidas reales. Coloca símbolos desde "Herramientas" o busca en la "Biblioteca QElectroTech". La leyenda del plano (cuadro de simbología) se genera sola.</p>
        </div>
      </main>
      <aside class="cad-start-cloud">
        <h4>☁️ Cloudflare (D1 + R2)</h4>
        <div id="cadStartCFStatus" class="cad-cf-status"><span id="cadStartCFStatusText">Verificando...</span></div>
        <p class="small muted">Guarda tu plano en la nube desde el editor para acceder desde cualquier equipo.</p>
      </aside>
    </div>
  </section>`;
}
export function render(host, state){
  const project = state.currentProject;
  let doc = ensureCad(project);
  const ui = project.cadUi || { tool: "select", layer: "enchufes", selectedId: "", wireStart: null, catSearch: "", zoom: 1, panX: 0, panY: 0, ribbonPanel: "" };
  project.cadUi = ui;
  const isEmptyPlan = doc.entities.length === 0 && !(doc.perimeter?.points?.length);
  if(ui.cadStartDismissed === undefined) ui.cadStartDismissed = !isEmptyPlan;
  if(!ui.cadStartDismissed){
    host.innerHTML = renderCadStartScreen(project, doc);
    host.querySelector("#cadStartNew").addEventListener("click", () => {
      ui.cadStartDismissed = true;
      project.cadUi = ui;
      render(host, state);
    });
    host.querySelectorAll("[data-cad-start-nav]").forEach(button => button.addEventListener("click", () => {
      const target = button.dataset.cadStartNav;
      host.querySelectorAll("[data-cad-start-nav]").forEach(b => b.classList.toggle("active", b === button));
      host.querySelector("#cadStartNovedades").hidden = target !== "novedades";
      host.querySelector("#cadStartAyuda").hidden = target !== "ayuda";
    }));
    const cfServiceStart = new CloudflareCADService("/api/giae");
    cfServiceStart.checkHealth().then(health => {
      const label = host.querySelector("#cadStartCFStatusText");
      if(label){
        label.textContent = cfServiceStart.getStatusIcon(health);
        label.style.color = health.available ? "#22c55e" : "#ef4444";
      }
    });
    return;
  }
  const validation = validateCadDocument(doc);
  doc.validation = validation;
  const summary = summarizeCadDocument(doc);
  const perimeterSegments = getPerimeterSegments(doc.perimeter);
  host.innerHTML = `
    <section class="module-window cad-module ${ui.fullscreen ? "cad-fullscreen" : ""}">
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

      ${renderRibbon(ui, doc)}
      ${ui.ribbonPanel ? `<div class="cad-ribbon-panel" id="cadRibbonPanel">${renderRibbonPanelContent(ui.ribbonPanel, doc, ui, perimeterSegments)}</div>` : ""}

      <section class="cad-workspace-v2">
        <main class="cad-main cad-main-wide">
          <div class="cad-topbar">
            <div><b>${esc(doc.name)}</b><span>${esc(doc.scale)} - ${esc(doc.units)} - ${esc(project.name || "Proyecto sin nombre")}</span></div>
            <div class="row-actions"><button id="cadBackToStart" class="ghost">🏠 Inicio</button><button id="cadGenerateProject" class="secondary">Generar desde proyecto</button><button id="cadValidate" class="secondary">Validar</button><button id="cadToggleFullscreen" class="primary-action">${ui.fullscreen ? "✕ Salir de pantalla completa" : "⛶ Pantalla completa"}</button><button id="cadExportJson" class="secondary">Exportar .giaecad</button><button id="cadExportDwt" class="secondary">Exportar .DWT</button><button id="cadExportSvg" class="secondary">Exportar SVG</button><button id="cadClear" class="ghost danger-text">Reiniciar plano</button></div>
          </div>
          <div class="cad-stage">${renderCadSvg(doc, ui.selectedId, ui)}</div>
          <div class="cad-statusbar">
            <span id="cadCoordsReadout">X: 0.00 m · Y: 0.00 m</span>
            <div class="row-actions">
              <button type="button" id="cadPanLeft" class="secondary" title="Mover izquierda">◀</button>
              <button type="button" id="cadPanUp" class="secondary" title="Mover arriba">▲</button>
              <button type="button" id="cadPanDown" class="secondary" title="Mover abajo">▼</button>
              <button type="button" id="cadPanRight" class="secondary" title="Mover derecha">▶</button>
              <button type="button" id="cadZoomOut" class="secondary">− Alejar</button>
              <span id="cadZoomLabel">${Math.round(Math.max(0.25, Math.min(4, n(ui.zoom, 1))) * 100)}%</span>
              <button type="button" id="cadZoomIn" class="secondary">+ Acercar</button>
              <button type="button" id="cadZoomReset" class="ghost">Restablecer</button>
            </div>
          </div>
          <div class="policy-box"><b>Uso:</b> selecciona una herramienta y haz clic en el plano. En modo Cablear, dos clics crean una canalizacion. El plano es fuente de datos preliminar y requiere revision profesional.</div>
        </main>

        <aside class="cad-right">
          ${renderRotationControl(doc, ui)}
          <article class="admin-card">
            <h4>Entidades</h4>
            <div class="cad-entity-list">${renderEntities(doc, ui.selectedId)}</div>
            <div class="row-actions"><button id="cadDeleteSelected" class="ghost danger-text">Eliminar seleccionado</button><small class="hint" style="margin-left:12px">Atajo: Ctrl+Suprimir</small></div>
          </article>
          <article class="admin-card"><h4>Validacion CAD</h4>${renderValidation(validation)}</article>
        </aside>
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
  host.querySelector("#cadScaleInput")?.addEventListener("change", event => {
    doc.scale = event.target.value.trim() || "1:50";
    project.cad2d = doc;
    persist();
    render(host, state);
  });
  host.querySelector("#cadUnitsSelect")?.addEventListener("change", event => {
    doc.units = event.target.value;
    project.cad2d = doc;
    persist();
    render(host, state);
  });
  host.querySelector("#cadExportDxf")?.addEventListener("click", () => downloadText(safeFileName(doc.name) + ".dxf", createCadExportDxf(project, doc), "application/dxf;charset=utf-8"));
  host.querySelector("#cadExportJsonSide")?.addEventListener("click", () => downloadText(safeFileName(doc.name) + ".giaecad", JSON.stringify(createCadExportPackage(project, doc), null, 2)));
  host.querySelector("#cadExportDwtSide")?.addEventListener("click", () => downloadText(safeFileName(doc.name) + ".dwt", createCadExportDwt(project, doc), "application/dxf;charset=utf-8"));
  host.querySelector("#cadImportDxf")?.addEventListener("click", () => host.querySelector("#cadImportDxfFile")?.click());
  host.querySelector("#cadImportSymbols")?.addEventListener("click", () => host.querySelector("#cadImportSymbolsFile")?.click());
  host.querySelector("#cadImportDxfFile")?.addEventListener("change", async event => {
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
  host.querySelector("#cadImportSymbolsFile")?.addEventListener("change", async event => {
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
  host.querySelector("#cadCatSearch")?.addEventListener("input", event => {
    ui.catSearch = event.target.value;
    project.cadUi = ui;
    render(host, state);
    const refocused = host.querySelector("#cadCatSearch");
    if(refocused){ refocused.focus(); refocused.setSelectionRange(refocused.value.length, refocused.value.length); }
  });
  host.querySelectorAll("[data-ribbon-toggle]").forEach(button => button.addEventListener("click", () => {
    const panelId = button.dataset.ribbonToggle;
    const opening = ui.ribbonPanel !== panelId;
    ui.ribbonPanel = opening ? panelId : "";
    if(opening && panelId.startsWith("cat-")) ui.catSearch = "";
    project.cadUi = ui;
    render(host, state);
  }));
  host.querySelector("#cadUndoPerimeterPoint")?.addEventListener("click", () => {
    doc = undoLastPerimeterPoint(doc);
    saveAndRefresh("Punto de perímetro deshecho");
  });
  host.querySelector("#cadClosePerimeter")?.addEventListener("click", () => {
    doc = closePerimeter(doc);
    saveAndRefresh("Perímetro cerrado");
  });
  host.querySelector("#cadResetPerimeter")?.addEventListener("click", () => {
    doc = resetPerimeter(doc);
    saveAndRefresh("Perímetro reiniciado");
  });
  host.querySelectorAll("[data-perimeter-measure]").forEach(input => input.addEventListener("change", () => {
    const segmentIndex = Number(input.dataset.perimeterMeasure);
    const valueM = Number(input.value);
    doc = setPerimeterMeasurement(doc, segmentIndex, valueM);
    project.cad2d = doc;
    persist();
  }));
  host.querySelector("#cadApplyPerimeterMeasurements")?.addEventListener("click", () => {
    doc = applyPerimeterMeasurements(doc);
    saveAndRefresh("Perímetro escalado según medidas reales");
  });
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
    if(ui.tool === "eraser"){
      if(entityGroup){
        doc = removeCadEntity(doc, entityGroup.dataset.entityId);
        if(ui.selectedId === entityGroup.dataset.entityId) ui.selectedId = "";
        saveAndRefresh("Entidad borrada con la goma");
      }
      return;
    }
    const point = svgPoint(event, host.querySelector("#cadCanvas"));
    const grid = doc.canvas.grid || 20;
    const rawX = snap(point.x, grid), rawY = snap(point.y, grid);
    const label = (host.querySelector("#cadLabelInput")?.value || ui.label || "").trim();
    const circuitId = (host.querySelector("#cadCircuitInput")?.value || ui.circuitId || "").trim();
    ui.label = label;
    ui.circuitId = circuitId;
    if(ui.tool === "select") return;
    if(ui.tool === "perimeter"){
      doc = addPerimeterPoint(doc, { x: rawX, y: rawY });
      saveAndRefresh("Punto de perímetro agregado");
      return;
    }
    if(ui.tool === "wire" || ui.tool === "dimension" || ui.tool === "pencil"){
      const magnet = nearestSymbolCenter(doc, point);
      const x = magnet ? magnet.x : rawX, y = magnet ? magnet.y : rawY;
      if(!ui.wireStart){ ui.wireStart = { x, y }; project.cadUi = ui; render(host, state); return; }
      const dx = x - ui.wireStart.x;
      const dy = y - ui.wireStart.y;
      const length = Math.hypot(dx, dy);
      const actualLength = length * parseScale(doc.scale);
      const layer = ui.tool === "dimension" ? "revision" : ui.tool === "pencil" ? "arquitectura" : "canalizacion";
      const wireLabel = ui.tool === "dimension" ? formatDistance(actualLength, doc.units) : ui.tool === "pencil" ? (label || "Muro") : (circuitId || "Canalizacion");
      doc = addCadEntity(doc, createCadEntity("wire", { layer, from: ui.wireStart, to: { x, y }, label: wireLabel, circuitId, source: "manual" }));
      ui.wireStart = null;
      const doneMessage = ui.tool === "dimension" ? "Dimension agregada en CAD" : ui.tool === "pencil" ? "Linea dibujada con el lapiz" : "Canalizacion agregada en CAD";
      saveAndRefresh(doneMessage);
      return;
    }
    if(ui.tool === "door" || ui.tool === "window"){
      const wallSnap = nearestWallPoint(doc.perimeter, { x: rawX, y: rawY });
      const placeX = wallSnap ? wallSnap.x : rawX;
      const placeY = wallSnap ? wallSnap.y : rawY;
      const rotation = wallSnap ? wallSnap.rotation : 0;
      const symbolLbl = label || symbolLabel(ui.tool, doc.symbols);
      doc = addCadEntity(doc, createCadEntity(ui.tool, { x: placeX, y: placeY, rotation, layer: "arquitectura", label: symbolLbl, circuitId, source: "manual" }));
      saveAndRefresh(wallSnap ? `${symbolLbl} agregada y ajustada al muro` : `${symbolLbl} agregada (traza el perimetro para que se ajuste sola al muro)`);
      return;
    }
    const symbol = doc.symbols.find(item => item.id === ui.tool) || CAD_SYMBOLS.find(item => item.id === ui.tool);
    const layer = symbol?.layer || "notas";
    doc = addCadEntity(doc, createCadEntity(ui.tool, { x: rawX, y: rawY, layer, label: label || symbolLabel(ui.tool, doc.symbols), circuitId, source: "manual" }));
    saveAndRefresh("Entidad CAD agregada: " + symbolLabel(ui.tool, doc.symbols));
  });

  // Drag & drop con doble click
  let selectedEntity = null;
  host.querySelector("#cadCanvas").addEventListener("dblclick", event => {
    const entityGroup = event.target.closest("[data-entity-id]");
    if(entityGroup && ui.tool === "select"){
      selectedEntity = entityGroup.dataset.entityId;
      entityGroup.style.opacity = "0.6";
    }
  });

  host.querySelector("#cadCanvas").addEventListener("mousemove", event => {
    const point = svgPoint(event, host.querySelector("#cadCanvas"));
    const readout = host.querySelector("#cadCoordsReadout");
    if(readout){
      readout.textContent = `X: ${(point.x / PERIMETER_PX_PER_METER).toFixed(2)} m · Y: ${(point.y / PERIMETER_PX_PER_METER).toFixed(2)} m`;
    }
    if(!selectedEntity) return;
    const entity = doc.entities.find(e => e.id === selectedEntity);
    if(!entity) { selectedEntity = null; return; }
    const grid = doc.canvas.grid || 20;
    entity.x = snap(point.x, grid);
    entity.y = snap(point.y, grid);
    render(host, state);
  });

  host.querySelector("#cadCanvas").addEventListener("mouseup", () => {
    if(selectedEntity){
      project.cad2d = doc;
      addHistory("Símbolo movido en CAD", "CAD electrico", false);
      persist();
      selectedEntity = null;
      render(host, state);
    }
  });
  host.querySelectorAll("[data-select-entity]").forEach(button => button.addEventListener("click", () => { ui.selectedId = button.dataset.selectEntity; project.cadUi = ui; render(host, state); }));
  host.querySelector("#cadDeleteSelected").addEventListener("click", () => {
    if(!ui.selectedId) return alert("Selecciona una entidad primero.");
    doc = removeCadEntity(doc, ui.selectedId);
    ui.selectedId = "";
    saveAndRefresh("Entidad CAD eliminada");
  });

  function rotateSelected(deltaOrAbsolute, isAbsolute){
    if(!ui.selectedId) return;
    const entity = doc.entities.find(item => item.id === ui.selectedId);
    if(!entity || entity.type === "wire") return;
    const current = n(entity.rotation, 0);
    const next = ((isAbsolute ? deltaOrAbsolute : current + deltaOrAbsolute) % 360 + 360) % 360;
    entity.rotation = next;
    saveAndRefresh("Símbolo rotado en CAD");
  }
  host.querySelector("#cadRotationInput")?.addEventListener("change", event => rotateSelected(Number(event.target.value) || 0, true));
  host.querySelector("#cadRotateLeft90")?.addEventListener("click", () => rotateSelected(-90, false));
  host.querySelector("#cadRotateRight90")?.addEventListener("click", () => rotateSelected(90, false));
  host.querySelector("#cadPropLabel")?.addEventListener("change", event => {
    const entity = doc.entities.find(item => item.id === ui.selectedId);
    if(!entity) return;
    entity.label = event.target.value.trim();
    saveAndRefresh("Etiqueta actualizada en CAD");
  });
  host.querySelector("#cadPropCircuit")?.addEventListener("change", event => {
    const entity = doc.entities.find(item => item.id === ui.selectedId);
    if(!entity) return;
    entity.circuitId = event.target.value.trim();
    saveAndRefresh("Circuito actualizado en CAD");
  });
  host.querySelector("#cadPropLayer")?.addEventListener("change", event => {
    const entity = doc.entities.find(item => item.id === ui.selectedId);
    if(!entity) return;
    entity.layer = event.target.value;
    saveAndRefresh("Capa actualizada en CAD");
  });
  host.querySelector("#cadGenerateProject")?.addEventListener("click", () => {
    if(!confirm("Regenerar el plano desde el Proyecto Activo? Esto reemplaza el plano CAD actual.")) return;
    project.cad2d = buildCadFromProject(project);
    project.cadUi = { tool: "select", layer: "enchufes", selectedId: "", wireStart: null };
    addHistory("Plano CAD regenerado desde Proyecto Activo", "CAD electrico", false);
    persist();
    render(host, state);
  });
  host.querySelector("#cadValidate")?.addEventListener("click", () => saveAndRefresh("Plano CAD validado"));
  function applyZoom(nextZoom){
    const width = n(doc.canvas.width, 1200), height = n(doc.canvas.height, 760);
    const oldZoom = Math.max(0.25, Math.min(4, n(ui.zoom, 1)));
    const clamped = Math.max(0.25, Math.min(4, nextZoom));
    const oldW = width / oldZoom, oldH = height / oldZoom;
    const centerX = n(ui.panX, 0) + oldW / 2, centerY = n(ui.panY, 0) + oldH / 2;
    const newW = width / clamped, newH = height / clamped;
    ui.zoom = clamped;
    ui.panX = centerX - newW / 2;
    ui.panY = centerY - newH / 2;
    project.cadUi = ui;
    render(host, state);
  }
  host.querySelector("#cadZoomIn").addEventListener("click", () => applyZoom(n(ui.zoom, 1) * 1.25));
  host.querySelector("#cadZoomOut").addEventListener("click", () => applyZoom(n(ui.zoom, 1) / 1.25));
  host.querySelector("#cadZoomReset").addEventListener("click", () => { ui.zoom = 1; ui.panX = 0; ui.panY = 0; project.cadUi = ui; render(host, state); });
  function pan(dx, dy){
    const zoom = Math.max(0.25, Math.min(4, n(ui.zoom, 1)));
    ui.panX = n(ui.panX, 0) + dx / zoom;
    ui.panY = n(ui.panY, 0) + dy / zoom;
    project.cadUi = ui;
    render(host, state);
  }
  host.querySelector("#cadPanLeft").addEventListener("click", () => pan(-80, 0));
  host.querySelector("#cadPanRight").addEventListener("click", () => pan(80, 0));
  host.querySelector("#cadPanUp").addEventListener("click", () => pan(0, -80));
  host.querySelector("#cadPanDown").addEventListener("click", () => pan(0, 80));
  host.querySelector("#cadCanvas").addEventListener("wheel", event => {
    event.preventDefault();
    applyZoom(n(ui.zoom, 1) * (event.deltaY < 0 ? 1.15 : 1 / 1.15));
  }, { passive: false });
  host.querySelector("#cadToggleFullscreen").addEventListener("click", () => {
    ui.fullscreen = !ui.fullscreen;
    project.cadUi = ui;
    render(host, state);
  });
  host.querySelector("#cadBackToStart").addEventListener("click", () => {
    ui.cadStartDismissed = false;
    project.cadUi = ui;
    render(host, state);
  });
  host.querySelector("#cadExportJson").addEventListener("click", () => downloadText(safeFileName(doc.name) + ".giaecad", JSON.stringify(createCadExportPackage(project, doc), null, 2)));
  host.querySelector("#cadExportDwt").addEventListener("click", () => downloadText(safeFileName(doc.name) + ".dwt", createCadExportDwt(project, doc), "application/dxf;charset=utf-8"));
  host.querySelector("#cadExportSvg").addEventListener("click", () => downloadText(safeFileName(doc.name) + ".svg", host.querySelector("#cadCanvas").outerHTML, "image/svg+xml;charset=utf-8"));
  host.querySelector("#cadClear").addEventListener("click", () => {
    if(!confirm("Reiniciar el plano CAD actual?")) return;
    project.cad2d = buildCadFromProject({ ...project, loads: [] });
    project.cadUi = { tool: "select", layer: "enchufes", selectedId: "", wireStart: null };
    addHistory("Plano CAD reiniciado", "CAD electrico", false);
    persist();
    render(host, state);
  });

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
}
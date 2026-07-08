import { totalPower, currentSinglePhase, currentThreePhase, suggestBreaker, safeRound } from "../../core/calculations.js";
import { recalculateProject, persist, addHistory } from "../../core/store.js";
import { calculatePanelProject } from "../../core/engineering/panelEngine.js";

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function n(value, fallback = 0){ const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function idSafe(value="x"){ return String(value).replace(/[^a-z0-9_-]+/gi,"-").replace(/^-|-$/g,"") || "x"; }
function phaseFor(project, index) { return project.supplyType === "trifasico" ? ["R", "S", "T"][index % 3] : "R"; }
function circuitCurrent(project, powerW) { return project.supplyType === "trifasico" ? currentThreePhase(powerW) : currentSinglePhase(powerW); }

function fromPanel(project){
  const panel = project.panelEngine || project.panel || calculatePanelProject(project);
  const devices = panel.devices || [];
  const auto = devices.filter(d => d.kind === "Automático");
  return auto.map((device, index) => {
    const load = (project.loads || [])[index] || {};
    return {
      numero:index + 1,
      id: device.circuitId || load.id || `C-${index+1}`,
      nombre: device.circuitName || load.name || `Circuito ${index + 1}`,
      fase: device.phase || load.phase || phaseFor(project, index),
      aut: device.label || `QF${index + 1} 1P+N ${device.ampere || 16} A curva C`,
      dif: (devices.find(d => d.kind === "Diferencial" && d.group === device.group)?.label) || load.differential || "ID 2P 40 A 30 mA tipo A",
      tipo: device.poles || load.outputType || "1P+N+T",
      conductor: device.conductor || load.suggestedConductor || "Conductor según cálculo",
      w: n(load.powerW || load.totalPowerW || device.powerW, 0),
      currentA: n(device.currentA || load.currentA || circuitCurrent(project, load.powerW || 0), 0),
      group: device.group || "General",
      status: device.normativeStatus || "Preliminar"
    };
  });
}
function fromLoads(project){
  const loads = project.loads || [];
  return loads.map((load, index) => {
    const power = n(load.powerW || load.totalPowerW, 0);
    const current = circuitCurrent(project, power);
    const breaker = n(load.breakerA || load.suggestedBreakerA, 0) || suggestBreaker(current) || (String(load.type).toLowerCase().includes("alumbr") ? 10 : 16);
    return {
      numero:index + 1,
      id: load.id || `C-${index+1}`,
      nombre: load.name || `Circuito ${index + 1}`,
      fase: load.phase || phaseFor(project, index),
      aut: `QF${index + 1} 1P+N ${breaker} A curva C`,
      dif: load.differential || "ID 2P 40 A 30 mA tipo A",
      tipo: load.outputType || "1P+N+T",
      conductor: load.suggestedConductor || "Conductor según cálculo",
      w: power,
      currentA: current,
      group: load.type || "General",
      status: "Preliminar"
    };
  });
}
function buildCircuits(project) {
  const panelCircuits = fromPanel(project);
  if(panelCircuits.length) return panelCircuits;
  const loadCircuits = fromLoads(project);
  if(loadCircuits.length) return loadCircuits;
  return [
    { numero:1, id:"RES-1", nombre:"Alumbrado reserva", fase:"R", aut:"QF1 1P+N 10 A curva C", dif:"ID 2P 40 A 30 mA tipo A", tipo:"1P+N+T", conductor:"1,5 mm²", w:0, currentA:0, group:"Alumbrado", status:"Reserva" },
    { numero:2, id:"RES-2", nombre:"Enchufes reserva", fase: project.supplyType === "trifasico" ? "S" : "R", aut:"QF2 1P+N 16 A curva C", dif:"ID 2P 40 A 30 mA tipo A", tipo:"1P+N+T", conductor:"2,5 mm²", w:0, currentA:0, group:"Enchufes", status:"Reserva" }
  ];
}
function t(x,y,text,size=12,anchor="middle",weight="400",fill="#0f172a"){
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-weight="${weight}" fill="${fill}">${esc(text)}</text>`;
}
function wrapText(x, y, text, max=18, size=11){
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [""];
  words.forEach(word => {
    const i = lines.length - 1;
    if((lines[i] + " " + word).trim().length > max) lines.push(word);
    else lines[i] = (lines[i] + " " + word).trim();
  });
  return lines.slice(0,4).map((line, i) => t(x, y + i*(size+3), line, size, "middle", "600")).join("");
}
function symbolMcb(x, y, label="QF 1P+N 16 A curva C"){
  const clean = label.replace(/^QF\d+\s*/i, "").trim();
  const lineA = clean.match(/(\d+\s*A)/i)?.[1] || "16 A";
  const pole = clean.match(/(\dP(?:\+N)?|3P\+N|1P\+N)/i)?.[1] || "1P+N";
  return `<g class="sym sym-mcb" data-buce-symbol="SYM-MCB" data-label="${esc(label)}">
    <line x1="${x}" y1="${y-44}" x2="${x}" y2="${y-23}" stroke="#111827" stroke-width="2.2"/>
    <circle cx="${x}" cy="${y-18}" r="4.8" fill="#fff" stroke="#111827" stroke-width="2"/>
    <path d="M ${x} ${y-18} A 27 27 0 0 1 ${x} ${y+36}" fill="none" stroke="#111827" stroke-width="2.2"/>
    <line x1="${x+1}" y1="${y+9}" x2="${x+44}" y2="${y+9}" stroke="#111827" stroke-width="2.2"/>
    <circle cx="${x}" cy="${y+36}" r="4.8" fill="#fff" stroke="#111827" stroke-width="2"/>
    <line x1="${x}" y1="${y+41}" x2="${x}" y2="${y+66}" stroke="#111827" stroke-width="2.2"/>
    ${t(x+52,y-2,"AUT.",12,"start","900")}
    ${t(x+52,y+16,pole,11,"start","900")}
    ${t(x+52,y+32,lineA,11,"start","900")}
  </g>`;
}
function symbolRcd(x, y, label="ID 2P 40 A 30 mA tipo A"){
  const sens = label.match(/\d+\s*mA/i)?.[0] || "30 mA";
  const amp = label.match(/\d+\s*A/i)?.[0] || "40 A";
  return `<g class="sym sym-rcd" data-buce-symbol="SYM-RCD" data-label="${esc(label)}">
    <rect x="${x-27}" y="${y}" width="54" height="46" rx="2" fill="#fff" stroke="#111827" stroke-width="1.8"/>
    <line x1="${x-27}" y1="${y+46}" x2="${x+27}" y2="${y}" stroke="#111827" stroke-width="1.4"/>
    ${t(x-10,y+19,"P",12,"middle","900")}${t(x+11,y+37,"D",12,"middle","900")}
    ${t(x+41,y+18,amp,10,"start","800")}${t(x+41,y+34,sens,10,"start","800")}
    <line x1="${x}" y1="${y+46}" x2="${x}" y2="${y+92}" stroke="#111827" stroke-width="2.2"/>
  </g>`;
}
function terminalSymbol(x,y,circuit){
  return `<g class="sym sym-output" data-circuit="${esc(circuit.id)}">
    <circle cx="${x}" cy="${y}" r="15" fill="#fff" stroke="#111827" stroke-width="2"/>
    ${t(x,y+5,`C${circuit.numero}`,13,"middle","800")}
    <rect x="${x-54}" y="${y+25}" width="108" height="74" rx="3" fill="#fff" stroke="#64748b" stroke-width="1.3"/>
    ${wrapText(x,y+43,circuit.nombre,18,10)}
    ${t(x,y+80,`${safeRound(circuit.w,0)} W · ${safeRound(circuit.currentA,2)} A`,9,"middle","700","#334155")}
    ${t(x,y+94,circuit.conductor || "Conductor",9,"middle","600","#475569")}
  </g>`;
}
function circuitLabel(circuit){
  return `${circuit.numero}. ${circuit.nombre} · ${circuit.fase} · ${circuit.w} W`;
}
function renderSvg(project, circuits){
  const isThree = project.supplyType === "trifasico";
  const power = totalPower(project.loads || []);
  const totalI = isThree ? currentThreePhase(power) : currentSinglePhase(power);
  const generalA = suggestBreaker(totalI) || 10;
  const panel = project.panelEngine || project.panel || calculatePanelProject(project);
  const nCircuits = Math.max(circuits.length,1);
  const gap = nCircuits <= 3 ? 220 : nCircuits <= 6 ? 185 : nCircuits <= 10 ? 150 : nCircuits <= 16 ? 122 : 98;
  const margin = 150;
  const groupWidth = (nCircuits - 1) * gap;
  const width = Math.max(980, groupWidth + margin*2);
  const height = 760;
  const centerX = width/2;
  const firstX = centerX - groupWidth/2;
  const lastX = centerX + groupWidth/2;
  const busY = 205;
  const outY = 570;
  const busStart = nCircuits === 1 ? centerX - 75 : firstX;
  const busEnd = nCircuits === 1 ? centerX + 75 : lastX;
  const generalLabel = isThree ? `IGA 3P+N ${generalA} A curva C` : `IGA 1P+N ${generalA} A curva C`;
  const barLabel = panel?.bars?.[0]?.label || (isThree ? "Barra repartidora tetrapolar" : "Barra repartidora bipolar");
  let svg = `<svg id="svgUnilineal" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="background:#fff;border:1px solid #cbd5e1;border-radius:14px">`;
  svg += `<defs><style>.unilineal-title{font-family:Arial,sans-serif}.thin{stroke:#111827;stroke-width:2;fill:none}.bus{stroke:#111827;stroke-width:3.2}.note{font-family:Arial,sans-serif;font-size:10px;fill:#475569}</style></defs>`;
  svg += `<rect x="48" y="48" width="${width-96}" height="${height-96}" fill="none" stroke="#94a3b8" stroke-dasharray="6 5"/>`;
  svg += t(centerX,32,"Diagrama Unilineal Automático",17,"middle","900");
  svg += t(78,84,project.name || "Proyecto sin nombre",15,"start","900");
  svg += t(78,110,`Cliente: ${project.client || "Sin cliente"}`,12,"start","700");
  svg += t(78,134,`Sistema: ${isThree ? "Trifásico 3F+N+T" : "Monofásico 1F+N+T"} · Potencia: ${safeRound(power/1000,2)} kW · Corriente: ${safeRound(totalI,2)} A`,12,"start","700");
  svg += `<line x1="${centerX}" y1="50" x2="${centerX}" y2="58" class="thin"/>`;
  svg += symbolMcb(centerX,104,generalLabel);
  svg += `<line x1="${centerX}" y1="170" x2="${centerX}" y2="${busY}" class="thin"/>`;
  svg += `<line x1="${busStart}" y1="${busY}" x2="${busEnd}" y2="${busY}" class="bus"/>`;
  svg += t(Math.min(width-210, centerX + Math.max(180, groupWidth/2)), busY-28, barLabel, 13, "middle", "900");
  if(isThree){ svg += t(busEnd+30,busY-16,"R",13,"middle","900") + t(busEnd+52,busY-16,"S",13,"middle","900") + t(busEnd+74,busY-16,"T",13,"middle","900"); }
  else svg += t(busEnd+32,busY-16,"R",13,"middle","900");
  svg += `<line x1="28" y1="${outY-70}" x2="65" y2="${outY-70}" class="thin"/><line x1="${width-65}" y1="${outY-70}" x2="${width-28}" y2="${outY-70}" class="thin"/>`;
  svg += t(45,outY-86,"T.P",12,"middle","900") + t(width-45,outY-86,"T.S",12,"middle","900");
  svg += `<path d="M 25 ${outY-58} l -15 15 M 36 ${outY-58} l -15 15 M ${width-25} ${outY-58} l 15 15 M ${width-36} ${outY-58} l 15 15" stroke="#111827"/>`;
  circuits.forEach((c, i) => {
    const x = firstX + i*gap;
    svg += t(x-15,busY+19,c.fase,18,"middle","900");
    svg += `<line x1="${x}" y1="${busY}" x2="${x}" y2="${busY+72}" class="thin"/>`;
    svg += symbolMcb(x,busY+98,c.aut);
    svg += symbolRcd(x,busY+220,c.dif);
    svg += terminalSymbol(x,outY,c);
  });
  svg += `<text x="75" y="${height-78}" class="note">Generado desde Proyecto Activo, Motor de Tableros y BUCE. Diagrama preliminar; revisar antes de declarar o imprimir.</text>`;
  svg += `<text x="75" y="${height-56}" class="note">La línea principal termina automáticamente en el último circuito y el IGA queda centrado respecto del conjunto.</text>`;
  svg += `</svg>`;
  return `<div class="svg-scroll v951-scroll">${svg}</div>`;
}
function table(circuits){
  return `<div class="table-scroll"><table><thead><tr><th>N°</th><th>Circuito</th><th>Fase</th><th>Automático</th><th>Diferencial</th><th>Conductor</th><th>Estado</th></tr></thead><tbody>${circuits.map(c=>`<tr><td>${c.numero}</td><td>${esc(c.nombre)}</td><td>${esc(c.fase)}</td><td>${esc(c.aut)}</td><td>${esc(c.dif)}</td><td>${esc(c.conductor)}</td><td>${esc(c.status)}</td></tr>`).join("")}</tbody></table></div>`;
}
function downloadSvg(project){
  const svg = document.getElementById("svgUnilineal");
  if(!svg) return alert("No hay unilineal para descargar.");
  const blob = new Blob([svg.outerHTML], { type:"image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href=url; a.download=`unilineal_${idSafe(project.name || "giae")}.svg`; a.click(); URL.revokeObjectURL(url);
}
function downloadPng(project){
  const svg = document.getElementById("svgUnilineal");
  if(!svg) return alert("No hay unilineal para exportar.");
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const img = new Image();
  const blob = new Blob([source], {type:"image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const viewBox = svg.getAttribute("viewBox").split(/\s+/).map(Number);
    canvas.width = Math.min(3600, Math.max(1600, viewBox[2]*2));
    canvas.height = Math.round(canvas.width * viewBox[3] / viewBox[2]);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    canvas.toBlob(png => { const a=document.createElement("a"); a.href=URL.createObjectURL(png); a.download=`unilineal_${idSafe(project.name || "giae")}.png`; a.click(); URL.revokeObjectURL(a.href); }, "image/png");
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
export function render(host, state){
  recalculateProject();
  const project = state.currentProject;
  const circuits = buildCircuits(project);
  host.innerHTML = `<section class="module-window unilineal-view unilineal-v951">
    <div class="workspace-title-row"><div><p class="eyebrow">PASO 5 · Diagrama unilineal</p><h3>Diagrama unilineal</h3><p>GIAE arma el unilineal desde las cargas, protecciones, tablero y tierra del proyecto.</p></div><div class="status-strip"><span>${circuits.length} circuitos</span><span>Sincronizado con cuadro de carga</span></div></div>
    ${project.loads?.length ? "" : `<div class="result-box danger"><strong>Sin cargas reales:</strong> se muestran circuitos de reserva para verificar el formato del plano.</div>`}
    <div class="module-toolbar"><button id="regenUnilinealBtn" class="primary-action">Regenerar desde proyecto</button><button id="continueToConnectionTop" class="primary-action">Continuar a empalme</button></div>
    <div class="diagram-panel">${renderSvg(project,circuits)}</div>
    ${table(circuits)}
    <div class="dashboard-card next-step-card"><div class="section-title-row"><div><h4>Unilineal listo</h4><p>El siguiente paso es definir el empalme a contratar con la potencia y corriente calculadas.</p></div><button id="continueToConnection" class="primary-action">Continuar a empalme</button></div></div>
    <details class="normative-details"><summary>Trazabilidad</summary><ul><li>Proyecto Activo: cargas y sistema de suministro.</li><li>Motor de Tableros: dispositivos, barras y gabinete.</li><li>BUCE: símbolos y componentes reutilizables.</li><li>Estado: diagrama preliminar sujeto a revisión profesional.</li></ul></details>
  </section>`;
  host.querySelector("#regenUnilinealBtn").addEventListener("click",()=>{ recalculateProject(); addHistory("Unilineal regenerado desde Proyecto Activo", "Unilineal", false); persist(); render(host,state); });
  host.querySelector("#downloadSvgBtn")?.addEventListener("click",()=>downloadSvg(project));
  host.querySelector("#downloadPngBtn")?.addEventListener("click",()=>downloadPng(project));
  host.querySelector("#printBtn")?.addEventListener("click",()=>window.print());
  const goToConnection = () => window.GIAE?.openModule?.("empalme");
  host.querySelector("#continueToConnectionTop")?.addEventListener("click", goToConnection);
  host.querySelector("#continueToConnection")?.addEventListener("click", goToConnection);
}

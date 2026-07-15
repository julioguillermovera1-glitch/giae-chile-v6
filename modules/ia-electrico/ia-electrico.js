import { analyzeElectricalProject, buildAdvice, buildFriendlyResponse, formatEngineStatus, buildProjectReport, rememberIaInteraction } from "../../core/ia/iaEngine.js";
import { buildPdfBlob } from "../../core/reportEngine.js";
import { buildCadFromProject } from "../../core/cad/cadEngine.js";
import { persist, addHistory } from "../../core/store.js";

const messages = {
  help: "Solicita un diagnóstico rápido del proyecto actual, valida cargas, protecciones, conductores y normas RIC.",
  prompt: "Describe qué quieres que revise: cargas, protecciones, caída de tensión, materiales, o si necesitas un plano eléctrico preliminar.",
  noProject: "No hay proyecto activo. Abre un proyecto o crea uno nuevo en el módulo de proyectos para usar el asistente." 
};

function esc(value = ""){
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function renderStatusCard(engine){
  return `
    <section class="admin-card ia-status-card">
      <h4>${esc(engine.title)}</h4>
      <p>${esc(engine.description)}</p>
      <ul>${engine.capabilities.map(item => `<li>${esc(item)}</li>`).join("")}</ul>
    </section>`;
}

async function analyze(host, state, userRequest = ""){
  const project = state.currentProject;
  if(!project) return { response: "", advice: null, report: null };
  if(!userRequest) userRequest = host.querySelector("#iaPrompt")?.value.trim() || "";
  // Provide quick feedback in the details area while computing
  host.querySelector("#iaDetails").innerHTML = `<div class="notice-list"><article class="notice-line info">Analizando proyecto...</article></div>`;
  try {
    const { electrical, normative } = await analyzeElectricalProject(project);
    const advice = buildAdvice(project, electrical, normative);
    let response = buildFriendlyResponse(project, advice);
    if(userRequest) response = `Solicitud: ${userRequest}\n\n${response}`;
    // Update details panel
    host.querySelector("#iaDetails").innerHTML = `
      <div class="notice-list">
        <article class="notice-line ok"><strong>Estado:</strong> ${esc(advice.electricalStatus)}</article>
        <article class="notice-line ${advice.normativeStatus === "no_cumple" ? "danger" : advice.normativeStatus === "requiere_revision" ? "warn" : "ok"}"><strong>Normativa:</strong> ${esc(advice.normativeStatus)}</article>
      </div>
      <h5>Protecciones sugeridas</h5>
      <ul>${advice.details.protections.map(item => `<li>${esc(item.label)} (${esc(item.ampere)} A, ${esc(item.curve)})</li>`).join("")}</ul>
      <h5>Conductores y caída de tensión</h5>
      <ul>${advice.details.conductors.map(item => `<li>${esc(item.label)}: Iz=${esc(item.izA)} A, caída=${esc(item.voltageDropPercent)}%</li>`).join("")}</ul>
      <h5>Canalizaciones</h5>
      <ul>${advice.details.conduits.map(item => `<li>${esc(item.label)} (${esc(item.lengthM)} m)</li>`).join("")}</ul>
    `;
    addHistory("Revisión IA eléctrica ejecutada", "Asistente IA", false);
    persist();
    const report = buildProjectReport(project, advice, userRequest);
    return { response, advice, report };
  } catch (error) {
    console.error(error);
    host.querySelector("#iaDetails").innerHTML = "";
    return { response: "Error al analizar el proyecto. Revisa la consola del navegador.", advice: null, report: null };
  }
}

function downloadFile(content, fileName, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function generateReport(host, state) {
  const project = state.currentProject;
  if(!project) return;
  const userRequest = host.querySelector("#iaPrompt").value.trim();
  host.querySelector("#iaResponse").textContent = "Generando informe técnico...";
  try {
    const result = await analyze(host, state, userRequest);
    const advice = result?.advice;
    const report = result?.report;
    if(advice && report){
      rememberIaInteraction(project, userRequest, advice, report);
      persist();
    } else {
      throw new Error('No se pudo generar el informe: análisis fallido');
    }
    downloadFile(report.markdown, `${report.metadata.title}.md`, "text/markdown");
    host.querySelector("#iaResponse").textContent = `Informe técnico generado y descargado: ${report.metadata.title}.md`;
    host.querySelector("#iaDetails").innerHTML = `
      <div class="notice-list">
        <article class="notice-line ok"><strong>Informe:</strong> ${esc(report.metadata.title)}</article>
        <article class="notice-line ok"><strong>Tipo:</strong> ${esc(report.metadata.type)}</article>
        <article class="notice-line ok"><strong>Normativa:</strong> DS8, RIC, IEC</article>
      </div>
    `;
    addHistory("Generado informe técnico IA", "Asistente IA", false);
  } catch (error) {
    console.error(error);
    host.querySelector("#iaResponse").textContent = "Error al generar el informe. Revisa la consola del navegador.";
  }
}

async function generateReportHtml(host, state) {
  const project = state.currentProject;
  if(!project) return;
  const userRequest = host.querySelector("#iaPrompt").value.trim();
  host.querySelector("#iaResponse").textContent = "Generando informe técnico HTML...";
  try {
    const result = await analyze(host, state, userRequest);
    const advice = result?.advice;
    const report = result?.report;
    if(advice && report){
      rememberIaInteraction(project, userRequest, advice, report);
      persist();
      downloadFile(report.html, `${report.metadata.title}.html`, "text/html");
    } else {
      throw new Error('No se pudo generar el informe HTML: análisis fallido');
    }
    host.querySelector("#iaResponse").textContent = `Informe técnico HTML generado y descargado: ${report.metadata.title}.html`;
    host.querySelector("#iaDetails").innerHTML = `
      <div class="notice-list">
        <article class="notice-line ok"><strong>Informe:</strong> ${esc(report.metadata.title)}</article>
        <article class="notice-line ok"><strong>Tipo:</strong> ${esc(report.metadata.type)}</article>
        <article class="notice-line ok"><strong>Normativa:</strong> DS8, RIC, IEC</article>
      </div>
    `;
    addHistory("Generado informe técnico IA HTML", "Asistente IA", false);
  } catch (error) {
    console.error(error);
    host.querySelector("#iaResponse").textContent = "Error al generar el informe HTML. Revisa la consola del navegador.";
  }
}

async function generateReportPdf(host, state) {
  const project = state.currentProject;
  if(!project) return;
  const userRequest = host.querySelector("#iaPrompt").value.trim();
  host.querySelector("#iaResponse").textContent = "Generando informe técnico PDF...";
  try {
    const result = await analyze(host, state, userRequest);
    const advice = result?.advice;
    const report = result?.report;
    if(advice && report){
      const pdfBlob = buildPdfBlob(report);
      rememberIaInteraction(project, userRequest, advice, report);
      persist();
      downloadFile(pdfBlob, `${report.metadata.title}.pdf`, "application/pdf");
    } else {
      throw new Error('No se pudo generar el informe PDF: análisis fallido');
    }
    host.querySelector("#iaResponse").textContent = `Informe técnico PDF generado y descargado: ${report.metadata.title}.pdf`;
    host.querySelector("#iaDetails").innerHTML = `
      <div class="notice-list">
        <article class="notice-line ok"><strong>Informe:</strong> ${esc(report.metadata.title)}</article>
        <article class="notice-line ok"><strong>Tipo:</strong> ${esc(report.metadata.type)}</article>
        <article class="notice-line ok"><strong>Normativa:</strong> DS8, RIC, IEC</article>
      </div>
    `;
    addHistory("Generado informe técnico IA PDF", "Asistente IA", false);
  } catch (error) {
    console.error(error);
    host.querySelector("#iaResponse").textContent = "Error al generar el informe PDF. Revisa la consola del navegador.";
  }
}

function generatePreliminaryCad(host, state) {
  const project = state.currentProject;
  if(!project) return;
  project.cad2d = buildCadFromProject(project);
  addHistory("Generado plano eléctrico preliminar", "Asistente IA", false);
  persist();
  host.querySelector("#iaResponse").textContent = "Plano eléctrico preliminar generado. Abre el módulo CAD para revisarlo y ajustarlo.";
  host.querySelector("#iaDetails").innerHTML = "";
}

export function render(host, state){
  const engine = formatEngineStatus();
  const project = state.currentProject;
  const projectSummary = project ? `${esc(project.name)} · ${esc(project.distributor)} · ${esc(project.supplyType)}` : "Sin proyecto activo";

  host.innerHTML = `
    <section class="module-window ia-module">
      <div class="module-head">
        <div>
          <p class="eyebrow">Asistente Eléctrico</p>
          <h3>IA especializada en electricidad</h3>
          <p>Motor local que razona con cálculos de cargas, RIC y reglas normativas chilenas. Gratuito y sin llamar a servicios externos.</p>
        </div>
      </div>

      <div class="admin-card ia-summary-card">
        <h4>Proyecto activo</h4>
        <p>${projectSummary}</p>
        <p class="small-note">Utiliza este asistente sobre el proyecto abierto en el sistema. Actualiza las cargas y la información del proyecto antes de ejecutar la revisión.</p>
      </div>

      ${renderStatusCard(engine)}

      <section class="admin-card">
        <h4>Interacción con la IA</h4>
        <p>${esc(messages.help)}</p>
        <div id="iaChat">
          <div id="iaChatMessages" class="chat-messages" aria-live="polite"></div>
          <textarea id="iaPrompt" rows="3" placeholder="${esc(messages.prompt)}"></textarea>
        </div>
        <div class="button-row">
          <button class="primary" id="iaAnalyzeBtn">Analizar proyecto</button>
          <button class="primary ghost" id="iaSendBtn">Enviar</button>
          <button class="secondary" id="iaClearConversation">Borrar conversación</button>
          <button class="secondary" id="iaReportBtn">Generar informe Markdown</button>
          <button class="secondary" id="iaReportHtmlBtn">Generar informe HTML</button>
          <button class="secondary" id="iaReportPdfBtn">Generar informe PDF</button>
          <button class="secondary" id="iaCadBtn">Generar plano CAD preliminar</button>
          <button class="secondary" id="iaClearBtn">Limpiar respuesta</button>
        </div>
      </section>

      <section class="admin-card ia-response-card">
        <h4>Respuesta del asistente</h4>
        <div id="iaResponse" class="result-box">Pulsa "Analizar proyecto" para obtener el diagnóstico.</div>
      </section>

      <section class="admin-card ia-details-card">
        <h4>Detalles técnicos</h4>
        <div id="iaDetails"></div>
      </section>
    </section>
  `;

  host.querySelector("#iaAnalyzeBtn").addEventListener("click", async () => {
    const result = await analyze(host, state);
    if(result && result.response) host.querySelector("#iaResponse").textContent = result.response;
  });
  host.querySelector("#iaSendBtn").addEventListener("click", () => sendPrompt(host, state));
  host.querySelector("#iaReportBtn").addEventListener("click", () => generateReport(host, state));
  host.querySelector("#iaReportHtmlBtn").addEventListener("click", () => generateReportHtml(host, state));
  host.querySelector("#iaReportPdfBtn").addEventListener("click", () => generateReportPdf(host, state));
  host.querySelector("#iaCadBtn").addEventListener("click", () => generatePreliminaryCad(host, state));
  host.querySelector("#iaClearBtn").addEventListener("click", () => {
    host.querySelector("#iaResponse").textContent = "Pulsa \"Analizar proyecto\" para obtener el diagnóstico.";
    host.querySelector("#iaDetails").innerHTML = "";
    host.querySelector("#iaPrompt").value = "";
  });
  host.querySelector("#iaClearConversation")?.addEventListener("click", () => clearConversation(host, state));

  // Chat behavior: Enter to send, Shift+Enter for newline; Ctrl/Cmd+Enter also sends
  const promptEl = host.querySelector("#iaPrompt");
  if(promptEl){
    promptEl.addEventListener("keydown", (ev) => {
      if(ev.key === "Enter" && !ev.shiftKey){
        ev.preventDefault();
        sendPrompt(host, state);
        return;
      }
      if(ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)){
        ev.preventDefault();
        sendPrompt(host, state);
      }
    });
  }

  // Restore previous history messages for project
  const project = state.currentProject;
  if(project && Array.isArray(project.iaMemory)){
    project.iaMemory.slice().reverse().forEach(entry => {
      appendMessage(host, 'user', entry.request || 'Diagnóstico general');
      appendMessage(host, 'assistant', entry.summary || entry.report || 'Respuesta IA anterior');
    });
  }
}

function appendMessage(host, role, text){
  const container = host.querySelector('#iaChatMessages');
  if(!container) return;
  const msg = document.createElement('div');
  msg.className = `chat-message ${role}`;
  msg.innerHTML = `<div class="bubble"><pre>${esc(String(text))}</pre></div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

async function sendPrompt(host, state){
  const promptEl = host.querySelector('#iaPrompt');
  if(!promptEl) return;
  const text = promptEl.value.trim();
  if(!text) return;
  appendMessage(host, 'user', text);
  promptEl.value = '';
  appendMessage(host, 'assistant', '...');
  const result = await analyze(host, state, text);
  const response = result?.response || '';
  // replace last assistant '...' with actual response
  const container = host.querySelector('#iaChatMessages');
  if(container){
    const last = container.querySelector('.chat-message.assistant:last-child');
    if(last) last.innerHTML = `<div class="bubble"><pre>${esc(String(response))}</pre></div>`;
  }
  // remember interaction in project memory
  try{
    const project = state.currentProject;
    if(result && result.advice && result.report){
      rememberIaInteraction(project, text, result.advice, result.report);
      persist();
    }
  }catch(e){ /* ignore memory failures */ }
}

function clearConversation(host, state){
  const project = state.currentProject;
  if(project && Array.isArray(project.iaMemory)){
    if(!confirm('Borrar historial de conversación IA del proyecto?')) return;
    project.iaMemory = [];
    persist();
  }
  const container = host.querySelector('#iaChatMessages');
  if(container) container.innerHTML = '';
  host.querySelector('#iaResponse').textContent = 'Pulsa "Analizar proyecto" para obtener el diagnóstico.';
  host.querySelector('#iaDetails').innerHTML = '';
}

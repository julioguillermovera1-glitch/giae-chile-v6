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

async function analyze(host, state){
  const project = state.currentProject;
  if(!project) return;
  const userRequest = host.querySelector("#iaPrompt").value.trim();
  host.querySelector("#iaResponse").textContent = "Analizando proyecto...";
  try {
    const { electrical, normative } = await analyzeElectricalProject(project);
    const advice = buildAdvice(project, electrical, normative);
    let response = buildFriendlyResponse(project, advice);
    if(userRequest) response = `Solicitud: ${userRequest}\n\n${response}`;
    host.querySelector("#iaResponse").textContent = response;
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
  } catch (error) {
    console.error(error);
    host.querySelector("#iaResponse").textContent = "Error al analizar el proyecto. Revisa la consola del navegador.";
    host.querySelector("#iaDetails").innerHTML = "";
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
    const { electrical, normative } = await analyzeElectricalProject(project);
    const advice = buildAdvice(project, electrical, normative);
    const report = buildProjectReport(project, advice, userRequest);
    rememberIaInteraction(project, userRequest, advice, report);
    persist();
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
    const { electrical, normative } = await analyzeElectricalProject(project);
    const advice = buildAdvice(project, electrical, normative);
    const report = buildProjectReport(project, advice, userRequest);
    rememberIaInteraction(project, userRequest, advice, report);
    persist();
    downloadFile(report.html, `${report.metadata.title}.html`, "text/html");
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
    const { electrical, normative } = await analyzeElectricalProject(project);
    const advice = buildAdvice(project, electrical, normative);
    const report = buildProjectReport(project, advice, userRequest);
    const pdfBlob = buildPdfBlob(report);
    rememberIaInteraction(project, userRequest, advice, report);
    persist();
    downloadFile(pdfBlob, `${report.metadata.title}.pdf`, "application/pdf");
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

async function generateChatResponse(userMessage, state) {
  const msg = userMessage.toLowerCase();
  const project = state.currentProject;

  // Saludos
  if (msg.match(/hola|hi|hey|buenos/i)) {
    return "¡Hola! 👋 Soy tu asistente eléctrico especializado en normativa chilena. Puedo ayudarte con cálculos de cargas, protecciones, conductores, caída de tensión, y todo lo relacionado con RIC e IEC. ¿Qué necesitas?";
  }

  // Sobre el proyecto actual
  if (msg.match(/proyecto|proyecto activo|estado del proyecto/i)) {
    if (project) {
      return `Tu proyecto actual es: **${project.name || 'Sin nombre'}** (${project.supplyType} - ${project.distributor}). Tienes ${project.loads?.length || 0} cargas registradas. ¿Necesitas analizar algo específico?`;
    }
    return "No tienes un proyecto activo. Crea uno primero en el módulo Proyecto para que pueda ayudarte con el análisis.";
  }

  // Sobre cargas
  if (msg.match(/carga|cargas|circuito|circuitos/i)) {
    return "Las cargas son los aparatos eléctricos que consumen energía. Para dimensionar bien el proyecto necesito:\n- Potencia de cada carga (W o kW)\n- Tipo (monofásica, trifásica)\n- Factor de potencia (generalmente 0.9 o 1.0)\n\n¿Tienes esos datos para que los ingresemos?";
  }

  // Sobre protecciones
  if (msg.match(/protección|protecciones|breaker|disyuntor|fusible/i)) {
    return "Las protecciones (breakers/disyuntores) protegen contra sobrecarga y cortocircuito. Se dimensionan según:\n- Corriente máxima de la carga (Iz)\n- Tipo de curva (C, D, K según norma RIC)\n- Calibre comercial disponible\n\nLa corriente Iz se calcula: Iz = P / (√3 × V × cosφ)\n\n¿Qué carga necesitas proteger?";
  }

  // Sobre conductores
  if (msg.match(/conductor|cable|sección|mm²|awg/i)) {
    return "Los conductores transportan la corriente. Se dimensionan considerando:\n- Corriente (Iz en amperes)\n- Caída de tensión máxima (3% en ramales, 5% total)\n- Método de instalación (en canaleta, enterrado, aéreo, etc.)\n\nTabla RIC IEC: Para 10A → 2.5mm² Cu, 15A → 4mm², 20A → 6mm², etc.\n\n¿Qué corriente debes transportar?";
  }

  // Sobre tierra/puesta a tierra
  if (msg.match(/tierra|puesta a tierra|electrodo|tp|ts|atterraggio/i)) {
    return "La puesta a tierra (TP/TS) protege a las personas ante fallas. Según RIC:\n- **TP**: Tierra de Protección (neutro del transformador)\n- **TS**: Tierra de Servicio (cuerpo del cliente)\n- Resistencia máxima: ≤ 10Ω para vivienda, ≤ 5Ω para industria\n\n¿Es para una vivienda, negocio o industria?";
  }

  // Sobre normativa RIC
  if (msg.match(/ric|norma|normativa|regulación/i)) {
    return "La **RIC (Reglamento de Instalaciones de Consumo)** es la norma obligatoria en Chile. Complementada con:\n- **IEC 60364**: Instalaciones eléctricas (internacional)\n- **DS Nº 8**: Requisitos de eficiencia energética\n- **NCh 4/2003**: Código eléctrico chileno\n\n¿Necesitas saber requisitos específicos de una instalación?";
  }

  // Sobre caída de tensión
  if (msg.match(/caída|caída de tensión|voltaje|tensión/i)) {
    return "La caída de tensión es la pérdida de voltaje en el conductor por su resistencia.\n\nFórmula: ΔV% = (100 × ρ × I × L) / (S × V)\nDonde: ρ=resistividad, I=corriente, L=longitud, S=sección, V=voltaje\n\n**Límites RIC:**\n- 3% en ramales desde cuadro secundario\n- 5% máximo total desde cuadro principal\n\n¿Qué distancia y corriente tienes?";
  }

  // Sobre empalme
  if (msg.match(/empalme|rIC 1|rIC1|conexión a red/i)) {
    return "El **Empalme (RIC 1)** es la conexión del cliente con la red de distribución. Requisitos:\n- Debe ser realizado por instalador SEC autorizado\n- Voltaje: 220V monofásico o 380V trifásico (según disponibilidad)\n- Seccionador con llave de corte de emergencia\n- Protección general y medidor de energía\n\n¿Qué tipo de empalme necesitas (monofásico o trifásico)?";
  }

  // Respuesta por defecto (conversacional)
  return "Interesante pregunta sobre electricidad. 🔌 Tengo conocimiento en:\n- Cálculo de cargas y dimensionamiento\n- Protecciones (breakers, fusibles)\n- Conductores y caída de tensión\n- Puesta a tierra (TP/TS)\n- Normativa RIC, IEC y DS Nº8\n- Empalmes a red\n\nTambién puedo ayudarte a analizar tu proyecto si tienes uno abierto. ¿Hay algo específico en lo que pueda ayudarte?";
}

export function render(host, state) {
  if(!state.iaChatHistory) state.iaChatHistory = [];
  const chatMessages = state.iaChatHistory.map(msg => `
    <div class="chat-message ${msg.role}">
      <div class="chat-bubble">${esc(msg.text)}</div>
    </div>
  `).join("");

  host.innerHTML = `
    <section class="module-window ia-chat-module">
      <div class="ia-chat-container">
        <div id="iaChatMessages" class="ia-chat-messages">
          ${chatMessages || '<div class="chat-message system"><div class="chat-bubble">Hola 👋 Soy tu asistente eléctrico. Puedo ayudarte con normativa RIC, IEC, caídas de tensión, protecciones, conductores y más. ¿Qué necesitas?</div></div>'}
        </div>
        <div class="ia-chat-input-area">
          <input id="iaChatInput" type="text" placeholder="Escribe tu pregunta sobre electricidad..." autocomplete="off">
          <button id="iaChatSendBtn" class="primary">Enviar</button>
        </div>
      </div>
    </section>
  `;

  const inputEl = host.querySelector("#iaChatInput");
  const sendBtn = host.querySelector("#iaChatSendBtn");
  const messagesContainer = host.querySelector("#iaChatMessages");

  const sendMessage = async () => {
    const text = inputEl.value.trim();
    if(!text) return;
    
    inputEl.value = "";
    inputEl.disabled = true;
    sendBtn.disabled = true;

    // Add user message
    state.iaChatHistory.push({ role: "usuario", text });
    const userBubble = document.createElement("div");
    userBubble.className = "chat-message usuario";
    userBubble.innerHTML = `<div class="chat-bubble">${esc(text)}</div>`;
    messagesContainer.appendChild(userBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Generate AI response
    try {
      const response = await generateChatResponse(text, state);
      state.iaChatHistory.push({ role: "asistente", text: response });
      const aiBubble = document.createElement("div");
      aiBubble.className = "chat-message asistente";
      aiBubble.innerHTML = `<div class="chat-bubble">${esc(response)}</div>`;
      messagesContainer.appendChild(aiBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      persist();
    } catch(e) {
      console.error(e);
      const errorBubble = document.createElement("div");
      errorBubble.className = "chat-message asistente";
      errorBubble.innerHTML = `<div class="chat-bubble">Lo siento, hubo un error. Intenta de nuevo.</div>`;
      messagesContainer.appendChild(errorBubble);
    }

    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
  };

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keypress", (e) => {
    if(e.key === "Enter") sendMessage();
  });
  inputEl.focus();
}

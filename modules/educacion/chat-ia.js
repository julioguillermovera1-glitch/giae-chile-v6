import { persist, addHistory } from "../../core/store.js";

// Base de conocimiento sobre instalaciones eléctricas (RIC, Decreto Ley 8, IEC)
const knowledgeBase = {
  ric: {
    "1": "Empalme: Punto de conexión entre red distribuidora e instalación del usuario.",
    "2": "Protecciones: Interruptores automáticos y diferenciales según IEC 60898 y 61008.",
    "3": "Conductores: Selección por corriente admisible (Iz) según IEC 60227 y 60228.",
    "4": "Canalizaciones: Tuberías, ductos, bandejas según tipo de instalación.",
    "5": "Puesta a tierra: Sistema TN-C-S con electrodo según IEC 61936.",
    "6": "Tierras de protección: Medición de resistencia ≤ 10Ω para viviendas, ≤ 5Ω para industria.",
    "7": "Instalación de baja tensión: Diseño, materiales y verificación completa.",
    "8": "Generadores y UPS: Instalación de equipos de emergencia.",
    "9": "Instalaciones solares fotovoltaicas: Sistemas conectados a red y aislados.",
    "10": "Instalaciones de energías renovables: Eólica y otras fuentes.",
    "11": "Instalaciones especiales: Piscinas, saunas, locales húmedos.",
    "12": "Instalaciones temporales: Ferias, eventos y construcción.",
    "13": "Instalaciones para discapacitados: Requisitos específicos de acceso.",
    "14": "Alumbrado público: Redes de distribución urbana.",
    "15": "Sistemas de control y automatización: Domótica e industria.",
    "16": "Telecomunicaciones: Cableado de datos y voz.",
    "17": "Certificación de instaladores: TE1, TE2, TE3 SEC.",
    "18": "Seguridad y protección contra accidentes: Protección contra caídas.",
    "19": "Inspección y verificación: Procedimientos finales de certificación."
  }
};

// Análisis del proyecto actual - MÁS PROFUNDO
function analyzeProjectContext(project) {
  if (!project) return { hasProject: false, summary: "Sin proyecto activo" };
  
  // Leer datos del proyecto - usando los nombres correctos del estado
  const cargas = project.loads || project.cargas || [];  // "loads" es el nombre correcto en store.js
  const quadro = project.quadro || project.quad || {};
  const empalme = project.empalme || project.breaker || {};
  const tierra = project.tierra || project.ground || {};
  
  // Calcular totales
  let totalPower = 0;
  let demandaPower = 0;
  let errors = [];
  
  // Analizar cargas
  cargas.forEach((carga, idx) => {
    const potencia = parseFloat(carga.potencia) || parseFloat(carga.power) || 0;
    const demanda = parseFloat(carga.demanda) || parseFloat(carga.demand) || potencia;
    totalPower += potencia;
    demandaPower += demanda;
    
    // Detectar errores en cargas
    if (carga.proteccion && carga.conductor) {
      const iz = parseFloat(carga.iz) || 0;
      const protection = parseFloat(carga.proteccion.split(" ")[1]) || 0;
      if (protection > iz) {
        errors.push(`Carga ${idx + 1}: Protección ${carga.proteccion} supera Iz ${iz}A`);
      }
    }
    
    // Detectar voltaje caído alto
    if (carga.deltaV) {
      const dv = parseFloat(carga.deltaV);
      if (dv > 3) {
        errors.push(`Carga ${idx + 1}: Caída de tensión ${dv.toFixed(2)}% > 3% (máximo permitido)`);
      }
    }
  });
  
  const analysis = {
    hasProject: true,
    name: project.name || "Sin nombre",
    client: project.client || project.customer || "No especificado",
    distributor: project.distributor || project.utility || "No especificada",
    supplyType: project.supplyType || project.supply || "No especificado",
    hasCargas: cargas.length > 0,
    hasQuadro: Object.keys(quadro).length > 0,
    hasEmpalme: !!empalme.proteccion || !!empalme.protection,
    hasTierra: !!tierra.resistance || !!tierra.ohms,
    circuitCount: cargas.length,
    totalPower: totalPower / 1000,  // Convertir a kW
    demandaPower: demandaPower / 1000,  // Convertir a kW
    cargas: cargas,
    quadro: quadro,
    empalme: empalme,
    tierra: tierra,
    errors: errors
  };
  
  return analysis;
}

// Respuesta contextual con análisis del proyecto
function buildIaResponse(userMessage, project) {
  const lower = userMessage.toLowerCase();
  const projectAnalysis = analyzeProjectContext(project);
  
  // ANÁLISIS DEL PROYECTO
  if (lower.includes("analiz") || lower.includes("cómo va") || lower.includes("diagnostico") || lower.includes("diagnóstico")) {
    let response = `**Análisis del proyecto "${projectAnalysis.name}"**\n\n`;
    
    if (!projectAnalysis.hasProject) {
      return {
        response: "No hay proyecto activo. Abre o crea un proyecto para que pueda analizarlo y ayudarte.",
        confidence: 0.95
      };
    }
    
    response += `📋 **Cliente:** ${projectAnalysis.client}\n`;
    response += `🏢 **Distribuidora:** ${projectAnalysis.distributor}\n`;
    response += `⚡ **Suministro:** ${projectAnalysis.supplyType}\n`;
    response += `💡 **Demanda total:** ${projectAnalysis.totalPower.toFixed(2)} kW\n\n`;
    
    response += `**Estado del proyecto:**\n`;
    response += `${projectAnalysis.hasCargas ? "✅" : "❌"} Cargas ingresadas (${projectAnalysis.circuitCount} circuitos)\n`;
    response += `${projectAnalysis.hasQuadro ? "✅" : "❌"} Cuadro de carga calculado\n`;
    response += `${projectAnalysis.hasEmpalme ? "✅" : "❌"} Empalme configurado\n`;
    response += `${projectAnalysis.hasTierra ? "✅" : "❌"} Puesta a tierra medida\n\n`;
    
    response += `¿Qué necesitas revisar o corregir?`;
    
    return { response, confidence: 0.95 };
  }
  
  // RECOMENDACIONES PARA CARGAS
  if ((lower.includes("cargas") || lower.includes("demanda") || lower.includes("circuitos")) && projectAnalysis.hasProject) {
    let response = `**Análisis de cargas del proyecto**\n\n`;
    
    if (!projectAnalysis.hasCargas) {
      response += `⚠️ Aún no hay cargas ingresadas. Necesitas:\n`;
      response += `1. Ir al módulo "Cargas"\n`;
      response += `2. Ingresar todos los circuitos\n`;
      response += `3. Especificar potencia y factor de carga\n\n`;
    } else {
      response += `Total de circuitos: ${projectAnalysis.circuitCount}\n`;
      response += `Demanda total: ${projectAnalysis.totalPower.toFixed(2)} kW\n\n`;
      response += `Recomendaciones RIC 1:\n`;
      response += `• Potencia debe incluir factor de simultaneidad\n`;
      response += `• Revisar tipo de suministro según demanda\n`;
      response += `• Validar con distribuidora\n`;
    }
    
    return { response, confidence: 0.9 };
  }
  
  // RECOMENDACIONES PARA EMPALME - CON ANÁLISIS DEL PROYECTO
  if ((lower.includes("empalme") || lower.includes("conexion") || lower.includes("disyuntor")) && projectAnalysis.hasProject) {
    let response = `**Análisis de empalme (RIC 1) - Integrado con tu proyecto**\n\n`;
    
    response += `📊 **Demanda calculada:** ${projectAnalysis.demandaPower.toFixed(2)} kW\n`;
    response += `🏢 **Distribuidora:** ${projectAnalysis.distributor}\n`;
    response += `⚡ **Sistema:** ${projectAnalysis.supplyType}\n`;
    response += `🔌 **Circuitos:** ${projectAnalysis.circuitCount}\n\n`;
    
    // Calcular protección general recomendada
    const corrienteProyecto = (projectAnalysis.demandaPower * 1000) / 220; // Para monofásico
    let proteccionRecomendada = 25;
    if (corrienteProyecto < 16) proteccionRecomendada = 16;
    else if (corrienteProyecto < 20) proteccionRecomendada = 20;
    else if (corrienteProyecto < 25) proteccionRecomendada = 25;
    else if (corrienteProyecto < 32) proteccionRecomendada = 32;
    
    response += `**Requisitos RIC 1 para tu proyecto:**\n`;
    response += `• **Protección general:** ${proteccionRecomendada}A (30mA tipo AC/A) coordinada con circuitos\n`;
    response += `• **Conductor:** Según demanda calculada (verificar sección)\n`;
    response += `• **Esquema:** TN-C-S (neutro y tierra separados en empalme)\n`;
    response += `• **Medidor:** Debe estar accesible y protegido\n`;
    response += `• **Documentación:** Proyecto ejecutivo + certificado TE1\n\n`;
    
    if (projectAnalysis.empalme && projectAnalysis.empalme.proteccion) {
      response += `**Empalme actual:**\n`;
      response += `• Protección: ${projectAnalysis.empalme.proteccion}\n`;
      response += `• Conductor: ${projectAnalysis.empalme.conductor || 'No especificado'}\n`;
    } else {
      response += `⚠️ Aún no se ha configurado el empalme en el proyecto.\n`;
    }
    
    return { response, confidence: 0.88 };
  }
  
  // RECOMENDACIONES PARA TIERRA - CON ANÁLISIS DEL PROYECTO
  if ((lower.includes("tierra") || lower.includes("puesta") || lower.includes("electrodo") || lower.includes("resistencia")) && projectAnalysis.hasProject) {
    let response = `**Análisis de puesta a tierra (RIC 5) - Integrado con tu proyecto**\n\n`;
    
    const isIndustrial = projectAnalysis.supplyType.includes("industrial") || projectAnalysis.demandaPower > 10;
    const maxResistencia = isIndustrial ? 5 : 10;
    
    response += `**Sistema TN-C-S recomendado para Chile:**\n`;
    response += `• **Máxima resistencia de tierra:** ${maxResistencia}Ω\n`;
    response += `• **Electrodo:** Varilla cobrizada ≥ 2m profundidad mínimo\n`;
    response += `• **Conductor PE:** 6mm² hasta 10mm² según demanda\n`;
    response += `• **Medición:** Con telúrometro 4 puntos (Wenner o Fall)\n`;
    response += `• **Frecuencia:** Cada 2 años o después de trabajos en terreno\n\n`;
    
    response += `**Datos de tu proyecto:**\n`;
    response += `• **Demanda:** ${projectAnalysis.demandaPower.toFixed(2)} kW\n`;
    response += `• **Corriente:** ${(projectAnalysis.demandaPower * 1000 / 220).toFixed(2)}A (monofásico)\n`;
    response += `• **Circuitos con diferencial:** ${projectAnalysis.circuitCount} (30mA según tipo)\n\n`;
    
    if (projectAnalysis.tierra && projectAnalysis.tierra.resistance) {
      response += `**Tierra actual medida:**\n`;
      response += `• **Resistencia:** ${projectAnalysis.tierra.resistance}Ω\n`;
      const estado = projectAnalysis.tierra.resistance <= maxResistencia ? "✅ CUMPLE" : "❌ NO CUMPLE";
      response += `• **Estado:** ${estado} con máximo de ${maxResistencia}Ω\n`;
      
      if (projectAnalysis.tierra.resistance > maxResistencia) {
        response += `\n⚠️ **Acción requerida:**\n`;
        response += `• Aumentar profundidad del electrodo\n`;
        response += `• Agregar electrodos en paralelo\n`;
        response += `• Mejorar terreno con bentonita\n`;
      }
    } else {
      response += `⚠️ Aún no se ha medido la puesta a tierra.\n`;
      response += `• Ve al módulo "Puesta a tierra" para calcular la solución recomendada\n`;
    }
    
    return { response, confidence: 0.9 };
  }
  
  // DETECTAR Y REPORTAR ERRORES DEL PROYECTO
  if ((lower.includes("error") || lower.includes("problema") || lower.includes("fallo") || lower.includes("incumpl")) && projectAnalysis.hasProject) {
    let response = `**Validación y errores detectados en "${projectAnalysis.name}"**\n\n`;
    
    if (projectAnalysis.errors.length === 0 && projectAnalysis.hasCargas) {
      response += `✅ No se detectaron errores críticos en las cargas.\n\n`;
    } else if (projectAnalysis.errors.length > 0) {
      response += `⚠️ **Errores detectados:**\n`;
      projectAnalysis.errors.forEach(error => {
        response += `• ${error}\n`;
      });
      response += `\n`;
    }
    
    // Validación de estado general
    if (!projectAnalysis.hasCargas) {
      response += `❌ **Cargas:** No hay cargas ingresadas\n`;
    } else {
      response += `✅ **Cargas:** ${projectAnalysis.circuitCount} circuitos, ${projectAnalysis.demandaPower.toFixed(2)} kW de demanda\n`;
    }
    
    if (!projectAnalysis.hasEmpalme) {
      response += `❌ **Empalme:** No configurado - Ve a RIC 1 para calcular protección general\n`;
    } else {
      response += `✅ **Empalme:** Configurado\n`;
    }
    
    if (!projectAnalysis.hasTierra) {
      response += `❌ **Tierra:** No medida - Ve a RIC 5 para calcular la solución recomendada\n`;
    } else {
      const maxRes = projectAnalysis.supplyType.includes("industrial") ? 5 : 10;
      const estado = projectAnalysis.tierra.resistance <= maxRes ? "✅ Cumple" : "❌ No cumple";
      response += `${estado} **Tierra:** ${projectAnalysis.tierra.resistance}Ω (máx ${maxRes}Ω)\n`;
    }
    
    response += `\n**Siguiente paso:**\n`;
    response += `1. Revisar cada error y hacer correcciones\n`;
    response += `2. Validar cargas vs. protecciones\n`;
    response += `3. Confirmar medición de tierra en terreno\n`;
    response += `4. Generar certificado final\n`;
    
    return { response, confidence: 0.92 };
  }
  
  // BÚSQUEDA EN CONOCIMIENTO (normas)
  for (const category in knowledgeBase) {
    for (const key in knowledgeBase[category]) {
      if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
        return {
          response: `Claro:\n\n**${key}:** ${knowledgeBase[category][key]}\n\n¿Cómo aplica esto a tu proyecto?`,
          confidence: 0.9
        };
      }
    }
  }
  
  // EDUCACIÓN GENERAL
  if (lower.includes("ric") || lower.includes("regulación")) {
    return {
      response: `Las **Reglas de Instalaciones de Corriente (RIC)** son 19 documentos que regulan todo en Chile:\n\n• **RIC 1-19:** Cubren desde empalme hasta inspección final\n• Todas se basan en **IEC 60364** (norma internacional)\n• Complementadas por **Decreto Ley 8** de seguridad\n\n¿Necesitas detalle de alguna específica?`,
      confidence: 0.85
    };
  }
  
  if (lower.includes("caida") || lower.includes("tensión") || lower.includes("voltaje")) {
    return {
      response: `La **caída de tensión** es importante:\n\n• Máximo **3%** en empalme-tablero general\n• Máximo **5%** desde empalme hasta punto final\n• Fórmula: ΔV = 2 × ρ × L × I / S\n\nPara tu proyecto de ${projectAnalysis.totalPower.toFixed(2)} kW, la caída debe revisarse en cada circuito.`,
      confidence: 0.9
    };
  }
  
  if (lower.includes("protección") || lower.includes("disyuntor") || lower.includes("automático")) {
    return {
      response: `Las **protecciones** son críticas:\n\n• **Automático** (IEC 60898): Sobrecarga y cortocircuito\n  - Curva C: Circuitos normales\n  - Curva D: Motores\n• **Diferencial** (IEC 61008): Fugas a tierra\n  - 30 mA: Personas\n  - 100-300 mA: Instalación\n\nDeben coordinar entre sí en cascada.`,
      confidence: 0.88
    };
  }
  
  // Respuesta por defecto educada
  return {
    response: `Interesante. Basándome en normas RIC 1-19, IEC y Decreto Ley 8:\n\n"${userMessage.substring(0, 50)}..." se relaciona con instalaciones eléctricas.\n\n¿Puedes preguntarme sobre:\n• Análisis de tu proyecto actual\n• Cargas y demanda\n• Protecciones y disyuntores\n• Puesta a tierra\n• Empalme\n• Normas RIC específicas\n\n¿Qué necesitas que revise?`,
    confidence: 0.6
  };
}

export function render(host, state) {
  const project = state.currentProject;
  
  host.innerHTML = `
    <div class="chat-ia-container">
      <div class="chat-header">
        <h2>🤖 Asistente IA Eléctrico Integrado</h2>
        <p>Análisis inteligente de tu proyecto: cargas, protecciones, empalme, tierra y cumplimiento RIC</p>
      </div>
      
      <div class="chat-messages" id="chatMessages">
        <div class="message bot">
          <div class="message-content">
            Hola, soy tu asistente especializado en electricidad integrado con tu proyecto.
            <br><br>Puedo:
            <ul style="margin-top: 10px; margin-left: 20px;">
              <li><strong>Analizar tu proyecto:</strong> Revisar cargas, cuadro, empalme y tierra</li>
              <li><strong>Corregir errores:</strong> Validar contra RIC 1-19, IEC y Decreto Ley 8</li>
              <li><strong>Hacer recomendaciones:</strong> Mejorar diseño y cumplimiento normativo</li>
              <li><strong>Educarte:</strong> Explicar normas y conceptos técnicos</li>
            </ul>
            <br>${project ? `📊 Proyecto actual: <strong>${project.name || "Sin nombre"}</strong>` : "⚠️ Sin proyecto activo"}
            <br><br>¿Qué necesitas?
          </div>
          <small>Hace un momento</small>
        </div>
      </div>
      
      <div class="chat-input-area">
        <div class="input-group">
          <input type="text" id="userMessage" placeholder="Pregunta: analizar, cargas, protecciones, tierra, empalme, RIC..." autofocus>
          <button id="sendBtn" class="btn-primary">Enviar</button>
        </div>
        <small>💡 Puedo: analizar proyecto | revisar cargas | revisar protecciones | revisar tierra | revisar empalme | normas RIC</small>
      </div>
    </div>
    
    <style>
      .chat-ia-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #1a1f27;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .chat-header {
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
        padding: 20px;
        border-bottom: 1px solid #334155;
        color: #e2e8f0;
      }
      
      .chat-header h2 {
        margin: 0 0 5px 0;
        font-size: 18px;
      }
      
      .chat-header p {
        margin: 0;
        font-size: 12px;
        color: #94a3b8;
      }
      
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .message {
        display: flex;
        flex-direction: column;
        gap: 5px;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .message.user {
        align-items: flex-end;
      }
      
      .message.bot {
        align-items: flex-start;
      }
      
      .message-content {
        background: #334155;
        color: #e2e8f0;
        padding: 12px 15px;
        border-radius: 8px;
        max-width: 85%;
        word-wrap: break-word;
        line-height: 1.5;
      }
      
      .message.user .message-content {
        background: #0ea5e9;
        color: white;
      }
      
      .message small {
        font-size: 11px;
        color: #64748b;
        padding: 0 10px;
      }
      
      .chat-input-area {
        background: #0f1419;
        border-top: 1px solid #334155;
        padding: 15px;
      }
      
      .input-group {
        display: flex;
        gap: 8px;
      }
      
      #userMessage {
        flex: 1;
        background: #1e293b;
        border: 1px solid #334155;
        color: #e2e8f0;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 14px;
      }
      
      #userMessage:focus {
        outline: none;
        border-color: #0ea5e9;
        box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
      }
      
      #sendBtn {
        background: #0ea5e9;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.2s;
      }
      
      #sendBtn:hover {
        background: #0284c7;
      }
      
      #sendBtn:active {
        transform: scale(0.98);
      }
      
      .chat-input-area small {
        display: block;
        margin-top: 8px;
        color: #64748b;
        font-size: 12px;
      }
      
      ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      
      li {
        margin: 5px 0;
        font-size: 13px;
      }
    </style>
  `;
  
  const chatMessages = host.querySelector("#chatMessages");
  const userInput = host.querySelector("#userMessage");
  const sendBtn = host.querySelector("#sendBtn");
  
  function addMessage(text, isUser = true) {
    const div = document.createElement("div");
    div.className = `message ${isUser ? "user" : "bot"}`;
    div.innerHTML = `
      <div class="message-content">${text.replace(/\n/g, "<br>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/✅|❌|⚠️|📊|💡|🏢|⚡|📋/g, m => m)}</div>
      <small>${isUser ? "Ahora" : "Hace un momento"}</small>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    userInput.value = "";
    
    setTimeout(() => {
      const response = buildIaResponse(message, project);
      addMessage(response.response, false);
      addHistory("Chat IA Proyecto: " + message.substring(0, 50), "Asistente IA Integrado", false);
      persist();
    }, 500);
  }
  
  sendBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

export default { render };

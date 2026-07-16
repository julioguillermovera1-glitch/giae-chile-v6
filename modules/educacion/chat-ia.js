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
  },
  decreto8: {
    "general": "Decreto de Ley que regula la seguridad eléctrica en instalaciones.",
    "articuloIII": "Toda instalación debe cumplir con las normas RIC, IEC y disposiciones SEC.",
    "articuloV": "Las protecciones deben coordinar: disyuntor de empalme, protecciones de circuito y diferencial.",
    "verificacion": "Toda instalación completada debe ser verificada y certificada por TE1, TE2 o TE3."
  },
  iec: {
    "60227": "Cables de cobre con aislación PVC. Especifica secciones y corrientes admisibles (Iz).",
    "60228": "Cables desnudos y aislados de cobre. Establece tabla de resistencia para caída de tensión.",
    "60898": "Interruptores automáticos. Define características de disparo y coordinación.",
    "61008": "Interruptores diferenciales. Sensibilidad en mA (30, 100, 300 mA típicos).",
    "61936": "Sistemas de puesta a tierra. Configuración TT, TN-S, TN-C-S según topología.",
    "60364": "Instalaciones de baja tensión. Norma madre que cubre diseño, ejecución y verificación."
  },
  electricidad: {
    "demanda": "Potencia que consume la instalación en el peor escenario de uso simultáneo de aparatos.",
    "factor_potencia": "Relación entre potencia real (W) y aparente (VA). Rango 0.8 a 1.0 típico.",
    "caida_tension": "Pérdida de voltaje en conductor por efecto resistivo. Se expresa en % respecto a tensión nominal.",
    "protecciones": "Dispositivos que desconectan circuitos ante sobrecarga o falla: automáticos y diferenciales.",
    "puesta_tierra": "Conexión deliberada a tierra para estabilizar referencias de seguridad y drenar corrientes de falla.",
    "circuitos": "Conjunto de conductores y cargas que forman un camino cerrado para la corriente eléctrica."
  }
};

// Respuestas personalizadas con tono humano
function buildIaResponse(userMessage) {
  const lower = userMessage.toLowerCase();
  
  // Búsqueda en conocimiento
  for (const category in knowledgeBase) {
    for (const key in knowledgeBase[category]) {
      if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
        return {
          response: `Claro, te explico:\n\n**${key}:** ${knowledgeBase[category][key]}\n\nEs importante que entiendas esto correctamente para un proyecto seguro.`,
          confidence: 0.9
        };
      }
    }
  }
  
  // Respuestas temáticas generales
  if (lower.includes("enchufe") || lower.includes("outlet")) {
    return {
      response: `Los enchufes se clasifican según RIC 1:\n\n• **Enchufe simple:** 1 contacto, hasta 16 A monofásico\n• **Enchufe doble:** 2 contactos independientes\n• **Enchufe trifásico:** 3 fases + neutro + tierra\n\nCada tipo tiene su identificación. ¿Qué necesitas saber más?`,
      confidence: 0.8
    };
  }
  
  if (lower.includes("ric") || lower.includes("regulación")) {
    return {
      response: `Las **Reglas de Instalaciones de Corriente (RIC)** son 19 documentos que regulan todo en Chile:\n\n• **RIC 1-19:** Cubren desde empalme hasta inspección final\n• Todas se basan en **IEC 60364** (norma internacional)\n• Complementadas por **Decreto Ley 8** de seguridad\n\n¿Necesitas detalle de alguna específica?`,
      confidence: 0.85
    };
  }
  
  if (lower.includes("caida") || lower.includes("tensión") || lower.includes("voltaje")) {
    return {
      response: `La **caída de tensión** es importante:\n\n• Máximo **3%** en el tramo empalme-tablero general\n• Máximo **5%** desde empalme hasta punto final del circuito\n• Se calcula: ΔV = 2 × ρ × L × I / S\n  - ρ = resistividad del cobre (0.0175 Ω·mm²/m)\n  - L = longitud del conductor (m)\n  - I = corriente (A)\n  - S = sección del conductor (mm²)\n\n¿Necesitas calcular una caída específica?`,
      confidence: 0.9
    };
  }
  
  if (lower.includes("protección") || lower.includes("disyuntor") || lower.includes("automático")) {
    return {
      response: `Las **protecciones** son críticas:\n\n• **Interruptor automático** (IEC 60898): Protege contra sobrecarga y cortocircuito\n  - Curva C: 5-10 In para circuitos normales\n  - Curva D: Motor arrancadores\n• **Interruptor diferencial** (IEC 61008): Protege contra fugas a tierra\n  - 30 mA: Protección de personas\n  - 100-300 mA: Protección de instalación\n• Deben **coordinar** entre sí\n\n¿Qué tipo de circuito necesitas proteger?`,
      confidence: 0.88
    };
  }
  
  if (lower.includes("tierra") || lower.includes("puesta") || lower.includes("electrodo")) {
    return {
      response: `La **puesta a tierra** es fundamental:\n\n• **Sistema TN-C-S:** Estándar en Chile (RIC 5)\n• **Resistencia:** ≤ 10Ω para viviendas, ≤ 5Ω para industria\n• **Electrodo:** Varilla cobrizada mínimo 2m de profundidad\n• **Conductor:** Cobre desnudo ≥ 6 mm², sin empalmes\n• **Medición:** Se debe medir con telúrometro\n\nUna buena tierra es seguridad. ¿Dónde la necesitas?`,
      confidence: 0.87
    };
  }
  
  if (lower.includes("materiales") || lower.includes("conductor") || lower.includes("cable")) {
    return {
      response: `Los **materiales** deben cumplir normas:\n\n• **Conductores:** Cobre (IEC 60227 o 60228)\n  - Secciones: 1.5, 2.5, 4, 6, 10, 16, 25, 35 mm²\n  - Corriente admisible (Iz) según tabla de IEC\n• **Canalización:** Ducto, tubería, bandeja según uso\n• **Interruptores:** IEC 60898 (automáticos) o 61008 (diferenciales)\n• **Disyuntores:** Coordinados con protección de empalme\n\n¿Qué circuito estás diseñando?`,
      confidence: 0.8
    };
  }
  
  if (lower.includes("nch4")) {
    return {
      response: `⚠️ **NCH4 está obsoleta.** No se usa más en Chile.\n\nUsa en su lugar:\n• **RIC 1-8:** Reglas oficiales de instalaciones\n• **IEC 60364:** Norma internacional en que se basan las RIC\n• **Decreto Ley 8:** Marco de seguridad\n\nTodos los proyectos nuevos deben cumplir RIC e IEC.`,
      confidence: 0.95
    };
  }
  
  if (lower.includes("sec") || lower.includes("superintendencia")) {
    return {
      response: `La **SEC** (Superintendencia de Electricidad y Combustible) es la autoridad:\n\n• Autoriza **instaladores TE1, TE2, TE3**\n• Certifica plataforma **E-Declarador** para trámites\n• Supervisa cumplimiento de **Decreto Ley 8** y **RIC**\n• Realiza fiscalizaciones en proyectos\n\nTodo trabajo debe registrarse en SEC y ser verificado por TE autorizado.`,
      confidence: 0.85
    };
  }
  
  // Respuesta genérica educada
  return {
    response: `Interesante pregunta. Basándome en normas RIC, IEC y Decreto Ley 8:\n\nTu consulta sobre "${userMessage}" se relaciona con instalaciones eléctricas, pero necesito más detalle para darte una respuesta precisa. ¿Podrías decirme:\n\n• ¿Qué tipo de instalación? (vivienda, comercio, industria)\n• ¿Qué potencia aproximada?\n• ¿Qué parte te interesa? (diseño, protección, materiales, cálculos)\n\nEstoy aquí para ayudarte a aprender lo correcto.`,
    confidence: 0.6
  };
}

export function initChatIa(host, state){
  host.innerHTML = `
    <div class="chat-ia-container">
      <div class="chat-header">
        <h2>🤖 Asistente IA Eléctrico</h2>
        <p>Consulta sobre instalaciones eléctricas, RIC, IEC y Decreto Ley 8</p>
      </div>
      
      <div class="chat-messages" id="chatMessages">
        <div class="message bot">
          <div class="message-content">
            Hola, soy tu asistente en instalaciones eléctricas. 
            <br><br>Sé todo sobre:
            <ul style="margin-top: 10px; margin-left: 20px;">
              <li><strong>RIC 1-19:</strong> Reglas de instalaciones de corriente (Chile)</li>
              <li><strong>IEC 60364:</strong> Norma internacional de baja tensión</li>
              <li><strong>Decreto Ley 8:</strong> Seguridad eléctrica</li>
              <li><strong>Cálculos:</strong> Caída de tensión, protecciones, tierra, materiales</li>
            </ul>
            <br>¿Qué quieres aprender hoy?
          </div>
          <small>Hace un momento</small>
        </div>
      </div>
      
      <div class="chat-input-area">
        <div class="input-group">
          <input type="text" id="userMessage" placeholder="Pregunta sobre instalaciones eléctricas, RIC, protecciones, caída de tensión, tierra..." autofocus>
          <button id="sendBtn" class="btn-primary">Enviar</button>
        </div>
        <small>💡 Puedes preguntar sobre: empalme, protecciones, conductores, tierra, normativas RIC 1-19, materiales, cálculos...</small>
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
        font-size: 20px;
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
        max-width: 80%;
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
      <div class="message-content">${text.replace(/\n/g, "<br>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</div>
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
    
    // Simulate thinking
    addMessage("Pensando...", false);
    
    setTimeout(() => {
      chatMessages.removeChild(chatMessages.lastChild);
      const response = buildIaResponse(message);
      addMessage(response.response, false);
      addHistory("Chat IA: " + message.substring(0, 50), "Asistente IA Educativo", false);
      persist();
    }, 500);
  }
  
  sendBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

export default { initChatIa };

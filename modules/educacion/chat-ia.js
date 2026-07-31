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

// Tabla real de empalmes de baja tension (RIC 1, Anexo 1.3). Transcrita del
// pliego oficial - no inventar valores intermedios, usar siempre esta tabla.
const EMPALME_MONOFASICO_A1_3 = [
  { a: 6, kw: 1 }, { a: 10, kw: 2 }, { a: 16, kw: 3 }, { a: 20, kw: 4 }, { a: 25, kw: 5 },
  { a: 30, kw: 6 }, { a: 32, kw: 6.5 }, { a: 35, kw: 7 }, { a: 40, kw: 8 }, { a: 50, kw: 10 }, { a: 63, kw: 13 }
];
const EMPALME_TRIFASICO_A1_3 = [
  { a: 6, kw: 3.6 }, { a: 10, kw: 6 }, { a: 16, kw: 9.7 }, { a: 20, kw: 12 }, { a: 25, kw: 15 },
  { a: 30, kw: 18 }, { a: 32, kw: 19 }, { a: 35, kw: 21 }, { a: 40, kw: 24 }, { a: 50, kw: 30 },
  { a: 63, kw: 38 }, { a: 80, kw: 48 }, { a: 90, kw: 55 }, { a: 100, kw: 61 }, { a: 125, kw: 76 },
  { a: 150, kw: 91 }, { a: 160, kw: 97 }, { a: 200, kw: 122 }, { a: 225, kw: 137 }, { a: 250, kw: 153 },
  { a: 320, kw: 195 }, { a: 350, kw: 214 }, { a: 400, kw: 244 }, { a: 450, kw: 275 }, { a: 500, kw: 306 },
  { a: 630, kw: 385 }, { a: 800, kw: 489 }, { a: 1000, kw: 612 }
];

function amperajeEmpalmeReal(kw, trifasico) {
  const tabla = trifasico ? EMPALME_TRIFASICO_A1_3 : EMPALME_MONOFASICO_A1_3;
  return tabla.find(fila => fila.kw >= kw) || tabla[tabla.length - 1];
}

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

// Consulta la normativa REAL cargada en D1 (ver migrations/0003_giae_normativa.sql
// y tools/gen-normativa-sql.mjs). Los 19 pliegos RIC y el Decreto N°8 estan
// cargados con reglas extraidas y verificadas. Esta funcion nunca inventa una
// regla: si no hay coincidencia real, devuelve un arreglo vacio y quien llama
// debe decirlo honestamente, no rellenar con texto generico disfrazado de norma.
async function buscarNormativaReal(query) {
  try {
    const response = await fetch(`/api/giae/normativa/reglas?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const payload = await response.json();
    return payload.ok ? (payload.reglas || []) : [];
  } catch {
    return []; // sin conexion al Worker: se sigue con el flujo local, sin inventar
  }
}

function formatearReglasReales(reglas) {
  const top = reglas.slice(0, reglas.length === 1 ? 1 : 2);
  let response = top.length === 1
    ? `Sobre tu consulta, esto dice la normativa cargada:\n\n`
    : `Sobre tu consulta, esto es lo más cercano que encontré en la normativa cargada:\n\n`;
  top.forEach(regla => {
    response += `**${regla.titulo}**\n`;
    response += `${regla.verifica}\n`;
    if (regla.correccion) response += `¿Cómo se soluciona si no se cumple? ${regla.correccion}\n`;
    response += `_(${regla.documento}, numeral ${regla.numeral})_\n\n`;
  });
  response += `Fuente: ${reglas[0]?.baseNormativa || "normativa cargada en el sistema"}.`;
  return { response, confidence: 0.97 };
}

// Respuesta contextual con análisis del proyecto
async function buildIaResponse(userMessage, project) {
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
  if ((lower.includes("empalme") || lower.includes("conexion") || lower.includes("disyuntor") || lower.includes("automatico") || lower.includes("automático")) && projectAnalysis.hasProject) {
    const esTrifasico = lower.includes("trifasic") || projectAnalysis.supplyType.toLowerCase().includes("trifasic");
    const kwMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*kw/);
    const kwMencionado = kwMatch ? parseFloat(kwMatch[1].replace(",", ".")) : null;
    const kwParaTabla = kwMencionado !== null ? kwMencionado : projectAnalysis.demandaPower;
    const filaEmpalme = amperajeEmpalmeReal(kwParaTabla, esTrifasico);

    let response = `**Amperaje del automático de empalme (RIC 1, Anexo 1.3)**\n\n`;

    if (kwMencionado !== null) {
      // El usuario dio un numero concreto: se responde a ESO, sin mezclar
      // datos del proyecto guardado (que pueden estar vacios/en 0 y no
      // tienen relacion con la potencia que se esta preguntando).
      response += `Para ${kwMencionado} kW contratados en un empalme ${esTrifasico ? "trifásico" : "monofásico"}, según la tabla oficial corresponde un interruptor automático de **${filaEmpalme.a} A**.\n\n`;
    } else {
      response += `Con la demanda calculada de tu proyecto (${projectAnalysis.demandaPower.toFixed(2)} kW, ${esTrifasico ? "trifásico" : "monofásico"}), corresponde un interruptor automático de **${filaEmpalme.a} A**.\n\n`;
      response += `📊 **Demanda calculada del proyecto:** ${projectAnalysis.demandaPower.toFixed(2)} kW\n`;
      response += `🏢 **Distribuidora:** ${projectAnalysis.distributor}\n`;
      response += `⚡ **Sistema:** ${projectAnalysis.supplyType}\n`;
      response += `🔌 **Circuitos:** ${projectAnalysis.circuitCount}\n\n`;
    }

    response += `**Otros requisitos del RIC 1 para el empalme:**\n`;
    response += `• **Esquema:** TN-C-S (neutro y tierra separados en el empalme)\n`;
    response += `• **Medidor:** Debe estar accesible y protegido\n`;
    response += `• **Documentación:** Proyecto ejecutivo + certificado TE1\n`;

    if (projectAnalysis.empalme && projectAnalysis.empalme.proteccion) {
      response += `\n**Empalme ya configurado en tu proyecto:**\n`;
      response += `• Protección: ${projectAnalysis.empalme.proteccion}\n`;
      response += `• Conductor: ${projectAnalysis.empalme.conductor || 'No especificado'}\n`;
    } else if (kwMencionado === null) {
      response += `\n⚠️ Aún no se ha configurado el empalme en el proyecto.\n`;
    }

    return { response, confidence: 0.95 };
  }
  
  // RECOMENDACIONES PARA TIERRA - CON ANÁLISIS DEL PROYECTO
  if ((lower.includes("tierra") || lower.includes("electrodo") || lower.includes("resistencia")) && projectAnalysis.hasProject) {
    // Limite real segun RIC 6 (CHL-RIC06-SERV-001): la puesta a tierra de
    // SERVICIO no debe superar 20 Ohm, con excepcion a 80 Ohm solo si la
    // instalacion es <=10 kW y tiene corte omnipolar + diferenciales
    // 300mA/30mA. No existe un limite fijo de 5/10 Ohm segun sea industrial
    // o residencial - ese valor no esta en la normativa cargada.
    const puedeUsarExcepcion80 = projectAnalysis.demandaPower <= 10;
    const maxResistencia = 20;

    let response = `**Puesta a tierra de servicio (RIC 6, numeral 6.1/6.2)**\n\n`;
    response += `• **Límite normativo:** la resistencia de puesta a tierra de servicio no debe superar **20 Ω**`;
    response += puedeUsarExcepcion80
      ? `. Como tu proyecto es ≤10 kW, existe una excepción a 80 Ω si además tiene corte omnipolar y diferenciales de 300 mA/30 mA (ver condiciones completas en RIC 6, 6.2).\n`
      : `.\n`;
    response += `• La **puesta a tierra de protección** no tiene un Ω fijo: se calcula como RTP = VS/I0 (tensión de seguridad del RIC 5 dividida por la corriente de operación de la protección) — depende de tu diseño particular.\n\n`;

    response += `💡 Buenas prácticas generales (orientativas, no cita textual del RIC): electrodo de cobre nuevo, medición con telurómetro de 4 puntos, revisión periódica del sistema.\n\n`;

    response += `**Datos de tu proyecto:**\n`;
    response += `• **Demanda:** ${projectAnalysis.demandaPower.toFixed(2)} kW\n`;
    response += `• **Sistema:** ${projectAnalysis.supplyType}\n\n`;

    if (projectAnalysis.tierra && projectAnalysis.tierra.resistance) {
      response += `**Tierra actual medida:**\n`;
      response += `• **Resistencia:** ${projectAnalysis.tierra.resistance}Ω\n`;
      const estado = projectAnalysis.tierra.resistance <= maxResistencia ? "✅ CUMPLE con el límite de 20 Ω" : "❌ NO CUMPLE con el límite de 20 Ω";
      response += `• **Estado:** ${estado}\n`;
    } else {
      response += `⚠️ Aún no se ha medido la puesta a tierra.\n`;
      response += `• Ve al módulo "Puesta a tierra" para calcular la solución recomendada\n`;
    }

    return { response, confidence: 0.92 };
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
  
  // NORMATIVA REAL (D1) - se intenta primero, antes que el resumen generico
  const reglasReales = await buscarNormativaReal(userMessage);
  if (reglasReales.length > 0) {
    return formatearReglasReales(reglasReales);
  }

  // BÚSQUEDA EN CONOCIMIENTO (resumen general propio, no reemplaza la norma real)
  for (const category in knowledgeBase) {
    for (const key in knowledgeBase[category]) {
      if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
        return {
          response: `**RIC ${key} (resumen general):** ${knowledgeBase[category][key]}\n\n💡 Ojo: esto es un resumen orientativo, no una cita verificada. Busqué en la normativa real cargada (RIC 1-19 y Decreto N°8) pero no encontré una coincidencia exacta para tu consulta — prueba con otros términos, o si prefieres, confirma con la norma oficial o un profesional competente antes de dar algo por cumplido.`,
          confidence: 0.6
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
              <li><strong>Citar normativa verificada:</strong> RIC 1 al 19 y Decreto N°8 completos, con numeral/artículo exacto</li>
              <li><strong>Hacer recomendaciones:</strong> Mejorar diseño y cumplimiento normativo</li>
              <li><strong>Educarte:</strong> Explicar conceptos técnicos generales</li>
            </ul>
            <br>💡 Para que sepas con qué cuentas: tengo cargados los <strong>19 pliegos RIC</strong> y el <strong>Decreto N°8</strong> completos (311 reglas verificadas), así que en eso puedes confiar en mis respuestas. Si tu proyecto usa una norma internacional (IEC, UNE, NFPA, etc.) como alternativa, esa parte todavía no la tengo cargada — para esos casos, te sugiero apoyarte en la norma oficial o consultarlo con un colega o profesional competente, por tu propia tranquilidad.
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
  
  async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = "";

    const response = await buildIaResponse(message, project);
    addMessage(response.response, false);
    addHistory("Chat IA Proyecto: " + message.substring(0, 50), "Asistente IA Integrado", false);
    persist();
  }
  
  sendBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

export default { render };

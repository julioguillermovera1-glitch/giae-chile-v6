const APP_VERSION = "2.5.0";

const modules = [
  {id:"inicio", icon:"🏠", label:"Inicio", status:"base", desc:"Portada profesional del sistema GIAE Chile."},
  {id:"proyecto", icon:"📁", label:"Proyecto", status:"ready", desc:"Módulo funcional: datos del proyecto, cliente, ubicación, suministro, distribuidora e instalador SEC."},
  {id:"cargas", icon:"⚡", label:"Cargas", status:"ready", desc:"Módulo funcional: ingreso de circuitos, potencia instalada, demanda y recomendación preliminar de empalme."},
  {id:"cuadro", icon:"▣", label:"Cuadro de Carga", status:"ready", desc:"Módulo funcional: calcula Ib, protecciones preliminares, conductores, fases y resumen de carga."},
  {id:"unilineal", icon:"⌁", label:"Unilineal", status:"ready", desc:"Módulo funcional: motor gráfico restaurado desde v9.5.1, adaptado a Cargas, Cuadro y Empalme."},
  {id:"tierra", icon:"⏚", label:"Tierra", status:"ready", desc:"Módulo funcional: Tierra Automática TP/TS con recomendación según potencia, empalme y distribuidora."},
  {id:"empalme", icon:"🔌", label:"Empalme", status:"ready", desc:"Módulo funcional: empalme inteligente con RIC 1, potencia normalizada, distribuidora y checklist documental."},
  {id:"carpeta", icon:"📂", label:"Carpeta Técnica", status:"ready", desc:"Módulo funcional: expediente técnico consolidado desde Proyecto, Cargas, Cuadro, Unilineal, Empalme y Tierra."},
  {id:"presupuesto", icon:"💰", label:"Presupuesto", status:"missing", desc:"Pendiente: módulo separado de materiales, mano de obra, IVA y utilidad."},
  {id:"asistente", icon:"🤖", label:"Asistente Documental", status:"ready", desc:"Módulo funcional: responde qué documentos exige cada distribuidora y muestra checklist."},
  {id:"auditoria", icon:"🧩", label:"Auditoría", status:"missing", desc:"Pendiente: trazabilidad, historial de consultas y registro de errores."},
  {id:"administracion", icon:"🔐", label:"Administración", status:"hidden", desc:"Pendiente: centro de monitoreo exclusivo del administrador."}
];

const quicks = [
  {label:"Nuevo Proyecto", icon:"📁", status:"ready", target:"proyecto", text:"Crear o editar datos base del proyecto"},
  {label:"Proyecto de Ejemplo", icon:"📘", status:"ready", target:"demo", text:"Cargar datos de demostración"},
  {label:"Cargas", icon:"⚡", status:"ready", target:"cargas", text:"Ingresar circuitos y calcular demanda"},
  {label:"Cuadro de Carga", icon:"▣", status:"ready", target:"cuadro", text:"Calcular protecciones y fases"},
  {label:"Unilineal", icon:"⌁", status:"ready", target:"unilineal", text:"Funcional ✓ Motor gráfico v9.5.1"},
  {label:"Empalme", icon:"🔌", status:"ready", target:"empalme", text:"Validar RIC 1 y distribuidora"},
  {label:"Tierra", icon:"⏚", status:"ready", target:"tierra", text:"TP/TS · RIC 6 · IEC 60417"},
  {label:"Carpeta Técnica", icon:"📂", status:"ready", target:"carpeta", text:"Revisar documentos por distribuidora"},
  {label:"Asistente", icon:"🤖", status:"ready", target:"asistente", text:"Consultar documentos requeridos"}
];

const STORAGE_KEY = "giae_chile_proyecto_v212";
const CARGAS_KEY = "giae_chile_cargas_v213";
const CARPETA_KEY = "giae_chile_carpeta_tecnica_v215";
const DISTRIBUIDORAS = {
  "CGE": {
    "descripcion": "Expediente orientado a TE1, evidencias fotográficas, punto de red y antecedentes del inmueble.",
    "documentos": [
      {
        "id": "te1",
        "nombre": "Certificado TE1 SEC aprobado",
        "obligatorio": true,
        "detalle": "Debe coincidir dirección y potencia con lo solicitado."
      },
      {
        "id": "fotos",
        "nombre": "Set fotográfico obligatorio",
        "obligatorio": true,
        "detalle": "Caja de empalme, poste, puesta a tierra, camarilla, unión al tablero y vista panorámica."
      },
      {
        "id": "poste",
        "nombre": "Identificación de punto de red",
        "obligatorio": true,
        "detalle": "Número de poste o cámara subterránea cercana."
      },
      {
        "id": "croquis",
        "nombre": "Croquis de ubicación",
        "obligatorio": true,
        "detalle": "Coordenadas o referencias claras."
      },
      {
        "id": "rol",
        "nombre": "Certificado de Rol SII",
        "obligatorio": false,
        "detalle": "Obligatorio en parcelaciones o loteos recientes."
      },
      {
        "id": "numero",
        "nombre": "Certificado de número municipal",
        "obligatorio": false,
        "detalle": "Si el dominio no especifica numeración exacta."
      },
      {
        "id": "medidor",
        "nombre": "Factura y certificado del medidor",
        "obligatorio": false,
        "detalle": "Si el cliente aporta el medidor."
      },
      {
        "id": "empresa",
        "nombre": "Antecedentes persona jurídica",
        "obligatorio": false,
        "detalle": "RUT sociedad, representante legal, vigencias y constitución."
      }
    ]
  },
  "ENEL": {
    "descripcion": "Proceso digital con documentos legales, contrato y factibilidad según potencia o red.",
    "documentos": [
      {
        "id": "te1qr",
        "nombre": "Declaración TE1 SEC con QR",
        "obligatorio": true,
        "detalle": "Documento digital verificable."
      },
      {
        "id": "dominio",
        "nombre": "Certificado de dominio vigente",
        "obligatorio": true,
        "detalle": "Antigüedad no mayor a 90 días."
      },
      {
        "id": "numero",
        "nombre": "Certificado de número municipal",
        "obligatorio": true,
        "detalle": "Emitido por DOM."
      },
      {
        "id": "contrato",
        "nombre": "Contrato de suministro firmado",
        "obligatorio": true,
        "detalle": "Firmado por propietario."
      },
      {
        "id": "jurada",
        "nombre": "Declaración jurada notarial",
        "obligatorio": false,
        "detalle": "Si no cuenta temporalmente con dominio inscrito."
      },
      {
        "id": "factibilidad",
        "nombre": "Formulario de factibilidad técnica",
        "obligatorio": false,
        "detalle": "Para potencias altas o red subterránea."
      },
      {
        "id": "fotos",
        "nombre": "Evidencia fotográfica",
        "obligatorio": true,
        "detalle": "Nicho/poste, tubo de bajada y término de obra."
      }
    ]
  },
  "CHILQUINTA": {
    "descripcion": "Trámite con fuerte control de representación legal del propietario.",
    "documentos": [
      {
        "id": "anexo_te1",
        "nombre": "Anexo TE1 SEC",
        "obligatorio": true,
        "detalle": "Instalador autorizado vigente."
      },
      {
        "id": "contrato",
        "nombre": "Contrato de suministro Chilquinta",
        "obligatorio": true,
        "detalle": "Firmado por dueño del inmueble."
      },
      {
        "id": "dominio",
        "nombre": "Certificado de dominio vigente",
        "obligatorio": true,
        "detalle": "Copia autorizada CBR."
      },
      {
        "id": "poder",
        "nombre": "Poder notarial",
        "obligatorio": false,
        "detalle": "Si instalador o tercero postula en nombre del propietario."
      }
    ]
  },
  "COPELEC": {
    "descripcion": "Requisitos orientados a terreno rural, constructividad local y factibilidad por red cercana.",
    "documentos": [
      {
        "id": "vecino",
        "nombre": "Número de cuenta de vecino cercano",
        "obligatorio": true,
        "detalle": "Referencia para identificar transformador o red cercana."
      },
      {
        "id": "te1",
        "nombre": "Certificado TE1 SEC",
        "obligatorio": true,
        "detalle": "Definitivo o de faena según corresponda."
      },
      {
        "id": "construccion",
        "nombre": "Acreditación de construcción existente",
        "obligatorio": true,
        "detalle": "Para definitivo debe existir construcción/caseta habitable."
      },
      {
        "id": "distancia",
        "nombre": "Distancia poste-medidor ≤ 30 m",
        "obligatorio": true,
        "detalle": "Si supera, requiere revisión especial."
      },
      {
        "id": "camarilla",
        "nombre": "Camarilla de tierra 160 mm",
        "obligatorio": true,
        "detalle": "Requisito constructivo local señalado."
      },
      {
        "id": "tierra",
        "nombre": "Cañería tierra 20 mm y bajada 25 mm",
        "obligatorio": true,
        "detalle": "Requisito constructivo indicado."
      },
      {
        "id": "rol",
        "nombre": "Certificado de Rol",
        "obligatorio": true,
        "detalle": "Especialmente en parcelas/subdivisiones."
      }
    ]
  },
  "SAESA / FRONTEL": {
    "descripcion": "Gestión orientada a factibilidad rural, ubicación, fotografías y respaldo de propiedad.",
    "documentos": [
      {
        "id": "te1",
        "nombre": "TE1 SEC aprobado",
        "obligatorio": true,
        "detalle": "Declaración eléctrica autorizada."
      },
      {
        "id": "dominio",
        "nombre": "Dominio vigente o acreditación de propiedad",
        "obligatorio": true,
        "detalle": "Según tipo de solicitud."
      },
      {
        "id": "ubicacion",
        "nombre": "Croquis / ubicación del empalme",
        "obligatorio": true,
        "detalle": "Referencia clara para terreno rural."
      },
      {
        "id": "fotos",
        "nombre": "Fotografías de obra y punto de conexión",
        "obligatorio": true,
        "detalle": "Permite revisión previa."
      },
      {
        "id": "factibilidad",
        "nombre": "Factibilidad técnica",
        "obligatorio": false,
        "detalle": "Según potencia, distancia y condiciones de red."
      }
    ]
  }
};

function stateLabel(status){
  if(status==="base") return "Base lista ✓";
  if(status==="ready") return "Funcional ✓";
  if(status==="next") return "Siguiente módulo";
  if(status==="draft") return "Base inicial";
  if(status==="hidden") return "Privado pendiente";
  return "Pendiente";
}
function stateClass(status){
  if(status==="base") return "ready";
  if(status==="ready") return "ready";
  if(status==="next") return "next";
  if(status==="draft") return "draft";
  return "missing";
}

function renderMenu(){
  const nav = document.getElementById("mainMenu");
  nav.innerHTML = modules.map((m,i)=>`<button class="nav-btn ${i===0?'active':''} ${stateClass(m.status)}" data-id="${m.id}"><span>${m.icon}</span>${m.label}</button>`).join("");
  nav.querySelectorAll("button").forEach(btn=>btn.onclick=()=>openModule(btn.dataset.id));
}

function renderEngines(){
  const grid = document.getElementById("engineGrid");
  grid.innerHTML = modules.filter(m=>m.id!=="inicio" && m.id!=="administracion").slice(0,9).map(m=>`
    <div class="engine ${stateClass(m.status)}">
      <span>${m.icon}</span>
      <b>${m.label}</b>
      <small class="status">${stateLabel(m.status)}</small>
    </div>
  `).join("");
}

function renderRIC(){
  const names = [
    "RIC 1 Disposiciones Generales","RIC 2 Alimentadores y Conductores","RIC 3 Conductores Puesta a Tierra","RIC 4 Protecciones","RIC 5 Selección e Instalación de Equipos",
    "RIC 6 Verificación","RIC 7 Locales Especiales","RIC 8 Eficiencia Energética","RIC 9 Instalaciones de Consumo","RIC 10 Suministro Provisional",
    "RIC 11 Conexiones","RIC 12 Empalmes","RIC 13 Medidores","RIC 14 Sistemas de Distribución","RIC 15 Calidad de Servicio",
    "RIC 16 Seguridad","RIC 17 Inspecciones","RIC 18 Modificaciones","RIC 19 Puesta en Servicio"
  ];
  document.getElementById("ricGrid").innerHTML = names.map(n=>`<div><span>✓</span>${n}</div>`).join("");
}

function renderQuick(){
  const box = document.getElementById("quickActions");
  box.innerHTML = quicks.map(q=>`
    <div class="quick ${stateClass(q.status)}" data-target="${q.target}">
      <b>${q.icon} ${q.label}</b>
      <small>${stateLabel(q.status)}: ${q.text}</small>
    </div>
  `).join("");
  box.querySelectorAll(".quick").forEach(q=>q.onclick=()=>{
    if(q.dataset.target==="demo"){ openModule("proyecto"); setTimeout(cargarDemoProyecto,100); }
    else openModule(q.dataset.target);
  });
}

function openModule(id){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.id===id));
  if(id==="unilineal"){ try{ renderUnilinealAutomatico(); }catch(e){ renderUnilinealFallback(e); } return; }
  if(id==="proyecto"){ renderProyecto(); return; }
  if(id==="cargas"){ renderCargas(); return; }
  if(id==="cuadro"){ renderCuadroInteligente(); return; }
  if(id==="empalme"){ renderEmpalmeInteligente(); return; }
  if(id==="tierra"){ renderTierraInteligente(); return; }
  if(id==="unilineal"){ renderUnilinealAutomatico(); return; }
  if(id==="carpeta"){ renderCarpetaTecnica(); return; }
  if(id==="motor"){ renderMotorNormativo(); return; }
  if(id==="asistente"){ renderAsistenteDocumental(); return; }
  const m = modules.find(x=>x.id===id) || modules[0];
  const view = document.getElementById("moduleView");
  const cls = stateClass(m.status);
  view.className = "module-view show " + cls;
  view.innerHTML = `
    <span class="badge ${cls}">${stateLabel(m.status)}</span>
    <h2>${m.icon} ${m.label}</h2>
    <p>${m.desc}</p>
    ${id==="cargas" ? `<div class="next-module-note"><b>Siguiente paso:</b> aquí construiremos el módulo Cargas v2.1.3. El proyecto guardado queda disponible para alimentar este módulo.</div>` : ""}
    <p><b>Regla:</b> nada se marca como funcional hasta que realmente guarde, lea o ejecute una acción útil.</p>
  `;
  view.scrollIntoView({behavior:"smooth", block:"start"});
}

function renderProyecto(){
  const view = document.getElementById("moduleView");
  view.className = "module-view show ready proyecto-view";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.5.0</span>
    <h2>📁 Proyecto</h2>
    <p>Este módulo guarda los datos base del proyecto. No calcula presupuesto, no dibuja unilineal y no define protecciones finales.</p>
    <p class="privacy-note">🔒 Privacidad: los datos quedan sólo en este navegador. Al completar el proyecto puedes continuar a Cargas sin perder información.</p>

    <div class="project-toolbar">
      <button class="step-chip active" data-section="datos">1. Datos</button>
      <button class="step-chip" data-section="cliente">2. Cliente</button>
      <button class="step-chip" data-section="ubicacion">3. Ubicación</button>
      <button class="step-chip" data-section="electrico">4. Eléctrico</button>
      <button class="step-chip" data-section="instalador">5. Instalador</button>
      <button class="step-chip" data-section="resumen">6. Resumen</button>
    </div>

    <form id="proyectoForm" class="project-form compact" autocomplete="off">
      <fieldset class="form-section active" data-section="datos">
        <legend>Datos generales</legend>
        <label>Nombre del proyecto<input name="nombreProyecto" placeholder="Ej: Vivienda San Pedro"></label>
        <label>N° OT<input name="numeroOT" placeholder="Ej: OT-001"></label>
        <label>Fecha<input name="fecha" type="date"></label>
        <label>Tipo de proyecto
          <select name="tipoProyecto">
            <option value="">Seleccionar</option>
            <option>Vivienda</option>
            <option>Local comercial</option>
            <option>Oficina</option>
            <option>Industrial</option>
            <option>Condominio</option>
          </select>
        </label>
      </fieldset>

      <fieldset class="form-section" data-section="cliente">
        <legend>Cliente</legend>
        <label>Nombre cliente<input name="cliente" placeholder="Nombre o razón social"></label>
        <label>RUT cliente<input name="rutCliente" class="rut-input" placeholder="11.111.111-1"><small class="rut-msg" data-rut-msg="rutCliente">Formato: 11.111.111-1</small></label>
        <label>Teléfono
          <div class="phone-wrap">
            <span>+56</span>
            <input name="telefonoCliente" class="phone-input" inputmode="numeric" placeholder="9 1234 5678">
          </div>
          <small class="phone-msg" data-phone-msg="telefonoCliente">Formato celular Chile</small>
        </label>
        <label>Correo<input name="correoCliente" type="email" placeholder="correo@dominio.cl"></label>
      </fieldset>

      <fieldset class="form-section" data-section="ubicacion">
        <legend>Ubicación</legend>
        <label>Dirección<input name="direccion" placeholder="Calle, número, sector"></label>
        <label>Comuna<input name="comuna" placeholder="Ej: Coronel"></label>
        <label>Región
          <select name="region">
            <option value="">Seleccionar</option>
            <option>Arica y Parinacota</option><option>Tarapacá</option><option>Antofagasta</option><option>Atacama</option>
            <option>Coquimbo</option><option>Valparaíso</option><option>Metropolitana</option><option>O'Higgins</option>
            <option>Maule</option><option>Ñuble</option><option>Biobío</option><option>La Araucanía</option>
            <option>Los Ríos</option><option>Los Lagos</option><option>Aysén</option><option>Magallanes</option>
          </select>
        </label>
        <label>Distribuidora
          <select name="distribuidora">
            <option value="">Seleccionar</option>
            <option>CGE</option>
            <option>COPELEC</option>
            <option>FRONTEL</option>
            <option>SAESA</option>
            <option>COOPELAN</option>
            <option>Otra</option>
          </select>
        </label>
      </fieldset>

      <fieldset class="form-section" data-section="electrico">
        <legend>Datos eléctricos base</legend>
        <label>Tipo de suministro
          <select name="suministro">
            <option value="">Seleccionar</option>
            <option>Monofásico 220 V</option>
            <option>Trifásico 380 V</option>
          </select>
        </label>
        <label>Estado del empalme
          <select name="estadoEmpalme">
            <option value="">Seleccionar</option>
            <option>Nuevo empalme</option>
            <option>Aumento de capacidad</option>
            <option>Regularización</option>
            <option>Modificación</option>
            <option>Existente</option>
          </select>
        </label>
        <label>Potencia estimada inicial kW<input name="potenciaEstimada" type="number" min="0" step="0.1" placeholder="Ej: 10"></label>
        <label>Observación técnica<textarea name="observacion" placeholder="Notas preliminares del proyecto"></textarea></label>
      </fieldset>

      <fieldset class="form-section" data-section="instalador">
        <legend>Instalador SEC</legend>
        <label>Nombre instalador<input name="instalador" placeholder="Nombre completo"></label>
        <label>RUT instalador<input name="rutInstalador" class="rut-input" placeholder="11.111.111-1"><small class="rut-msg" data-rut-msg="rutInstalador">Formato: 11.111.111-1</small></label>
        <label>Clase SEC
          <select name="claseSEC">
            <option value="">Seleccionar</option>
            <option>Clase A</option>
            <option>Clase B</option>
            <option>Clase C</option>
            <option>Clase D</option>
          </select>
        </label>
        <label>Correo instalador<input name="correoInstalador" type="email" placeholder="correo@dominio.cl"></label>
      </fieldset>

      <div class="form-actions">
        <button type="button" class="btn primary" id="guardarProyecto">Guardar avance</button>
        <button type="button" class="btn next" id="guardarContinuar">Guardar y continuar a Cargas</button>
        <button type="button" class="btn" id="cargarProyecto">Cargar guardado</button>
        <button type="button" class="btn danger" id="limpiarProyecto">Limpiar proyecto</button>
      </div>
    </form>

    <section class="project-summary form-section" data-section="resumen" id="projectSummary">
      <h3>Resumen del proyecto</h3>
      <p>No hay proyecto guardado todavía.</p>
    </section>
  `;
  view.scrollIntoView({behavior:"smooth", block:"start"});
  bindProyecto();
  bindProjectSections();
  cargarProyecto(false);
}


function bindProjectSections(){
  document.querySelectorAll(".step-chip").forEach(btn=>{
    btn.onclick = ()=>{
      const sec = btn.dataset.section;
      document.querySelectorAll(".step-chip").forEach(b=>b.classList.toggle("active", b.dataset.section===sec));
      document.querySelectorAll(".form-section").forEach(s=>s.classList.toggle("active", s.dataset.section===sec));
      if(sec==="resumen"){
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved){
          try{ renderResumen(JSON.parse(saved), []); }catch(e){}
        }
      }
    };
  });
}

function goProjectSection(sec){
  document.querySelectorAll(".step-chip").forEach(b=>b.classList.toggle("active", b.dataset.section===sec));
  document.querySelectorAll(".form-section").forEach(s=>s.classList.toggle("active", s.dataset.section===sec));
}

function bindProyecto(){
  document.getElementById("guardarProyecto").onclick = ()=>guardarProyecto(false);
  document.getElementById("guardarContinuar").onclick = ()=>guardarProyecto(true);
  document.getElementById("cargarProyecto").onclick = ()=>cargarProyecto(true);
  document.getElementById("limpiarProyecto").onclick = limpiarProyecto;
  bindRutInputs();
  bindPhoneInputs();
}

function formToObject(){
  const form = document.getElementById("proyectoForm");
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    version: APP_VERSION,
    actualizado: new Date().toISOString(),
    proyecto:{
      nombre: data.nombreProyecto || "",
      numeroOT: data.numeroOT || "",
      fecha: data.fecha || "",
      tipoProyecto: data.tipoProyecto || ""
    },
    cliente:{
      nombre: data.cliente || "",
      rut: limpiarRut(data.rutCliente || ""),
      rutFormateado: formatearRut(data.rutCliente || ""),
      rutValido: validarRut(data.rutCliente || ""),
      telefono: normalizarTelefonoChile(data.telefonoCliente || ""),
      telefonoFormateado: formatearTelefonoChile(data.telefonoCliente || ""),
      correo: data.correoCliente || ""
    },
    ubicacion:{
      direccion: data.direccion || "",
      comuna: data.comuna || "",
      region: data.region || "",
      distribuidora: data.distribuidora || ""
    },
    electrico:{
      suministro: data.suministro || "",
      estadoEmpalme: data.estadoEmpalme || "",
      potenciaEstimadaKW: Number(data.potenciaEstimada || 0),
      observacion: data.observacion || ""
    },
    instalador:{
      nombre: data.instalador || "",
      rut: limpiarRut(data.rutInstalador || ""),
      rutFormateado: formatearRut(data.rutInstalador || ""),
      rutValido: validarRut(data.rutInstalador || ""),
      claseSEC: data.claseSEC || "",
      correo: data.correoInstalador || ""
    }
  };
}



function bindPhoneInputs(){
  document.querySelectorAll(".phone-input").forEach(input=>{
    input.addEventListener("input", ()=>{
      input.value = formatearTelefonoChile(input.value);
      pintarEstadoTelefono(input.name, input.value);
    });
    input.addEventListener("blur", ()=>{
      input.value = formatearTelefonoChile(input.value);
      pintarEstadoTelefono(input.name, input.value);
    });
    pintarEstadoTelefono(input.name, input.value);
  });
}

function normalizarTelefonoChile(valor){
  let n = String(valor || "").replace(/\D/g,"");
  if(n.startsWith("56")) n = n.slice(2);
  if(n.startsWith("0")) n = n.slice(1);
  return n.slice(0,9);
}

function formatearTelefonoChile(valor){
  const n = normalizarTelefonoChile(valor);
  if(!n) return "";
  if(n.length <= 1) return n;
  if(n.length <= 5) return `${n.slice(0,1)} ${n.slice(1)}`;
  return `${n.slice(0,1)} ${n.slice(1,5)} ${n.slice(5,9)}`.trim();
}

function validarTelefonoChile(valor){
  const n = normalizarTelefonoChile(valor);
  return /^9\d{8}$/.test(n);
}

function pintarEstadoTelefono(name, value){
  const msg = document.querySelector(`[data-phone-msg="${name}"]`);
  if(!msg) return;
  const n = normalizarTelefonoChile(value);
  if(!n){
    msg.textContent = "Formato celular Chile";
    msg.className = "phone-msg";
    return;
  }
  if(validarTelefonoChile(n)){
    msg.textContent = "Teléfono válido ✅";
    msg.className = "phone-msg ok";
  }else{
    msg.textContent = "Debe ser celular chileno: +56 9 XXXX XXXX";
    msg.className = "phone-msg bad";
  }
}


function bindRutInputs(){
  document.querySelectorAll(".rut-input").forEach(input=>{
    input.addEventListener("input", ()=>{
      const formatted = formatearRut(input.value);
      input.value = formatted;
      pintarEstadoRut(input.name, formatted);
    });
    input.addEventListener("blur", ()=>{
      input.value = formatearRut(input.value);
      pintarEstadoRut(input.name, input.value);
    });
    pintarEstadoRut(input.name, input.value);
  });
}

function pintarEstadoRut(name, value){
  const msg = document.querySelector(`[data-rut-msg="${name}"]`);
  if(!msg) return;
  const limpio = limpiarRut(value);
  if(!limpio){
    msg.textContent = "Formato: 11.111.111-1";
    msg.className = "rut-msg";
    return;
  }
  if(validarRut(value)){
    msg.textContent = "RUT válido ✅";
    msg.className = "rut-msg ok";
  }else{
    msg.textContent = "RUT inválido ❌";
    msg.className = "rut-msg bad";
  }
}

function formatearRut(valor){
  let limpio = limpiarRut(valor);
  if(limpio.length < 2) return limpio;
  let cuerpo = limpio.slice(0, -1);
  let dv = limpio.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpo}-${dv}`;
}

function validarRut(valor){
  const rut = limpiarRut(valor);
  if(!/^\d{7,8}[0-9K]$/.test(rut)) return false;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for(let i = cuerpo.length - 1; i >= 0; i--){
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dv === dvEsperado;
}

function usarDatosJulio(){
  const form = document.getElementById("proyectoForm");
  if(!form) return;
  form.elements.instalador.value = "Julio Vera Concha";
  form.elements.rutInstalador.value = "11.111.111-1";
  form.elements.claseSEC.value = "Clase A";
  pintarEstadoRut("rutInstalador", "11.111.111-1");
  toast("Datos de Julio Vera cargados.");
}


function limpiarRut(v){ return String(v).replace(/[^0-9kK]/g,"").toUpperCase(); }

function objectToForm(obj){
  const form = document.getElementById("proyectoForm");
  if(!form || !obj) return;
  const map = {
    nombreProyecto: obj.proyecto?.nombre,
    numeroOT: obj.proyecto?.numeroOT,
    fecha: obj.proyecto?.fecha,
    tipoProyecto: obj.proyecto?.tipoProyecto,
    cliente: obj.cliente?.nombre,
    rutCliente: obj.cliente?.rutFormateado || formatearRut(obj.cliente?.rut || ""),
    telefonoCliente: obj.cliente?.telefonoFormateado || formatearTelefonoChile(obj.cliente?.telefono || ""),
    correoCliente: obj.cliente?.correo,
    direccion: obj.ubicacion?.direccion,
    comuna: obj.ubicacion?.comuna,
    region: obj.ubicacion?.region,
    distribuidora: obj.ubicacion?.distribuidora,
    suministro: obj.electrico?.suministro,
    estadoEmpalme: obj.electrico?.estadoEmpalme,
    potenciaEstimada: obj.electrico?.potenciaEstimadaKW,
    observacion: obj.electrico?.observacion,
    instalador: obj.instalador?.nombre,
    rutInstalador: obj.instalador?.rutFormateado || formatearRut(obj.instalador?.rut || ""),
    claseSEC: obj.instalador?.claseSEC,
    correoInstalador: obj.instalador?.correo
  };
  Object.entries(map).forEach(([name,value])=>{
    const el = form.elements[name];
    if(el) el.value = value ?? "";
  });
  pintarEstadoRut("rutCliente", form.elements.rutCliente?.value || "");
  pintarEstadoRut("rutInstalador", form.elements.rutInstalador?.value || "");
  pintarEstadoTelefono("telefonoCliente", form.elements.telefonoCliente?.value || "");
}

function guardarProyecto(continuar=false){
  const obj = formToObject();
  const faltantes = validarProyectoBase(obj);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  renderResumen(obj, faltantes);

  if(faltantes.length){
    toast("Proyecto guardado, pero falta corregir datos.");
    goProjectSection("resumen");
    return;
  }

  toast(continuar ? "Proyecto completo. Pasando a Cargas..." : "Proyecto guardado correctamente.");
  if(continuar){
    setTimeout(()=>openModule("cargas"), 650);
  }else{
    goProjectSection("resumen");
  }
}

function validarProyectoBase(obj){
  const faltantes = [];
  if(!obj.proyecto.nombre) faltantes.push("nombre del proyecto");
  if(!obj.proyecto.tipoProyecto) faltantes.push("tipo de proyecto");
  if(!obj.cliente.nombre) faltantes.push("cliente");
  if(!obj.ubicacion.direccion) faltantes.push("dirección");
  if(!obj.ubicacion.comuna) faltantes.push("comuna");
  if(!obj.ubicacion.region) faltantes.push("región");
  if(!obj.ubicacion.distribuidora) faltantes.push("distribuidora");
  if(!obj.electrico.suministro) faltantes.push("tipo de suministro");
  if(!obj.electrico.estadoEmpalme) faltantes.push("estado del empalme");
  if(obj.cliente.rut && !obj.cliente.rutValido) faltantes.push("RUT cliente inválido");
  if(obj.cliente.telefono && !validarTelefonoChile(obj.cliente.telefono)) faltantes.push("teléfono cliente inválido");
  if(obj.instalador.rut && !obj.instalador.rutValido) faltantes.push("RUT instalador inválido");
  return faltantes;
}

function cargarProyecto(showToast){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    if(showToast) toast("No hay proyecto guardado.");
    return;
  }
  try{
    const obj = JSON.parse(raw);
    objectToForm(obj);
    renderResumen(obj, []);
    if(showToast) toast("Proyecto cargado.");
  }catch(e){
    toast("Error al leer proyecto guardado.");
  }
}

function cargarDemoProyecto(){
  const hoy = new Date().toISOString().slice(0,10);
  const demo = {
    version: APP_VERSION,
    actualizado: new Date().toISOString(),
    proyecto:{nombre:"Vivienda San Pedro", numeroOT:"OT-001", fecha:hoy, tipoProyecto:"Vivienda"},
    cliente:{nombre:"Cliente de prueba", rut:"111111111", telefono:"912345678", telefonoFormateado:"9 1234 5678", correo:"cliente@ejemplo.cl"},
    ubicacion:{direccion:"Av. Ejemplo 123", comuna:"Coronel", region:"Biobío", distribuidora:"CGE"},
    electrico:{suministro:"Monofásico 220 V", estadoEmpalme:"Nuevo empalme", potenciaEstimadaKW:10, observacion:"Proyecto de demostración local."},
    instalador:{nombre:"Instalador de prueba", rut:"", rutFormateado:"", rutValido:false, claseSEC:"Clase D", correo:""}
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  objectToForm(demo);
  renderResumen(demo, []);
  toast("Proyecto de ejemplo cargado.");
}

function limpiarProyecto(){
  if(!confirm("¿Limpiar todos los datos visibles y guardados del proyecto?")) return;
  localStorage.removeItem(STORAGE_KEY);

  const form = document.getElementById("proyectoForm");
  if(form){
    form.reset();
    form.querySelectorAll("input, textarea").forEach(el => {
      el.value = "";
      el.defaultValue = "";
      el.setAttribute("autocomplete", "off");
    });
    form.querySelectorAll("select").forEach(el => {
      el.selectedIndex = 0;
    });
  }

  pintarEstadoRut("rutCliente", "");
  pintarEstadoRut("rutInstalador", "");
  pintarEstadoTelefono("telefonoCliente", "");

  const summary = document.getElementById("projectSummary");
  if(summary){
    summary.innerHTML = "<h3>Resumen del proyecto</h3><p>No hay proyecto guardado todavía.</p>";
  }

  goProjectSection("datos");
  toast("Proyecto limpiado completamente.");
}

function renderResumen(obj, faltantes){
  const box = document.getElementById("projectSummary");
  if(!box) return;
  const estado = faltantes.length ? `<span class="summary-warn">Datos pendientes: ${faltantes.join(", ")}</span>` : `<span class="summary-ok">Proyecto base completo</span>`;
  box.innerHTML = `
    <h3>Resumen del proyecto</h3>
    <div class="summary-head">${estado}<small>Actualizado: ${new Date(obj.actualizado).toLocaleString("es-CL")}</small></div>
    <div class="summary-grid">
      <p><b>Proyecto:</b> ${obj.proyecto.nombre || "Sin nombre"} / ${obj.proyecto.tipoProyecto || "Sin tipo"}</p>
      <p><b>Cliente:</b> ${obj.cliente.nombre || "Sin cliente"} / RUT ${obj.cliente.rutFormateado || "sin RUT"} ${obj.cliente.rut ? (obj.cliente.rutValido ? "✅" : "❌") : ""} / Tel. ${obj.cliente.telefonoFormateado ? "+56 " + obj.cliente.telefonoFormateado : "sin teléfono"}</p>
      <p><b>Dirección:</b> ${obj.ubicacion.direccion || "Sin dirección"}, ${obj.ubicacion.comuna || ""}</p>
      <p><b>Distribuidora:</b> ${obj.ubicacion.distribuidora || "Sin distribuidora"}</p>
      <p><b>Suministro:</b> ${obj.electrico.suministro || "Sin definir"}</p>
      <p><b>Potencia estimada:</b> ${obj.electrico.potenciaEstimadaKW || 0} kW</p>
      <p><b>Instalador:</b> ${obj.instalador.nombre || "Sin instalador"} / ${obj.instalador.claseSEC || "Sin clase SEC"} / RUT ${obj.instalador.rutFormateado || "sin RUT"} ${obj.instalador.rut ? (obj.instalador.rutValido ? "✅" : "❌") : ""}</p>
    </div>
  `;
}

function toast(msg){
  let t = document.getElementById("toast");
  if(!t){
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = "toast show";
  setTimeout(()=>t.className="toast", 2600);
}


function renderCargas(){
  const proyecto = getProyectoGuardado();
  const view = document.getElementById("moduleView");
  view.className = "module-view show ready cargas-view";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.5.0</span>
    <h2>⚡ Cargas por circuitos</h2>
    <p>Ingresa los circuitos del proyecto. GIAE calcula potencia instalada, demanda estimada y una recomendación preliminar de empalme.</p>
    <p class="privacy-note">📌 Regla técnica: la distribuidora define la protección/limitador del medidor según potencia contratada y factibilidad. GIAE sólo recomienda y advierte.</p>

    <section class="load-project-card">
      <h3>Proyecto base</h3>
      <p><b>Proyecto:</b> ${proyecto?.proyecto?.nombre || "Sin proyecto guardado"} · <b>Suministro:</b> ${proyecto?.electrico?.suministro || "Sin definir"} · <b>Distribuidora:</b> ${proyecto?.ubicacion?.distribuidora || "Sin definir"}</p>
      ${!proyecto ? `<small class="summary-warn">Recomendación: completar primero el módulo Proyecto.</small>` : ""}
    </section>

    <section class="load-form-card">
      <h3>Agregar circuito</h3>
      <form id="cargaForm" class="load-form" autocomplete="off">
        <label>N° circuito<input name="numero" type="number" min="1" step="1" readonly></label>
        <label>Tipo de circuito
          <select name="tipo" id="tipoCarga">
            <option>Alumbrado</option>
            <option>Enchufes</option>
            <option>Baño</option>
            <option>Cocina</option>
            <option>Luz exterior</option>
            <option>Motor</option>
            <option>Bomba</option>
            <option>Enchufe trifásico</option>
            <option>Termo de agua</option>
            <option>Climatización</option>
            <option>Otro</option>
          </select>
        </label>
        <label id="otroWrap" class="hidden">Nombre personalizado<input name="otro" placeholder="Ej: Portón eléctrico"></label>
        <label>Cantidad<input name="cantidad" type="number" min="1" step="1" value="1"></label>
        <label>Potencia unidad W<input name="potencia" type="number" min="0" step="1" placeholder="Ej: 100"></label>
        <label>Tipo alimentación
          <select name="alimentacion">
            <option>Monofásico</option>
            <option>Trifásico</option>
          </select>
        </label>
        <label>Fase sugerida
          <select name="fase">
            <option>R</option><option>S</option><option>T</option><option>R-S-T</option>
          </select>
        </label>
        <label>Factor simultaneidad %
          <input name="simultaneidad" type="number" min="1" max="100" step="1" value="100">
        </label>
        <label>Observación<input name="observacion" placeholder="Opcional"></label>
      </form>
      <div class="form-actions">
        <button type="button" class="btn primary" id="agregarCircuito">Agregar circuito</button>
        <button type="button" class="btn" id="guardarCargas">Guardar cargas</button>
        <button type="button" class="btn danger" id="limpiarCargas">Limpiar cargas</button>
        <button type="button" class="btn next" id="continuarCuadro">Continuar a Cuadro</button>
      </div>
    </section>

    <section class="load-summary-grid">
      <article>
        <b id="totalInstalado">0.00 kW</b>
        <small>Potencia instalada</small>
      </article>
      <article>
        <b id="totalDemanda">0.00 kW</b>
        <small>Demanda estimada</small>
      </article>
      <article>
        <b id="corrienteEstimada">0.0 A</b>
        <small>Corriente estimada</small>
      </article>
      <article>
        <b id="empalmeSugerido">Sin datos</b>
        <small>Empalme sugerido</small>
      </article>
    </section>

    <section class="load-warning" id="loadWarning"></section>

    <section class="load-table-card">
      <h3>Listado de circuitos</h3>
      <div class="table-scroll">
        <table class="load-table">
          <thead>
            <tr>
              <th>N°</th><th>Circuito</th><th>Cant.</th><th>W unidad</th><th>Total W</th><th>Demanda W</th><th>Alim.</th><th>Fase</th><th></th>
            </tr>
          </thead>
          <tbody id="cargasBody"></tbody>
        </table>
      </div>
    </section>

    <div class="ric-modal" id="ricModal" aria-hidden="true">
      <div class="ric-modal-box">
        <h3>📚 RIC aplicado · Cargas y empalme</h3>
        <p><b>Criterio:</b> la potencia solicitada debe ser coherente con la demanda calculada, valores normalizados, factibilidad y criterios de la distribuidora.</p>
        <p><b>Importante:</b> la protección o limitador del medidor no la define libremente el instalador. La distribuidora la determina según potencia contratada y condiciones técnicas.</p>
        <p><b>Cómo corregir:</b> revise potencia instalada, simultaneidad, tipo de suministro y solicite una potencia normalizada compatible.</p>
        <button type="button" class="btn primary" id="cerrarRic">Cerrar y volver a Cargas</button>
      </div>
    </div>
  `;
  view.scrollIntoView({behavior:"smooth", block:"start"});
  bindCargas();
  cargarCargas();
}

function getProyectoGuardado(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

function bindCargas(){
  const form = document.getElementById("cargaForm");
  const tipo = document.getElementById("tipoCarga");
  tipo.onchange = ()=>{
    document.getElementById("otroWrap").classList.toggle("hidden", tipo.value !== "Otro");
    if(tipo.value === "Enchufe trifásico"){
      form.elements.alimentacion.value = "Trifásico";
      form.elements.fase.value = "R-S-T";
    }
  };
  document.getElementById("agregarCircuito").onclick = agregarCircuito;
  document.getElementById("guardarCargas").onclick = ()=>{ guardarCargas(); toast("Cargas guardadas."); };
  document.getElementById("limpiarCargas").onclick = limpiarCargas;
  document.getElementById("continuarCuadro").onclick = ()=>{
    guardarCargas();
    openModule("cuadro");
  };
  document.getElementById("cerrarRic").onclick = cerrarRicModal;
}

function getCargas(){
  try{
    return JSON.parse(localStorage.getItem(CARGAS_KEY) || "[]");
  }catch(e){ return []; }
}

function setCargas(cargas){
  localStorage.setItem(CARGAS_KEY, JSON.stringify(cargas));
}

function cargarCargas(){
  renderCargasTabla();
  prepararSiguienteCircuito();
}

function guardarCargas(){
  const cargas = getCargas();
  setCargas(cargas);
  renderCargasTabla();
}

function agregarCircuito(){
  const form = document.getElementById("cargaForm");
  const data = Object.fromEntries(new FormData(form).entries());
  const cargas = getCargas();
  const numero = cargas.length + 1;
  const cantidad = Math.max(1, Number(data.cantidad || 1));
  const potenciaUnidad = Math.max(0, Number(data.potencia || 0));
  const simultaneidad = Math.min(100, Math.max(1, Number(data.simultaneidad || 100)));
  const nombre = data.tipo === "Otro" ? (data.otro || "Otro personalizado") : data.tipo;
  if(!potenciaUnidad){
    toast("Ingrese potencia unitaria en W.");
    return;
  }
  const totalW = cantidad * potenciaUnidad;
  const demandaW = totalW * (simultaneidad / 100);
  cargas.push({
    numero, nombre, tipo:data.tipo, cantidad, potenciaUnidad, totalW, demandaW,
    alimentacion:data.alimentacion || "Monofásico",
    fase:data.alimentacion === "Trifásico" ? "R-S-T" : (data.fase || "R"),
    simultaneidad,
    observacion:data.observacion || ""
  });
  setCargas(cargas);
  form.reset();
  form.elements.cantidad.value = 1;
  form.elements.simultaneidad.value = 100;
  document.getElementById("otroWrap").classList.add("hidden");
  renderCargasTabla();
  prepararSiguienteCircuito();
  toast("Circuito agregado.");
}

function prepararSiguienteCircuito(){
  const form = document.getElementById("cargaForm");
  if(!form) return;
  form.elements.numero.value = getCargas().length + 1;
}

function eliminarCircuito(index){
  const cargas = getCargas();
  cargas.splice(index, 1);
  cargas.forEach((c,i)=>c.numero = i + 1);
  setCargas(cargas);
  renderCargasTabla();
  prepararSiguienteCircuito();
}

function limpiarCargas(){
  if(!confirm("¿Limpiar todos los circuitos ingresados?")) return;
  localStorage.removeItem(CARGAS_KEY);
  renderCargasTabla();
  prepararSiguienteCircuito();
  toast("Cargas limpiadas.");
}

function renderCargasTabla(){
  const cargas = getCargas();
  const body = document.getElementById("cargasBody");
  if(!body) return;
  body.innerHTML = cargas.length ? cargas.map((c,i)=>`
    <tr>
      <td>${c.numero}</td>
      <td>${c.nombre}</td>
      <td>${c.cantidad}</td>
      <td>${c.potenciaUnidad}</td>
      <td>${Math.round(c.totalW)}</td>
      <td>${Math.round(c.demandaW)}</td>
      <td>${c.alimentacion}</td>
      <td>${c.fase}</td>
      <td><button class="mini-danger" onclick="eliminarCircuito(${i})">Borrar</button></td>
    </tr>
  `).join("") : `<tr><td colspan="9">Sin circuitos ingresados.</td></tr>`;
  actualizarResumenCargas(cargas);
}

function actualizarResumenCargas(cargas){
  const instaladoW = cargas.reduce((s,c)=>s + Number(c.totalW || 0), 0);
  const demandaW = cargas.reduce((s,c)=>s + Number(c.demandaW || 0), 0);
  const proyecto = getProyectoGuardado();
  const suministro = proyecto?.electrico?.suministro || "Monofásico 220 V";
  const esTrifasico = suministro.includes("Trifásico") || cargas.some(c=>c.alimentacion === "Trifásico");
  const tension = esTrifasico ? 380 : 220;
  const fp = 0.92;
  const corriente = esTrifasico ? demandaW / (Math.sqrt(3) * tension * fp) : demandaW / (tension * fp);

  const empalme = sugerirEmpalme(demandaW, esTrifasico);
  document.getElementById("totalInstalado").textContent = `${(instaladoW/1000).toFixed(2)} kW`;
  document.getElementById("totalDemanda").textContent = `${(demandaW/1000).toFixed(2)} kW`;
  document.getElementById("corrienteEstimada").textContent = `${corriente.toFixed(1)} A`;
  document.getElementById("empalmeSugerido").textContent = empalme.texto;

  const warn = document.getElementById("loadWarning");
  if(!warn) return;
  if(!cargas.length){
    warn.innerHTML = "";
    return;
  }
  const severidad = empalme.error ? "error" : "ok";
  warn.className = `load-warning ${severidad}`;
  warn.innerHTML = `
    <h3>${empalme.error ? "❌ Advertencia técnica" : "✅ Recomendación preliminar"}</h3>
    <p>${empalme.mensaje}</p>
    <p><b>Nota:</b> GIAE no define el automático del medidor. La distribuidora define la protección/limitador según potencia contratada y factibilidad.</p>
    <button type="button" class="btn" onclick="abrirRicModal()">📚 Ver RIC aplicado</button>
  `;
}

function sugerirEmpalme(demandaW, esTrifasico){
  const kw = demandaW / 1000;
  if(kw <= 0) return {texto:"Sin datos", mensaje:"Ingrese circuitos para calcular demanda.", error:false};
  if(!esTrifasico && kw > 10){
    return {
      texto:"Evaluar trifásico",
      mensaje:`La demanda estimada es ${kw.toFixed(2)} kW. Para cargas altas en monofásico, GIAE recomienda evaluar suministro trifásico o factibilidad con la distribuidora.`,
      error:true
    };
  }
  if(kw <= 3.6) return {texto:"3,6 kW aprox.", mensaje:"Demanda baja. Validar potencia normalizada y factibilidad con distribuidora.", error:false};
  if(kw <= 6) return {texto:"6 kW aprox.", mensaje:"Demanda compatible con evaluación de empalme residencial/comercial menor. Validar potencia normalizada.", error:false};
  if(kw <= 10) return {texto:"10 kW aprox.", mensaje:"Demanda media. Validar empalme, canalización, protecciones interiores y factibilidad.", error:false};
  if(kw <= 20) return {texto:"Trifásico 20 kW aprox.", mensaje:"Demanda alta. Recomendación preliminar: evaluar suministro trifásico y potencia normalizada.", error:false};
  return {texto:"Requiere estudio", mensaje:"Demanda elevada. Requiere análisis detallado, factibilidad de distribuidora y revisión normativa.", error:true};
}

function abrirRicModal(){
  const modal = document.getElementById("ricModal");
  if(modal) modal.classList.add("show");
}

function cerrarRicModal(){
  const modal = document.getElementById("ricModal");
  if(modal) modal.classList.remove("show");
}




function renderCarpetaTecnica(){
  const v=document.getElementById("moduleView"), e=exp240();
  v.className="module-view show ready carpeta-view carpeta-240";
  v.innerHTML=`<span class="badge ready">Módulo funcional v2.5.0</span>
  <h2>📂 Carpeta Técnica Inteligente</h2>
  <p>Consolida automáticamente Proyecto, Cargas, Cuadro, Unilineal, Empalme y Tierra en un expediente técnico.</p>
  <p class="privacy-note">📌 No recalcula ni modifica módulos anteriores. Sólo lee y organiza información.</p>
  <section class="folder-head"><div><h3>Expediente técnico</h3><p><b>Proyecto:</b> ${esc240(e.proyectoNombre)} · <b>Cliente:</b> ${esc240(e.cliente)} · <b>Distribuidora:</b> ${esc240(e.distribuidora)}</p></div><div class="uni-mini"><b>${e.porcentaje}%</b><small>Avance</small></div><div class="uni-mini"><b>${e.estado}</b><small>Estado</small></div></section>
  <section class="exp-progress"><div class="exp-progress-bar"><span style="width:${e.porcentaje}%"></span></div><p>${e.mensaje}</p></section>
  <section class="folder-grid"><article class="folder-panel"><h3>1. Resumen del Proyecto</h3>${resProyecto240(e)}</article><article class="folder-panel"><h3>2. Resumen Eléctrico</h3>${resElectrico240(e)}</article></section>
  <section class="folder-panel"><h3>3. Estado de módulos</h3><div class="mod-state-grid">${e.modulos.map(m=>`<div class="mod-state ${m.ok?'ok':'warn'}"><b>${m.ok?'✓':'⚠'} ${m.nombre}</b><small>${m.detalle}</small></div>`).join("")}</div></section>
  <section class="folder-grid"><article class="folder-panel"><h3>4. Documentos generados</h3>${docs240(e)}</article><article class="folder-panel"><h3>5. Checklist ${esc240(e.distribuidora)}</h3>${check240(e)}</article></section>
  <section class="folder-panel"><h3>6. Observaciones automáticas</h3>${obs240(e)}</section>
  <section class="folder-panel"><h3>Acciones</h3><div class="folder-buttons"><button class="btn primary" onclick="renderCarpetaTecnica()">Actualizar expediente</button><button class="btn" onclick="validarExp240()">Validar expediente</button><button class="btn" onclick="guardarExp240()">Guardar expediente</button><button class="btn next" onclick="guardarExp240(true)">Continuar a Documentación</button></div><div id="validacionCarpeta240" class="inline-check">${e.porcentaje>=80?'✅ Expediente avanzado.':'⚠ Expediente aún incompleto.'}</div></section>`;
  v.scrollIntoView({behavior:"smooth",block:"start"});
}
function exp240(){
 const p=getP240(), c=getC240(), r=getR240(c), emp=getJ240("giae_chile_empalme_v220"), tie=getJ240("giae_chile_tierra_v230");
 const dist=normD240(emp?.distribuidora||p?.ubicacion?.distribuidora||"CGE");
 const mod=[["Proyecto",!!p,p?"Datos base encontrados":"Falta crear proyecto"],["Cargas",c.length>0,c.length?`${c.length} circuitos registrados`:"Sin circuitos"],["Cuadro de Carga",c.length>0,c.length?"Protecciones disponibles":"Falta cuadro/cargas"],["Unilineal",c.length>0,c.length?"Generable automáticamente":"Falta información"],["Empalme",!!emp,emp?(emp.evaluacion?.tipoEmpalme||"Empalme guardado"):"Sin empalme"],["Tierra",!!tie,tie?`${tie.data?.tipoSistema||"Tierra"} · ${tie.calculo?.rt||"--"} Ω`:"Sin tierra"]];
 const docs=[["Resumen del proyecto",!!p],["Cuadro de carga",c.length>0],["Unilineal",c.length>0],["Informe Empalme",!!emp],["Informe Tierra",!!tie],["TE1",false,true],["Croquis",false,true],["Fotografías",false,true],["Certificados",false,true]];
 const pct=Math.round(docs.filter(d=>d[1]).length/docs.length*100);
 return{p,c,r,emp,tie,distribuidora:dist,proyectoNombre:p?.proyecto?.nombre||"Sin proyecto",cliente:p?.cliente?.nombre||"Sin cliente",direccion:p?.ubicacion?.direccion||"Sin dirección",comuna:p?.ubicacion?.comuna||"",region:p?.ubicacion?.region||"",instalador:p?.instalador?.nombre||"Sin instalador",claseSEC:p?.instalador?.claseSEC||"Sin clase SEC",suministro:p?.electrico?.suministro||"Sin definir",porcentaje:pct,modulos:mod.map(x=>({nombre:x[0],ok:x[1],detalle:x[2]})),docs:docs.map(x=>({nombre:x[0],ok:x[1],manual:x[2]})),estado:pct>=90?"Listo":pct>=60?"Avanzado":"Incompleto",mensaje:pct>=90?"Expediente casi listo para documentación.":pct>=60?"Expediente técnico avanzado, faltan antecedentes documentales.":"Expediente incompleto, faltan módulos o documentos clave."};
}
function getP240(){try{return typeof getProyectoSeguro==="function"?getProyectoSeguro():JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")}catch(e){return null}}
function getC240(){try{return typeof getCargasSeguras==="function"?getCargasSeguras():JSON.parse(localStorage.getItem(CARGAS_KEY)||"[]")}catch(e){return[]}}
function getJ240(k){try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}}
function getR240(c){let r=null;try{if(typeof resumenIngenieria==="function")r=resumenIngenieria()}catch(e){}; if(r)return r; const totalW=(c||[]).reduce((s,x)=>s+Number(x.totalW||(Number(x.cantidad||1)*Number(x.potenciaUnidad||x.potencia||0))||0),0); const demandaW=(c||[]).reduce((s,x)=>s+Number(x.demandaW||x.totalW||(Number(x.cantidad||1)*Number(x.potenciaUnidad||x.potencia||0))||0),0); return{totalW,demandaW,cargas:c}}
function normD240(d){const s=String(d||"CGE").toUpperCase(); if(s.includes("COPELEC"))return"COPELEC"; if(s.includes("SAESA")||s.includes("FRONTEL"))return"SAESA / FRONTEL"; if(s.includes("ENEL"))return"ENEL"; if(s.includes("CHIL"))return"CHILQUINTA"; return"CGE"}
function resProyecto240(e){return`<dl class="exp-dl"><dt>Cliente</dt><dd>${esc240(e.cliente)}</dd><dt>RUT</dt><dd>${esc240(e.p?.cliente?.rutFormateado||"Sin RUT")}</dd><dt>Dirección</dt><dd>${esc240(e.direccion)}</dd><dt>Comuna / Región</dt><dd>${esc240(e.comuna)} / ${esc240(e.region)}</dd><dt>Distribuidora</dt><dd>${esc240(e.distribuidora)}</dd><dt>Instalador SEC</dt><dd>${esc240(e.instalador)} / ${esc240(e.claseSEC)}</dd></dl>`}
function resElectrico240(e){return`<dl class="exp-dl"><dt>Suministro</dt><dd>${esc240(e.suministro)}</dd><dt>Potencia instalada</dt><dd>${(Number(e.r.totalW||0)/1000).toFixed(2)} kW</dd><dt>Potencia demandada</dt><dd>${(Number(e.r.demandaW||0)/1000).toFixed(2)} kW</dd><dt>Empalme</dt><dd>${esc240(e.emp?.evaluacion?.tipoEmpalme||"Sin empalme")}</dd><dt>Potencia normalizada</dt><dd>${esc240(e.emp?.evaluacion?.potenciaSugerida||"Sin definir")}</dd><dt>Tierra</dt><dd>${esc240(e.tie?.data?.tipoSistema||"Sin tierra")}</dd></dl>`}
function docs240(e){return`<ul class="doc-gen-list">${e.docs.map(d=>`<li class="${d.ok?'ok':'warn'}"><span>${d.ok?'✓':'☐'}</span><b>${esc240(d.nombre)}</b><small>${d.manual?'Externo/manual':'Generado desde GIAE'}</small></li>`).join("")}</ul>`}
function check240(e){const base=(typeof DISTRIBUIDORAS!=="undefined"&&DISTRIBUIDORAS[e.distribuidora])?DISTRIBUIDORAS[e.distribuidora]:null; const auto=[["Proyecto",!!e.p],["Cuadro de carga",e.c.length>0],["Unilineal",e.c.length>0],["Empalme",!!e.emp],["Tierra",!!e.tie]]; const ext=base?base.documentos.map(d=>[d.nombre,false,d.obligatorio]):[["TE1",false,true],["Croquis",false,true],["Fotografías",false,true]]; return`<ul class="checklist-240">${auto.map(x=>`<li class="${x[1]?'ok':'warn'}"><span>${x[1]?'☑':'☐'}</span>${esc240(x[0])}</li>`).join("")}${ext.map(x=>`<li class="warn"><span>☐</span>${esc240(x[0])}<small>${x[2]?'obligatorio':'opcional'}</small></li>`).join("")}</ul>`}
function obs240(e){const f=[...e.modulos.filter(m=>!m.ok).map(m=>m.nombre),...e.docs.filter(d=>!d.ok).map(d=>d.nombre)]; return f.length?`<div class="obs-warn"><b>⚠ Expediente incompleto.</b><p>Faltan o deben adjuntarse:</p><ul>${f.map(x=>`<li>${esc240(x)}</li>`).join("")}</ul></div>`:`<div class="obs-ok"><b>✅ Expediente completo.</b><p>Preparado para documentación SEC.</p></div>`}
function validarExp240(){const e=exp240(),b=document.getElementById("validacionCarpeta240"); if(!b)return; b.className=e.porcentaje>=80?"inline-check ok":"inline-check error"; b.innerHTML=e.porcentaje>=80?`✅ Expediente avanzado: ${e.porcentaje}%. Puede continuar a Documentación.`:`⚠ Expediente incompleto: ${e.porcentaje}%. Revise observaciones.`}
function guardarExp240(cont=false){const e=exp240(); localStorage.setItem("giae_chile_expediente_v240",JSON.stringify({version:APP_VERSION,actualizado:new Date().toISOString(),expediente:e})); toast("Expediente técnico guardado."); if(cont)setTimeout(()=>openModule("documentacion"),650)}
function esc240(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

function renderAsistenteDocumental(){const view=document.getElementById("moduleView"); view.className="module-view show ready asistente-view"; view.innerHTML=`<span class="badge ready">Módulo funcional v2.5.0</span><h2>🤖 Asistente Documental GIAE</h2><p>Consulta qué documentos debe presentar una persona o instalador autorizado SEC según la distribuidora.</p><section class="assistant-card"><label>Distribuidora<select id="assistantDist">${Object.keys(DISTRIBUIDORAS).map(d=>`<option>${d}</option>`).join("")}</select></label><label>Pregunta<input id="assistantQuestion" placeholder="Ej: ¿Qué documentos pide CGE para empalme?"></label><button class="btn primary" id="assistantAsk">Responder</button></section><section class="assistant-answer" id="assistantAnswer"></section>`; document.getElementById("assistantAsk").onclick=responderAsistente; responderAsistente(); view.scrollIntoView({behavior:"smooth",block:"start"});}
function responderAsistente(){const dist=document.getElementById("assistantDist")?.value||"CGE", data=DISTRIBUIDORAS[dist], box=document.getElementById("assistantAnswer"); if(!box)return; box.innerHTML=`<h3>Documentación requerida para ${dist}</h3><p>${data.descripcion}</p><h4>Documentos obligatorios</h4><ul>${data.documentos.filter(d=>d.obligatorio).map(d=>`<li><b>${d.nombre}</b>: ${d.detalle}</li>`).join("")}</ul><h4>Documentos condicionales</h4><ul>${data.documentos.filter(d=>!d.obligatorio).map(d=>`<li><b>${d.nombre}</b>: ${d.detalle}</li>`).join("")||"<li>No hay condicionales registrados.</li>"}</ul><p><b>Recomendación GIAE:</b> crear proyecto, subir carpeta técnica y ejecutar revisión antes de enviar a la distribuidora.</p>`;}


function getCargasSeguras(){
  try{return JSON.parse(localStorage.getItem(CARGAS_KEY) || "[]");}
  catch(e){return [];}
}
function getProyectoSeguro(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");}
  catch(e){return null;}
}
function calcCircuito(c, idx){
  const totalW = Number(c.totalW || (Number(c.cantidad||1) * Number(c.potenciaUnidad||0)) || 0);
  const demandaW = Number(c.demandaW || totalW * (Number(c.simultaneidad||100)/100));
  const tri = c.alimentacion === "Trifásico" || c.fase === "R-S-T";
  const v = tri ? 380 : 220;
  const fp = 0.92;
  const ib = tri ? demandaW/(Math.sqrt(3)*v*fp) : demandaW/(v*fp);
  const automatico = elegirAutomaticoGiae(ib, c);
  const diferencial = tri ? "4P 40A / 30mA" : "2P 25A / 30mA";
  const conductor = sugerirConductorGiae(c, ib);
  const ducto = tri ? "EMT 25 mm" : "EMT 20 mm";
  const fase = tri ? "R-S-T" : (c.fase || asignarFasePorIndice(idx));
  const ric = validarRicCircuito(c, ib, conductor, automatico);
  return {...c, totalW, demandaW, ib, automatico, diferencial, conductor, ducto, fase, ric};
}
function asignarFasePorIndice(idx){ return ["R","S","T"][idx % 3]; }
function elegirAutomaticoGiae(ib, c){
  const vals = [6,10,16,20,25,32,40,50,63,80,100,125];
  const factor = String(c.tipo||c.nombre||"").toLowerCase().includes("motor") ? 1.25 : 1.15;
  const val = vals.find(x=>x >= ib*factor) || "Estudio";
  return typeof val === "number" ? `${val}A` : "Requiere estudio";
}
function sugerirConductorGiae(c, ib){
  const tipo = String(c.tipo||c.nombre||"").toLowerCase();
  if(tipo.includes("alumbrado") || tipo.includes("luz")) return "1,5 mm²";
  if(c.alimentacion === "Trifásico" || c.fase === "R-S-T") return ib > 25 ? "6 mm²" : "4 mm²";
  if(ib <= 16) return "2,5 mm²";
  if(ib <= 25) return "4 mm²";
  if(ib <= 32) return "6 mm²";
  return "Requiere cálculo";
}
function validarRicCircuito(c, ib, conductor, automatico){
  const errores = [];
  const tipo = String(c.tipo||c.nombre||"").toLowerCase();
  if(tipo.includes("enchufe") && conductor.includes("1,5")) errores.push("Enchufes no deben quedar con conductor de alumbrado.");
  if(automatico.includes("Estudio") || conductor.includes("Requiere")) errores.push("Corriente alta: requiere cálculo detallado de conductor, protección, caída de tensión e ICC.");
  if(ib > 63) errores.push("Circuito sobre 63A: revisar diseño, alimentador dedicado o tablero específico.");
  return {ok:errores.length===0, errores};
}
function resumenIngenieria(){
  const cargas = getCargasSeguras().map(calcCircuito);
  const totalW = cargas.reduce((s,c)=>s+c.totalW,0);
  const demandaW = cargas.reduce((s,c)=>s+c.demandaW,0);
  const fases = {R:0,S:0,T:0};
  cargas.forEach(c=>{
    if(c.fase === "R-S-T"){
      fases.R += c.demandaW/3; fases.S += c.demandaW/3; fases.T += c.demandaW/3;
    }else if(fases[c.fase] !== undefined){
      fases[c.fase] += c.demandaW;
    }
  });
  const max = Math.max(fases.R, fases.S, fases.T, 1);
  const min = Math.min(fases.R, fases.S, fases.T);
  const desbalance = ((max-min)/max)*100;
  const proyecto = getProyectoSeguro();
  const suministro = proyecto?.electrico?.suministro || "Automático";
  const tri = suministro.includes("Trifásico") || demandaW > 10000 || cargas.some(c=>c.fase==="R-S-T");
  const corriente = tri ? demandaW/(Math.sqrt(3)*380*0.92) : demandaW/(220*0.92);
  const empalme = recomendarEmpalmeGiae(demandaW, tri, suministro);
  return {cargas,totalW,demandaW,fases,desbalance,tri,corriente,empalme,proyecto};
}
function recomendarEmpalmeGiae(demandaW, tri, suministro){
  const kw = demandaW/1000;
  const monoNorm = [1.5,2.2,3.6,5,6,9,10];
  const triNorm = [3.6,6,10,15,20,25,30,40,50,75,100];
  const lista = tri ? triNorm : monoNorm;
  let normal = lista.find(x=>x >= kw);
  let error = false;
  let motivo = "";
  if(!normal){
    normal = "Estudio especial";
    error = true;
    motivo = "La demanda supera las potencias preliminares consideradas. Requiere factibilidad y estudio técnico.";
  }else if(!tri && kw > 10){
    error = true;
    motivo = "Demanda alta para monofásico. Evaluar suministro trifásico y factibilidad con distribuidora.";
  }else{
    motivo = "Potencia normalizada preliminar seleccionada sobre la demanda calculada.";
  }
  const tipo = tri ? "Trifásico" : "Monofásico";
  const corriente = tri ? demandaW/(Math.sqrt(3)*380*0.92) : demandaW/(220*0.92);
  return {kw, tipo, normal, corriente, error, motivo};
}
function renderCuadroInteligente(){
  const r = resumenIngenieria();
  const view = document.getElementById("moduleView");
  view.className = "module-view show ready cuadro-inteligente";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.5.0</span>
    <h2>▣ Cuadro de Carga Inteligente</h2>
    <p>Genera protecciones preliminares, conductores, canalizaciones y balance de fases desde las cargas ingresadas.</p>
    <p class="privacy-note">📌 Uso técnico preliminar: debe verificarse con RIC, cálculo de caída de tensión, ICC y criterio del instalador autorizado SEC.</p>
    <section class="load-summary-grid">
      <article><b>${(r.totalW/1000).toFixed(2)} kW</b><small>Potencia instalada</small></article>
      <article><b>${(r.demandaW/1000).toFixed(2)} kW</b><small>Demanda</small></article>
      <article><b>${r.corriente.toFixed(1)} A</b><small>Corriente estimada</small></article>
      <article><b>${r.empalme.tipo}</b><small>Suministro recomendado</small></article>
    </section>
    <section class="ric-table-card">
      <h3>Cuadro técnico GIAE</h3>
      <div class="table-scroll">
        <table class="load-table smart-table">
          <thead><tr><th>N°</th><th>Circuito</th><th>W inst.</th><th>W demanda</th><th>Ib</th><th>Automático</th><th>Diferencial</th><th>Conductor</th><th>Canalización</th><th>Fase</th><th>Estado</th></tr></thead>
          <tbody>
            ${r.cargas.length ? r.cargas.map((c,i)=>`
              <tr>
                <td>${i+1}</td><td>${c.nombre}</td><td>${Math.round(c.totalW)}</td><td>${Math.round(c.demandaW)}</td><td>${c.ib.toFixed(1)} A</td>
                <td>${c.automatico}</td><td>${c.diferencial}</td><td>${c.conductor}</td><td>${c.ducto}</td><td>${c.fase}</td>
                <td>${c.ric.ok ? "✅ Cumple preliminar" : "❌ Revisar"}</td>
              </tr>`).join("") : `<tr><td colspan="11">No hay cargas ingresadas. Vuelve al módulo Cargas.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    <section class="folder-grid">
      <article class="folder-panel">
        <h3>Balance de fases</h3>
        <p><b>R:</b> ${(r.fases.R/1000).toFixed(2)} kW</p>
        <p><b>S:</b> ${(r.fases.S/1000).toFixed(2)} kW</p>
        <p><b>T:</b> ${(r.fases.T/1000).toFixed(2)} kW</p>
        <p><b>Desbalance estimado:</b> ${r.desbalance.toFixed(1)}%</p>
      </article>
      <article class="folder-panel">
        <h3>Verificación RIC preliminar</h3>
        ${renderErroresRic(r.cargas)}
        <button class="btn" onclick="abrirModalRic216()">📚 Ver fundamento</button>
      </article>
    </section>
    <div class="cuadro-actions">
      <button class="btn primary" onclick="openModule('empalme')">Ver Motor de Empalmes</button>
      <button class="btn" onclick="window.print()">Imprimir / PDF</button>
      <button class="btn next" onclick="openModule('unilineal')">Preparar Unilineal</button>
    </div>
    ${modalRic216()}
  `;
  view.scrollIntoView({behavior:"smooth", block:"start"});
}
function renderErroresRic(cargas){
  const errores = cargas.flatMap(c=>c.ric.errores.map(e=>`${c.nombre}: ${e}`));
  if(!cargas.length) return "<p>Sin datos para verificar.</p>";
  if(!errores.length) return "<p>✅ No se detectan errores preliminares en los circuitos ingresados.</p>";
  return `<ul>${errores.map(e=>`<li>❌ ${e}</li>`).join("")}</ul>`;
}

function renderTierraInteligente(){
  const view = document.getElementById("moduleView");
  const proyecto = getProyectoSeguro230();
  const empalme = getEmpalmeGuardado230();
  const resumen = empalme?.resumen || getResumenTierra230();
  const guardado = getTierraGuardada230();
  view.className = "module-view show ready tierra-view tierra-230";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.5.0</span>
    <h2>⏚ Tierra Automática TP / TS</h2>
    <p>Define Tierra de Protección, Tierra de Servicio, sistema existente o proyectado, equipotencialidad y validación preliminar RIC 6.</p>
    <p class="privacy-note">📌 GIAE documenta y calcula de forma preliminar. La resistencia final debe medirse en terreno con instrumento adecuado.</p>

    <section class="folder-head">
      <div>
        <h3>Proyecto analizado</h3>
        <p><b>Proyecto:</b> ${esc230(proyecto?.proyecto?.nombre || "Sin proyecto")} · <b>Cliente:</b> ${esc230(proyecto?.cliente?.nombre || "Sin cliente")} · <b>Empalme:</b> ${esc230(empalme?.evaluacion?.tipoEmpalme || "Sin empalme guardado")}</p>
      </div>
      <div class="uni-mini"><b>${((resumen.demandaW||0)/1000).toFixed(2)} kW</b><small>Demanda</small></div>
      <div class="uni-mini"><b>${empalme?.distribuidora || proyecto?.ubicacion?.distribuidora || "CGE"}</b><small>Distribuidora</small></div>
    </section>

    <section class="tierra-auto-box">
      <div>
        <h3>🤖 Recomendación automática GIAE</h3>
        <p>Según potencia, empalme y distribuidora, GIAE propone un sistema inicial editable para TP/TS.</p>
      </div>
      <div id="tierraAutoResumen230">${renderRecomendacionTierra230(recomendarTierra230(proyecto, empalme, resumen))}</div>
      <button class="btn primary" id="btnAplicarRecomendacion230">Aplicar recomendación</button>
    </section>

    <section class="tierra-symbol-grid">
      <article class="tierra-symbol-card">
        <h3>TP · Tierra de Protección</h3>
        ${svgTP230()}
        <p><b>IEC 60417-5019</b></p>
        <small>Protección de personas, masas metálicas, PE y barra de tierra del tablero.</small>
      </article>
      <article class="tierra-symbol-card">
        <h3>TS · Tierra de Servicio</h3>
        ${svgTS230()}
        <p><b>IEC 60417-5018</b></p>
        <small>Referencia operacional del sistema, neutro o tierra funcional según corresponda.</small>
      </article>
      <article class="tierra-symbol-card">
        <h3>Equipotencialidad</h3>
        ${svgEQ230()}
        <p><b>IEC 60417-5021</b></p>
        <small>Unión equipotencial principal y suplementaria.</small>
      </article>
    </section>

    <form id="tierraForm230" class="project-form compact tierra-form" autocomplete="off">
      <fieldset class="form-section active">
        <legend>Sistema de puesta a tierra</legend>
        <label>Tipo de sistema
          <select name="tipoSistema" id="tipoSistema230">
            <option>Jabalina simple</option>
            <option>Jabalinas múltiples en paralelo</option>
            <option>Malla de tierra</option>
            <option>Anillo de tierra</option>
            <option>Tierra química</option>
            <option>Tierra profunda</option>
            <option>Sistema existente</option>
            <option>Sistema compartido autorizado</option>
            <option>Otro sistema especial</option>
          </select>
        </label>
        <label>Tipo existente, si aplica
          <select name="tipoExistente">
            <option>No aplica</option>
            <option>Jabalina existente</option>
            <option>Malla existente</option>
            <option>Anillo existente</option>
            <option>Tierra química existente</option>
            <option>Desconocido</option>
          </select>
        </label>
        <label>Resistencia medida de tierra Ω<input name="resistenciaMedida" type="number" min="0" step="0.01" placeholder="Ej: 8.5"></label>
        <label>Fecha de medición<input name="fechaMedicion" type="date"></label>
        <label>Instrumento utilizado<input name="instrumento" placeholder="Ej: Telurómetro"></label>
      </fieldset>

      <fieldset class="form-section active">
        <legend>Datos técnicos</legend>
        <label>Material
          <select name="material">
            <option>Jabalina cobreada</option>
            <option>Cobre desnudo</option>
            <option>Acero galvanizado</option>
            <option>Malla de cobre</option>
            <option>Existente verificado</option>
          </select>
        </label>
        <label>Diámetro electrodo
          <select name="diametro">
            <option>5/8&quot;</option>
            <option>3/4&quot;</option>
            <option>1&quot;</option>
            <option>No aplica</option>
          </select>
        </label>
        <label>Longitud electrodo m<input name="longitud" type="number" min="0" step="0.1" value="2.4"></label>
        <label>Cantidad de electrodos<input name="cantidad" type="number" min="1" step="1" value="1"></label>
        <label>Separación entre electrodos m<input name="separacion" type="number" min="0" step="0.1" value="2.4"></label>
        <label>Resistividad estimada terreno Ω·m<input name="resistividad" type="number" min="1" step="1" value="100"></label>
      </fieldset>

      <fieldset class="form-section active">
        <legend>Conductores y equipotencialidad</legend>
        <label>Conductor TP / PE
          <select name="conductorTP">
            <option>Cu 16 mm²</option>
            <option>Cu 25 mm²</option>
            <option>Cu 35 mm²</option>
            <option>Cu 50 mm²</option>
          </select>
        </label>
        <label>Conductor TS
          <select name="conductorTS">
            <option>Cu 10 mm²</option>
            <option>Cu 16 mm²</option>
            <option>Cu 25 mm²</option>
            <option>No aplica</option>
          </select>
        </label>
        <div class="check-grid">
          ${["Barra principal de tierra","Unión equipotencial principal","Unión equipotencial suplementaria","Canalizaciones metálicas conectadas","Tablero conectado a TP","Empalme conectado a TP"].map((x,i)=>`<label class="check-line"><input type="checkbox" name="eq${i}" ${i<3?"checked":""}> ${x}</label>`).join("")}
        </div>
        <label>Observaciones<textarea name="observaciones" placeholder="Observaciones del sistema de tierra"></textarea></label>
      </fieldset>

      <div class="form-actions">
        <button type="button" class="btn primary" id="btnCalcTierra230">Calcular y validar RIC 6</button>
        <button type="button" class="btn" onclick="abrirModalRic6230()">📚 Ver fundamento RIC 6</button>
        <button type="button" class="btn next" id="btnGuardarTierra230">Guardar Tierra y continuar</button>
      </div>
    </form>

    <section id="resultadoTierra230" class="tierra-result">
      ${guardado ? renderResultadoTierra230(guardado.calculo, guardado.data) : "<p>Complete los datos y presione calcular.</p>"}
    </section>

    <section class="folder-grid">
      <article class="folder-panel">
        <h3>Dibujo preliminar</h3>
        <div id="dibujoTierra230">${renderDibujoTierra230(guardado?.data || null)}</div>
      </article>
      <article class="folder-panel">
        <h3>Informe automático</h3>
        <div id="informeTierra230">${guardado ? renderInformeTierra230(guardado.data, guardado.calculo) : "<p>Aún no hay informe generado.</p>"}</div>
      </article>
    </section>

    ${modalRic6230()}
  `;
  cargarFormTierra230(guardado?.data || null);
  document.getElementById("btnAplicarRecomendacion230").onclick = aplicarRecomendacionTierra230;
  if(!guardado) aplicarRecomendacionTierra230(false);
  document.getElementById("btnCalcTierra230").onclick = calcularTierra230;
  document.getElementById("btnGuardarTierra230").onclick = guardarTierraContinuar230;
  view.scrollIntoView({behavior:"smooth", block:"start"});
}

function getProyectoSeguro230(){
  try{ return typeof getProyectoSeguro==="function" ? getProyectoSeguro() : JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); }catch(e){ return null; }
}
function getEmpalmeGuardado230(){
  try{ return JSON.parse(localStorage.getItem("giae_chile_empalme_v220")||"null"); }catch(e){ return null; }
}
function getTierraGuardada230(){
  try{ return JSON.parse(localStorage.getItem("giae_chile_tierra_v230")||"null"); }catch(e){ return null; }
}
function getResumenTierra230(){
  try{ if(typeof getResumenEmpalme220==="function") return getResumenEmpalme220(); }catch(e){}
  return {totalW:0, demandaW:0, corriente:0, tri:false};
}

function recomendarTierra230(proyecto, empalme, resumen){
  const kw = Number((resumen?.demandaW || 0) / 1000);
  const tipoEmpalme = String(empalme?.evaluacion?.tipoEmpalme || "").toLowerCase();
  const distribuidora = String(empalme?.distribuidora || proyecto?.ubicacion?.distribuidora || "CGE").toUpperCase();
  const tri = tipoEmpalme.includes("trif") || resumen?.tri || String(proyecto?.electrico?.suministro || "").includes("Trifásico");

  let tipoSistema = "Jabalina simple";
  let cantidad = 1;
  let conductorTP = "Cu 16 mm²";
  let conductorTS = tri ? "Cu 16 mm²" : "Cu 10 mm²";
  let longitud = 2.4;
  let diametro = '5/8"';
  let material = "Jabalina cobreada";
  let resistividad = 100;
  let motivo = "Proyecto de baja demanda: se recomienda solución básica con jabalina simple y medición final.";

  if(kw > 10 && kw <= 25){
    tipoSistema = "Jabalinas múltiples en paralelo";
    cantidad = 2;
    conductorTP = "Cu 16 mm²";
    conductorTS = "Cu 16 mm²";
    motivo = "Demanda media: se recomiendan dos electrodos en paralelo para mejorar resistencia y estabilidad.";
  }
  if(kw > 25 && kw <= 50){
    tipoSistema = "Jabalinas múltiples en paralelo";
    cantidad = 3;
    conductorTP = "Cu 25 mm²";
    conductorTS = "Cu 16 mm²";
    motivo = "Demanda alta en BT: se recomiendan múltiples electrodos y conductor TP reforzado.";
  }
  if(kw > 50 || tipoEmpalme.includes("indirecto")){
    tipoSistema = "Malla de tierra";
    cantidad = 4;
    conductorTP = "Cu 35 mm²";
    conductorTS = "Cu 25 mm²";
    motivo = "Potencia elevada o empalme indirecto: se recomienda evaluar malla de tierra y memoria técnica.";
  }

  if(distribuidora.includes("COPELEC")){
    cantidad = Math.max(cantidad, 2);
    motivo += " Para COPELEC se recomienda especial atención a camarilla, distancia poste-medidor y requisitos constructivos locales.";
  }
  if(distribuidora.includes("SAESA") || distribuidora.includes("FRONTEL")){
    resistividad = 150;
    motivo += " En zonas rurales del sur se sugiere considerar mayor resistividad y validar factibilidad/medición.";
  }
  if(distribuidora.includes("CGE")){
    motivo += " Para CGE se debe respaldar con set fotográfico: puesta a tierra, camarilla y unión al tablero.";
  }

  return {
    tipoSistema, tipoExistente:"No aplica", resistenciaMedida:0, fechaMedicion:"",
    instrumento:"Telurómetro", material, diametro, longitud, cantidad,
    separacion: longitud, resistividad, conductorTP, conductorTS,
    equipotencialidad:["Barra principal de tierra","Unión equipotencial principal","Unión equipotencial suplementaria","Tablero conectado a TP","Empalme conectado a TP"],
    observaciones: motivo,
    motivo, kw, distribuidora, tri
  };
}

function renderRecomendacionTierra230(rec){
  return `<div class="auto-rec-grid">
    <p><b>Sistema:</b> ${esc230(rec.tipoSistema)}</p>
    <p><b>Electrodos:</b> ${rec.cantidad} · ${esc230(rec.diametro)} x ${rec.longitud} m</p>
    <p><b>TP:</b> ${esc230(rec.conductorTP)}</p>
    <p><b>TS:</b> ${esc230(rec.conductorTS)}</p>
    <p><b>Distribuidora:</b> ${esc230(rec.distribuidora)}</p>
    <p><b>Base:</b> ${rec.kw.toFixed(2)} kW</p>
    <small>${esc230(rec.motivo)}</small>
  </div>`;
}

function aplicarRecomendacionTierra230(mostrarToast=true){
  const proyecto = getProyectoSeguro230();
  const empalme = getEmpalmeGuardado230();
  const resumen = empalme?.resumen || getResumenTierra230();
  const rec = recomendarTierra230(proyecto, empalme, resumen);
  const f = document.getElementById("tierraForm230");
  if(!f) return;
  Object.entries(rec).forEach(([k,v])=>{
    if(f.elements[k] && typeof v !== "object") f.elements[k].value = v;
  });
  f.querySelectorAll(".check-line input").forEach(ch=>{
    ch.checked = rec.equipotencialidad.includes(ch.parentElement.textContent.trim());
  });
  calcularTierra230();
  if(mostrarToast) toast("Recomendación automática aplicada.");
}


function leerFormTierra230(){
  const f = document.getElementById("tierraForm230");
  const fd = Object.fromEntries(new FormData(f).entries());
  const eq = [];
  f.querySelectorAll(".check-line input").forEach(ch=>{ if(ch.checked) eq.push(ch.parentElement.textContent.trim()); });
  return {
    tipoSistema: fd.tipoSistema || "Jabalina simple",
    tipoExistente: fd.tipoExistente || "No aplica",
    resistenciaMedida: Number(fd.resistenciaMedida || 0),
    fechaMedicion: fd.fechaMedicion || "",
    instrumento: fd.instrumento || "",
    material: fd.material || "",
    diametro: fd.diametro || "",
    longitud: Number(fd.longitud || 0),
    cantidad: Number(fd.cantidad || 1),
    separacion: Number(fd.separacion || 0),
    resistividad: Number(fd.resistividad || 100),
    conductorTP: fd.conductorTP || "",
    conductorTS: fd.conductorTS || "",
    equipotencialidad: eq,
    observaciones: fd.observaciones || ""
  };
}
function cargarFormTierra230(data){
  if(!data) return;
  const f = document.getElementById("tierraForm230");
  Object.entries(data).forEach(([k,v])=>{
    if(f.elements[k] && typeof v !== "object") f.elements[k].value = v;
  });
}
function calcularTierra230(){
  const data = leerFormTierra230();
  const calculo = calcularRt230(data);
  document.getElementById("resultadoTierra230").innerHTML = renderResultadoTierra230(calculo, data);
  document.getElementById("dibujoTierra230").innerHTML = renderDibujoTierra230(data);
  document.getElementById("informeTierra230").innerHTML = renderInformeTierra230(data, calculo);
}
function calcularRt230(data){
  let rtTeorica = 0;
  if(data.tipoSistema.includes("Existente") && data.resistenciaMedida){
    rtTeorica = data.resistenciaMedida;
  }else{
    const rho = Math.max(1, data.resistividad || 100);
    const L = Math.max(0.5, data.longitud || 2.4);
    const n = Math.max(1, data.cantidad || 1);
    // Fórmula preliminar simple para electrodo vertical. GIAE la usa como estimación, no reemplaza medición en terreno.
    const electrodo = rho / (2 * Math.PI * L) * (Math.log((4 * L) / 0.016) - 1);
    const factorParalelo = n === 1 ? 1 : Math.max(0.35, 1 / (n * 0.75));
    rtTeorica = electrodo * factorParalelo;
    if(data.tipoSistema.includes("Malla")) rtTeorica *= 0.55;
    if(data.tipoSistema.includes("Anillo")) rtTeorica *= 0.7;
    if(data.tipoSistema.includes("química")) rtTeorica *= 0.65;
    if(data.tipoSistema.includes("profunda")) rtTeorica *= 0.5;
  }
  const cumple = rtTeorica <= 10;
  const revisar = rtTeorica > 10 && rtTeorica <= 20;
  return {
    rt: Number(rtTeorica.toFixed(2)),
    estado: cumple ? "cumple" : revisar ? "revisar" : "nocumple",
    titulo: cumple ? "✅ Cumple preliminar" : revisar ? "⚠️ Revisar en terreno" : "❌ No cumple preliminar",
    mensaje: cumple ? "La resistencia estimada/medida está bajo el criterio preliminar de 10 Ω." : revisar ? "La resistencia supera 10 Ω. Revisar cantidad de electrodos, malla o medición real." : "La resistencia es alta. Requiere mejora del sistema de puesta a tierra."
  };
}
function renderResultadoTierra230(calc, data){
  return `<section class="tierra-status ${calc.estado}">
    <h3>${calc.titulo}</h3>
    <div class="load-summary-grid">
      <article><b>${calc.rt} Ω</b><small>Resistencia estimada/medida</small></article>
      <article><b>${esc230(data.tipoSistema)}</b><small>Sistema</small></article>
      <article><b>${esc230(data.conductorTP)}</b><small>Conductor TP</small></article>
      <article><b>${data.equipotencialidad.length}</b><small>Uniones equipotenciales</small></article>
    </div>
    <p>${calc.mensaje}</p>
    <p><b>Nota:</b> validar medición final con instrumento en terreno y documentar fecha/instrumento.</p>
  </section>`;
}
function renderDibujoTierra230(data){
  const tipo = data?.tipoSistema || "Jabalina simple";
  const multi = tipo.includes("múltiples") || tipo.includes("Malla") || tipo.includes("Anillo");
  return `<svg class="tierra-svg" viewBox="0 0 720 360" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="680" height="320" rx="12" fill="white" stroke="#111"/>
    <text x="360" y="50" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20">Sistema de puesta a tierra</text>
    <rect x="270" y="75" width="180" height="45" fill="white" stroke="#111"/>
    <text x="360" y="103" text-anchor="middle" font-family="Arial" font-weight="700" font-size="14">Tablero General</text>
    <line x1="360" y1="120" x2="360" y2="155" stroke="#111" stroke-width="3"/>
    <rect x="260" y="155" width="200" height="34" fill="white" stroke="#111"/>
    <text x="360" y="177" text-anchor="middle" font-family="Arial" font-size="13">Barra principal TP / PE</text>
    <line x1="360" y1="189" x2="360" y2="225" stroke="#111" stroke-width="3"/>
    ${svgSymbolTP230(315,225)} ${svgSymbolTS230(405,225)}
    <text x="315" y="285" text-anchor="middle" font-family="Arial" font-size="12">TP</text>
    <text x="405" y="285" text-anchor="middle" font-family="Arial" font-size="12">TS</text>
    ${multi ? `<line x1="250" y1="300" x2="470" y2="300" stroke="#111" stroke-width="3"/><line x1="250" y1="288" x2="250" y2="325" stroke="#111" stroke-width="3"/><line x1="360" y1="288" x2="360" y2="325" stroke="#111" stroke-width="3"/><line x1="470" y1="288" x2="470" y2="325" stroke="#111" stroke-width="3"/>` : `<line x1="360" y1="288" x2="360" y2="325" stroke="#111" stroke-width="3"/>`}
    <line x1="180" y1="330" x2="540" y2="330" stroke="#111" stroke-width="2"/>
    <text x="360" y="350" text-anchor="middle" font-family="Arial" font-size="12">${esc230(tipo)}</text>
  </svg>`;
}
function renderInformeTierra230(data, calc){
  return `<div class="tierra-report">
    <p><b>Tipo:</b> ${esc230(data.tipoSistema)}</p>
    <p><b>Tipo existente:</b> ${esc230(data.tipoExistente)}</p>
    <p><b>Material:</b> ${esc230(data.material)} · ${esc230(data.diametro)} · ${data.longitud} m</p>
    <p><b>Cantidad electrodos:</b> ${data.cantidad}</p>
    <p><b>Resistividad terreno:</b> ${data.resistividad} Ω·m</p>
    <p><b>Resistencia:</b> ${calc.rt} Ω · ${esc230(calc.titulo)}</p>
    <p><b>TP:</b> ${esc230(data.conductorTP)} · IEC 60417-5019</p>
    <p><b>TS:</b> ${esc230(data.conductorTS)} · IEC 60417-5018</p>
    <p><b>Equipotencialidad:</b> ${data.equipotencialidad.map(esc230).join(", ") || "Sin marcar"}</p>
    <p><b>Normativa:</b> RIC 6 referencial. Validar medición final en terreno.</p>
  </div>`;
}
function guardarTierraContinuar230(){
  const data = leerFormTierra230();
  const calculo = calcularRt230(data);
  localStorage.setItem("giae_chile_tierra_v230", JSON.stringify({version:APP_VERSION, actualizado:new Date().toISOString(), data, calculo}));
  toast("Tierra guardada. Pasando a Carpeta Técnica...");
  setTimeout(()=>openModule("carpeta"),650);
}
function svgTP230(){ return `<svg viewBox="0 0 120 90" class="iec-symbol">${svgSymbolTP230(60,12)}</svg>`; }
function svgTS230(){ return `<svg viewBox="0 0 120 90" class="iec-symbol">${svgSymbolTS230(60,12)}</svg>`; }
function svgEQ230(){ return `<svg viewBox="0 0 120 90" class="iec-symbol"><circle cx="60" cy="45" r="24" fill="none" stroke="currentColor" stroke-width="4"/><line x1="30" y1="45" x2="90" y2="45" stroke="currentColor" stroke-width="4"/><line x1="60" y1="15" x2="60" y2="75" stroke="currentColor" stroke-width="4"/></svg>`; }
function svgSymbolTP230(x,y){
  return `<g stroke="currentColor" stroke-width="3" fill="none"><line x1="${x}" y1="${y}" x2="${x}" y2="${y+28}"/><line x1="${x-28}" y1="${y+28}" x2="${x+28}" y2="${y+28}"/><line x1="${x-18}" y1="${y+39}" x2="${x+18}" y2="${y+39}"/><line x1="${x-9}" y1="${y+50}" x2="${x+9}" y2="${y+50}"/></g>`;
}
function svgSymbolTS230(x,y){
  return `<g stroke="currentColor" stroke-width="3" fill="none"><line x1="${x}" y1="${y}" x2="${x}" y2="${y+25}"/><line x1="${x-24}" y1="${y+25}" x2="${x+24}" y2="${y+25}"/><path d="M ${x-20} ${y+38} Q ${x} ${y+52} ${x+20} ${y+38}"/></g>`;
}
function modalRic6230(){
  return `<div class="ric-modal" id="ric6230Modal"><div class="ric-modal-box">
    <h3>📚 Fundamento RIC 6 aplicado</h3>
    <p><b>GIAE v2.5.0:</b> clasifica TP, TS, equipotencialidad y sistema de tierra, dejando registro para carpeta técnica.</p>
    <p><b>Símbolos:</b> TP IEC 60417-5019, TS IEC 60417-5018 y equipotencialidad IEC 60417-5021.</p>
    <p><b>Validación:</b> la resistencia calculada es preliminar. El cumplimiento definitivo requiere medición en terreno.</p>
    <button class="btn primary" onclick="cerrarModalRic6230()">Cerrar y volver a Tierra</button>
  </div></div>`;
}
function abrirModalRic6230(){ document.getElementById("ric6230Modal")?.classList.add("show"); }
function cerrarModalRic6230(){ document.getElementById("ric6230Modal")?.classList.remove("show"); }
function esc230(v){ return String(v ?? "").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }

function renderEmpalmeInteligente(){
  const view=document.getElementById("moduleView");
  const proyecto=getProyectoSeguro220();
  const resumen=getResumenEmpalme220();
  const carpeta=(typeof cargarCarpeta==="function")?cargarCarpeta():{};
  const dist=normalizarDistribuidora220(carpeta?.distribuidora||proyecto?.ubicacion?.distribuidora||"CGE");
  const ev=evaluarEmpalme220(resumen,dist);
  view.className="module-view show ready empalme-view empalme-220";
  view.innerHTML=`
    <span class="badge ready">Módulo funcional v2.5.0</span>
    <h2>🔌 Empalme Inteligente</h2>
    <p>Valida demanda, suministro, potencia normalizada, distribuidora y fundamento RIC 1 sin tocar módulos operativos.</p>
    <p class="privacy-note">📌 GIAE recomienda y advierte. La distribuidora define condiciones finales, medidor, limitador y factibilidad.</p>
    <section class="folder-head">
      <div><h3>Proyecto analizado</h3><p><b>Proyecto:</b> ${esc220(proyecto?.proyecto?.nombre||"Sin proyecto")} · <b>Cliente:</b> ${esc220(proyecto?.cliente?.nombre||"Sin cliente")} · <b>Suministro:</b> ${esc220(proyecto?.electrico?.suministro||"Sin definir")}</p></div>
      <label>Distribuidora<select id="empDist220">${getDistribuidoras220().map(d=>`<option ${d===dist?"selected":""}>${d}</option>`).join("")}</select></label>
      <label>Potencia solicitada kW<input id="empKw220" type="number" min="0" step="0.1" value="${ev.potenciaSugeridaNumero||""}"></label>
    </section>
    <section class="load-summary-grid">
      <article><b>${(resumen.totalW/1000).toFixed(2)} kW</b><small>Potencia instalada</small></article>
      <article><b>${(resumen.demandaW/1000).toFixed(2)} kW</b><small>Potencia demandada</small></article>
      <article><b>${ev.tipoSuministro}</b><small>Suministro recomendado</small></article>
      <article><b>${ev.corriente.toFixed(1)} A</b><small>Corriente estimada</small></article>
    </section>
    <section class="empalme-result ${ev.clase}">
      <h3>${ev.titulo}</h3><p>${ev.mensaje}</p>
      <div class="empalme-kv">
        <p><b>Empalme recomendado:</b> ${ev.tipoEmpalme}</p>
        <p><b>Potencia normalizada:</b> ${ev.potenciaSugerida}</p>
        <p><b>Automático/limitador preliminar:</b> ${ev.limitador}</p>
        <p><b>Distribuidora:</b> ${dist}</p>
      </div>
      <div class="folder-buttons">
        <button class="btn primary" id="btnValidarEmp220">Validar RIC 1</button>
        <button class="btn" onclick="abrirModalRic220()">📚 Ver fundamento RIC 1</button>
        <button class="btn next" id="btnContinuarTierra220">Guardar y continuar a Tierra</button>
      </div>
      <div id="empValidacion220" class="inline-check">${renderValidacionEmpalme220(ev)}</div>
    </section>
    <section class="folder-grid">
      <article class="folder-panel"><h3>Orden técnica GIAE</h3><ol><li>Demanda: ${(resumen.demandaW/1000).toFixed(2)} kW.</li><li>Suministro: ${ev.tipoSuministro}.</li><li>Potencia normalizada: ${ev.potenciaSugerida}.</li><li>Validar factibilidad con ${dist}.</li><li>Continuar a Tierra: TP, TS y equipotencialidad.</li></ol></article>
      <article class="folder-panel"><h3>Checklist ${dist}</h3>${renderDocsEmpalme220(dist)}</article>
    </section>
    <section class="folder-panel"><h3>Potencias normalizadas preliminares</h3><div class="norm-list"><div><b>Monofásico:</b> ${potenciasMono220().join(" kW · ")} kW</div><div><b>Trifásico:</b> ${potenciasTri220().join(" kW · ")} kW</div></div></section>
    ${modalRic220(ev)}
  `;
  document.getElementById("empDist220").onchange=()=>renderEmpalmeInteligente();
  document.getElementById("btnValidarEmp220").onclick=validarEmpalmeSolicitado220;
  document.getElementById("btnContinuarTierra220").onclick=guardarEmpalmeContinuarTierra220;
  view.scrollIntoView({behavior:"smooth",block:"start"});
}
function getProyectoSeguro220(){try{return typeof getProyectoSeguro==="function"?getProyectoSeguro():JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")}catch(e){return null}}
function getResumenEmpalme220(){
  let r=null; try{if(typeof resumenIngenieria==="function")r=resumenIngenieria()}catch(e){}
  if(r&&typeof r.demandaW==="number")return{totalW:Number(r.totalW||0),demandaW:Number(r.demandaW||0),tri:!!r.tri,corriente:Number(r.corriente||0),cargas:Array.isArray(r.cargas)?r.cargas:[]};
  let cargas=[]; try{cargas=typeof getCargasSeguras==="function"?getCargasSeguras():JSON.parse(localStorage.getItem(CARGAS_KEY)||"[]")}catch(e){}
  const totalW=(Array.isArray(cargas)?cargas:[]).reduce((s,c)=>s+Number(c.totalW||(Number(c.cantidad||1)*Number(c.potenciaUnidad||c.potencia||0))||0),0);
  const demandaW=(Array.isArray(cargas)?cargas:[]).reduce((s,c)=>s+Number(c.demandaW||c.totalW||(Number(c.cantidad||1)*Number(c.potenciaUnidad||c.potencia||0))||0),0);
  const tri=cargas.some(c=>c.alimentacion==="Trifásico"||c.fase==="R-S-T");
  const corriente=tri?demandaW/(Math.sqrt(3)*380*0.92):demandaW/(220*0.92);
  return{totalW,demandaW,tri,corriente,cargas};
}
function normalizarDistribuidora220(d){const s=String(d||"CGE").toUpperCase();if(s.includes("COPELEC"))return"COPELEC";if(s.includes("FRONTEL")||s.includes("SAESA"))return"SAESA / FRONTEL";if(s.includes("ENEL"))return"ENEL";if(s.includes("CHIL"))return"CHILQUINTA";return"CGE"}
function getDistribuidoras220(){const b=(typeof DISTRIBUIDORAS!=="undefined")?Object.keys(DISTRIBUIDORAS):[];return[...new Set([...b,"CGE","COPELEC","SAESA / FRONTEL","ENEL","CHILQUINTA"])]}
function potenciasMono220(){return[1.5,2.2,3.6,5,6,9,10]}
function potenciasTri220(){return[3.6,6,10,15,20,25,30,40,50,75,100]}
function evaluarEmpalme220(resumen,dist){
  const kw=Math.max(0,resumen.demandaW/1000), tipo=(kw>10||resumen.tri)?"Trifásico":"Monofásico", lista=tipo==="Trifásico"?potenciasTri220():potenciasMono220(), normal=lista.find(x=>x>=kw);
  const corriente=tipo==="Trifásico"?resumen.demandaW/(Math.sqrt(3)*380*0.92):resumen.demandaW/(220*0.92);
  const mono=[{kw:1.5,a:10},{kw:2.2,a:10},{kw:3.6,a:16},{kw:5,a:25},{kw:6,a:32},{kw:9,a:40},{kw:10,a:50}], tri=[{kw:3.6,a:6},{kw:6,a:10},{kw:10,a:16},{kw:15,a:25},{kw:20,a:32},{kw:25,a:40},{kw:30,a:50},{kw:40,a:63},{kw:50,a:80},{kw:75,a:125},{kw:100,a:160}];
  const lim=normal?((tipo==="Trifásico"?tri:mono).find(x=>x.kw>=normal)?.a||"Estudio"):"Estudio";
  let clase="ok",titulo="✅ Empalme compatible preliminar",mensaje="La demanda puede asociarse a una potencia normalizada preliminar.";
  if(!normal){clase="error";titulo="❌ Requiere estudio especial";mensaje="La demanda supera la tabla preliminar integrada. Se requiere factibilidad formal."}
  else if(tipo==="Monofásico"&&kw>9){clase="warn";titulo="🟡 Límite monofásico cercano";mensaje="Evaluar trifásico si existe observación de la distribuidora."}
  return{kw,tipoSuministro:tipo,corriente,potenciaSugerida:normal?`${normal} kW`:"Estudio especial",potenciaSugeridaNumero:normal||"",tipoEmpalme:tipo==="Trifásico"?(kw>50?"BT Trifásico indirecto / estudio":"BT Trifásico"):"BT Monofásico",limitador:typeof lim==="number"?`${tipo==="Trifásico"?"3x":"1x"}${lim}A`:"Requiere estudio",clase,titulo,mensaje,dist}
}
function renderValidacionEmpalme220(e){return e.clase==="ok"?`<b>✅ Validación RIC 1 preliminar:</b> compatible con potencia normalizada sugerida.`:e.clase==="warn"?`<b>⚠️ Observación RIC 1:</b> ${e.mensaje}`:`<b>❌ No compatible preliminar:</b> ${e.mensaje}`}
function validarEmpalmeSolicitado220(){
  const r=getResumenEmpalme220(), dist=document.getElementById("empDist220")?.value||"CGE", sol=Number(document.getElementById("empKw220")?.value||0), base=evaluarEmpalme220(r,dist), lista=base.tipoSuministro==="Trifásico"?potenciasTri220():potenciasMono220(), box=document.getElementById("empValidacion220");
  if(!box)return; if(!sol){box.className="inline-check error";box.innerHTML="<b>❌ Falta potencia solicitada.</b>";return}
  const demanda=r.demandaW/1000;
  if(!lista.includes(sol)){box.className="inline-check error";box.innerHTML=`<b>❌ Error RIC 1:</b> ${sol} kW no está en tabla preliminar para ${base.tipoSuministro}. Cercanas: ${potenciasCercanas220(sol,lista).join(" kW / ")} kW.`}
  else if(sol<demanda){box.className="inline-check error";box.innerHTML=`<b>❌ Error técnico:</b> potencia solicitada (${sol} kW) menor que demanda (${demanda.toFixed(2)} kW).`}
  else{box.className="inline-check ok";box.innerHTML=`<b>✅ Compatible preliminar:</b> ${sol} kW cubre la demanda (${demanda.toFixed(2)} kW). Validar factibilidad con ${dist}.`}
}
function potenciasCercanas220(valor,lista){return[...lista].sort((a,b)=>Math.abs(a-valor)-Math.abs(b-valor)).slice(0,2)}
function renderDocsEmpalme220(dist){const d=(typeof DISTRIBUIDORAS!=="undefined"&&DISTRIBUIDORAS[dist])?DISTRIBUIDORAS[dist]:null;if(!d)return`<p>No hay checklist configurado.</p>`;return`<p>${esc220(d.descripcion||"")}</p><ul class="emp-docs">${d.documentos.map(x=>`<li><span>${x.obligatorio?"🔴":"🟡"}</span><div><b>${esc220(x.nombre)}</b><small>${esc220(x.detalle||"")}</small></div></li>`).join("")}</ul>`}
function guardarEmpalmeContinuarTierra220(){const r=getResumenEmpalme220(),dist=document.getElementById("empDist220")?.value||"CGE",ev=evaluarEmpalme220(r,dist);localStorage.setItem("giae_chile_empalme_v220",JSON.stringify({version:APP_VERSION,actualizado:new Date().toISOString(),distribuidora:dist,evaluacion:ev,resumen:{totalW:r.totalW,demandaW:r.demandaW,tri:r.tri,corriente:r.corriente}}));toast("Empalme guardado. Pasando a Tierra...");setTimeout(()=>openModule("tierra"),650)}
function modalRic220(e){return`<div class="ric-modal" id="ric220Modal"><div class="ric-modal-box"><h3>📚 Fundamento RIC 1 aplicado</h3><p><b>Aplicación GIAE:</b> compara demanda con suministro, potencia normalizada preliminar y factibilidad.</p><p><b>Resultado:</b> ${esc220(e.titulo)} · ${esc220(e.potenciaSugerida)} · ${esc220(e.tipoEmpalme)}.</p><p><b>Importante:</b> la distribuidora define condiciones finales del empalme, medidor, limitador y factibilidad.</p><button class="btn primary" onclick="cerrarModalRic220()">Cerrar y volver al empalme</button></div></div>`}
function abrirModalRic220(){document.getElementById("ric220Modal")?.classList.add("show")}
function cerrarModalRic220(){document.getElementById("ric220Modal")?.classList.remove("show")}
function esc220(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

function potenciasMono217(){ return [1.5,2.2,3.6,5,6,9,10]; }
function potenciasTri217(){ return [3.6,6,10,15,20,25,30,40,50,75,100]; }
function evaluarEmpalme217(r, dist){
  const kw = r.demandaW / 1000;
  const tipoRecomendado = (kw > 10 || r.tri) ? "Trifásico" : "Monofásico";
  const lista = tipoRecomendado === "Trifásico" ? potenciasTri217() : potenciasMono217();
  const normal = lista.find(x=>x >= kw);
  const corriente = tipoRecomendado === "Trifásico" ? r.demandaW/(Math.sqrt(3)*380*0.92) : r.demandaW/(220*0.92);
  let estadoClase = "ok", titulo = "✅ Empalme compatible preliminar", mensaje = "La demanda calculada puede asociarse a una potencia normalizada preliminar.";
  if(!normal){
    estadoClase = "error";
    titulo = "❌ Requiere estudio especial";
    mensaje = "La demanda calculada supera las potencias normalizadas preliminares registradas en GIAE. Se requiere factibilidad y revisión técnica.";
  }else if(tipoRecomendado === "Monofásico" && kw > 9){
    estadoClase = "warn";
    titulo = "🟡 Límite monofásico cercano";
    mensaje = "La demanda está cerca del límite preliminar monofásico. Evaluar trifásico si la distribuidora lo observa.";
  }
  return {
    kw, tipoRecomendado,
    normalSugerida: normal ? `${normal} kW` : "Estudio especial",
    normalSugeridaNumero: normal || "",
    corriente, estadoClase, titulo, mensaje, dist
  };
}

function renderDocsEmpalme217(dist){
  const data = (typeof DISTRIBUIDORAS !== "undefined" && DISTRIBUIDORAS[dist]) ? DISTRIBUIDORAS[dist] : null;
  if(!data) return "<p>No hay checklist documental configurado.</p>";
  return `<ul>${data.documentos.slice(0,6).map(d=>`<li>${d.obligatorio ? "🔴" : "🟡"} <b>${d.nombre}</b></li>`).join("")}</ul>`;
}
function validarPotenciaSolicitada217(){
  const r = resumenIngenieria();
  const dist = document.getElementById("empalmeDistribuidora")?.value || "CGE";
  const solicitada = Number(document.getElementById("potenciaSolicitadaKw")?.value || 0);
  const tipo = (r.demandaW/1000 > 10 || r.tri) ? "Trifásico" : "Monofásico";
  const lista = tipo === "Trifásico" ? potenciasTri217() : potenciasMono217();
  const box = document.getElementById("empalmeResultado");
  if(!box) return;
  if(!solicitada){
    box.className = "empalme-result error";
    box.innerHTML += `<div class="inline-error"><b>❌ Falta potencia solicitada.</b><br>Ingrese una potencia en kW para comparar.</div>`;
    return;
  }
  const esNormalizada = lista.includes(solicitada);
  const demandaKw = r.demandaW/1000;
  let html = "";
  let cls = "ok";
  if(!esNormalizada){
    cls = "error";
    html = `<b>❌ Error:</b> ${solicitada} kW no está registrada como potencia normalizada preliminar para ${tipo}. Potencias cercanas: ${potenciasCercanas217(solicitada, lista).join(" kW / ")} kW.`;
  }else if(solicitada < demandaKw){
    cls = "error";
    html = `<b>❌ Error:</b> la potencia solicitada (${solicitada} kW) es menor que la demanda calculada (${demandaKw.toFixed(2)} kW).`;
  }else{
    html = `<b>✅ Compatible preliminar:</b> ${solicitada} kW cubre la demanda calculada (${demandaKw.toFixed(2)} kW) y está en la lista normalizada preliminar. Validar factibilidad con ${dist}.`;
  }
  box.className = `empalme-result ${cls}`;
  box.querySelector(".inline-check")?.remove();
  const div = document.createElement("div");
  div.className = "inline-check";
  div.innerHTML = html;
  box.appendChild(div);
}
function potenciasCercanas217(valor, lista){
  return [...lista].sort((a,b)=>Math.abs(a-valor)-Math.abs(b-valor)).slice(0,2);
}
function modalRic217(){
  return `<div class="ric-modal" id="ric217Modal"><div class="ric-modal-box"><h3>📚 Fundamento normativo aplicado</h3>
  <p><b>RIC N°01:</b> se usa como criterio base para empalmes y potencia de suministro. GIAE compara demanda con potencias normalizadas preliminares.</p>
  <p><b>Distribuidora:</b> puede exigir factibilidad, documentos, fotografías, contrato y requisitos propios según zona y tipo de conexión.</p>
  <p><b>Advertencia:</b> el instalador autorizado calcula la instalación interior y solicita una potencia coherente. La compañía eléctrica define protección/limitador del medidor según potencia contratada y factibilidad.</p>
  <p><b>Acción correctiva:</b> si la potencia no coincide o es menor que la demanda, corregir solicitud, revisar cargas o evaluar suministro trifásico.</p>
  <button class="btn primary" onclick="cerrarModalRic217()">Cerrar y volver al empalme</button></div></div>`;
}
function abrirModalRic217(){document.getElementById("ric217Modal")?.classList.add("show");}
function cerrarModalRic217(){document.getElementById("ric217Modal")?.classList.remove("show");}


function modalRic216(){
  return `<div class="ric-modal" id="ric216Modal"><div class="ric-modal-box"><h3>📚 Criterio RIC / Empalme aplicado</h3><p><b>Cargas:</b> GIAE calcula potencia instalada, demanda, Ib y fases.</p><p><b>Protecciones:</b> valores preliminares. Deben verificarse con capacidad de conductor, canalización, temperatura, caída de tensión e ICC.</p><p><b>Empalme:</b> la potencia debe ser coherente con demanda y potencias normalizadas. La distribuidora define protección/limitador del medidor según contrato y factibilidad.</p><button class="btn primary" onclick="cerrarModalRic216()">Cerrar y volver</button></div></div>`;
}
function abrirModalRic216(){document.getElementById("ric216Modal")?.classList.add("show");}
function cerrarModalRic216(){document.getElementById("ric216Modal")?.classList.remove("show");}






function renderUnilinealAutomatico(){
  const view = document.getElementById("moduleView");
  if(!view) return;
  try{
    const proyecto = getProyecto951();
    const cargas = getCargas951();
    const esTri = (proyecto?.electrico?.suministro || "").includes("Trifásico") || cargas.some(c=>c.fase==="R-S-T");
    const barra = esTri ? "Barra repartidora tetrapolar 4x100A 10kA" : "Barra repartidora bipolar 2x100A 10kA";
    const general = getGeneral951(cargas, esTri);

    view.className = "module-view show ready unilineal-view unilineal-v951";
    view.innerHTML = `
      <span class="badge ready">Módulo funcional v2.5.0</span>
      <h2>⌁ Unilineal v9.5.1 Restaurado</h2>
      <p>Motor gráfico restaurado desde v9.5.1: automático con media luna, círculos, rayita central, diferencial alineado y diseño tipo plano.</p>
      <p class="privacy-note">📐 Vista técnica preliminar. El instalador autorizado SEC debe validar el plano final.</p>
      <section class="folder-head">
        <div>
          <h3>Proyecto base</h3>
          <p><b>Proyecto:</b> ${esc951(proyecto?.proyecto?.nombre || "Proyecto GIAE")} · <b>Cliente:</b> ${esc951(proyecto?.cliente?.nombre || "Cliente")} · <b>Sistema:</b> ${esTri ? "Trifásico" : "Monofásico"}</p>
        </div>
        <div class="uni-mini"><b>${esTri ? "Trifásico" : "Monofásico"}</b><small>Suministro</small></div>
        <div class="uni-mini"><b>${general}</b><small>Automático general</small></div>
      </section>
      <section class="uni-toolbar">
        <button class="btn primary" onclick="renderUnilinealAutomatico()">Actualizar unilineal</button>
        <button class="btn" onclick="descargarUnilinealSVG218()">Descargar SVG</button>
        <button class="btn" onclick="window.print()">Imprimir / PDF</button>
        <button class="btn next" onclick="openModule('tierra')">Continuar a Tierra</button>
      </section>
      ${cargas.length ? "" : `<section class="load-warning error"><h3>⚠️ Sin circuitos</h3><p>No existen circuitos para generar el unilineal. Complete primero el módulo Cargas.</p></section>`}
      <section class="uni-card v951-sheet">
        <div class="uni-header"><h3>TABLERO GENERAL</h3><p>${barra}</p></div>
        ${renderSVG951(cargas, proyecto, esTri, general, barra)}
      </section>`;
    view.scrollIntoView({behavior:"smooth", block:"start"});
  }catch(e){
    renderUnilinealFallback(e);
  }
}

function getProyecto951(){
  try{
    if(typeof getProyectoSeguro === "function") return getProyectoSeguro();
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  }catch(e){ return null; }
}
function getCargas951(){
  let raw = [];
  try{
    if(typeof getCargasSeguras === "function") raw = getCargasSeguras();
    else raw = JSON.parse(localStorage.getItem(CARGAS_KEY) || "[]");
  }catch(e){ raw = []; }
  return (Array.isArray(raw)?raw:[]).map((c,i)=>{
    let cc=c;
    try{ if(typeof calcCircuito === "function") cc = calcCircuito(c,i); }catch(e){}
    const cantidad = Number(cc.cantidad || 1);
    const potenciaUnidad = Number(cc.potenciaUnidad || cc.potencia || 0);
    const totalW = Number(cc.totalW || cantidad*potenciaUnidad || 0);
    const demandaW = Number(cc.demandaW || totalW);
    const tri = cc.alimentacion === "Trifásico" || cc.fase === "R-S-T";
    return {
      nombre: cc.nombre || cc.tipo || `Circuito ${i+1}`,
      fase: tri ? "R-S-T" : (cc.fase || "R"),
      aut: normalizarAut951(cc.automatico || elegirAuto951(demandaW, tri), tri),
      dif: cc.diferencial || (tri ? "P/D 4x40A 30 mA" : "P/D 2x25A 30 mA"),
      tipo: tri ? "3P+N+T" : "1P+N+T",
      w: demandaW
    };
  });
}
function elegirAuto951(w, tri){
  const ib = tri ? Number(w||0)/(Math.sqrt(3)*380*0.92) : Number(w||0)/(220*0.92);
  const vals = [6,10,16,20,25,32,40,50,63,80,100,125];
  const v = vals.find(x=>x >= ib*1.15) || 16;
  return tri ? `Aut. 3x${v}A 10 kA C` : `Aut. 1x${v}A 10 kA C`;
}
function normalizarAut951(txt, tri){
  txt = String(txt || "").trim();
  if(!txt.toLowerCase().includes("aut")) txt = "Aut. " + txt;
  if(!txt.toLowerCase().includes("ka")) txt += " 10 kA C";
  if(tri && txt.includes("1x")) txt = txt.replace("1x","3x");
  return txt;
}
function getGeneral951(cargas, tri){
  const total = cargas.reduce((s,c)=>s+Number(c.w||0),0);
  const ib = tri ? total/(Math.sqrt(3)*380*0.92) : total/(220*0.92);
  const vals = [25,32,40,50,63,80,100,125];
  const v = vals.find(x=>x >= ib*1.15) || 40;
  return tri ? `Aut. 3x${v}A 10 kA Curva C` : `Aut. 1x${v}A 10 kA Curva C`;
}
function esc951(t){ return String(t ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
function svgText951(x,y,t,size=12,anchor="middle",weight="400"){ return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-weight="${weight}" fill="#111">${esc951(t)}</text>`; }
function wrapSvgText951(x,y,t,max=18,size=12){
  let words=String(t||"").split(/\s+/), lines=[""];
  words.forEach(w=>{ let last=lines.length-1; if((lines[last]+" "+w).trim().length>max) lines.push(w); else lines[last]=(lines[last]+" "+w).trim(); });
  return lines.slice(0,4).map((l,i)=>svgText951(x,y+i*(size+3),l,size)).join("");
}
function breakerSymbol951(x,y,label){
  let clean=String(label||"").replace("Aut.","").replaceAll('"',"").trim();
  let parts=clean.split(/\s+/);
  let linea1=parts.slice(0,1).join(" ") || "1x16A";
  let linea2=parts.slice(1,3).join(" ") || "10 kA";
  let linea3=parts.slice(3).join(" ") || "C";
  return `<line x1="${x}" y1="${y-42}" x2="${x}" y2="${y-22}" stroke="#111" stroke-width="2.2"/>
  <circle cx="${x}" cy="${y-18}" r="4.5" fill="white" stroke="#111" stroke-width="2"/>
  <path d="M ${x} ${y-18} A 27 27 0 0 1 ${x} ${y+36}" fill="none" stroke="#111" stroke-width="2.2"/>
  <line x1="${x+1}" y1="${y+9}" x2="${x+44}" y2="${y+9}" stroke="#111" stroke-width="2.2"/>
  <circle cx="${x}" cy="${y+36}" r="4.5" fill="white" stroke="#111" stroke-width="2"/>
  <line x1="${x}" y1="${y+40}" x2="${x}" y2="${y+64}" stroke="#111" stroke-width="2.2"/>
  <text x="${x+48}" y="${y-5}" font-size="13" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">AUT.</text>
  <text x="${x+48}" y="${y+13}" font-size="12.8" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${esc951(linea1)}</text>
  <text x="${x+48}" y="${y+31}" font-size="12.8" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${esc951(linea2)}</text>
  <text x="${x+48}" y="${y+49}" font-size="12.8" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${esc951(linea3)}</text>`;
}
function diffSymbol951(x,y,label){
  let txt = String(label || "P/D 2x25A 30 mA").trim();
  let linea1 = esc951(txt), linea2 = "";
  if(/30\s*mA/i.test(txt)){ linea1 = esc951(txt.replace(/30\s*mA/i,"").trim()); linea2 = "30 mA"; }
  return `<rect x="${x-26}" y="${y}" width="52" height="46" fill="white" stroke="#111" stroke-width="1.8"/>
  <line x1="${x-26}" y1="${y+46}" x2="${x+26}" y2="${y}" stroke="#111" stroke-width="1.4"/>
  <text x="${x-10}" y="${y+19}" font-size="13" text-anchor="middle" font-family="Arial" font-weight="900">P</text>
  <text x="${x+11}" y="${y+37}" font-size="13" text-anchor="middle" font-family="Arial" font-weight="900">D</text>
  <text x="${x+40}" y="${y+18}" font-size="11" text-anchor="start" font-family="Arial" font-weight="900" fill="#111">${linea1}</text>
  <text x="${x+40}" y="${y+34}" font-size="11" text-anchor="start" font-family="Arial" font-weight="400" fill="#111">${linea2}</text>
  <line x1="${x}" y1="${y+46}" x2="${x}" y2="${y+92}" stroke="#111" stroke-width="2.2"/>`;
}
function salidaSymbol951(x,y,n,c){
  return `<circle cx="${x}" cy="${y}" r="15" fill="white" stroke="#111" stroke-width="2"/>
  ${svgText951(x,y+5,n,14,"middle","700")}
  <rect x="${x-50}" y="${y+25}" width="100" height="58" fill="white" stroke="#111" stroke-width="1.5"/>
  ${wrapSvgText951(x,y+43,c.nombre,16,11)}
  ${svgText951(x,y+77,c.tipo,10)}`;
}

function renderSVG951(cargas, proyecto, esTri, general, barra){
  const cs = cargas.length ? cargas : [];
  const n = Math.max(cs.length,1);

  // Ajuste v2.5.0:
  // El dibujo se adapta a la cantidad real de circuitos.
  // La barra horizontal nace en el primer circuito y termina en el último circuito.
  // El automático general se centra sobre el conjunto de circuitos, no sobre la hoja completa.
  const gap = 190;
  const left = 130;
  const rightMargin = 130;
  const top = 175;
  const busY = top;
  const outY = 525;
  const lastX = left + (n - 1) * gap;
  const busStart = left;
  const busEnd = lastX;
  const circuitCenter = (busStart + busEnd) / 2;

  // La hoja se calcula según los circuitos, con margen suficiente para textos laterales.
  const w = Math.max(980, left + rightMargin + (n - 1) * gap + 210);
  const h = 700;

  let svg=`<svg id="svgUnilineal" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${w} ${h}" style="background:white;border:1px solid #cbd8e6;border-radius:14px">`;

  // Marco del plano ajustado al ancho real del dibujo.
  svg+=`<rect x="50" y="55" width="${w-100}" height="${h-95}" fill="none" stroke="#777" stroke-dasharray="5 4"/>`;

  svg+=svgText951(w/2,35,"Tablero general",17,"middle","700");
  svg+=svgText951(82,82, proyecto?.proyecto?.nombre || "Tablero de alumbrado y fuerza 1",15,"start","700");
  svg+=svgText951(82,104, proyecto?.cliente?.nombre || "Cliente",12,"start","400");

  // Automático general centrado con el cuadro unilineal/circuitos.
  svg+=`<line x1="${circuitCenter}" y1="45" x2="${circuitCenter}" y2="53" stroke="#111" stroke-width="2"/>`;
  svg+=breakerSymbol951(circuitCenter,95,general);
  svg+=`<line x1="${circuitCenter}" y1="159" x2="${circuitCenter}" y2="${busY}" stroke="#111" stroke-width="2"/>`;

  // Barra horizontal: empieza donde está el primer automático y termina donde está el último automático.
  // No se extiende al borde del proyecto.
  svg+=`<line x1="${busStart}" y1="${busY}" x2="${busEnd}" y2="${busY}" stroke="#111" stroke-width="3"/>`;

  // Texto de barra: a la derecha del automático general, pero dentro del área útil.
  const barraX = Math.min(circuitCenter + 350, w - 260);
  svg+=svgText951(barraX,busY-30,barra,16,"middle","900");

  // Fase de llegada al extremo derecho de la barra.
  if(esTri){
    svg += `<text x="${Math.min(busEnd+45,w-95)}" y="${busY-18}" font-size="14" font-family="Arial" font-weight="900">R</text><text x="${Math.min(busEnd+65,w-75)}" y="${busY-18}" font-size="14" font-family="Arial" font-weight="900">S</text><text x="${Math.min(busEnd+85,w-55)}" y="${busY-18}" font-size="14" font-family="Arial" font-weight="900">T</text>`;
  }else{
    svg += `<text x="${Math.min(busEnd+45,w-75)}" y="${busY-18}" font-size="14" font-family="Arial" font-weight="900">R</text>`;
  }

  // Marcas laterales T.P / T.S ajustadas a la hoja.
  svg+=`<line x1="25" y1="${outY-80}" x2="60" y2="${outY-80}" stroke="#111" stroke-width="2"/><line x1="${w-60}" y1="${outY-80}" x2="${w-25}" y2="${outY-80}" stroke="#111" stroke-width="2"/>`;
  svg+=svgText951(40,outY-95,"T.P",13)+svgText951(w-40,outY-95,"T.S",13);

  cs.forEach((c,i)=>{
    const x=left+i*gap;
    const fase=esTri ? (c.fase==="R-S-T" ? ["R","S","T"][i%3] : c.fase) : "R";
    svg+=svgText951(x-13,busY+18,fase,19,"middle","900");
    svg+=`<line x1="${x}" y1="${busY}" x2="${x}" y2="${busY+72}" stroke="#111" stroke-width="2"/>`;
    svg+=breakerSymbol951(x,busY+96,c.aut);
    svg+=diffSymbol951(x,busY+215,c.dif);
    svg+=salidaSymbol951(x,outY,i+1,c);
  });

  svg+="</svg>";
  return `<div class="svg-scroll v951-scroll">${svg}</div>`;
}

function descargarUnilinealSVG218(){
  const svg = document.getElementById("svgUnilineal") || document.getElementById("unilinealSvg218");
  if(!svg){ toast("No hay unilineal para descargar."); return; }
  const blob = new Blob([svg.outerHTML], {type:"image/svg+xml"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "GIAE_Unilineal_v951_Base_Actual_v2_1_9_5_2.svg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Unilineal restaurado descargado en SVG.");
}

function renderMotorNormativo(){
  const view=document.getElementById("moduleView");
  const exp=getExpedienteNorm250();
  const audit=auditarNormativa250(exp);
  view.className="module-view show ready motor-view motor-250";
  view.innerHTML=`
    <span class="badge ready">Módulo funcional v2.5.0</span>
    <h2>⚖️ Motor Normativo SEC</h2>
    <p>Base normativa transversal: Decreto Supremo N°8, RIC 1-19, normas IEC y requisitos de distribuidoras.</p>
    <p class="privacy-note">📌 Esta versión crea la base normativa y auditoría preliminar. No modifica cálculos ni módulos operativos.</p>

    <section class="folder-head">
      <div>
        <h3>Proyecto auditado</h3>
        <p><b>Proyecto:</b> ${esc250(exp.proyectoNombre)} · <b>Cliente:</b> ${esc250(exp.cliente)} · <b>Distribuidora:</b> ${esc250(exp.distribuidora)}</p>
      </div>
      <div class="uni-mini"><b>${audit.porcentaje}%</b><small>Cumplimiento preliminar</small></div>
      <div class="uni-mini"><b>${audit.estado}</b><small>Estado normativo</small></div>
    </section>

    <section class="norm-tabs">
      <button class="btn primary" onclick="mostrarNormTab250('ds8')">DS N°8</button>
      <button class="btn" onclick="mostrarNormTab250('ric')">RIC 1-19</button>
      <button class="btn" onclick="mostrarNormTab250('iec')">IEC</button>
      <button class="btn" onclick="mostrarNormTab250('dist')">Distribuidoras</button>
      <button class="btn next" onclick="mostrarNormTab250('audit')">Auditoría</button>
    </section>

    <section id="normPanel250" class="norm-panel-250">
      ${renderTabDS8250(exp)}
    </section>

    <section class="folder-panel">
      <h3>Resultado de auditoría preliminar</h3>
      <div class="norm-audit-grid">
        ${audit.items.map(i=>`<article class="norm-audit ${i.estado}"><b>${i.icono} ${esc250(i.titulo)}</b><small>${esc250(i.detalle)}</small></article>`).join("")}
      </div>
    </section>

    <section class="folder-panel">
      <h3>Acciones</h3>
      <div class="folder-buttons">
        <button class="btn primary" onclick="guardarAuditoriaNorm250()">Guardar auditoría normativa</button>
        <button class="btn" onclick="mostrarNormTab250('audit')">Ver auditoría completa</button>
        <button class="btn next" onclick="openModule('documentacion')">Continuar a Documentación</button>
      </div>
      <div id="normMsg250" class="inline-check">Motor Normativo listo para usar como base de Documentación Inteligente.</div>
    </section>
  `;
  view.scrollIntoView({behavior:"smooth",block:"start"});
}

function getExpedienteNorm250(){
  let expediente=getJSON250("giae_chile_expediente_v240")?.expediente;
  const p=typeof getProyectoSeguro==="function"?getProyectoSeguro():getJSON250(STORAGE_KEY);
  const cargas=typeof getCargasSeguras==="function"?getCargasSeguras():getJSON250(CARGAS_KEY)||[];
  const emp=getJSON250("giae_chile_empalme_v220");
  const tie=getJSON250("giae_chile_tierra_v230");
  if(expediente) return {
    ...expediente,
    p:expediente.p||p,
    c:expediente.c||cargas,
    emp:expediente.emp||emp,
    tie:expediente.tie||tie,
    proyectoNombre:expediente.proyectoNombre||p?.proyecto?.nombre||"Sin proyecto",
    cliente:expediente.cliente||p?.cliente?.nombre||"Sin cliente",
    distribuidora:expediente.distribuidora||emp?.distribuidora||p?.ubicacion?.distribuidora||"CGE"
  };
  return {p,c:cargas,emp,tie,proyectoNombre:p?.proyecto?.nombre||"Sin proyecto",cliente:p?.cliente?.nombre||"Sin cliente",distribuidora:emp?.distribuidora||p?.ubicacion?.distribuidora||"CGE"};
}
function getJSON250(k){try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}}

function auditarNormativa250(exp){
  const items=[
    {titulo:"DS N°8 Art. 7 · Proyecto técnico", ok:!!exp.p, detalle:exp.p?"Existe proyecto base en GIAE.":"Falta proyecto técnico base."},
    {titulo:"DS N°8 Art. 8 · Instalador autorizado", ok:!!(exp.p?.instalador?.nombre), detalle:exp.p?.instalador?.nombre?"Instalador registrado.":"Falta registrar instalador SEC."},
    {titulo:"RIC 1 · Empalmes", ok:!!exp.emp, detalle:exp.emp?"Empalme inteligente guardado.":"Falta guardar empalme."},
    {titulo:"RIC 2 · Tableros", ok:(exp.c||[]).length>0, detalle:(exp.c||[]).length?`${exp.c.length} circuitos disponibles para tablero.`:"Falta cuadro/cargas."},
    {titulo:"RIC 3 · Alimentadores y demanda", ok:Number(exp.r?.demandaW||0)>0 || !!exp.emp, detalle:"Demanda calculada desde cargas/empalme."},
    {titulo:"RIC 4 · Conductores", ok:(exp.c||[]).length>0, detalle:"Conductores asociados al cuadro de carga."},
    {titulo:"RIC 5 · Protección contra tensiones peligrosas", ok:(exp.c||[]).length>0, detalle:"Protecciones preliminares disponibles."},
    {titulo:"RIC 6 · Tierra y equipotencialidad", ok:!!exp.tie, detalle:exp.tie?"Tierra automática guardada.":"Falta guardar Tierra."},
    {titulo:"RIC 18 · Presentación de proyectos", ok:!!getJSON250("giae_chile_expediente_v240"), detalle:"Carpeta Técnica centraliza el expediente."},
    {titulo:"RIC 19 · Puesta en servicio", ok:false, detalle:"Pendiente para Documentación Inteligente / TE1."},
    {titulo:"IEC 60417 · Símbolos", ok:!!exp.tie, detalle:"TP, TS y equipotencialidad implementados en Tierra."},
    {titulo:"IEC 60364 · Baja tensión", ok:!!exp.p, detalle:"Base internacional referencial para instalaciones BT."},
    {titulo:"IEC 61439 · Tableros", ok:(exp.c||[]).length>0, detalle:"Referencia futura para tableros eléctricos."}
  ].map(x=>({...x,estado:x.ok?"ok":"warn",icono:x.ok?"✓":"⚠"}));
  const pct=Math.round(items.filter(i=>i.ok).length/items.length*100);
  return{items,porcentaje:pct,estado:pct>=85?"Avanzado":pct>=60?"En revisión":"Incompleto"};
}

function renderTabDS8250(exp){
  return `<h3>📖 Decreto Supremo N°8</h3>
  <p>El DS N°8 aprueba el Reglamento de Seguridad de las Instalaciones de Consumo de Energía Eléctrica y funciona como base superior de los RIC.</p>
  <div class="norm-card-grid">
    <article><b>Artículo 7</b><small>Toda instalación debe ejecutarse de acuerdo a un proyecto técnicamente elaborado.</small></article>
    <article><b>Artículo 8</b><small>La instalación debe ser proyectada, ejecutada y dirigida por instalador eléctrico autorizado o profesional competente.</small></article>
    <article><b>Artículo 12</b><small>Enumera oficialmente los Pliegos Técnicos Normativos RIC N°1 al RIC N°19.</small></article>
    <article><b>Artículo 16</b><small>Las instalaciones deben ser declaradas para su puesta en servicio según RIC N°19.</small></article>
  </div>`;
}
function renderTabRIC250(){
  const rics=[
    ["RIC 1","Empalmes"],["RIC 2","Tableros eléctricos"],["RIC 3","Alimentadores y demanda de una instalación"],["RIC 4","Conductores, materiales y sistemas de canalización"],["RIC 5","Medidas de protección contra tensiones peligrosas y descargas eléctricas"],["RIC 6","Puesta a tierra y enlace equipotencial"],["RIC 7","Instalaciones de equipos"],["RIC 8","Sistemas de emergencia"],["RIC 9","Sistemas de autogeneración"],["RIC 10","Instalaciones de uso general"],["RIC 11","Instalaciones especiales"],["RIC 12","Instalaciones en ambientes explosivos"],["RIC 13","Subestaciones y salas eléctricas"],["RIC 14","Exigencias de eficiencia energética para edificios"],["RIC 15","Infraestructura para recarga de vehículos eléctricos"],["RIC 16","Subsistemas de distribución"],["RIC 17","Operación y mantenimiento"],["RIC 18","Presentación de proyectos"],["RIC 19","Puesta en servicio"]
  ];
  return `<h3>📚 Pliegos Técnicos Normativos RIC 1-19</h3><div class="ric-grid-250">${rics.map(r=>`<article><b>${r[0]}</b><small>${r[1]}</small></article>`).join("")}</div>`;
}
function renderTabIEC250(){
  const iec=[
    ["IEC 60364","Instalaciones eléctricas de baja tensión"],["IEC 60417","Símbolos gráficos para uso en equipos"],["IEC 61439","Conjuntos de aparamenta de baja tensión / tableros"],["IEC 60529","Grados de protección IP"],["IEC 62305","Protección contra rayos"],["IEC 60947","Aparamenta de baja tensión"]
  ];
  return `<h3>🌎 Normas IEC referenciales</h3><p>Se integran como base internacional de apoyo. La aplicación final debe respetar normativa chilena vigente.</p><div class="norm-card-grid">${iec.map(i=>`<article><b>${i[0]}</b><small>${i[1]}</small></article>`).join("")}</div>`;
}
function renderTabDist250(){
  return `<h3>🏢 Normas y requisitos de distribuidoras</h3>
  <p>GIAE considera requisitos documentales y de factibilidad de CGE, COPELEC, ENEL, CHILQUINTA, SAESA y FRONTEL.</p>
  <div class="norm-card-grid">
    <article><b>CGE</b><small>TE1, set fotográfico, punto de red, croquis, rol y número municipal cuando aplique.</small></article>
    <article><b>COPELEC</b><small>Factibilidad rural, número de vecino, requisitos constructivos y documentación de propiedad.</small></article>
    <article><b>SAESA / FRONTEL</b><small>Factibilidad, antecedentes de dominio, croquis, fotografías y condiciones rurales.</small></article>
    <article><b>ENEL / CHILQUINTA</b><small>Proceso digital, contrato, dominio vigente, número municipal y formularios propios.</small></article>
  </div>`;
}
function renderTabAudit250(){
  const exp=getExpedienteNorm250(), a=auditarNormativa250(exp);
  return `<h3>🔍 Auditoría normativa preliminar</h3><p><b>Cumplimiento estimado:</b> ${a.porcentaje}% · ${a.estado}</p><div class="norm-audit-grid">${a.items.map(i=>`<article class="norm-audit ${i.estado}"><b>${i.icono} ${esc250(i.titulo)}</b><small>${esc250(i.detalle)}</small></article>`).join("")}</div>`;
}
function mostrarNormTab250(tab){
  const p=document.getElementById("normPanel250"); if(!p)return;
  if(tab==="ds8")p.innerHTML=renderTabDS8250(getExpedienteNorm250());
  if(tab==="ric")p.innerHTML=renderTabRIC250();
  if(tab==="iec")p.innerHTML=renderTabIEC250();
  if(tab==="dist")p.innerHTML=renderTabDist250();
  if(tab==="audit")p.innerHTML=renderTabAudit250();
}
function guardarAuditoriaNorm250(){
  const exp=getExpedienteNorm250(), audit=auditarNormativa250(exp);
  localStorage.setItem("giae_chile_normativo_v250",JSON.stringify({version:APP_VERSION,actualizado:new Date().toISOString(),expediente:exp,auditoria:audit}));
  const m=document.getElementById("normMsg250"); if(m)m.innerHTML="✅ Auditoría normativa guardada.";
  toast("Auditoría normativa guardada.");
}
function esc250(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

function tick(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const ss = String(d.getSeconds()).padStart(2,"0");
  document.getElementById("clock").textContent = `${hh}:${mm}`;
  document.getElementById("dateTime").textContent = `Hora del sistema: ${d.toLocaleDateString("es-CL")} ${hh}:${mm}:${ss}`;
}

renderMenu(); renderEngines(); renderRIC(); renderQuick(); tick(); setInterval(tick,1000);

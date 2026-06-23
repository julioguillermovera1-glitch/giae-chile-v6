const APP_VERSION = "2.1.9.3";

const modules = [
  {id:"inicio", icon:"🏠", label:"Inicio", status:"base", desc:"Portada profesional del sistema GIAE Chile."},
  {id:"proyecto", icon:"📁", label:"Proyecto", status:"ready", desc:"Módulo funcional: datos del proyecto, cliente, ubicación, suministro, distribuidora e instalador SEC."},
  {id:"cargas", icon:"⚡", label:"Cargas", status:"ready", desc:"Módulo funcional: ingreso de circuitos, potencia instalada, demanda y recomendación preliminar de empalme."},
  {id:"cuadro", icon:"▣", label:"Cuadro de Carga", status:"ready", desc:"Módulo funcional: calcula Ib, protecciones preliminares, conductores, fases y resumen de carga."},
  {id:"unilineal", icon:"⌁", label:"Unilineal", status:"ready", desc:"Módulo funcional: genera diagrama unilineal automático profesional SEC desde cargas."},
  {id:"tierra", icon:"⏚", label:"Tierra", status:"missing", desc:"Pendiente: puesta a tierra y equipotencialidad según RIC 6."},
  {id:"empalme", icon:"🔌", label:"Empalme", status:"missing", desc:"Pendiente: validación de empalmes normalizados y distribuidoras."},
  {id:"carpeta", icon:"📂", label:"Carpeta Técnica", status:"ready", desc:"Módulo funcional: revisión documental por distribuidora, checklist, archivos y estado de carpeta."},
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
  {label:"Unilineal", icon:"⌁", status:"ready", target:"unilineal", text:"Funcional ✓ Generación automática"},
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
  if(id==="unilineal"){ renderUnilinealAutomatico(); return; }
  if(id==="carpeta"){ renderCarpetaTecnica(); return; }
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
    <span class="badge ready">Módulo funcional v2.1.9.3</span>
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
    <span class="badge ready">Módulo funcional v2.1.9.3</span>
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
  const proyecto = getProyectoGuardado ? getProyectoGuardado() : null;
  const distProyecto = proyecto?.ubicacion?.distribuidora || "CGE";
  const distribuidora = normalizarDistribuidora(distProyecto);
  const data = cargarCarpeta();
  const seleccion = data.distribuidora || distribuidora;
  const view = document.getElementById("moduleView");
  view.className = "module-view show ready carpeta-view";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.1.9.3</span>
    <h2>📂 Carpeta Técnica</h2>
    <p>Revisa documentos según la distribuidora seleccionada. Puedes usar GIAE sólo para revisar o para preparar un envío posterior.</p>
    <p class="privacy-note">🔒 Modo actual: revisión local. El envío por correo y respaldo en servidor se implementarán después.</p>
    <section class="folder-head">
      <div><h3>Proyecto vinculado</h3><p><b>Proyecto:</b> ${proyecto?.proyecto?.nombre || "Sin proyecto"} · <b>Cliente:</b> ${proyecto?.cliente?.nombre || "Sin cliente"} · <b>Distribuidora:</b> ${seleccion}</p></div>
      <label>Modo de trabajo<select id="modoCarpeta"><option value="revisar">Sólo revisar documentos</option><option value="preparar">Revisar y preparar envío</option></select></label>
      <label>Distribuidora<select id="distCarpeta">${Object.keys(DISTRIBUIDORAS).map(d=>`<option ${d===seleccion?'selected':''}>${d}</option>`).join("")}</select></label>
    </section>
    <section class="folder-upload"><h3>Subir documentos</h3><p>Selecciona archivos o ZIP. Esta versión revisa nombres y tipos de archivo de forma local.</p><input id="fileInputCarpeta" type="file" multiple accept=".pdf,.dwg,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.zip"><div class="folder-buttons"><button class="btn primary" id="btnGuardarCarpeta">Guardar revisión</button><button class="btn danger" id="btnLimpiarCarpeta">Limpiar carpeta</button><button class="btn" id="btnRevisarCarpeta">Revisar documentos</button></div></section>
    <section class="folder-grid"><article class="folder-panel"><h3>Checklist ${seleccion}</h3><div id="checklistDistribuidora"></div></article><article class="folder-panel"><h3>Archivos detectados</h3><div id="archivosDetectados"></div></article></section>
    <section class="folder-result" id="resultadoCarpeta"></section>
    <div class="ric-modal" id="distModal" aria-hidden="true"><div class="ric-modal-box"><h3 id="distModalTitle">Requisito aplicado</h3><div id="distModalBody"></div><button type="button" class="btn primary" onclick="cerrarDistModal()">Cerrar y volver a Carpeta</button></div></div>`;
  document.getElementById("modoCarpeta").value = data.modo || "revisar";
  bindCarpeta(); renderChecklistCarpeta(); renderArchivosCarpeta(); revisarCarpeta();
  view.scrollIntoView({behavior:"smooth", block:"start"});
}
function normalizarDistribuidora(d){const up=String(d||"").toUpperCase(); if(up.includes("ENEL"))return"ENEL"; if(up.includes("CHIL"))return"CHILQUINTA"; if(up.includes("COPELEC"))return"COPELEC"; if(up.includes("FRONTEL")||up.includes("SAESA"))return"SAESA / FRONTEL"; return"CGE";}
function cargarCarpeta(){try{return JSON.parse(localStorage.getItem(CARPETA_KEY)||"{}");}catch(e){return{};}}
function guardarCarpeta(data){localStorage.setItem(CARPETA_KEY,JSON.stringify(data));}
function bindCarpeta(){const dist=document.getElementById("distCarpeta"), modo=document.getElementById("modoCarpeta"), input=document.getElementById("fileInputCarpeta"); dist.onchange=()=>{const data=cargarCarpeta(); data.distribuidora=dist.value; guardarCarpeta(data); renderCarpetaTecnica();}; modo.onchange=()=>{const data=cargarCarpeta(); data.modo=modo.value; guardarCarpeta(data); revisarCarpeta();}; input.onchange=()=>{const archivos=Array.from(input.files||[]).map(f=>({name:f.name,type:f.type,size:f.size,updated:new Date().toISOString()})); const data=cargarCarpeta(); data.archivos=archivos; data.distribuidora=dist.value; data.modo=modo.value; guardarCarpeta(data); renderArchivosCarpeta(); revisarCarpeta();}; document.getElementById("btnGuardarCarpeta").onclick=()=>{const data=cargarCarpeta(); data.actualizado=new Date().toISOString(); guardarCarpeta(data); toast("Carpeta técnica guardada.");}; document.getElementById("btnLimpiarCarpeta").onclick=()=>{if(!confirm("¿Limpiar archivos detectados y revisión de carpeta?"))return; localStorage.removeItem(CARPETA_KEY); renderCarpetaTecnica(); toast("Carpeta técnica limpiada.");}; document.getElementById("btnRevisarCarpeta").onclick=revisarCarpeta;}
function renderChecklistCarpeta(){const dist=document.getElementById("distCarpeta")?.value||"CGE", box=document.getElementById("checklistDistribuidora"); if(!box)return; const req=DISTRIBUIDORAS[dist]; box.innerHTML=`<p>${req.descripcion}</p><div class="checklist-list">${req.documentos.map(doc=>`<div class="check-item"><span>${doc.obligatorio?"🔴":"🟡"}</span><div><b>${doc.nombre}</b><small>${doc.obligatorio?"Obligatorio":"Condicional"} · ${doc.detalle}</small></div><button class="mini-info" onclick="verDetalleDistribuidora('${dist}','${doc.id}')">Ver</button></div>`).join("")}</div>`;}
function renderArchivosCarpeta(){const data=cargarCarpeta(), archivos=data.archivos||[], box=document.getElementById("archivosDetectados"); if(!box)return; box.innerHTML=archivos.length?`<div class="file-list">${archivos.map(a=>`<div class="file-item"><b>${iconoArchivo(a.name)} ${a.name}</b><small>${formatoPeso(a.size)}</small></div>`).join("")}</div>`:`<p>No hay archivos cargados todavía.</p>`;}
function iconoArchivo(name){const n=name.toLowerCase(); if(n.endsWith(".pdf"))return"📄"; if(n.endsWith(".dwg"))return"📐"; if(n.match(/\.(jpg|jpeg|png)$/))return"🖼"; if(n.endsWith(".zip"))return"🗜"; if(n.match(/\.(doc|docx)$/))return"📝"; if(n.match(/\.(xls|xlsx)$/))return"📊"; return"📎";}
function formatoPeso(bytes){if(!bytes)return"0 KB"; if(bytes<1024*1024)return`${(bytes/1024).toFixed(1)} KB`; return`${(bytes/1024/1024).toFixed(2)} MB`;}
function revisarCarpeta(){const data=cargarCarpeta(), dist=document.getElementById("distCarpeta")?.value||data.distribuidora||"CGE", modo=document.getElementById("modoCarpeta")?.value||data.modo||"revisar", archivos=data.archivos||[], req=DISTRIBUIDORAS[dist]; const resultado=req.documentos.map(doc=>({...doc,encontrado:detectarDocumento(doc,archivos)})), obligatorios=resultado.filter(x=>x.obligatorio), faltantes=obligatorios.filter(x=>!x.encontrado), presentes=resultado.filter(x=>x.encontrado), box=document.getElementById("resultadoCarpeta"); if(!box)return; let estado="incompleta"; if(archivos.length&&faltantes.length===0)estado=modo==="preparar"?"lista":"revisada"; else if(archivos.length)estado="observada"; const estadoTxt={incompleta:"🔴 Carpeta incompleta",observada:"🟡 Carpeta con observaciones",revisada:"🟢 Documentos mínimos presentes",lista:"🟢 Lista para preparar envío"}[estado]; box.className=`folder-result ${estado}`; box.innerHTML=`<h3>${estadoTxt}</h3><p><b>Distribuidora:</b> ${dist} · <b>Modo:</b> ${modo==="revisar"?"Sólo revisar":"Revisar y preparar envío"}</p><div class="folder-metrics"><div><b>${archivos.length}</b><small>Archivos cargados</small></div><div><b>${presentes.length}</b><small>Requisitos detectados</small></div><div><b>${faltantes.length}</b><small>Obligatorios faltantes</small></div></div>${faltantes.length?`<h4>Faltan documentos obligatorios</h4><ul>${faltantes.map(f=>`<li>❌ ${f.nombre}</li>`).join("")}</ul>`:`<p>✅ No se detectan faltantes obligatorios según el checklist configurado.</p>`}<p><b>Nota:</b> revisión preliminar por nombres/tipos de archivo. Lectura inteligente se agregará con servidor documental.</p>`;}
function detectarDocumento(doc,archivos){const texto=archivos.map(a=>a.name.toLowerCase()).join(" "), id=doc.id.toLowerCase(); const claves={te1:["te1","declaracion","declaración","sec"],te1qr:["te1","qr","sec"],anexo_te1:["anexo","te1","sec"],fotos:["foto","fotos","imagen","jpg","jpeg","png"],poste:["poste","placa","punto_red","punto-red"],croquis:["croquis","ubicacion","ubicación","coordenada"],rol:["rol","sii"],numero:["numero","número","municipal","dom"],medidor:["medidor","calibracion","calibración","pruebas"],empresa:["sociedad","empresa","rut","vigencia","personeria"],dominio:["dominio","cbr","conservador"],contrato:["contrato","suministro"],jurada:["jurada","notarial"],factibilidad:["factibilidad"],poder:["poder","notarial","autorizacion","autorización"],vecino:["vecino","cuenta","cliente"],construccion:["construccion","construcción","vivienda","caseta"],distancia:["distancia","30m","30_m"],camarilla:["camarilla","160"],tierra:["tierra","puesta","malla"],ubicacion:["ubicacion","ubicación","croquis","coordenada"]}; return (claves[id]||[id]).some(k=>texto.includes(k));}
function verDetalleDistribuidora(dist,id){const doc=DISTRIBUIDORAS[dist]?.documentos.find(d=>d.id===id); if(!doc)return; document.getElementById("distModalTitle").textContent=`📚 ${dist} · ${doc.nombre}`; document.getElementById("distModalBody").innerHTML=`<p><b>Tipo:</b> ${doc.obligatorio?"Obligatorio":"Condicional"}</p><p><b>Detalle:</b> ${doc.detalle}</p><p><b>Acción GIAE:</b> cargar documento asociado. Si falta, la carpeta queda observada antes de envío.</p>`; document.getElementById("distModal").classList.add("show");}
function cerrarDistModal(){document.getElementById("distModal")?.classList.remove("show");}
function renderAsistenteDocumental(){const view=document.getElementById("moduleView"); view.className="module-view show ready asistente-view"; view.innerHTML=`<span class="badge ready">Módulo funcional v2.1.9.3</span><h2>🤖 Asistente Documental GIAE</h2><p>Consulta qué documentos debe presentar una persona o instalador autorizado SEC según la distribuidora.</p><section class="assistant-card"><label>Distribuidora<select id="assistantDist">${Object.keys(DISTRIBUIDORAS).map(d=>`<option>${d}</option>`).join("")}</select></label><label>Pregunta<input id="assistantQuestion" placeholder="Ej: ¿Qué documentos pide CGE para empalme?"></label><button class="btn primary" id="assistantAsk">Responder</button></section><section class="assistant-answer" id="assistantAnswer"></section>`; document.getElementById("assistantAsk").onclick=responderAsistente; responderAsistente(); view.scrollIntoView({behavior:"smooth",block:"start"});}
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
    <span class="badge ready">Módulo funcional v2.1.9.3</span>
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
function renderEmpalmeInteligente(){
  const r = resumenIngenieria();
  const proyecto = r.proyecto || getProyectoSeguro();
  const carpeta = cargarCarpeta ? cargarCarpeta() : {};
  const dist = carpeta.distribuidora || normalizarDistribuidora(proyecto?.ubicacion?.distribuidora || "CGE");
  const e = evaluarEmpalme217(r, dist);
  const view = document.getElementById("moduleView");
  view.className = "module-view show ready empalme-view empalme-217";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.1.9.3</span>
    <h2>🔌 Motor de Empalmes Inteligente</h2>
    <p>Analiza demanda, suministro, potencia normalizada y requisitos documentales por distribuidora.</p>

    <section class="folder-head">
      <div>
        <h3>Proyecto analizado</h3>
        <p><b>Proyecto:</b> ${proyecto?.proyecto?.nombre || "Sin proyecto"} · <b>Cliente:</b> ${proyecto?.cliente?.nombre || "Sin cliente"}</p>
      </div>
      <label>Distribuidora
        <select id="empalmeDistribuidora">
          ${Object.keys(DISTRIBUIDORAS || {"CGE":{}}).map(d=>`<option ${d===dist?'selected':''}>${d}</option>`).join("")}
        </select>
      </label>
      <label>Potencia solicitada kW
        <input id="potenciaSolicitadaKw" type="number" min="0" step="0.1" value="${e.normalSugeridaNumero || ""}" placeholder="Ej: 10">
      </label>
    </section>

    <section class="load-summary-grid">
      <article><b>${(r.totalW/1000).toFixed(2)} kW</b><small>Potencia instalada</small></article>
      <article><b>${(r.demandaW/1000).toFixed(2)} kW</b><small>Demanda calculada</small></article>
      <article><b>${e.tipoRecomendado}</b><small>Tipo recomendado</small></article>
      <article><b>${e.normalSugerida}</b><small>Potencia normalizada sugerida</small></article>
    </section>

    <section class="empalme-result ${e.estadoClase}" id="empalmeResultado">
      <h3>${e.titulo}</h3>
      <p>${e.mensaje}</p>
      <p><b>Corriente estimada:</b> ${e.corriente.toFixed(1)} A</p>
      <p><b>Importante:</b> la distribuidora define protección/limitador del medidor según potencia contratada y factibilidad. GIAE recomienda, advierte y documenta.</p>
      <div class="folder-buttons">
        <button class="btn primary" id="btnValidarEmpalme">Validar potencia solicitada</button>
        <button class="btn" onclick="abrirModalRic217()">📚 Ver fundamento normativo</button>
        <button class="btn next" onclick="openModule('carpeta')">Ver Carpeta Técnica</button>
      </div>
    </section>

    <section class="folder-grid">
      <article class="folder-panel">
        <h3>Orden técnica GIAE</h3>
        <ol>
          <li>Demanda calculada: ${(r.demandaW/1000).toFixed(2)} kW.</li>
          <li>Tipo recomendado: ${e.tipoRecomendado}.</li>
          <li>Potencia normalizada sugerida: ${e.normalSugerida}.</li>
          <li>Validar factibilidad con ${dist}.</li>
          <li>No declarar automático de medidor como si lo definiera el instalador.</li>
        </ol>
      </article>
      <article class="folder-panel">
        <h3>Documentos base ${dist}</h3>
        ${renderDocsEmpalme217(dist)}
      </article>
    </section>

    <section class="folder-panel">
      <h3>Potencias normalizadas preliminares</h3>
      <div class="norm-list">
        <div><b>Monofásico:</b> ${potenciasMono217().join(" kW · ")} kW</div>
        <div><b>Trifásico:</b> ${potenciasTri217().join(" kW · ")} kW</div>
      </div>
    </section>

    ${modalRic217()}
  `;
  document.getElementById("empalmeDistribuidora").onchange = ()=>renderEmpalmeInteligente();
  document.getElementById("btnValidarEmpalme").onclick = validarPotenciaSolicitada217;
  view.scrollIntoView({behavior:"smooth", block:"start"});
}

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
  if(!view){ return; }
  view.className = "module-view show ready unilineal-view unilineal-pro";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.1.9.3</span>
    <h2>⌁ Unilineal Blindado SEC</h2>
    <p>Generando unilineal automático...</p>
  `;
  try{
    let proyecto = null;
    try{ proyecto = (typeof getProyectoSeguro === "function") ? getProyectoSeguro() : JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }catch(_){ proyecto = null; }

    let cargasRaw = [];
    try{
      if(typeof getCargasSeguras === "function") cargasRaw = getCargasSeguras();
      else cargasRaw = JSON.parse(localStorage.getItem(CARGAS_KEY) || "[]");
    }catch(_){ cargasRaw = []; }

    let cargas = Array.isArray(cargasRaw) ? cargasRaw.map((c,i)=>{
      try{ return (typeof calcCircuito === "function") ? calcCircuito(c,i) : calcCircuitoLocal2193(c,i); }
      catch(_){ return calcCircuitoLocal2193(c,i); }
    }) : [];

    let totalW = cargas.reduce((s,c)=>s+Number(c.totalW||0),0);
    let demandaW = cargas.reduce((s,c)=>s+Number(c.demandaW||c.totalW||0),0);
    let suministro = proyecto?.electrico?.suministro || "";
    let tri = suministro.includes("Trifásico") || cargas.some(c=>c.alimentacion==="Trifásico" || c.fase==="R-S-T");
    let corriente = tri ? demandaW/(Math.sqrt(3)*380*0.92) : demandaW/(220*0.92);
    let resumen = {totalW, demandaW, corriente, tri};
    let barra = tri ? "Barra repartidora tetrapolar 4x100A 10kA" : "Barra repartidora bipolar 2x100A 10kA";
    let general = sugerirGeneralUnilineal2193(corriente, tri);

    view.innerHTML = `
      <span class="badge ready">Módulo funcional v2.1.9.3</span>
      <h2>⌁ Unilineal Blindado SEC</h2>
      <p>Diagrama automático con símbolo de automático SEC, barra repartidora correcta y render protegido contra errores.</p>
      <p class="privacy-note">📐 Vista técnica preliminar. Para presentación oficial, el instalador autorizado puede usar este esquema como apoyo y desarrollar el plano definitivo en AutoCAD.</p>
      <section class="folder-head">
        <div>
          <h3>Proyecto base</h3>
          <p><b>Proyecto:</b> ${escapeHtml2193(proyecto?.proyecto?.nombre || "Sin proyecto")} · <b>Cliente:</b> ${escapeHtml2193(proyecto?.cliente?.nombre || "Sin cliente")} · <b>Demanda:</b> ${(demandaW/1000).toFixed(2)} kW</p>
        </div>
        <div class="uni-mini"><b>${tri ? "Trifásico" : "Monofásico"}</b><small>Suministro</small></div>
        <div class="uni-mini"><b>${general}</b><small>Automático general preliminar</small></div>
      </section>
      <section class="uni-toolbar">
        <button class="btn primary" onclick="renderUnilinealAutomatico()">Actualizar unilineal</button>
        <button class="btn" onclick="descargarUnilinealSVG218()">Descargar SVG</button>
        <button class="btn" onclick="window.print()">Imprimir / PDF</button>
        <button class="btn next" onclick="openModule('tierra')">Continuar a Tierra</button>
      </section>
      ${cargas.length ? "" : `<section class="load-warning error"><h3>⚠️ Sin circuitos</h3><p>No existen circuitos para generar el unilineal. Complete primero el módulo Cargas.</p></section>`}
      <section class="uni-card professional-sheet">
        <div class="uni-header"><h3>TABLERO GENERAL</h3><p>${barra}</p></div>
        ${generarSVGUnilineal2193(cargas, tri, general, barra, proyecto, resumen)}
      </section>
    `;
    view.scrollIntoView({behavior:"smooth", block:"start"});
  }catch(e){
    renderUnilinealFallback(e);
  }
}

function renderUnilinealFallback(e){
  const view = document.getElementById("moduleView");
  if(!view) return;
  view.className = "module-view show ready unilineal-view";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.1.9.3</span>
    <h2>⌁ Unilineal Blindado SEC</h2>
    <section class="load-warning error">
      <h3>⚠️ El unilineal no pudo leer los datos anteriores</h3>
      <p>El módulo sí está conectado. Falta completar o reparar los datos de Cargas/Cuadro para generar el dibujo.</p>
      <p><b>Detalle técnico:</b> ${escapeHtml2193(e && e.message ? e.message : "Error desconocido")}</p>
      <button class="btn primary" onclick="openModule('cargas')">Volver a Cargas</button>
    </section>
  `;
  view.scrollIntoView({behavior:"smooth", block:"start"});
}

function calcCircuitoLocal2193(c,i){
  const cantidad = Number(c.cantidad || 1);
  const potenciaUnidad = Number(c.potenciaUnidad || c.potencia || 0);
  const totalW = Number(c.totalW || cantidad * potenciaUnidad || 0);
  const simult = Number(c.simultaneidad || 100);
  const demandaW = Number(c.demandaW || totalW * simult/100 || totalW);
  const tri = c.alimentacion === "Trifásico" || c.fase === "R-S-T";
  const ib = tri ? demandaW/(Math.sqrt(3)*380*0.92) : demandaW/(220*0.92);
  const aut = elegirAutoLocal2193(ib);
  return {
    ...c,
    nombre: c.nombre || c.tipo || `Circuito ${i+1}`,
    totalW, demandaW, ib,
    automatico: c.automatico || aut,
    diferencial: c.diferencial || (tri ? "4P 40A 30mA" : "2P 25A 30mA"),
    conductor: c.conductor || (String(c.tipo||c.nombre||"").toLowerCase().includes("alumbrado") ? "1,5 mm²" : "2,5 mm²"),
    fase: tri ? "R-S-T" : "R"
  };
}

function elegirAutoLocal2193(ib){
  const vals = [6,10,16,20,25,32,40,50,63,80,100,125];
  const v = vals.find(x=>x >= ib*1.15) || "Estudio";
  return typeof v === "number" ? `1x${v}A` : "Requiere estudio";
}

function sugerirGeneralUnilineal2193(ib, tri){
  const vals = [25,32,40,50,63,80,100,125];
  const v = vals.find(x=>x >= Number(ib||0)*1.15) || "Estudio";
  return typeof v === "number" ? (tri ? `3x${v}A` : `1x${v}A`) : "Requiere estudio";
}

function generarSVGUnilineal2193(cargas, tri, general, barra, proyecto, resumen){
  const circuits = cargas.length ? cargas : [{nombre:"Sin circuitos", automatico:"-", fase: tri ? "R-S-T" : "R", conductor:"-", demandaW:0}];
  const n = circuits.length;
  const colW = 122, left = 90, right = 100;
  const width = Math.max(1040, left + right + n*colW);
  const height = 520, busY = 178, circuitTop = busY + 14;
  const title = escapeHtml2193(proyecto?.proyecto?.nombre || "Proyecto GIAE");
  const cliente = escapeHtml2193(proyecto?.cliente?.nombre || "Cliente");
  const demanda = (((resumen?.demandaW)||0)/1000).toFixed(2);
  const generalX = width/2;
  const verticalFromGeneralY = tri ? busY-18 : busY;

  const phaseLabels = tri
    ? `<text x="${left-42}" y="${busY-12}" class="phase">R</text><text x="${left-42}" y="${busY+8}" class="phase">S</text><text x="${left-42}" y="${busY+28}" class="phase">T</text>`
    : `<text x="${left-42}" y="${busY+4}" class="phase">R</text>`;

  const busLines = tri
    ? `<line x1="${left}" y1="${busY-18}" x2="${width-right}" y2="${busY-18}" class="bus"/><line x1="${left}" y1="${busY+2}" x2="${width-right}" y2="${busY+2}" class="bus"/><line x1="${left}" y1="${busY+22}" x2="${width-right}" y2="${busY+22}" class="bus"/>`
    : `<line x1="${left}" y1="${busY}" x2="${width-right}" y2="${busY}" class="bus"/>`;

  const circuitSVG = circuits.map((c,i)=>{
    const x = left + colW*i + colW/2;
    const phase = tri ? (c.fase === "R-S-T" ? "RST" : (c.fase || ["R","S","T"][i%3])) : "R";
    const tapY = tri ? (phase === "S" ? busY+2 : phase === "T" ? busY+22 : busY-18) : busY;
    const aut = escapeHtml2193(c.automatico || "AUT.");
    const name = escapeHtml2193(c.nombre || c.tipo || `Circuito ${i+1}`);
    const conductor = escapeHtml2193(c.conductor || "");
    const kw = ((Number(c.demandaW || c.totalW || 0))/1000).toFixed(2);
    return `
      <g class="uni-circuit-pro">
        <text x="${x-6}" y="${tapY-9}" class="phaseSmall">${phase}</text>
        <line x1="${x}" y1="${tapY}" x2="${x}" y2="${circuitTop+30}" class="wire"/>
        ${simboloAutomaticoSEC2193(x, circuitTop+42, 15)}
        <text x="${x+20}" y="${circuitTop+47}" class="tiny">${aut}</text>
        <line x1="${x}" y1="${circuitTop+56}" x2="${x}" y2="${circuitTop+84}" class="wire"/>
        <rect x="${x-20}" y="${circuitTop+84}" width="40" height="27" class="pdBox"/>
        <text x="${x}" y="${circuitTop+102}" text-anchor="middle" class="pdTxt">P/D</text>
        <text x="${x+24}" y="${circuitTop+102}" class="tiny">30mA</text>
        <line x1="${x}" y1="${circuitTop+111}" x2="${x}" y2="${circuitTop+146}" class="wire"/>
        <circle cx="${x}" cy="${circuitTop+163}" r="13" class="cNum"/>
        <text x="${x}" y="${circuitTop+168}" text-anchor="middle" class="num">${i+1}</text>
        <line x1="${x}" y1="${circuitTop+176}" x2="${x}" y2="${circuitTop+202}" class="wire"/>
        <rect x="${x-45}" y="${circuitTop+202}" width="90" height="50" class="loadBox"/>
        <text x="${x}" y="${circuitTop+221}" text-anchor="middle" class="loadName">${name.slice(0,15)}</text>
        <text x="${x}" y="${circuitTop+238}" text-anchor="middle" class="tiny">${conductor}</text>
        <text x="${x}" y="${circuitTop+252}" text-anchor="middle" class="tiny">${kw} kW</text>
      </g>`;
  }).join("");

  return `<div class="svg-scroll professional-scroll">
    <svg id="unilinealSvg218" class="unilineal-svg professional-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs><style>
        .sheet{fill:#fff;stroke:#111;stroke-width:1.4}.title{font:bold 22px Arial;fill:#111}.sub{font:12px Arial;fill:#111}.label{font:bold 12px Arial;fill:#111}.tiny{font:10px Arial;fill:#111}.phase{font:bold 18px Arial;fill:#111}.phaseSmall{font:bold 11px Arial;fill:#111}.num{font:bold 13px Arial;fill:#111}.pdTxt{font:bold 11px Arial;fill:#111}.loadName{font:bold 11px Arial;fill:#111}.bus{stroke:#111;stroke-width:3.2;fill:none}.wire{stroke:#111;stroke-width:2.1;fill:none}.pdBox,.loadBox,.cNum{stroke:#111;stroke-width:1.8;fill:white}.breakerArc{stroke:#111;stroke-width:2.3;fill:none}.breakerMid{stroke:#111;stroke-width:2.1;fill:none}.dash{stroke:#999;stroke-width:1.2;stroke-dasharray:8 5;fill:none}
      </style></defs>
      <rect x="24" y="24" width="${width-48}" height="${height-48}" class="sheet"/>
      <rect x="44" y="42" width="${width-88}" height="${height-82}" class="dash"/>
      <text x="${width/2}" y="69" text-anchor="middle" class="title">TABLERO GENERAL</text>
      <text x="72" y="93" class="sub">Proyecto: ${title}</text>
      <text x="72" y="111" class="sub">Cliente: ${cliente}</text>
      <text x="72" y="129" class="sub">Demanda: ${demanda} kW · ${tri ? "Trifásico" : "Monofásico"}</text>
      <line x1="${generalX}" y1="92" x2="${generalX}" y2="127" class="wire"/>
      ${simboloAutomaticoSEC2193(generalX, 145, 21)}
      <text x="${generalX+32}" y="151" class="label">AUT. GENERAL ${general}</text>
      <line x1="${generalX}" y1="166" x2="${generalX}" y2="${verticalFromGeneralY}" class="wire"/>
      ${phaseLabels}${busLines}
      <text x="${width-right-270}" y="${tri ? busY+52 : busY+34}" class="tiny">${escapeHtml2193(barra)}</text>
      ${circuitSVG}
      <text x="${width-245}" y="${height-54}" class="tiny">GIAE Chile v2.1.9.3 · Unilineal automático</text>
    </svg>
  </div>`;
}

function simboloAutomaticoSEC2193(x, y, r){
  return `<path d="M ${x-r} ${y} A ${r} ${r} 0 0 1 ${x+r} ${y}" class="breakerArc"/>
          <line x1="${x}" y1="${y-r-8}" x2="${x}" y2="${y+r+8}" class="breakerMid"/>`;
}

function escapeHtml2193(v){
  return String(v ?? "").replace(/[&<>"\']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[m]; });
}

function descargarUnilinealSVG218(){
  const svg = document.getElementById("unilinealSvg218");
  if(!svg){ toast("No hay unilineal para descargar."); return; }
  const blob = new Blob([svg.outerHTML], {type:"image/svg+xml"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "GIAE_Unilineal_Blindado_v2_1_9_3.svg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Unilineal reparado descargado en SVG.");
}

function tick(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const ss = String(d.getSeconds()).padStart(2,"0");
  document.getElementById("clock").textContent = `${hh}:${mm}`;
  document.getElementById("dateTime").textContent = `Hora del sistema: ${d.toLocaleDateString("es-CL")} ${hh}:${mm}:${ss}`;
}

renderMenu(); renderEngines(); renderRIC(); renderQuick(); tick(); setInterval(tick,1000);

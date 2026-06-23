const APP_VERSION = "2.1.2.3";

const modules = [
  {id:"inicio", icon:"🏠", label:"Inicio", status:"base", desc:"Portada profesional del sistema GIAE Chile."},
  {id:"proyecto", icon:"📁", label:"Proyecto", status:"ready", desc:"Módulo funcional: datos del proyecto, cliente, ubicación, suministro, distribuidora e instalador SEC."},
  {id:"cargas", icon:"⚡", label:"Cargas", status:"missing", desc:"Pendiente: ingreso de alumbrado, enchufes, fuerza, simultaneidad y demanda."},
  {id:"cuadro", icon:"▣", label:"Cuadro de Carga", status:"missing", desc:"Pendiente: Ib, Iz, protecciones, diferenciales y cumplimiento."},
  {id:"unilineal", icon:"⎇", label:"Unilineal", status:"missing", desc:"Pendiente: diagrama profesional generado desde el cuadro de carga."},
  {id:"tierra", icon:"⏚", label:"Tierra", status:"missing", desc:"Pendiente: puesta a tierra y equipotencialidad según RIC 6."},
  {id:"empalme", icon:"🔌", label:"Empalme", status:"missing", desc:"Pendiente: validación de empalmes normalizados y distribuidoras."},
  {id:"documentacion", icon:"📄", label:"Documentación", status:"missing", desc:"Pendiente: TE1, formularios nativos de distribuidoras y memorias técnicas."},
  {id:"presupuesto", icon:"💰", label:"Presupuesto", status:"missing", desc:"Pendiente: módulo separado de materiales, mano de obra, IVA y utilidad."},
  {id:"motorric", icon:"⚙", label:"Motor RIC", status:"missing", desc:"Pendiente: motor normativo con reglas RIC detalladas y verificables."},
  {id:"auditoria", icon:"🧩", label:"Auditoría", status:"missing", desc:"Pendiente: trazabilidad, historial de consultas y registro de errores."},
  {id:"administracion", icon:"🔐", label:"Administración", status:"hidden", desc:"Pendiente: centro de monitoreo exclusivo del administrador."}
];

const quicks = [
  {label:"Nuevo Proyecto", icon:"📁", status:"ready", target:"proyecto", text:"Crear o editar datos base del proyecto"},
  {label:"Proyecto de Ejemplo", icon:"📘", status:"ready", target:"demo", text:"Cargar datos de demostración"},
  {label:"Cargas", icon:"⚡", status:"missing", target:"cargas", text:"Pendiente para v2.1.3"},
  {label:"Cuadro de Carga", icon:"▣", status:"missing", target:"cuadro", text:"Pendiente para v2.1.4"},
  {label:"Unilineal", icon:"⎇", status:"missing", target:"unilineal", text:"Pendiente para v2.1.5"},
  {label:"Presupuesto", icon:"💰", status:"missing", target:"presupuesto", text:"Pendiente para versión posterior"}
];

const STORAGE_KEY = "giae_chile_proyecto_v212";

function stateLabel(status){
  if(status==="base") return "Base lista ✓";
  if(status==="ready") return "Funcional ✓";
  if(status==="next") return "Siguiente módulo";
  if(status==="draft") return "Base inicial";
  if(status==="hidden") return "Privado pendiente";
  return "No implementado";
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
  if(id==="proyecto"){ renderProyecto(); return; }
  const m = modules.find(x=>x.id===id) || modules[0];
  const view = document.getElementById("moduleView");
  const cls = stateClass(m.status);
  view.className = "module-view show " + cls;
  view.innerHTML = `
    <span class="badge ${cls}">${stateLabel(m.status)}</span>
    <h2>${m.icon} ${m.label}</h2>
    <p>${m.desc}</p>
    <p><b>Regla:</b> nada se marca como funcional hasta que realmente guarde, lea o ejecute una acción útil.</p>
  `;
  view.scrollIntoView({behavior:"smooth", block:"start"});
}

function renderProyecto(){
  const view = document.getElementById("moduleView");
  view.className = "module-view show ready proyecto-view";
  view.innerHTML = `
    <span class="badge ready">Módulo funcional v2.1.2.3</span>
    <h2>📁 Proyecto</h2>
    <p>Este módulo guarda los datos base del proyecto. No calcula presupuesto, no dibuja unilineal y no define protecciones finales.</p>

    <div class="project-toolbar">
      <button class="step-chip active" data-section="datos">1. Datos</button>
      <button class="step-chip" data-section="cliente">2. Cliente</button>
      <button class="step-chip" data-section="ubicacion">3. Ubicación</button>
      <button class="step-chip" data-section="electrico">4. Eléctrico</button>
      <button class="step-chip" data-section="instalador">5. Instalador</button>
      <button class="step-chip" data-section="resumen">6. Resumen</button>
    </div>

    <form id="proyectoForm" class="project-form compact">
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
        <label>RUT cliente<input name="rutCliente" class="rut-input" placeholder="Ej: 15.180.337-7"><small class="rut-msg" data-rut-msg="rutCliente">Ingrese RUT chileno</small></label>
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
        <label>RUT instalador<input name="rutInstalador" class="rut-input" placeholder="Ej: 15.180.337-7"><small class="rut-msg" data-rut-msg="rutInstalador">Ingrese RUT chileno</small></label>
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
        <div class="sec-data-card">
          <b>Datos rápidos</b>
          <button type="button" class="btn small" id="usarDatosJulio">Usar datos Julio Vera</button>
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="button" class="btn primary" id="guardarProyecto">Guardar proyecto</button>
        <button type="button" class="btn" id="cargarProyecto">Cargar guardado</button>
        <button type="button" class="btn danger" id="limpiarProyecto">Limpiar proyecto</button>
        <button type="button" class="btn next" id="continuarCargas">Continuar a Cargas</button>
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
  document.getElementById("guardarProyecto").onclick = guardarProyecto;
  document.getElementById("cargarProyecto").onclick = ()=>cargarProyecto(true);
  document.getElementById("limpiarProyecto").onclick = limpiarProyecto;
  document.getElementById("continuarCargas").onclick = ()=>openModule("cargas");
  const datosJulio = document.getElementById("usarDatosJulio");
  if(datosJulio) datosJulio.onclick = usarDatosJulio;
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
    msg.textContent = "Ingrese RUT chileno";
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
  form.elements.rutInstalador.value = "15.180.337-7";
  form.elements.claseSEC.value = "Clase A";
  pintarEstadoRut("rutInstalador", "15.180.337-7");
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

function guardarProyecto(){
  const obj = formToObject();
  const faltantes = [];
  if(!obj.proyecto.nombre) faltantes.push("nombre del proyecto");
  if(!obj.cliente.nombre) faltantes.push("cliente");
  if(!obj.ubicacion.direccion) faltantes.push("dirección");
  if(!obj.ubicacion.distribuidora) faltantes.push("distribuidora");
  if(!obj.electrico.suministro) faltantes.push("tipo de suministro");
  if(obj.cliente.rut && !obj.cliente.rutValido) faltantes.push("RUT cliente inválido");
  if(obj.cliente.telefono && !validarTelefonoChile(obj.cliente.telefono)) faltantes.push("teléfono cliente inválido");
  if(obj.instalador.rut && !obj.instalador.rutValido) faltantes.push("RUT instalador inválido");

  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  renderResumen(obj, faltantes);
  toast(faltantes.length ? "Proyecto guardado con datos pendientes." : "Proyecto guardado correctamente.");
  goProjectSection("resumen");
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
    instalador:{nombre:"Julio Vera Concha", rut:"", claseSEC:"Clase D", correo:""}
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  objectToForm(demo);
  renderResumen(demo, []);
  toast("Proyecto de ejemplo cargado.");
}

function limpiarProyecto(){
  if(!confirm("¿Limpiar los datos del proyecto guardado?")) return;
  localStorage.removeItem(STORAGE_KEY);
  const form = document.getElementById("proyectoForm");
  if(form) form.reset();
  document.getElementById("projectSummary").innerHTML = "<h3>Resumen del proyecto</h3><p>No hay proyecto guardado todavía.</p>";
  toast("Proyecto limpiado.");
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

function tick(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const ss = String(d.getSeconds()).padStart(2,"0");
  document.getElementById("clock").textContent = `${hh}:${mm}`;
  document.getElementById("dateTime").textContent = `Hora del sistema: ${d.toLocaleDateString("es-CL")} ${hh}:${mm}:${ss}`;
}

renderMenu(); renderEngines(); renderRIC(); renderQuick(); tick(); setInterval(tick,1000);

const modules = [
  {id:"inicio", icon:"🏠", label:"Inicio", ready:true, desc:"Portada profesional del sistema GIAE Chile."},
  {id:"proyecto", icon:"📁", label:"Proyecto", ready:true, desc:"Motor de datos del cliente, dirección, tipo de instalación y distribuidora."},
  {id:"cargas", icon:"⚡", label:"Cargas", ready:true, desc:"Motor de cargas, demanda y simultaneidad."},
  {id:"cuadro", icon:"▣", label:"Cuadro de Carga", ready:true, desc:"Motor de Ib, Iz, protecciones y estado de cumplimiento."},
  {id:"unilineal", icon:"⎇", label:"Unilineal", ready:true, desc:"Motor de dibujo técnico del diagrama unilineal."},
  {id:"tierra", icon:"⏚", label:"Tierra", ready:true, desc:"Motor de puesta a tierra y equipotencialidad."},
  {id:"empalme", icon:"🔌", label:"Empalme", ready:true, desc:"Motor de validación de empalmes normalizados."},
  {id:"documentacion", icon:"📄", label:"Documentación", ready:false, desc:"Pendiente: TE1, formularios nativos de distribuidoras y memorias técnicas."},
  {id:"presupuesto", icon:"💰", label:"Presupuesto", ready:false, desc:"Pendiente: módulo separado de materiales, mano de obra, IVA y utilidad."},
  {id:"motorric", icon:"⚙", label:"Motor RIC", ready:true, desc:"Base normativa RIC 1-19 para validaciones."},
  {id:"auditoria", icon:"🧩", label:"Auditoría", ready:false, desc:"Pendiente: trazabilidad, historial de consultas y registro de errores."},
  {id:"administracion", icon:"🔐", label:"Administración", ready:false, desc:"Pendiente: centro de monitoreo exclusivo del administrador."}
];

const quicks = [
  {label:"Nuevo Proyecto", icon:"📁", ready:true, target:"proyecto", text:"Crear un proyecto desde cero"},
  {label:"Abrir Proyecto", icon:"🗂", ready:false, target:"proyecto", text:"Requiere base de datos o almacenamiento"},
  {label:"Proyecto de Ejemplo", icon:"📘", ready:true, target:"proyecto", text:"Cargar datos de demostración"},
  {label:"Importar Archivo", icon:"⬇", ready:false, target:"administracion", text:"Pendiente para versión con archivos"},
  {label:"Centro de Ayuda", icon:"?", ready:false, target:"documentacion", text:"Manuales, guías y tutoriales"},
  {label:"Soporte Técnico", icon:"🎧", ready:false, target:"administracion", text:"Contacto y reporte de problemas"}
];

function renderMenu(){
  const nav = document.getElementById("mainMenu");
  nav.innerHTML = modules.map((m,i)=>`<button class="nav-btn ${i===0?'active':''} ${m.ready?'':'missing'}" data-id="${m.id}"><span>${m.icon}</span>${m.label}</button>`).join("");
  nav.querySelectorAll("button").forEach(btn=>btn.onclick=()=>openModule(btn.dataset.id));
}

function renderEngines(){
  const grid = document.getElementById("engineGrid");
  grid.innerHTML = modules.filter(m=>m.id!=="inicio" && m.id!=="administracion").slice(0,9).map(m=>`
    <div class="engine ${m.ready?'':'missing'}">
      <span>${m.icon}</span>
      <b>${m.label}</b>
      <small class="status">${m.ready?'Operativo ✓':'No creado / pendiente ✕'}</small>
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
    <div class="quick ${q.ready?'':'missing'}" data-target="${q.target}">
      <b>${q.icon} ${q.label}</b>
      <small>${q.ready?q.text:"PENDIENTE: "+q.text}</small>
    </div>
  `).join("");
  box.querySelectorAll(".quick").forEach(q=>q.onclick=()=>openModule(q.dataset.target));
}

function openModule(id){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.id===id));
  const m = modules.find(x=>x.id===id) || modules[0];
  const view = document.getElementById("moduleView");
  view.className = "module-view show " + (m.ready ? "" : "missing");
  view.innerHTML = `
    <span class="badge ${m.ready?'ok':'no'}">${m.ready?'Módulo operativo':'Módulo no creado aún'}</span>
    <h2>${m.icon} ${m.label}</h2>
    <p>${m.desc}</p>
    ${m.ready ? `<p>Este módulo queda disponible para el siguiente desarrollo independiente.</p>` : `<p><b>Estado:</b> Queda marcado en rojo para no confundirlo con funciones disponibles.</p>`}
  `;
  view.scrollIntoView({behavior:"smooth", block:"start"});
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

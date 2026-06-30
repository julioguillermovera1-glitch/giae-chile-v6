const profileNames = {
  administrador: 'Administrador de plataforma',
  empresa: 'Panel empresa',
  independiente: 'Panel profesional',
  estudiante: 'Panel estudiante',
  aula: 'Aula Técnica - Acceso libre'
};

const quickByProfile = {
  administrador: [
    ['administracion', 'Administración', 'Usuarios, empresas, licencias, módulos y respaldos.'],
    ['auditoria', 'Auditoría', 'Revisión del estado general de la plataforma.'],
    ['educacion', 'Aula Técnica', 'Revisar contenidos de acceso libre.']
  ],
  empresa: [
    ['proyecto', 'Nuevo proyecto', 'Crear o continuar un proyecto eléctrico.'],
    ['usuarios', 'Trabajadores', 'Gestionar usuarios internos de la empresa.'],
    ['presupuesto', 'Presupuestos', 'Generar cotizaciones con marca de empresa.'],
    ['documentacion', 'Documentación', 'Preparar informes y antecedentes.']
  ],
  independiente: [
    ['proyecto', 'Nuevo proyecto', 'Registrar cliente, dirección y datos técnicos base.'],
    ['cargas', 'Cargas', 'Ingresar consumos y circuitos.'],
    ['unilineal', 'Unilineal', 'Generar diagrama automático desde el cuadro.'],
    ['presupuesto', 'Presupuesto', 'Crear cotización profesional.']
  ],
  estudiante: [
    ['educacion', 'Continuar aprendizaje', 'Aula Técnica, conceptos y guías.'],
    ['proyecto', 'Proyecto de práctica', 'Practicar un flujo de proyecto eléctrico.'],
    ['cargas', 'Ejercicios de cargas', 'Ingresar cargas y revisar resultados.'],
    ['auditoria', 'Revisión guiada', 'Comprender observaciones del sistema.']
  ],
  aula: [
    ['educacion', 'Comenzar aprendizaje', 'Contenidos libres sin registro ni licencia.'],
    ['educacion', 'Materiales', 'Conocer componentes básicos de una instalación.'],
    ['educacion', 'Empalmes', 'Aprender cómo se solicita y entiende un empalme.'],
    ['educacion', 'Formación comunitaria', 'Educación y Desarrollo Comunitario para Pueblos Originarios.']
  ]
};

function getProjectStats(state){
  const loads = state.currentProject?.loads || [];
  const totalW = loads.reduce((sum, item) => sum + (Number(item.power || item.watts || item.potencia || 0) * Number(item.quantity || item.qty || item.cantidad || 1)), 0);
  return {
    loads: loads.length,
    totalW,
    totalKw: (totalW / 1000).toFixed(2),
    supply: state.currentProject?.supplyType || 'monofasico'
  };
}

function moduleButton([id, title, desc]){
  return `<button class="dash-action" data-open-module="${id}"><strong>${title}</strong><span>${desc}</span></button>`;
}

function adminPanel(state){
  const sessions = state.admin?.sessions || [];
  const connected = sessions.filter(s => s.status === 'Conectado').length;
  const users = state.admin?.users?.length || 0;
  const modules = Object.values(state.admin?.enabledModules || {}).filter(v => v !== false).length;
  return `
    <section class="dashboard-grid kpi-row">
      <article><small>Usuarios conectados</small><strong>${connected}</strong></article>
      <article><small>Usuarios registrados</small><strong>${users}</strong></article>
      <article><small>Módulos activos</small><strong>${modules || 'Base'}</strong></article>
      <article><small>Modo normativo</small><strong>Estricto</strong></article>
    </section>
    <section class="dashboard-grid two">
      <article class="dashboard-card"><h4>Actividad reciente</h4>${sessions.slice(-4).reverse().map(s=>`<p><strong>${s.name}</strong><br><span>${s.status} · ${s.lastSeen || 'sin fecha'}</span></p>`).join('') || '<p>Sin sesiones registradas.</p>'}</article>
      <article class="dashboard-card"><h4>Acciones administrativas</h4>${quickByProfile.administrador.map(moduleButton).join('')}</article>
    </section>`;
}

function standardPanel(state){
  const profile = state.profile;
  const stats = getProjectStats(state);
  const projectName = state.currentProject?.name || 'Proyecto sin nombre';
  const client = state.currentProject?.client || 'Cliente no definido';
  const checklist = state.currentProject?.checklist || [];
  const done = checklist.filter(item => item.done).length;
  const progress = checklist.length ? Math.round((done / checklist.length) * 100) : 0;
  const company = state.admin?.company?.name || state.companyBrand?.name || 'GIAE Chile';
  const cards = quickByProfile[profile] || quickByProfile.independiente;
  return `
    <section class="dashboard-grid kpi-row">
      <article><small>Proyecto activo</small><strong>${projectName}</strong></article>
      <article><small>Cliente</small><strong>${client}</strong></article>
      <article><small>Avance</small><strong>${progress}%</strong></article>
      <article><small>Potencia estimada</small><strong>${stats.totalKw} kW</strong></article>
    </section>
    <section class="dashboard-grid two">
      <article class="dashboard-card"><h4>Accesos rápidos</h4>${cards.map(moduleButton).join('')}</article>
      <article class="dashboard-card">
        <h4>Resumen del espacio</h4>
        <p><strong>Perfil:</strong> ${profileNames[profile] || 'Usuario'}</p>
        <p><strong>Empresa/Marca:</strong> ${company}</p>
        <p><strong>Normativa autorizada:</strong> RIC · IEC eléctrica · DS N°8</p>
        <p><strong>Último guardado:</strong> ${state.currentProject?.updatedAt || 'Pendiente'}</p>
        <p><strong>Checklist:</strong> ${done}/${checklist.length || 0} tareas completas</p>
        <div class="dashboard-notice">El sistema no debe emitir recomendaciones técnicas sin respaldo normativo cargado.</div>
      </article>
    </section>`;
}

function aulaPanel(){
  return `
    <section class="dashboard-grid kpi-row aula-free-row">
      <article><small>Acceso</small><strong>Libre</strong></article>
      <article><small>Registro</small><strong>No requerido</strong></article>
      <article><small>Uso</small><strong>Educativo</strong></article>
      <article><small>Licencia</small><strong>Sin pago</strong></article>
    </section>
    <section class="dashboard-grid two">
      <article class="dashboard-card"><h4>Rutas de aprendizaje</h4>${quickByProfile.aula.map(moduleButton).join('')}</article>
      <article class="dashboard-card">
        <h4>Educación y Desarrollo Comunitario para Pueblos Originarios</h4>
        <p>Contenido de orientación técnica para comprender empalmes, materiales, seguridad eléctrica, cotizaciones y trabajos que deben ser realizados por instaladores autorizados.</p>
        <div class="dashboard-notice">Este espacio es educativo. No reemplaza la revisión, ejecución ni declaración de un profesional competente.</div>
      </article>
    </section>`;
}

export function render(host, state){
  const profile = state.profile || 'independiente';
  host.innerHTML = `
    <div class="module-window dashboard-module">
      <div class="module-head">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h3>${profileNames[profile] || 'Panel de trabajo'}</h3>
          <p>Escritorio inicial del perfil seleccionado. Desde aquí se accede a las herramientas principales sin mostrar todos los módulos de golpe.</p>
        </div>
      </div>
      ${profile === 'administrador' ? adminPanel(state) : profile === 'aula' ? aulaPanel() : standardPanel(state)}
    </div>`;

  host.querySelectorAll('[data-open-module]').forEach(button => {
    button.addEventListener('click', () => {
      if(window.GIAE?.openModule) window.GIAE.openModule(button.dataset.openModule);
    });
  });
}

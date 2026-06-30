export function render(host, state) {
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Usuarios y perfiles</h3>
        <p>Base visual para separar instaladores, empresas y estudiantes. La autenticación real queda para una fase backend.</p>
      </div>
      <div class="card-grid">
        <article class="card"><h4>Independiente</h4><p>Proyectos propios, presupuestos, exportaciones y datos profesionales.</p></article>
        <article class="card"><h4>Empresa</h4><p>Logo, plantillas, trabajadores, permisos, clientes y proyectos compartidos.</p></article>
        <article class="card"><h4>Estudiante</h4><p>Ejercicios, ejemplos guiados y explicaciones paso a paso.</p></article>
      </div>
      <div class="result-box">Perfil activo: <strong>${state.profile || "sin sesión"}</strong></div>
    </section>`;
}

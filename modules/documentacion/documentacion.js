export function render(host, state) {
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Documentación</h3>
        <p>Preparará memoria técnica, informes, anexos y formularios. No depende de Presupuesto.</p>
      </div>
      <div class="card-grid">
        <article class="card"><h4>TE1</h4><p>Plantilla pendiente de parametrizar.</p></article>
        <article class="card"><h4>Memoria técnica</h4><p>Se alimentará desde datos del proyecto.</p></article>
        <article class="card"><h4>Informe</h4><p>Exportación preparada para PDF/impresión.</p></article>
      </div>
      <div class="result-box">Proyecto activo: ${state.currentProject.name}</div>
    </section>`;
}

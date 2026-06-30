export function render(host) {
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Educación</h3>
        <p>Espacio para estudiantes, trabajadores nuevos y comunidades que necesiten aprender con lenguaje claro.</p>
      </div>
      <div class="card-grid">
        <article class="card"><h4>Glosario</h4><p>Conceptos eléctricos explicados de forma simple.</p></article>
        <article class="card"><h4>Ejercicios</h4><p>Casos guiados para practicar cálculos.</p></article>
        <article class="card"><h4>Modo rural</h4><p>Material educativo adaptable a comunidades y zonas aisladas.</p></article>
      </div>
    </section>`;
}

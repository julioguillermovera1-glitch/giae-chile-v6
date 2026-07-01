// Punto de integración UI futuro para GIAE Inspector Técnico.
// Este archivo queda preparado para conectar el módulo visual con core/inspector.

export function mountGIAEInspector(container, inspectorResult = null) {
  if (!container) return;

  container.innerHTML = `
    <section class="giae-inspector">
      <h2>GIAE Inspector Técnico</h2>
      <p>Sistema Inteligente de Auditoría y Validación de Proyectos Eléctricos.</p>
      <p>Estado: ${inspectorResult?.score?.label || 'Pendiente de ejecución'}</p>
    </section>
  `;
}

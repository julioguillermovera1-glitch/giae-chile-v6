export function render(host, state) {
  const checks = [
    { label: "Proyecto con nombre", ok: Boolean(state.currentProject.name) },
    { label: "Cliente informado", ok: Boolean(state.currentProject.client) },
    { label: "Tipo de empalme definido", ok: Boolean(state.currentProject.supplyType) },
    { label: "Cargas registradas", ok: (state.currentProject.loads || []).length > 0 }
  ];
  const score = Math.round(checks.filter(item => item.ok).length / checks.length * 100);
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Auditoría preliminar</h3>
        <p>Revisa consistencia del proyecto. El motor normativo detallado será una fase posterior.</p>
      </div>
      <div class="result-box"><strong>Puntaje de preparación:</strong> ${score}%</div>
      <div>${checks.map(item => `<p>${item.ok ? "✅" : "⚠️"} ${item.label}</p>`).join("")}</div>
    </section>`;
}

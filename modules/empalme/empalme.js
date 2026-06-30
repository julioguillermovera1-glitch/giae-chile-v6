import { totalPower, currentSinglePhase, currentThreePhase, suggestBreaker } from "../../core/calculations.js";

export function render(host, state) {
  const project = state.currentProject;
  const power = totalPower(project.loads || []);
  const current = project.supplyType === "trifasico" ? currentThreePhase(power) : currentSinglePhase(power);
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Empalme</h3>
        <p>Calcula una orientación preliminar para empalme. Las reglas detalladas se cargan desde datos propios del proyecto.</p>
      </div>
      <div class="card-grid">
        <article class="card"><h4>Distribuidora</h4><p>${project.distributor || "No definida"}</p></article>
        <article class="card"><h4>Tipo</h4><p>${project.supplyType}</p></article>
        <article class="card"><h4>Limitador sugerido</h4><p>${suggestBreaker(current) || "Revisar"} A</p></article>
      </div>
      <div class="result-box">Este módulo no certifica el empalme; prepara datos para revisión técnica y normativa.</div>
    </section>`;
}

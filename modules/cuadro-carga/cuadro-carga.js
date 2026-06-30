import { totalPower, currentSinglePhase, currentThreePhase, suggestBreaker } from "../../core/calculations.js";

export function render(host, state) {
  const project = state.currentProject;
  const power = totalPower(project.loads || []);
  const current = project.supplyType === "trifasico" ? currentThreePhase(power) : currentSinglePhase(power);
  const breaker = suggestBreaker(current);
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Cuadro de carga preliminar</h3>
        <p>Resume cargas y calcula corriente base. La validación normativa queda en Auditoría/Motor RIC.</p>
      </div>
      <div class="card-grid">
        <article class="card"><h4>Potencia total</h4><p>${power} W</p></article>
        <article class="card"><h4>Corriente estimada</h4><p>${current} A</p></article>
        <article class="card"><h4>Protección sugerida</h4><p>${breaker ? breaker + " A" : "Revisar"}</p></article>
      </div>
    </section>`;
}

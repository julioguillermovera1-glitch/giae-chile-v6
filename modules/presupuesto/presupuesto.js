export function render(host) {
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Presupuesto</h3>
        <p>Base original para materiales, mano de obra, margen, logo y plantillas de empresa.</p>
      </div>
      <div class="form-grid">
        <label>Materiales $ <input id="materials" type="number" min="0" value="0"></label>
        <label>Mano de obra $ <input id="labor" type="number" min="0" value="0"></label>
        <label>Margen % <input id="margin" type="number" min="0" value="20"></label>
        <label>IVA % <input id="tax" type="number" min="0" value="19"></label>
      </div>
      <button id="budgetCalc">Calcular</button>
      <div id="budgetResult" class="result-box">Resultado pendiente.</div>
    </section>`;
  host.querySelector("#budgetCalc").addEventListener("click", () => {
    const materials = Number(host.querySelector("#materials").value);
    const labor = Number(host.querySelector("#labor").value);
    const margin = Number(host.querySelector("#margin").value) / 100;
    const tax = Number(host.querySelector("#tax").value) / 100;
    const subtotal = (materials + labor) * (1 + margin);
    const total = Math.round(subtotal * (1 + tax));
    host.querySelector("#budgetResult").textContent = `Total estimado: $${total.toLocaleString("es-CL")}`;
  });
}

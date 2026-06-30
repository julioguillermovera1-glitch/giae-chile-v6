export function render(host) {
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Puesta a tierra</h3>
        <p>Base nueva para registrar diseño, materiales, medición en terreno y observaciones técnicas.</p>
      </div>
      <div class="form-grid">
        <label>Resistencia medida Ω <input type="number" min="0" step="0.01" id="earthResistance" placeholder="Ej: 8.5"></label>
        <label>Tipo de electrodo <input id="electrode" placeholder="Barra, malla, anillo, otro"></label>
      </div>
      <button id="earthCheck">Evaluar registro</button>
      <div id="earthResult" class="result-box">Ingresa medición real para evaluar.</div>
    </section>`;
  host.querySelector("#earthCheck").addEventListener("click", () => {
    const value = Number(host.querySelector("#earthResistance").value);
    host.querySelector("#earthResult").textContent = value > 0
      ? `Medición registrada: ${value} Ω. Requiere contraste con criterio técnico aplicable y medición certificada.`
      : "Ingresa una medición válida.";
  });
}

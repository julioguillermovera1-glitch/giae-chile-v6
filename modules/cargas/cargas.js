import { addLoad, clearLoads } from "../../core/store.js";
import { totalPower } from "../../core/calculations.js";

export function render(host, state) {
  const loads = state.currentProject.loads || [];
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Cargas eléctricas</h3>
        <p>Registra cargas sin generar documentos ni presupuestos.</p>
      </div>
      <div class="form-grid">
        <label>Descripción <input id="loadName" placeholder="Ej: enchufes sala 1"></label>
        <label>Potencia W <input id="loadPower" type="number" min="0" placeholder="1200"></label>
      </div>
      <div class="top-actions">
        <button id="addLoadBtn">Agregar carga</button>
        <button id="clearLoadsBtn" class="secondary">Limpiar cargas</button>
      </div>
      <div class="result-box">
        <strong>Total:</strong> ${totalPower(loads)} W<br>
        <strong>Cargas registradas:</strong> ${loads.length}
      </div>
      <div>${loads.map(item => `<p>• ${item.name}: ${item.powerW} W</p>`).join("") || "<p>No hay cargas registradas.</p>"}</div>
    </section>`;

  host.querySelector("#addLoadBtn").addEventListener("click", () => {
    const name = host.querySelector("#loadName").value.trim();
    const powerW = Number(host.querySelector("#loadPower").value);
    if (!name || !powerW) return alert("Ingresa descripción y potencia.");
    addLoad({ name, powerW });
    render(host, state);
  });
  host.querySelector("#clearLoadsBtn").addEventListener("click", () => {
    clearLoads();
    render(host, state);
  });
}

import { addLoad, clearLoads, persist, addHistory } from "../../core/store.js";
import { totalPower } from "../../core/calculations.js";

function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

function rows(loads){
  return loads.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${esc(item.name)}</strong><br><small>${esc(item.type || "General")}</small></td>
      <td>${Number(item.quantity || 1)}</td>
      <td>${Number(item.powerW || 0).toLocaleString("es-CL")} W</td>
      <td>${(Number(item.quantity || 1) * Number(item.powerW || 0)).toLocaleString("es-CL")} W</td>
      <td>${esc(item.phase || "Auto")}</td>
      <td><button class="ghost danger-text" data-delete-load="${index}">Quitar</button></td>
    </tr>`).join("");
}

export function render(host, state) {
  const project = state.currentProject;
  const loads = project.loads || [];
  const total = totalPower(loads);
  host.innerHTML = `
    <section class="module-window real-workspace cargas-workspace">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">Workspace real</p>
          <h3>Cargas del Proyecto Activo</h3>
          <p>Este módulo registra consumos reales y actualiza el Proyecto Activo. El cuadro de carga, empalme, tierra y unilineal leen estos datos.</p>
        </div>
        <div class="status-strip">
          <span>Proyecto: ${esc(project.name)}</span>
          <span>Total: ${(total/1000).toFixed(2)} kW</span>
          <span>Circuitos: ${loads.length}</span>
        </div>
      </div>

      <div class="dashboard-card">
        <h4>Agregar carga</h4>
        <div class="form-grid compact">
          <label>Descripción <input id="loadName" placeholder="Ej: enchufes sala 1"></label>
          <label>Tipo
            <select id="loadType">
              <option>Alumbrado</option><option>Enchufes</option><option>Fuerza</option><option>Climatización</option><option>Especial</option>
            </select>
          </label>
          <label>Cantidad <input id="loadQty" type="number" min="1" value="1"></label>
          <label>W por unidad <input id="loadPower" type="number" min="0" value="100"></label>
          <label>Fase
            <select id="loadPhase"><option>Auto</option><option>R</option><option>S</option><option>T</option><option>R-S-T</option></select>
          </label>
        </div>
        <div class="module-toolbar">
          <button id="addLoadBtn" class="primary-action">Agregar al proyecto</button>
          <button id="exampleLoadsBtn" class="secondary">Cargar ejemplo</button>
          <button id="clearLoadsBtn" class="secondary">Limpiar cargas</button>
        </div>
      </div>

      ${loads.length ? `
        <div class="data-table-wrap">
          <table>
            <thead><tr><th>N°</th><th>Carga</th><th>Cantidad</th><th>Potencia unidad</th><th>Total</th><th>Fase</th><th></th></tr></thead>
            <tbody>${rows(loads)}</tbody>
          </table>
        </div>` : `<div class="workspace-empty">No hay cargas registradas. Agrega cargas para que los demás módulos trabajen con datos reales.</div>`}
    </section>`;

  host.querySelector("#addLoadBtn").addEventListener("click", () => {
    const name = host.querySelector("#loadName").value.trim();
    const powerW = Number(host.querySelector("#loadPower").value);
    const quantity = Number(host.querySelector("#loadQty").value || 1);
    if (!name || !powerW || quantity < 1) return alert("Ingresa descripción, cantidad y potencia válida.");
    addLoad({ name, powerW, quantity, type: host.querySelector("#loadType").value, phase: host.querySelector("#loadPhase").value });
    render(host, state);
  });
  host.querySelector("#exampleLoadsBtn").addEventListener("click", () => {
    addLoad({ name:"Alumbrado sala", type:"Alumbrado", quantity:8, powerW:18, phase:"Auto" });
    addLoad({ name:"Enchufes generales", type:"Enchufes", quantity:6, powerW:180, phase:"Auto" });
    addLoad({ name:"Equipo especial", type:"Especial", quantity:1, powerW:1200, phase:"Auto" });
    render(host, state);
  });
  host.querySelector("#clearLoadsBtn").addEventListener("click", () => {
    if(confirm("¿Eliminar todas las cargas del Proyecto Activo?")){ clearLoads(); render(host, state); }
  });
  host.querySelectorAll("[data-delete-load]").forEach(button => button.addEventListener("click", () => {
    project.loads.splice(Number(button.dataset.deleteLoad), 1);
    addHistory("Carga eliminada", "Cargas", false);
    persist();
    render(host, state);
  }));
}

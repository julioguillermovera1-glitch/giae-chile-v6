import { updateProject } from "../../core/store.js";

export function render(host, state) {
  const project = state.currentProject;
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Proyecto eléctrico</h3>
        <p>Centraliza los datos mínimos que otros módulos consultarán sin depender entre ellos.</p>
      </div>
      <div class="form-grid">
        <label>Nombre del proyecto <input id="projectName" value="${project.name || ""}"></label>
        <label>Cliente <input id="client" value="${project.client || ""}"></label>
        <label>Instalador <input id="installer" value="${project.installer || ""}"></label>
        <label>Empresa <input id="company" value="${project.company || ""}"></label>
        <label>Tipo de empalme
          <select id="supplyType">
            <option value="monofasico" ${project.supplyType === "monofasico" ? "selected" : ""}>Monofásico</option>
            <option value="trifasico" ${project.supplyType === "trifasico" ? "selected" : ""}>Trifásico</option>
          </select>
        </label>
        <label>Distribuidora
          <select id="distributor">
            <option value="cge">CGE</option>
            <option value="copelec">Copelec</option>
            <option value="frontel">Frontel</option>
            <option value="saesa">Saesa</option>
          </select>
        </label>
      </div>
      <button id="saveProjectData">Actualizar datos del proyecto</button>
    </section>`;

  host.querySelector("#saveProjectData").addEventListener("click", () => {
    updateProject({
      name: host.querySelector("#projectName").value.trim(),
      client: host.querySelector("#client").value.trim(),
      installer: host.querySelector("#installer").value.trim(),
      company: host.querySelector("#company").value.trim(),
      supplyType: host.querySelector("#supplyType").value,
      distributor: host.querySelector("#distributor").value
    });
    alert("Datos del proyecto actualizados.");
  });
}

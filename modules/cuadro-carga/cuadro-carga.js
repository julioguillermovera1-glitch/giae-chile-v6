function esc(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function num(value, digits=2){
  return Number(value || 0).toLocaleString("es-CL", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function kw(value){ return (Number(value || 0) / 1000).toLocaleString("es-CL", { minimumFractionDigits: 3, maximumFractionDigits: 3 }); }

function rows(board){
  return board.map(row => `<tr>
    <td>${row.number}</td>
    <td><strong>${esc(row.description)}</strong><br><small>${esc(row.type)}</small></td>
    <td>${row.quantity}</td>
    <td>${Number(row.unitPowerW || 0).toLocaleString("es-CL")} W</td>
    <td>${kw(row.installedW)} kW</td>
    <td>${kw(row.demandW)} kW</td>
    <td>${num(row.currentA)} A</td>
    <td>${esc(row.phase)}</td>
    <td>${esc(row.protection)}<br><small>${esc(row.differential)}</small></td>
    <td>${esc(row.conductor)}<br><small>Iz ${num(row.conductorIzA)} A · ΔV ${num(row.voltageDropPercent)}%</small></td>
    <td>${esc(row.conduit)}</td>
    <td>${esc(row.confidence)}</td>
  </tr>`).join("");
}

export function render(host, state) {
  const project = state.currentProject;
  const engine = project.electricalEngine;
  const board = project.loadBoard || [];
  host.innerHTML = `
    <section class="module-window real-workspace">
      <div class="workspace-title-row">
        <div>
          <p class="eyebrow">PASO 3 · Cuadro de carga</p>
          <h3>Cuadro de carga</h3>
          <p>GIAE ordena las cargas ingresadas y muestra protecciones, conductores, fases y totales.</p>
        </div>
        <div class="status-strip"><span>${board.length} circuitos</span><span>${num(project.demandPowerKw,3)} kW demanda</span></div>
      </div>
      <div class="kpi-grid engineering-kpis">
        <div class="kpi-card"><span>Potencia instalada</span><strong>${num(project.installedPowerKw,3)} kW</strong></div>
        <div class="kpi-card"><span>Demanda</span><strong>${num(project.demandPowerKw,3)} kW</strong></div>
        <div class="kpi-card"><span>Corriente proyecto</span><strong>${num(project.currentA)} A</strong></div>
        <div class="kpi-card"><span>Estado</span><strong>${esc(project.engineeringStatus || "Pendiente")}</strong></div>
      </div>
      ${board.length ? `<div class="data-table-wrap wide-table"><table>
        <thead><tr><th>N°</th><th>Carga</th><th>Cant.</th><th>W unidad</th><th>Instalada</th><th>Demanda</th><th>Ib</th><th>Fase</th><th>Protección</th><th>Conductor</th><th>Canalización</th><th>Confianza</th></tr></thead>
        <tbody>${rows(board)}</tbody>
      </table></div>` : `<div class="workspace-empty">No hay cargas calculadas. Agrega cargas en el Motor de Ingeniería.</div>`}
      ${board.length ? `
      <div class="dashboard-card next-step-card">
        <div class="section-title-row">
          <div><h4>Cuadro de carga listo</h4><p>El siguiente paso es calcular la puesta a tierra recomendada usando estos circuitos.</p></div>
          <button id="continueToGrounding" class="primary-action">Continuar a puesta a tierra</button>
        </div>
      </div>` : `
      <div class="dashboard-card next-step-card muted-step">
        <div class="section-title-row">
          <div><h4>Faltan cargas</h4><p>Primero ingresa cargas para generar el cuadro automaticamente.</p></div>
          <button id="backToLoads" class="secondary">Volver a cargas</button>
        </div>
      </div>`}
    </section>`;
  host.querySelector("#continueToGrounding")?.addEventListener("click", () => window.GIAE?.openModule?.("tierra"));
  host.querySelector("#backToLoads")?.addEventListener("click", () => window.GIAE?.openModule?.("cargas"));
}

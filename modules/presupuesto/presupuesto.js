export function render(host, state) {
  const brand = state.companyBrand || state.admin?.company?.brand || {};
  const company = state.admin?.company || {};
  const templates = (state.admin?.templates || []).filter(t => t.type === "Presupuesto" || t.type === "Trabajo");
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Presupuesto y órdenes de trabajo</h3>
        <p>Cada empresa puede usar su logo, colores y plantillas propias. Los valores se calculan con datos ingresados por el usuario; GIAE no inventa precios.</p>
      </div>
      <div class="budget-preview" style="border:1px solid var(--line);border-radius:18px;padding:1rem;background:#fff">
        <div style="display:flex;gap:1rem;align-items:center;justify-content:space-between;border-bottom:3px solid ${brand.accentColor || '#1456a0'};padding-bottom:1rem;margin-bottom:1rem">
          <div>
            <strong style="font-size:1.4rem;color:${brand.primaryColor || '#102033'}">${escapeHtml(company.name || brand.name || 'GIAE Chile')}</strong><br>
            <span class="small">Plantilla corporativa editable</span>
          </div>
          <div>${company.logoData ? `<img src="${company.logoData}" alt="Logo" style="max-width:130px;max-height:75px;object-fit:contain">` : defaultLogo()}</div>
        </div>
        <label>Plantilla<select id="budgetTemplate">${templates.map((t,i)=>`<option value="${i}">${escapeHtml(t.name)} · ${escapeHtml(t.type)}</option>`).join('') || '<option>Plantilla básica</option>'}</select></label>
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
    const tpl = templates[Number(host.querySelector("#budgetTemplate")?.value || 0)];
    host.querySelector("#budgetResult").innerHTML = `<strong>Total estimado:</strong> $${total.toLocaleString("es-CL")}<br><span class="small">Plantilla: ${escapeHtml(tpl?.name || 'Básica')}. Los precios deben ser ingresados por la empresa o instalador.</span>`;
  });
}
function defaultLogo(){ return `<svg viewBox="0 0 120 120" width="88" height="88"><rect x="10" y="10" width="100" height="100" rx="24" fill="currentColor"/><path d="M30 72h25l-5 28 40-52H65l7-28z" fill="#fff"/></svg>`; }
function escapeHtml(value){return String(value??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

import { persist, addHistory } from "../../core/store.js";
import { CAD_SYMBOLS, CAD_LAYERS } from "../../core/cad/cadEngine.js";

function esc(value = ""){ return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function n(value, fallback = 0){ const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }

export function render(host, state){
  const project = state.currentProject;
  const symbols = Array.isArray(project.customSymbols) ? project.customSymbols : [];
  
  host.innerHTML = `
    <section class="module-window">
      <div class="module-head">
        <div>
          <p class="eyebrow">Fase 5 - Creador de símbolos</p>
          <h3>Biblioteca de símbolos CAD</h3>
          <p>Crea y personaliza símbolos para usar en tus planos eléctricos.</p>
        </div>
      </div>

      <section class="cad-workspace" style="display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; padding: 1.5rem;">
        
        <aside style="display: grid; gap: 1rem; align-content: start;">
          <article class="admin-card">
            <h4>Crear símbolo</h4>
            <label>Nombre<input id="symbolName" type="text" placeholder="Ej: Campana" value=""></label>
            <label>Descripción<textarea id="symbolDesc" placeholder="Describe el símbolo" style="min-height: 80px; font-size: 12px;"></textarea></label>
            <label>Capa<select id="symbolLayer">${CAD_LAYERS.map(layer => `<option value="${layer.id}">${esc(layer.label)}</option>`).join("")}</select></label>
            <div class="row-actions">
              <button id="createSymbolBtn" class="primary">Crear símbolo</button>
            </div>
          </article>

          <article class="admin-card">
            <h4>Vista previa SVG</h4>
            <textarea id="symbolSvg" style="width: 100%; height: 120px; font-family: monospace; font-size: 11px; padding: 8px; background: #0f172a; color: #e2e8f0; border: 1px solid #1e293b; border-radius: 6px;" placeholder="Código SVG del símbolo"></textarea>
          </article>
        </aside>

        <main>
          <article class="admin-card">
            <h4>Símbolos estándar incluidos</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
              ${CAD_SYMBOLS.map(sym => `
                <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer;" onclick="alert('Símbolo: ${sym.id}')">
                  <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; margin-bottom: 8px;">${esc(sym.label)}</div>
                  <small style="color: #94a3b8; font-size: 11px;">${esc(sym.kind)}</small>
                </div>
              `).join("")}
            </div>
          </article>

          <article class="admin-card" style="margin-top: 1.5rem;">
            <h4>Símbolos personalizados (${symbols.length})</h4>
            ${symbols.length === 0 
              ? `<p style="color: #94a3b8; text-align: center; padding: 2rem;">Sin símbolos personalizados aún</p>`
              : `<div style="display: grid; gap: 0.5rem;">${symbols.map(sym => `
                <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="color: #e2e8f0; font-weight: 600; font-size: 13px;">${esc(sym.name)}</div>
                    <small style="color: #64748b; font-size: 11px;">${esc(sym.description)}</small>
                  </div>
                  <button class="ghost danger-text" style="padding: 0.4rem 0.6rem; font-size: 11px;" onclick="">Eliminar</button>
                </div>
              `).join("")}</div>`
            }
          </article>
        </main>
      </section>
    </section>`;

  host.querySelector("#createSymbolBtn").addEventListener("click", () => {
    const name = host.querySelector("#symbolName").value.trim();
    const desc = host.querySelector("#symbolDesc").value.trim();
    const layer = host.querySelector("#symbolLayer").value;
    const svg = host.querySelector("#symbolSvg").value.trim();
    
    if(!name) { alert("Ingresa nombre del símbolo"); return; }
    if(!svg) { alert("Ingresa el código SVG"); return; }
    
    if(!Array.isArray(project.customSymbols)) project.customSymbols = [];
    project.customSymbols.push({
      id: "custom-" + Date.now().toString(36),
      name,
      description: desc,
      layer,
      svg,
      created: new Date().toISOString()
    });
    
    addHistory("Símbolo personalizado creado: " + name, "Creador de símbolos", false);
    persist();
    render(host, state);
  });
}

export const module = {
  id: "cad-symbols",
  label: "Creador de símbolos",
  group: "cad",
  path: "cad-symbols",
  profiles: ["administrador"],
  permission: null,
  hiddenInMenu: false
};

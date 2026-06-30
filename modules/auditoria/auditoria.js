import { evaluateStrictRule, strictNormativeMessage } from "../../core/normativeGuard.js";

export function render(host, state) {
  const checks = [
    { label: "Proyecto con nombre", ok: Boolean(state.currentProject.name) },
    { label: "Cliente informado", ok: Boolean(state.currentProject.client) },
    { label: "Tipo de empalme definido", ok: Boolean(state.currentProject.supplyType) },
    { label: "Cargas registradas", ok: (state.currentProject.loads || []).length > 0 }
  ];
  const score = Math.round(checks.filter(item => item.ok).length / checks.length * 100);
  const rule = evaluateStrictRule({ topic: "Auditoría preliminar", hasLocalRule: false });
  host.innerHTML = `
    <section class="module-window">
      <div>
        <p class="eyebrow">Módulo independiente</p>
        <h3>Auditoría normativa estricta</h3>
        <p>La plataforma puede emitir observaciones técnicas, pero sus opiniones deben guiarse solo por RIC, IEC y Decreto de Ley N°8 de Chile.</p>
      </div>
      <div class="result-box"><strong>Puntaje de preparación:</strong> ${score}%</div>
      <div class="policy-box"><b>Regla anti-invención:</b> ${strictNormativeMessage()}</div>
      <div>${checks.map(item => `<p>${item.ok ? "✅" : "⚠️"} ${item.label}</p>`).join("")}</div>
      <div class="result-box warn"><b>Estado normativo:</b> ${rule.message}</div>
    </section>`;
}

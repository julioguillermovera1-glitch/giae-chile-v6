// Integración Cloudflare D1 + R2 para CAD Electrico
// ✅ No rompe nada - Usa localStorage como respaldo

export class CloudflareCADService {
  constructor(apiBase = "/api/giae") {
    this.apiBase = apiBase;
  }

  /**
   * Guardar plano en Cloudflare D1 + R2 (sin romper localStorage)
   */
  async saveToCF(projectId, cadDocument) {
    try {
      if (!projectId) {
        console.warn("⚠️ projectId no disponible - usando localStorage");
        return { success: false, reason: "no_project_id", local: true };
      }

      const response = await fetch(`${this.apiBase}/planos?project_id=${projectId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nombre: cadDocument.name || "Plano sin nombre",
          escala: cadDocument.scale || "1:50",
          unidades: cadDocument.units || "mm",
          contenido: cadDocument
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log("✅ Plano guardado en Cloudflare D1 + R2:", result.planId);
        return { success: true, planId: result.planId, cloud: true };
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.warn("⚠️ No se pudo guardar en Cloudflare:", error.message);
      return { success: false, error: error.message, local: true };
    }
  }

  /**
   * Cargar plano desde Cloudflare R2 (con fallback a localStorage)
   */
  async loadFromCF(planId) {
    try {
      const response = await fetch(`${this.apiBase}/planos/${planId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log("✅ Plano cargado desde Cloudflare R2:", planId);
        return { success: true, plan: result.plan, cloud: true };
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.warn("⚠️ No se pudo cargar desde Cloudflare:", error.message);
      return { success: false, error: error.message, local: true };
    }
  }

  /**
   * Health check - Verificar disponibilidad de Cloudflare
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBase}/health`, { timeout: 5000 });
      if (!response.ok) return { available: false };
      
      const result = await response.json();
      return {
        available: result.bindings?.d1 && result.bindings?.r2,
        db: result.bindings?.d1,
        r2: result.bindings?.r2
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  /**
   * Mostrar status en UI (visual feedback)
   */
  getStatusIcon(health) {
    if (!health.available) return "🔴 Offline";
    if (health.db && health.r2) return "🟢 Conectado";
    return "🟡 Parcial";
  }
}

export default CloudflareCADService;

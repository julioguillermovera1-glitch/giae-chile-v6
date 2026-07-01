/**
 * GIAE RuleLoader
 * Carga reglas JSON desde rutas públicas del proyecto.
 */
export class RuleLoader {
  static async loadJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${path}: ${response.status}`);
    }
    return response.json();
  }

  static async loadRulePack(path) {
    const data = await RuleLoader.loadJson(path);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.rules)) return data.rules;
    throw new Error(`Paquete de reglas inválido: ${path}`);
  }
}

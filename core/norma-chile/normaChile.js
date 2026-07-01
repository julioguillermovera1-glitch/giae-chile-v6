
/**
 * NORMA-CHILE Core v1.0-base
 * Motor de consulta normativa para GIAE.
 * Regla permanente: no almacenar textos completos de normas; solo reglas de ingeniería, referencias y trazabilidad.
 */
const NormaChile = {
  catalogo: null,
  reglas: [],
  async cargar() {
    const [catalogo, ds8, ricIndex] = await Promise.all([
      fetch('data/norma-chile/catalogo-normativo.json').then(r=>r.json()),
      fetch('data/norma-chile/reglas/ds8/reglas-ds8-base.json').then(r=>r.json()),
      fetch('data/norma-chile/reglas/ric/indice-ric-1-19.json').then(r=>r.json())
    ]);
    this.catalogo = catalogo;
    this.reglas = ds8.reglas || [];
    this.ricIndex = ricIndex.items || [];
    return { documentos: catalogo.documentos.length, reglas: this.reglas.length, ric: this.ricIndex.length };
  },
  buscarReglas(filtro = {}) {
    return this.reglas.filter(regla => {
      return Object.entries(filtro).every(([k,v]) => !v || String(regla[k] || '').toLowerCase().includes(String(v).toLowerCase()));
    });
  },
  evaluar(contexto = {}) {
    const resultados = [];
    for (const regla of this.reglas) {
      // Evaluador base conservador: no ejecuta condiciones arbitrarias.
      // Marca aplicabilidad por etiquetas del contexto.
      const aplica = !contexto.categoria || regla.categoria?.toLowerCase().includes(String(contexto.categoria).toLowerCase());
      if (aplica) {
        resultados.push({
          regla: regla.id,
          estado: regla.estado,
          nivel: regla.nivel,
          mensaje: regla.mensaje_usuario,
          referencia: regla.referencia,
          resultado: 'requiere_revision_contextual'
        });
      }
    }
    return resultados;
  },
  trazabilidad(reglaId) {
    const regla = this.reglas.find(r => r.id === reglaId);
    if (!regla) return null;
    return {
      id: regla.id,
      origen: regla.origen,
      documento: regla.documento,
      apartado: regla.articulo_o_apartado,
      referencia: regla.referencia,
      version: regla.version,
      motores: regla.motores
    };
  }
};
window.NormaChile = NormaChile;

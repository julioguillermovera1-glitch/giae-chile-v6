/* NORMA-CHILE v1.1 - Motor de Reglas
   Diseñado para que los motores GIAE consulten reglas estructuradas.
*/
(function(){
  const NormaChileRuleEngine = {
    version: '1.1.0',
    reglas: [],
    cargar(reglas){
      this.reglas = Array.isArray(reglas) ? reglas : [];
      return { ok:true, total:this.reglas.length, version:this.version };
    },
    buscar(filtro={}){
      return this.reglas.filter(r => {
        return Object.entries(filtro).every(([k,v]) => {
          if(!v) return true;
          const valor = (r[k] || '').toString().toLowerCase();
          return valor.includes(v.toString().toLowerCase());
        });
      });
    },
    porMotor(motor){
      return this.reglas.filter(r => Array.isArray(r.motores) && r.motores.includes(motor));
    },
    explicar(id){
      const r = this.reglas.find(x => x.id === id);
      if(!r) return { ok:false, mensaje:'Regla no encontrada en NORMA-CHILE.' };
      return {
        ok:true,
        id:r.id,
        origen:r.origen,
        documento:r.documento,
        referencia:r.referencia,
        categoria:r.categoria,
        validacion:r.validacion,
        mensaje:r.mensaje_cumple,
        estado:r.estado,
        version:r.version
      };
    },
    cobertura(){
      const porOrigen = {};
      this.reglas.forEach(r => { porOrigen[r.origen] = (porOrigen[r.origen] || 0) + 1; });
      return porOrigen;
    }
  };
  window.NormaChileRuleEngine = NormaChileRuleEngine;
})();

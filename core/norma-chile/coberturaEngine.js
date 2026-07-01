/* NORMA-CHILE v1.2 - Motor de Cobertura Normativa */
(function(){
  const NormaChileCoverageEngine = {
    version: '1.2.0',
    diagnosticar(documentos=[]){
      const total = documentos.length;
      const reglas = documentos.reduce((a,d)=>a+(Number(d.reglas_estructuradas)||0),0);
      const pendientes = documentos.filter(d => String(d.estado).includes('pendiente')).length;
      const conReglas = documentos.filter(d => (Number(d.reglas_estructuradas)||0)>0).length;
      return { total_documentos: total, reglas_estructuradas: reglas, documentos_con_reglas: conReglas, pendientes, version:this.version };
    },
    porMotor(documentos=[], motor=''){
      return documentos.filter(d => (d.motores||[]).includes(motor));
    },
    pendientes(documentos=[]){
      return documentos.filter(d => (Number(d.reglas_estructuradas)||0)===0);
    }
  };
  window.NormaChileCoverageEngine = NormaChileCoverageEngine;
})();

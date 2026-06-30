function getValue(context, key){
  return key.split(".").reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, context);
}

function compare(left, operator, right){
  const a = Number(left);
  const b = Number(right);
  switch(operator){
    case "<=": return a <= b;
    case "<": return a < b;
    case ">=": return a >= b;
    case ">": return a > b;
    case "==": return String(left) === String(right);
    case "!=": return String(left) !== String(right);
    default: return null;
  }
}

function evaluateAtomic(condition, context){
  if(!condition || condition.tipo === "manual") return { result: "requiere_revision", detail: "Regla manual o sin condición ejecutable." };
  if(condition.tipo === "comparacion"){
    const left = getValue(context, condition.izquierda);
    const right = condition.derechaDato ? getValue(context, condition.derechaDato) : condition.derecha;
    if(left === undefined || right === undefined || left === "" || right === "") return { result: "informacion_insuficiente", detail: `Faltan datos para ${condition.izquierda}.` };
    const ok = compare(left, condition.operador, right);
    if(ok === null) return { result: "requiere_revision", detail: "Operador no soportado." };
    return { result: ok ? "cumple" : "no_cumple", detail: `${condition.izquierda} ${condition.operador} ${condition.derechaDato || condition.derecha}` };
  }
  if(condition.tipo === "rango"){
    const value = getValue(context, condition.dato);
    if(value === undefined || value === "") return { result: "informacion_insuficiente", detail: `Falta dato ${condition.dato}.` };
    const n = Number(value);
    if(Number.isNaN(n)) return { result: "informacion_insuficiente", detail: `${condition.dato} no es numérico.` };
    const minOk = condition.min === undefined || n >= Number(condition.min);
    const maxOk = condition.max === undefined || n <= Number(condition.max);
    return { result: minOk && maxOk ? "cumple" : "no_cumple", detail: `${condition.dato} dentro de rango permitido.` };
  }

  if(condition.tipo === "minimo_seccion_por_tipo_circuito"){
    const tipo = String(getValue(context, condition.tipoDato || "tipoCircuito") || "").toLowerCase().trim();
    const seccion = Number(getValue(context, condition.seccionDato || "seccionMm2"));
    if(!tipo || Number.isNaN(seccion)) return { result: "informacion_insuficiente", detail: "Faltan tipo de circuito o sección del conductor." };
    const catalogo = condition.minimos || {};
    const minimo = Number(catalogo[tipo]);
    if(Number.isNaN(minimo)) return { result: "requiere_revision", detail: `No hay sección mínima cargada para tipo ${tipo}.` };
    return { result: seccion >= minimo ? "cumple" : "no_cumple", detail: `${tipo}: sección ${seccion} mm², mínimo ${minimo} mm².` };
  }
  if(condition.tipo === "valor_en_lista"){
    const value = String(getValue(context, condition.dato) || "").toLowerCase().trim();
    if(!value) return { result: "informacion_insuficiente", detail: `Falta dato ${condition.dato}.` };
    const values = (condition.valores || []).map(v => String(v).toLowerCase());
    return { result: values.includes(value) ? "cumple" : "no_cumple", detail: `${condition.dato} debe estar en: ${(condition.valores || []).join(", ")}.` };
  }
  if(condition.tipo === "valor_no_en_lista"){
    const value = String(getValue(context, condition.dato) || "").toLowerCase().trim();
    if(!value) return { result: "informacion_insuficiente", detail: `Falta dato ${condition.dato}.` };
    const values = (condition.valores || []).map(v => String(v).toLowerCase());
    return { result: !values.includes(value) ? "cumple" : "no_cumple", detail: `${condition.dato} no debe ser: ${(condition.valores || []).join(", ")}.` };
  }
  if(condition.tipo === "booleano_verdadero"){
    const value = getValue(context, condition.dato);
    if(value === undefined || value === "") return { result: "informacion_insuficiente", detail: `Falta dato ${condition.dato}.` };
    return { result: value === true || value === "true" || value === "si" || value === "sí" ? "cumple" : "no_cumple", detail: `${condition.dato} debe estar confirmado.` };
  }
  if(condition.tipo === "color_conductor"){
    const funcion = String(getValue(context, condition.funcionDato || "funcionConductor") || "").toLowerCase().trim();
    const color = String(getValue(context, condition.colorDato || "colorConductor") || "").toLowerCase().trim();
    if(!funcion || !color) return { result: "informacion_insuficiente", detail: "Faltan función o color del conductor." };
    const mapa = condition.codigo || {};
    const permitido = (mapa[funcion] || []).map(v => String(v).toLowerCase());
    if(!permitido.length) return { result: "requiere_revision", detail: `No hay código de color cargado para ${funcion}.` };
    return { result: permitido.includes(color) ? "cumple" : "no_cumple", detail: `${funcion}: color ${color}, permitido ${permitido.join("/")}.` };
  }
  if(condition.tipo === "verde_exclusivo_tierra"){
    const funcion = String(getValue(context, condition.funcionDato || "funcionConductor") || "").toLowerCase().trim();
    const color = String(getValue(context, condition.colorDato || "colorConductor") || "").toLowerCase().trim();
    if(!funcion || !color) return { result: "informacion_insuficiente", detail: "Faltan función o color del conductor." };
    const esVerde = color.includes("verde");
    const esProteccion = ["proteccion", "protección", "pe", "tierra", "conductor de protección"].includes(funcion);
    return { result: (!esVerde || esProteccion) ? "cumple" : "no_cumple", detail: "Verde o verde/amarillo queda reservado para conductor de protección." };
  }

  if(condition.tipo === "minimo_seccion_alimentador_ric3"){
    const tipo = String(getValue(context, condition.tipoDato || "tipoAlimentacion") || "").toLowerCase().trim();
    const seccion = Number(getValue(context, condition.seccionDato || "seccionMm2"));
    if(!tipo || Number.isNaN(seccion)) return { result: "informacion_insuficiente", detail: "Faltan tipo de alimentador/subalimentador o sección." };
    const minimos = condition.minimos || { alimentador: 4, subalimentador: 2.5 };
    const minimo = Number(minimos[tipo]);
    if(Number.isNaN(minimo)) return { result: "requiere_revision", detail: `No hay mínimo cargado para ${tipo}.` };
    return { result: seccion >= minimo ? "cumple" : "no_cumple", detail: `${tipo}: sección ${seccion} mm², mínimo ${minimo} mm².` };
  }
  if(condition.tipo === "caida_tension_ric3"){
    const alim = Number(getValue(context, condition.alimentadorDato || "caidaAlimentadorPct"));
    const total = Number(getValue(context, condition.totalDato || "caidaTotalPct"));
    if(Number.isNaN(alim) || Number.isNaN(total)) return { result: "informacion_insuficiente", detail: "Faltan caída de tensión del alimentador o total." };
    const maxAlim = Number(condition.maxAlimentador ?? 3);
    const maxTotal = Number(condition.maxTotal ?? 5);
    const ok = alim <= maxAlim && total <= maxTotal;
    return { result: ok ? "cumple" : "no_cumple", detail: `Caída alimentador ${alim}%/${maxAlim}%, total ${total}%/${maxTotal}%.` };
  }
  if(condition.tipo === "neutro_monofasico_igual_fase_ric3"){
    const sistema = String(getValue(context, condition.sistemaDato || "sistema") || "").toLowerCase().trim();
    const fase = Number(getValue(context, condition.faseDato || "seccionFaseMm2"));
    const neutro = Number(getValue(context, condition.neutroDato || "seccionNeutroMm2"));
    if(!sistema || Number.isNaN(fase) || Number.isNaN(neutro)) return { result: "informacion_insuficiente", detail: "Faltan sistema, sección de fase o sección de neutro." };
    if(!sistema.includes("mono")) return { result: "requiere_revision", detail: "Regla ejecutable solo para alimentadores/subalimentadores monofásicos." };
    return { result: neutro >= fase ? "cumple" : "no_cumple", detail: `Monofásico: neutro ${neutro} mm², fase ${fase} mm².` };
  }
  if(condition.tipo === "factor_simultaneidad_viviendas_ric3"){
    const n = Number(getValue(context, condition.viviendasDato || "cantidadViviendas"));
    const aplicado = Number(getValue(context, condition.factorDato || "factorSimultaneidad"));
    if(Number.isNaN(n) || Number.isNaN(aplicado)) return { result: "informacion_insuficiente", detail: "Faltan cantidad de viviendas o factor de simultaneidad aplicado." };
    const tabla = {1:1,2:1,3:1,4:0.95,5:0.92,6:0.90,7:0.89,8:0.88,9:0.87,10:0.85,11:0.84,12:0.83,13:0.82,14:0.81,15:0.79,16:0.78,17:0.77,18:0.76,19:0.75,20:0.74,21:0.73};
    const requerido = n > 21 ? (15.3 + (n - 21) * 0.5) / n : tabla[Math.max(1, Math.floor(n))];
    if(requerido === undefined) return { result: "requiere_revision", detail: "Cantidad de viviendas fuera de rango evaluable." };
    const ok = aplicado + 0.0001 >= requerido;
    return { result: ok ? "cumple" : "no_cumple", detail: `Fs aplicado ${aplicado}, mínimo requerido ${requerido.toFixed(3)} para ${n} vivienda(s).` };
  }
  if(condition.tipo === "demanda_alumbrado_ric3"){
    const tipo = String(getValue(context, condition.tipoConsumidorDato || "tipoConsumidor") || "").toLowerCase().trim();
    const potencia = Number(getValue(context, condition.potenciaAlumbradoKwDato || "potenciaAlumbradoKw"));
    const demanda = Number(getValue(context, condition.demandaAlumbradoKwDato || "demandaAlumbradoKw"));
    if(!tipo || Number.isNaN(potencia) || Number.isNaN(demanda)) return { result: "informacion_insuficiente", detail: "Faltan tipo de consumidor, potencia de alumbrado o demanda calculada." };
    function calcDemanda(t, p){
      if(t.includes("casa")) return Math.min(p,3)*1 + Math.max(Math.min(p,120)-3,0)*0.35 + Math.max(p-120,0)*0.25;
      if(t.includes("hospital")) return Math.min(p,50)*0.4 + Math.max(p-50,0)*0.2;
      if(t.includes("hotel") || t.includes("motel")) return Math.min(p,20)*0.5 + Math.max(Math.min(p,100)-20,0)*0.4 + Math.max(p-100,0)*0.3;
      if(t.includes("bodega")) return Math.min(p,12.5)*1 + Math.max(p-12.5,0)*0.5;
      if(t.includes("servicio")) return p;
      if(t.includes("local") || t.includes("oficina")) return Math.min(p,50)*1 + Math.max(p-50,0)*0.8;
      return p;
    }
    const requerida = calcDemanda(tipo, potencia);
    const ok = demanda + 0.0001 >= requerida;
    return { result: ok ? "cumple" : "no_cumple", detail: `Demanda aplicada ${demanda.toFixed(3)} kW, demanda mínima calculada ${requerida.toFixed(3)} kW.` };
  }

    return { result: "requiere_revision", detail: "Tipo de condición no implementado." };
}

export function evaluateRule(rule, context = {}){
  const missing = (rule.entradasRequeridas || []).filter(key => getValue(context, key) === undefined || getValue(context, key) === "");
  if(missing.length){
    return {
      ruleId: rule.id,
      result: "informacion_insuficiente",
      severity: rule.severidad,
      message: rule.mensajes.informacionInsuficiente,
      action: "Completar datos faltantes: " + missing.join(", "),
      reference: rule.referencia,
      confidence: "baja",
      detail: "Faltan entradas requeridas."
    };
  }
  const evaluation = evaluateAtomic(rule.condicion, context);
  const messageMap = {
    cumple: rule.mensajes.cumple,
    no_cumple: rule.mensajes.noCumple,
    requiere_revision: rule.mensajes.requiereRevision,
    informacion_insuficiente: rule.mensajes.informacionInsuficiente
  };
  return {
    ruleId: rule.id,
    result: evaluation.result,
    severity: rule.severidad,
    message: messageMap[evaluation.result] || rule.mensajes.requiereRevision,
    action: evaluation.result === "cumple" ? "Sin acción correctiva." : rule.accion,
    reference: rule.referencia,
    confidence: rule.estado === "validada" && evaluation.result !== "requiere_revision" ? "alta" : "media",
    detail: evaluation.detail
  };
}

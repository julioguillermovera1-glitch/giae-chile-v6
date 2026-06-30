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

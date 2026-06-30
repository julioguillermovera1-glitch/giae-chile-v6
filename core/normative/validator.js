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

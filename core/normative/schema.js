export const RULE_SCHEMA_VERSION = "1.0.0";

export const ALLOWED_SOURCES = ["RIC", "IEC", "DS8", "INTERNA"];
export const ALLOWED_STATUS = ["borrador", "en_revision", "validada", "obsoleta"];
export const ALLOWED_SEVERITY = ["info", "advertencia", "critico"];
export const ALLOWED_RESULT = ["cumple", "no_cumple", "requiere_revision", "informacion_insuficiente"];

export function normalizeRule(raw = {}){
  const now = new Date().toISOString();
  return {
    id: String(raw.id || "").trim(),
    nombre: String(raw.nombre || "Regla sin nombre").trim(),
    descripcion: String(raw.descripcion || "").trim(),
    fuente: ALLOWED_SOURCES.includes(raw.fuente) ? raw.fuente : "INTERNA",
    categoria: String(raw.categoria || "General").trim(),
    version: String(raw.version || "1.0.0").trim(),
    estado: ALLOWED_STATUS.includes(raw.estado) ? raw.estado : "borrador",
    severidad: ALLOWED_SEVERITY.includes(raw.severidad) ? raw.severidad : "advertencia",
    prioridad: Number.isFinite(Number(raw.prioridad)) ? Number(raw.prioridad) : 100,
    referencia: {
      documento: String(raw.referencia?.documento || raw.documento || "Pendiente").trim(),
      apartado: String(raw.referencia?.apartado || raw.apartado || "Pendiente").trim(),
      nota: String(raw.referencia?.nota || raw.nota || "No contiene texto normativo completo; solo referencia de control.").trim()
    },
    aplicaA: Array.isArray(raw.aplicaA) ? raw.aplicaA : [],
    entradasRequeridas: Array.isArray(raw.entradasRequeridas) ? raw.entradasRequeridas : [],
    condicion: raw.condicion || { tipo: "manual", expresion: "requiere_revision" },
    mensajes: {
      cumple: String(raw.mensajes?.cumple || raw.mensaje_ok || "Cumple la regla implementada.").trim(),
      noCumple: String(raw.mensajes?.noCumple || raw.mensaje_error || "No cumple la regla implementada.").trim(),
      requiereRevision: String(raw.mensajes?.requiereRevision || "Requiere revisión normativa o profesional.").trim(),
      informacionInsuficiente: String(raw.mensajes?.informacionInsuficiente || "Faltan datos para evaluar esta regla.").trim()
    },
    accion: String(raw.accion || "Revisar antecedentes técnicos y respaldo normativo.").trim(),
    creadoPor: String(raw.creadoPor || "Julio Guillermo Vera").trim(),
    creadoEn: raw.creadoEn || now,
    actualizadoEn: raw.actualizadoEn || now,
    historial: Array.isArray(raw.historial) ? raw.historial : [{ fecha: now.slice(0,10), accion: "Regla creada en estructura del Motor Normativo GIAE." }]
  };
}

export function validateRule(raw = {}){
  const errors = [];
  const warnings = [];
  const rule = normalizeRule(raw);
  if(!rule.id) errors.push("La regla no tiene ID.");
  if(!/^[A-Z0-9]+-[A-Z0-9]+-[0-9]{3,}$/i.test(rule.id)) warnings.push("El ID no sigue el patrón recomendado, ejemplo RIC-02-001.");
  if(!rule.nombre || rule.nombre.length < 4) errors.push("La regla necesita un nombre claro.");
  if(rule.estado === "validada" && (rule.referencia.documento === "Pendiente" || rule.referencia.apartado === "Pendiente")) errors.push("Una regla validada debe tener documento y apartado de referencia.");
  if(!rule.entradasRequeridas.length) warnings.push("La regla no declara entradas requeridas.");
  if(!rule.aplicaA.length) warnings.push("La regla no indica a qué módulos aplica.");
  return { ok: errors.length === 0, errors, warnings, rule };
}

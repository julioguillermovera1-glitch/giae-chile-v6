export const NORMATIVE_SOURCES = [
  { id: "RIC", label: "Pliegos RIC Chile", priority: 1 },
  { id: "IEC", label: "Normas IEC aplicables", priority: 2 },
  { id: "DL8", label: "Decreto de Ley N°8 de Chile", priority: 3 }
];

export function strictNormativeMessage() {
  return "GIAE Chile entrega criterios técnicos solo cuando existe respaldo en RIC, IEC o Decreto de Ley N°8 de Chile. Si la base local no contiene una regla suficiente, el sistema debe indicar revisión normativa y no inventar datos.";
}

export function evaluateStrictRule({ topic = "General", hasLocalRule = false, calculation = "" } = {}) {
  return {
    topic,
    status: hasLocalRule ? "respaldado" : "requiere_revision",
    sources: NORMATIVE_SOURCES.map(source => source.id),
    calculation,
    message: hasLocalRule
      ? "Resultado preliminar respaldado por base normativa local. Validar con profesional autorizado y documentos vigentes."
      : strictNormativeMessage()
  };
}

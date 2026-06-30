export const modules = [
  { id: "proyecto", label: "Proyecto", path: "../modules/proyecto/proyecto.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "usuarios", label: "Usuarios", path: "../modules/usuarios/usuarios.js", profiles: ["empresa"] },
  { id: "administracion", label: "Administración", path: "../modules/administracion/administracion.js", profiles: ["administrador"] },
  { id: "cargas", label: "Cargas", path: "../modules/cargas/cargas.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "cuadro-carga", label: "Cuadro de carga", path: "../modules/cuadro-carga/cuadro-carga.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "empalme", label: "Empalme", path: "../modules/empalme/empalme.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "tierra", label: "Puesta a tierra", path: "../modules/tierra/tierra.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "unilineal", label: "Unilineal", path: "../modules/unilineal/unilineal.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "documentacion", label: "Documentación", path: "../modules/documentacion/documentacion.js", profiles: ["independiente", "empresa"] },
  { id: "presupuesto", label: "Presupuesto", path: "../modules/presupuesto/presupuesto.js", profiles: ["independiente", "empresa"] },
  { id: "auditoria", label: "Auditoría", path: "../modules/auditoria/auditoria.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "educacion", label: "Educación", path: "../modules/educacion/educacion.js", profiles: ["estudiante", "independiente", "empresa"] }
];

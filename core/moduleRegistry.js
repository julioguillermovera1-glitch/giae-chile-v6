export const menuGroups = [
  { id: "inicio", label: "Inicio" },
  { id: "proyecto", label: "Proyecto" },
  { id: "ingenieria", label: "Ingeniería" },
  { id: "documentacion", label: "Documentación" },
  { id: "educacion", label: "Educación" },
  { id: "administracion", label: "Administración" }
];

export const modules = [
  { id: "dashboard", label: "Dashboard", group: "inicio", path: "../modules/dashboard/dashboard.js", profiles: ["administrador", "empresa", "independiente", "estudiante", "aula"] },

  { id: "proyecto", label: "Proyecto activo", group: "proyecto", path: "../modules/proyecto/proyecto.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "usuarios", label: "Usuarios", group: "proyecto", path: "../modules/usuarios/usuarios.js", profiles: ["empresa"] },

  { id: "cargas", label: "Cargas", group: "ingenieria", path: "../modules/cargas/cargas.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "cuadro-carga", label: "Cuadro de carga", group: "ingenieria", path: "../modules/cuadro-carga/cuadro-carga.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "empalme", label: "Empalme", group: "ingenieria", path: "../modules/empalme/empalme.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "tierra", label: "Puesta a tierra", group: "ingenieria", path: "../modules/tierra/tierra.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "unilineal", label: "Unilineal", group: "ingenieria", path: "../modules/unilineal/unilineal.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "auditoria", label: "Auditoría", group: "ingenieria", path: "../modules/auditoria/auditoria.js", profiles: ["independiente", "empresa", "estudiante"] },

  { id: "documentacion", label: "Documentación", group: "documentacion", path: "../modules/documentacion/documentacion.js", profiles: ["independiente", "empresa"] },
  { id: "presupuesto", label: "Presupuesto", group: "documentacion", path: "../modules/presupuesto/presupuesto.js", profiles: ["independiente", "empresa"] },

  { id: "educacion", label: "Aula Técnica", group: "educacion", path: "../modules/educacion/educacion.js", profiles: ["aula", "estudiante", "independiente", "empresa"] },

  { id: "administracion", label: "Panel administrador", group: "administracion", path: "../modules/administracion/administracion.js", profiles: ["administrador"] }
];

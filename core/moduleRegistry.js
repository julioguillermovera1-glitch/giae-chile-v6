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

  { id: "proyectos", label: "Crear proyecto", group: "proyecto", path: "../modules/proyectos/proyectos.js", profiles: ["independiente", "empresa", "estudiante", "administrador"] },
  { id: "proyecto", label: "Datos del proyecto", group: "proyecto", path: "../modules/proyecto/proyecto.js", profiles: ["independiente", "empresa", "estudiante", "administrador"] },
  { id: "flujo-guiado", label: "Flujo guiado", group: "proyecto", path: "../modules/flujo-guiado/flujo-guiado.js", profiles: ["independiente", "empresa", "estudiante", "administrador"] },
  { id: "gpe", label: "Motor de proyecto", group: "proyecto", path: "../modules/gpe.js", profiles: ["independiente", "empresa", "estudiante", "administrador"] },
  { id: "usuarios", label: "Usuarios", group: "proyecto", path: "../modules/usuarios/usuarios.js", profiles: ["empresa"] },
  { id: "nube", label: "Nube y licencias", group: "proyecto", path: "../modules/nube/nube.js", profiles: ["administrador", "empresa", "independiente"] },
  { id: "cargas", label: "Cargas", group: "ingenieria", path: "../modules/cargas/cargas.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "cuadro-carga", label: "Cuadro de carga", group: "ingenieria", path: "../modules/cuadro-carga/cuadro-carga.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "balance", label: "Balance de fases", group: "ingenieria", path: "../modules/balance/balance.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "tableros", label: "Tableros", group: "ingenieria", path: "../modules/tableros/tableros.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "empalme", label: "Empalme", group: "ingenieria", path: "../modules/empalme/empalme.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "tierra", label: "Puesta a tierra", group: "ingenieria", path: "../modules/tierra/tierra.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "unilineal", label: "Unilineal", group: "ingenieria", path: "../modules/unilineal/unilineal.js", profiles: ["independiente", "empresa", "estudiante"] },
  { id: "cad-electrico", label: "CAD electrico", group: "ingenieria", path: "../modules/cad-electrico/cad-electrico.js", profiles: ["administrador", "empresa", "independiente", "estudiante"] },
  { id: "auditoria", label: "Auditoría", group: "ingenieria", path: "../modules/auditoria/auditoria.js", profiles: ["independiente", "empresa", "estudiante"] },

  { id: "documentacion", label: "Centro de Documentación SEC", group: "documentacion", path: "../modules/documentacion/documentacion.js", profiles: ["independiente", "empresa"] },
  { id: "lector-documental", label: "Lector documental", group: "documentacion", path: "../modules/lector-documental/lector-documental.js", profiles: ["independiente", "empresa", "administrador"] },
  { id: "presupuesto", label: "Presupuesto", group: "documentacion", path: "../modules/presupuesto/presupuesto.js", profiles: ["independiente", "empresa"] },

  { id: "educacion", label: "Aula Técnica", group: "educacion", path: "../modules/educacion/educacion.js", profiles: ["aula", "estudiante", "independiente", "empresa"] },

  { id: "administracion", label: "Panel administrador", group: "administracion", path: "../modules/administracion/administracion.js", profiles: ["administrador"] },
  { id: "biblioteca", label: "Base de conocimiento", group: "administracion", path: "../modules/biblioteca/biblioteca.js", profiles: ["administrador"] },
  { id: "componentes", label: "BUCE · Componentes eléctricos", group: "administracion", path: "../modules/componentes/componentes.js", profiles: ["administrador"] },
  { id: "normativo", label: "Motor normativo", group: "administracion", path: "../modules/normativo/normativo.js", profiles: ["administrador"] },
  { id: "norma-chile", label: "NORMA-CHILE", group: "administracion", path: "../modules/norma-chile/norma-chile.js", profiles: ["administrador"] }
];

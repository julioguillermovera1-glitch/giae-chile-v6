export const menuGroups = [
  { id: "inicio", label: "Inicio" },
  { id: "proyecto", label: "Proyecto" },
  { id: "ingenieria", label: "Ingenieria" },
  { id: "documentacion", label: "Documentacion" },
  { id: "educacion", label: "Educacion" },
  { id: "administracion", label: "Reparacion" }
];

const profesionales = ["empresa", "independiente"];
const usuariosPago = [...profesionales, "estudiante"];

export const modules = [
  { id: "inicio-proyecto", label: "Inicio", group: "inicio", path: "../modules/proyectos/proyectos.js", profiles: usuariosPago },

  { id: "proyectos", label: "Crear proyecto", group: "proyecto", path: "../modules/proyectos/proyectos.js", profiles: usuariosPago },
  { id: "inventario", label: "Inventario empresa", group: "proyecto", path: "../modules/inventario/inventario.js", profiles: profesionales },
  { id: "flujo-guiado", label: "Flujo guiado", group: "proyecto", path: "../modules/flujo-guiado/flujo-guiado.js", profiles: usuariosPago },
  { id: "gpe", label: "Motor de proyecto", group: "proyecto", path: "../modules/gpe.js", profiles: usuariosPago },
  { id: "usuarios", label: "Usuarios de empresa", group: "proyecto", path: "../modules/usuarios/usuarios.js", profiles: ["empresa"] },
  { id: "nube", label: "Nube y licencias", group: "proyecto", path: "../modules/nube/nube.js", profiles: profesionales },

  { id: "cargas", label: "Cargas", group: "ingenieria", path: "../modules/cargas/cargas.js", profiles: usuariosPago },
  { id: "cuadro-carga", label: "Cuadro de carga", group: "ingenieria", path: "../modules/cuadro-carga/cuadro-carga.js", profiles: usuariosPago },
  { id: "balance", label: "Balance de fases", group: "ingenieria", path: "../modules/balance/balance.js", profiles: usuariosPago },
  { id: "tableros", label: "Tableros", group: "ingenieria", path: "../modules/tableros/tableros.js", profiles: usuariosPago },
  { id: "empalme", label: "Empalme", group: "ingenieria", path: "../modules/empalme/empalme.js", profiles: usuariosPago },
  { id: "tierra", label: "Puesta a tierra", group: "ingenieria", path: "../modules/tierra/tierra.js", profiles: usuariosPago },
  { id: "unilineal", label: "Unilineal", group: "ingenieria", path: "../modules/unilineal/unilineal.js", profiles: usuariosPago },
  { id: "cad-electrico", label: "CAD electrico", group: "ingenieria", path: "../modules/cad-electrico/cad-electrico.js", profiles: usuariosPago },
  { id: "auditoria", label: "Auditoria", group: "ingenieria", path: "../modules/auditoria/auditoria.js", profiles: usuariosPago },

  { id: "documentacion", label: "Centro de Documentacion SEC", group: "documentacion", path: "../modules/documentacion/documentacion.js", profiles: profesionales },
  { id: "lector-documental", label: "Lector documental", group: "documentacion", path: "../modules/lector-documental/lector-documental.js", profiles: profesionales },
  { id: "presupuesto", label: "Presupuesto", group: "documentacion", path: "../modules/presupuesto/presupuesto.js", profiles: profesionales },

  { id: "educacion", label: "Aula tecnica", group: "educacion", path: "../modules/educacion/educacion.js", profiles: ["aula", "estudiante"] },

  { id: "administracion", label: "Panel de reparacion", group: "administracion", path: "../modules/administracion/administracion.js", profiles: ["administrador"] },
  { id: "biblioteca", label: "Base de conocimiento", group: "administracion", path: "../modules/biblioteca/biblioteca.js", profiles: ["administrador"] },
  { id: "componentes", label: "Reparar componentes electricos", group: "administracion", path: "../modules/componentes/componentes.js", profiles: ["administrador"] },
  { id: "normativo", label: "Reparar motor normativo", group: "administracion", path: "../modules/normativo/normativo.js", profiles: ["administrador"] },
  { id: "norma-chile", label: "Reparar NORMA-CHILE", group: "administracion", path: "../modules/norma-chile/norma-chile.js", profiles: ["administrador"] }
];
export const menuGroups = [
  { id: "inicio", label: "Inicio" },
  { id: "proyecto", label: "Proyecto" },
  { id: "documentacion", label: "Documentacion" },
  { id: "educacion", label: "Educacion" },
  { id: "administracion", label: "Reparacion" }
];

const profesionales = ["empresa", "independiente"];
const usuariosPago = [...profesionales, "estudiante"];

export const modules = [
  { id: "inicio-proyecto", label: "Inicio", group: "inicio", path: "../modules/proyectos/proyectos.js", profiles: usuariosPago },

  { id: "proyectos", label: "1. Crear proyecto", group: "proyecto", path: "../modules/proyectos/proyectos.js", profiles: usuariosPago },
  { id: "cargas", label: "2. Cargas", group: "proyecto", path: "../modules/cargas/cargas.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "cuadro-carga", label: "3. Cuadro de carga", group: "proyecto", path: "../modules/cuadro-carga/cuadro-carga.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "balance", label: "4. Balance de fases", group: "proyecto", path: "../modules/balance/balance.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "tableros", label: "5. Tableros", group: "proyecto", path: "../modules/tableros/tableros.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "tierra", label: "6. Puesta a tierra", group: "proyecto", path: "../modules/tierra/tierra.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "unilineal", label: "7. Unilineal", group: "proyecto", path: "../modules/unilineal/unilineal.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "empalme", label: "8. Empalme", group: "proyecto", path: "../modules/empalme/empalme.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "cad-electrico", label: "Plano CAD opcional", group: "proyecto", path: "../modules/cad-electrico/cad-electrico.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "inventario", label: "Inventario empresa", group: "proyecto", path: "../modules/inventario/inventario.js", profiles: profesionales },
  { id: "flujo-guiado", label: "Flujo guiado", group: "proyecto", path: "../modules/flujo-guiado/flujo-guiado.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "gpe", label: "Motor de proyecto", group: "proyecto", path: "../modules/gpe.js", profiles: usuariosPago, hiddenInMenu: true },
  { id: "usuarios", label: "Usuarios de empresa", group: "proyecto", path: "../modules/usuarios/usuarios.js", profiles: ["empresa"] },
  { id: "nube", label: "Nube y licencias", group: "proyecto", path: "../modules/nube/nube.js", profiles: profesionales, hiddenInMenu: true },
  { id: "auditoria", label: "Auditoria", group: "proyecto", path: "../modules/auditoria/auditoria.js", profiles: usuariosPago, hiddenInMenu: true },

  { id: "documentacion", label: "Centro de Documentacion SEC", group: "documentacion", path: "../modules/documentacion/documentacion.js", profiles: profesionales },
  { id: "lector-documental", label: "Lector documental", group: "documentacion", path: "../modules/lector-documental/lector-documental.js", profiles: profesionales, hiddenInMenu: true },
  { id: "presupuesto", label: "Presupuesto", group: "documentacion", path: "../modules/presupuesto/presupuesto.js", profiles: profesionales, hiddenInMenu: true },

  { id: "educacion", label: "Aula tecnica", group: "educacion", path: "../modules/educacion/educacion.js", profiles: ["aula", "estudiante"] },

  { id: "administracion", label: "Panel de reparacion", group: "administracion", path: "../modules/administracion/administracion.js", profiles: ["administrador"] },
  { id: "biblioteca", label: "Base de conocimiento", group: "administracion", path: "../modules/biblioteca/biblioteca.js", profiles: ["administrador"] },
  { id: "componentes", label: "Reparar componentes electricos", group: "administracion", path: "../modules/componentes/componentes.js", profiles: ["administrador"] },
  { id: "normativo", label: "Reparar motor normativo", group: "administracion", path: "../modules/normativo/normativo.js", profiles: ["administrador"] },
  { id: "norma-chile", label: "Reparar NORMA-CHILE", group: "administracion", path: "../modules/norma-chile/norma-chile.js", profiles: ["administrador"] }
];
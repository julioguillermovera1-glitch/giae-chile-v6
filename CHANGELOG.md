# Changelog

## 2026-07-30 - Cuentas nuevas de Empresa/Independiente quedaban con el menu vacio

- Bug real encontrado al probar la primera cuenta Empresa creada en produccion: `upsertCompanyUser` asignaba `permissions: []` a cualquier cuenta nueva que no fuera "super_admin", y no existe ninguna pantalla en la app para asignar permisos manualmente. Resultado: el menu quedaba casi vacio, solo visible lo que no exige permiso (Chat tecnico IA).
- `core/store.js`: `upsertCompanyUser` ahora usa todos los permisos disponibles por defecto cuando no se especifican explicitos (no existe hoy forma de especificarlos desde la interfaz).
- `ensureCompanyAccess()` repara automaticamente las cuentas ya creadas antes de este arreglo (permissions vacio se completa solo, sin que el usuario tenga que recrear nada).
- Probado end-to-end: cuenta con `permissions: []` se autorepara al recargar; login como Empresa muestra los 7 grupos del menu (Inicio, Proyecto, Inventario, CAD, Documentacion, Educacion/IA, Reparacion), no solo Chat IA.

## 2026-07-30 - Administrador ahora exige correo y contraseña

- El perfil "Administrador" nunca tuvo clave, desde antes de esta sesion de trabajo. Cualquiera con el link publico podia entrar directo al panel de reparacion completo.
- `core/store.js`: se agrega un usuario "Super administrador" con correo y contrasena inicial por defecto (`administrador@giae.cl`), generada de forma segura. `ensureCompanyAccess()` completa estas credenciales tambien en sesiones que ya existian sin ellas (backfill), no solo en instalaciones nuevas.
- `core/main.js`: el boton "Administrador" pasa por el mismo login de correo/contrasena que Empresa e Independiente. `verifyCompanyUserCredentials` reconoce el modo `administrador` validando `role === "super_admin"`.
- La clave inicial se entrega solo por fuera del repositorio (chat + archivo local en `docs/_secretos_locales/`, cubierto por `.gitignore`). El propio texto de la app instruye cambiarla desde "Cuentas corporativas" en el primer ingreso.
- Probado end-to-end en navegador: sesion nueva pide clave, clave incorrecta rechaza, clave inicial entra, y la cuenta del Administrador aparece editable en Cuentas corporativas para poder cambiarla.
- Cierra la tarea pendiente anotada el 2026-07-29 sobre este mismo hueco.

## 2026-07-30 - Instalador independiente pasa a requerir cuenta, igual que Empresa

- "Instalador independiente" nunca pidio clave, desde antes de esta sesion de trabajo (confirmado en el historial de commits). Maneja datos reales de proyectos igual que Empresa, asi que se le agrega el mismo sistema de cuentas.
- `core/store.js`: `verifyCompanyUserCredentials` reconoce el nuevo accountType `independiente`.
- `core/main.js`: el perfil "independiente" pasa por el mismo login de correo/contrasena que "empresa"; se agregan las variantes de texto correspondientes.
- `modules/administracion/administracion.js` y `modules/usuarios/usuarios.js`: se agrega la opcion "Instalador independiente" en los selectores de tipo de cuenta.
- Probado end-to-end: crear cuenta -> login con clave correcta entra, clave incorrecta rechaza, una cuenta de "independiente" no sirve para entrar como "empresa".
- Pendiente sin resolver (anotado como tarea aparte): el perfil "Administrador" sigue sin pedir ninguna clave.

## 2026-07-30 - Pueblos Originarios y Estudiante quedan de acceso libre permanente

- Se retira la exigencia de correo/contrasena para el perfil "Pueblos Originarios": ahora entra directo, igual que "Aula educativa", sin depender del modo desarrollo.
- Se corrige la etiqueta de "Estudiante" a "Estudiante - acceso libre": ese perfil ya entraba sin clave en el codigo, pero el texto no lo reflejaba.
- Se actualiza el texto y los botones de la portada (`index.html`) para declarar honestamente que Pueblos Originarios, Alumno/estudiante y Aula educativa son gratuitos, y que solo Empresa exige cuenta creada por el administrador.
- Se apaga `GIAE_DEV_ACCESO_ABIERTO` (vuelve a `false`) antes de publicar: ese interruptor abria TODOS los perfiles y modulos sin clave (incluido Administrador), pensado solo para pruebas locales. El acceso libre de Pueblos Originarios y Estudiante ahora es permanente y no depende de el.
- Hallazgo aparte, no corregido en este cambio: el perfil "Administrador" nunca pidio contrasena en este codigo, independiente del modo desarrollo. Impacto limitado hoy porque los datos son locales al navegador de cada persona; queda anotado como pendiente para cuando se conecte autenticacion real (Fase 6).

## 2026-07-29 - R2 activado con los 4 buckets reales

- Se crean en Cloudflare los 4 buckets R2: `giae-project-backups`, `giae-project-documents`, `giae-brand-assets`, `giae-field-media`. Nombres confirmados uno por uno por URL antes de tocar el codigo.
- `wrangler.jsonc` incorpora el bloque `r2_buckets` con los 4 bindings.
- `GIAE_BINDINGS_MODE` pasa de `d1-activo-r2-pendiente` a `active`.
- Diagnostico `tools/phase55-worker-backend-check.mjs`: estado `apto_para_cloudflare_con_d1_r2`, 100%.
- Pendiente antes de publicar: migracion remota (`npm run d1:migrate:remote`), secreto `GIAE_API_TOKEN`, y revisar que `GIAE_DEV_ACCESO_ABIERTO` este en el valor correcto.

## 2026-07-29 - D1 activado con database_id real

- `wrangler.jsonc` incorpora el binding `GIAE_DB` con el `database_id` real de `giae-db`.
- Migracion `0001_giae_cloud_core.sql` validada en local: 15 comandos, 9 tablas creadas.
- R2 se mantiene deliberadamente en `wrangler.bindings.example.jsonc`: los 4 buckets aun no existen en Cloudflare y activarlos antes de crearlos hace fallar el deploy.
- `GIAE_BINDINGS_MODE` pasa de `pending` a `d1-activo-r2-pendiente`.
- Se agrega `.gitignore` para excluir `.wrangler/`, `node_modules/` y `.claude/`.
- Pendiente: crear buckets R2, secreto `GIAE_API_TOKEN` y migracion remota (la base remota aun muestra 0 tablas).

## 2026-07-29 - Perfil renombrado a Pueblos Originarios

- "Pueblos tecnicos" pasa a llamarse **Pueblos Originarios** en toda la interfaz: `index.html`, `core/main.js`, `modules/administracion/administracion.js` y `modules/usuarios/usuarios.js`.
- Motivo: el nombre anterior sonaba a categoria administrativa y no a personas. El nuevo es respetuoso, de uso amplio en Chile y coherente con que el modulo sea gratuito y abierto a todos los pueblos.
- La clave interna del perfil sigue siendo `pueblos`, por lo que no se pierden cuentas ni datos ya guardados.
- Se corrige el texto de la portada: el acceso de Pueblos Originarios se declara libre y gratuito, en vez de pedir credenciales creadas por un administrador.

## 2026-07-29 - Modo desarrollo con acceso abierto

- Se agrega la bandera `GIAE_DEV_ACCESO_ABIERTO` en `core/main.js`: entra sin claves en cualquier perfil y muestra los 28 modulos.
- Motivo: "Pueblos tecnicos" exigia credenciales que solo un administrador podia crear, dejando el modulo inaccesible. La etiqueta del perfil ya decia "acceso libre", contradiciendo al codigo.
- No se borro la logica de acceso: la bandera en `false` restaura el comportamiento original.
- Franja de aviso fija en pantalla mientras el modo este activo. Ver `docs/MODO_DESARROLLO_ACCESO_ABIERTO.md`.
- **Desactivar antes de publicar en Cloudflare.**

## 2026-07-29 - Fase 1 cerrada con prueba manual aprobada

- Se ejecuta la prueba manual completa en la app real y se registra en `docs/PRUEBA_MANUAL_FASE1_2026_07_29.md`.
- Cubre: crear proyecto, 6 cargas (4.26 kW), puesta a tierra con medicion real, exportar/importar `.giae` (ciclo integro, datos identicos) y vista movil 375x812 sin desborde.
- Cero errores de consola. Fase 1 cumple su criterio de salida.

## 2026-07-29 - Diagnostico Fase 1 actualizado al estado sin legado

- `tools/phase1-publicable-check.mjs`: el check `legado-identificado` exigia que `js/app.js` y `css/styles.css` existieran para pasar. Tras retirar el legado quedaba marcando REVISAR por un motivo obsoleto.
- Se reemplaza por `legado-retirado`, que valida el estado correcto: legado fuera de rutas activas, archivado en `docs/_duplicados_retirados/` y documentado en README.
- Fase 1 queda en 100% (12/12 verificaciones). Las 7 fases diagnosticadas (1, 2, 3, 4, 5, 5.5 y 5.6) dan 100% estructural.

## 2026-07-29 - Puesta a tierra conectada al recalculo del proyecto

- `modules/tierra/tierra.js` ahora llama a `recalculateProject()` al guardar el diseno de tierra, siguiendo el mismo patron que `cargas`, `balance`, `gpe` y `presupuesto`.
- Antes, guardar la puesta a tierra dejaba desactualizados el presupuesto (materiales y mano de obra de tierra), la auditoria integral (GND-001/GND-002), el centro documental, el checklist y el flujo guiado, que seguia reportando "No hay diseno de puesta a tierra guardado" hasta abrir otro modulo.

## 2026-07-29 - Limpieza de legado Fase 1

- Se retiran `js/app.js`, `js/giae-fix-botones.js` y `css/styles.css` a `docs/_duplicados_retirados/js` y `docs/_duplicados_retirados/css`: no eran referenciados por `index.html` ni por el cache de la PWA (`sw.js`).
- Se retira `indice.html` de la raiz a `docs/_duplicados_retirados/indice-raiz-2026-07-01.html`: estaba desincronizado de `index.html` (sin perfil "Pueblos tecnicos", sin Chat IA, sin meta tags PWA) y no formaba parte de ninguna ruta activa.
- Queda una sola entrada activa: `index.html`, `core/main.js`, `css/platform.css`.

## 2026-07-07 - Fase 5.6 Flujo maestro guiado

- Se agrega motor de flujo guiado en `core/workflow/guidedWorkflowEngine.js`.
- Se agregan etapas oficiales en `data/workflow/guided-flow.json`.
- Se agrega modulo `Flujo guiado` con bloqueos, observaciones, siguiente accion y reporte de faltantes.
- Se conecta `guidedWorkflow` al Proyecto Activo desde `core/store.js`.
- Se documenta la especificacion maestra y el limite profesional de GIAE.
## 2026-07-07 - Backend Worker real y fix despliegue Cloudflare

- Se agrega Cloudflare Worker API en `src/worker.js`.
- Se agrega `package.json`, `.assetsignore`, migracion D1 y diagnostico backend.
- Se deja `wrangler.jsonc` publicable en modo Worker + Static Assets sin placeholders activos.
- Se mueve la configuracion D1/R2 pendiente a `wrangler.bindings.example.jsonc`.
- Se evita que Cloudflare rechace el deploy por `database_id` de ejemplo o Worker faltante.
## 2026-07-06 - Inicio Fase 5 CAD electrico GIAE 2.0

- Se agrega motor CAD propio con formato `.giaecad`.
- Se agrega modulo CAD electrico al menu Ingenieria.
- Se agregan capas, simbolos electricos, cableado en dos clics y validacion preliminar.
- Se permite generar plano desde Proyecto Activo y exportar JSON/SVG.
- Se agrega diagnostico Fase 5 CAD.
## 2026-07-06 - Inicio Fase 4 nube, usuarios y licencias

- Se agrega motor cloud-ready propio para Workers, D1, R2, licencias, roles y cola sync.
- Se agrega modulo Nube y licencias al menu Proyecto.
- Se agregan contratos de datos para Cloudflare y modelo D1/R2.
- Se mantiene modo local y respaldo .giae como formato portable.
- Se agrega diagnostico Fase 4 cloud.
## 2026-07-06 - Inicio Fase 3 inteligencia documental

- Se agrega motor propio de inteligencia documental.
- Se agrega modulo Lector documental al menu de Documentacion.
- Se agregan tipos documentales y politica de analisis sin copia normativa completa.
- Se conecta el lector al Proyecto Activo para guardar resultados.
- Se actualiza cache PWA para incluir Fase 3.
- Se agrega diagnostico Fase 3 documental.

## 2026-07-06 - Inicio Fase 2 instalable local

- Se agrega manifest PWA para instalacion local.
- Se agrega service worker propio con cache controlado y pagina offline.
- Se agrega registro PWA en core/pwa.js y boton de instalacion cuando el navegador lo permita.
- Se agregan iconos propios SVG/PNG para PC y celular.
- Se agrega diagnostico Fase 2 instalable.
- Se enlaza Fase 2 en README, indice y manifiesto de producto.

## 2026-07-06 - Inicio Fase 1 publicable

- Se agrega checklist formal de Fase 1 publicable.
- Se agrega diagnostico local propio sin dependencias externas.
- Se corrige el calculo de potencia estimada del dashboard para usar powerW.
- Se completa el listado de modulos del panel administrador.
- Se enlaza la Fase 1 al manifiesto de producto y al README.

## 2026-07-06 - Roadmap publicable y vision GIAE 2.0

- Se incorpora roadmap oficial de 6 fases en docs y docs/data/producto.
- Se incorpora vision GIAE 2.0 para CAD electrico, lectura documental y razonamiento verificable.
- Se registra Decreto8.pdf local como fuente de ingesta sin copiar texto completo.
- Se normaliza la referencia de DS8 como Decreto Supremo N8.
- Se refuerza politica de originalidad y no copia.

## v2.9.0

- Agrega Auditoria Legal y Tecnica.

# Changelog

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

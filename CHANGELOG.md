# Changelog

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

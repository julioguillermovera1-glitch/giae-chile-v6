# GIAE Chile

GIAE Chile es una plataforma tecnica para apoyar el diseno, calculo, revision, documentacion y auditoria de instalaciones electricas en Chile.

Autor intelectual y director del proyecto: Julio Guillermo Vera.

## Estado actual

El repositorio esta en fase de depuracion para llegar a una primera version publicable. La entrada oficial de la aplicacion nueva es:

- index.html
- core/main.js
- css/platform.css

La version historica contenida en js/app.js y css/styles.css debe tratarse como legado hasta confirmar su retiro seguro.

## Roadmap oficial

La ruta del producto esta incorporada en:

- docs/ROADMAP_6_FASES_GIAE_CHILE.md
- docs/data/producto/roadmap-6-fases.json
- docs/GIAE_2_0_CAD_DOCUMENTOS_RAZONAMIENTO.md
- docs/data/producto/vision-giae-2.json

Las seis fases son:

1. Depuracion y base publicable.
2. Version 1.0 instalable local.
3. Inteligencia normativa y lectura documental.
4. Nube, usuarios, licencias y colaboracion.
5. CAD electrico GIAE 2.0.
6. GIAE razonador tecnico 2.0.

## Principios obligatorios

- No copiar codigo de internet, repositorios, ejemplos ni otras IA.
- No copiar textos normativos completos.
- No duplicar motores, reglas ni datos.
- Usar DS8, RIC e IEC aplicable como fuentes trazables.
- Mantener NCh4 solo como referencia historica excluida.
- Separar siempre calculo preliminar, medicion real y validacion final.
- Si falta evidencia, GIAE debe indicar requiere revision.

## Fase 1 publicable

La Fase 1 ya tiene checklist y diagnostico local propio:

- docs/FASE_1_PUBLICABLE_GIAE.md
- docs/data/producto/fase-1-publicable.json
- tools/phase1-publicable-check.mjs

Comando de revision desde la raiz del repositorio:

    node tools/phase1-publicable-check.mjs

Esta revision no reemplaza la prueba manual en PC y celular. Sirve para detectar bloqueos tecnicos antes de anunciar una version publicable.

## Fase 2 instalable local

La Fase 2 inicia la preparacion de GIAE como app instalable local para PC y celular mediante PWA propia:

- manifest.webmanifest
- sw.js
- core/pwa.js
- assets/icons/giae-icon.svg
- assets/icons/giae-icon-192.png
- assets/icons/giae-icon-512.png
- docs/FASE_2_INSTALABLE_GIAE.md
- tools/phase2-installable-check.mjs
- tools/local-static-server.mjs

Comando de revision:

    node tools/phase2-installable-check.mjs

Servidor local para prueba PWA:

    node tools/local-static-server.mjs 8787

Esta base no reemplaza la prueba manual en PC y celular ni corresponde aun a instalador EXE, MSI o APK final.

## Fase 3 inteligencia documental

La Fase 3 inicia el lector documental inteligente de GIAE:

- core/document-intelligence/documentIntelligenceEngine.js
- modules/lector-documental/lector-documental.js
- data/document-intelligence/document-types.json
- docs/FASE_3_INTELIGENCIA_DOCUMENTAL_GIAE.md
- tools/phase3-document-intelligence-check.mjs

Comando de revision:

    node tools/phase3-document-intelligence-check.mjs

Esta base clasifica documentos, detecta senales y faltantes, pero aun no hace OCR ni certifica cumplimiento final.


## Fase 4 nube, usuarios y licencias

La Fase 4 inicia la base cloud-ready de GIAE:

- core/cloud/cloudWorkspaceEngine.js
- modules/nube/nube.js
- data/cloud/cloud-contract.json
- data/cloud/d1-schema.json
- data/cloud/r2-assets.json
- docs/FASE_4_NUBE_USUARIOS_LICENCIAS_GIAE.md
- tools/phase4-cloud-readiness-check.mjs

Comando de revision:

    node tools/phase4-cloud-readiness-check.mjs

Esta base prepara contratos, roles, licencias y paquetes de sincronizacion. Aun no autentica usuarios reales ni escribe en D1/R2.

## Fase 5 CAD electrico GIAE 2.0

La Fase 5 inicia el editor CAD electrico propio de GIAE:

- core/cad/cadEngine.js
- modules/cad-electrico/cad-electrico.js
- data/cad/electrical-symbols.json
- docs/FASE_5_CAD_ELECTRICO_GIAE.md
- tools/phase5-cad-check.mjs

Comando de revision:

    node tools/phase5-cad-check.mjs

Esta base permite generar un plano desde el Proyecto Activo, agregar simbolos y canalizaciones por clic, validar el plano y exportar `.giaecad` o SVG. Aun no importa ni exporta DWG/DXF.

## Fase 5.5 backend Worker para D1/R2

Esta etapa convierte GIAE en una aplicacion hibrida: PWA + Cloudflare Worker API.

- src/worker.js
- migrations/0001_giae_cloud_core.sql
- package.json
- .assetsignore
- wrangler.bindings.example.jsonc
- docs/FASE_5_5_BACKEND_WORKER_GIAE.md
- tools/phase55-worker-backend-check.mjs

Comando de revision:

    node tools/phase55-worker-backend-check.mjs

El despliegue actual queda listo para Worker + Static Assets. D1/R2 quedan en `wrangler.bindings.example.jsonc` para activarlos cuando exista el `database_id` real de D1, los buckets R2 reales y el secreto `GIAE_API_TOKEN`.
## Decreto Supremo N8

El PDF local indicado por el usuario quedo registrado como fuente de ingesta en:

- data/norma-chile/fuentes/decreto8-local-intake.json

Ese registro no copia texto completo. Sirve para que una fase futura convierta el documento en reglas propias con referencias.

## Validaciones recomendadas

Antes de publicar una version:

- Verificar sintaxis JavaScript.
- Verificar JSON/JSONC.
- Crear proyecto de prueba.
- Agregar cargas.
- Revisar cuadro, tablero, tierra, empalme, presupuesto, documentacion y auditoria.
- Probar exportar/importar .giae.
- Probar vista movil y escritorio.

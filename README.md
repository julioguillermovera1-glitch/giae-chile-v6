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

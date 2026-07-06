# Fase 3 inteligencia documental GIAE Chile

Fecha de inicio: 2026-07-06
Responsable del producto: Julio Guillermo Vera
Estado: iniciada

## Objetivo

Iniciar la capacidad de GIAE para leer y entender documentos tecnicos del proyecto sin copiar textos normativos completos ni inventar cumplimiento.

La primera entrega de esta fase incorpora un motor propio de analisis documental y un modulo visible llamado Lector documental.

## Entregables incorporados

- core/document-intelligence/documentIntelligenceEngine.js
- modules/lector-documental/lector-documental.js
- data/document-intelligence/document-types.json
- tools/phase3-document-intelligence-check.mjs
- docs/data/producto/fase-3-documental.json

## Capacidades iniciales

- Leer archivos de texto, JSON y .giae desde el navegador.
- Detectar PDF por firma y registrarlo como documento que requiere extraccion autorizada.
- Marcar imagenes como pendientes de OCR o revision visual.
- Clasificar documentos como proyecto GIAE, memoria tecnica, informe de tierra, plano electrico, presupuesto o fuente normativa.
- Detectar senales tecnicas: proyecto, cargas, normativa, puesta a tierra, medicion, plano, presupuesto y fuente.
- Informar faltantes antes de permitir una evaluacion tecnica.
- Guardar resultados en el Proyecto Activo.

## Limites honestos

- No hace OCR todavia.
- No extrae texto profundo de PDF todavia.
- No convierte automaticamente una norma en regla activa.
- No certifica cumplimiento final.
- No reemplaza revision profesional ni responsabilidad ante SEC.

## Prueba tecnica

    node tools/phase3-document-intelligence-check.mjs

Para guardar reporte:

    node tools/phase3-document-intelligence-check.mjs --write docs/data/producto/fase-3-documental-last-report.json

## Criterio de salida de la fase completa

GIAE debe poder recibir documentos tecnicos, reconocer su tipo, extraer datos utiles, pedir faltantes, vincular evidencia al proyecto y preparar reglas propias con fuente, fecha y trazabilidad.

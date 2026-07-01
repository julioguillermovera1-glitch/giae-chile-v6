# Sprint 0.9.0.005 — Analizador Normativo Base

## Objetivo
Crear una primera capa funcional para leer el catálogo normativo de NORMA-CHILE y preparar la conexión con el Rule Engine y el futuro GIAE Inspector Técnico.

## Archivos agregados

```text
core/normative-analyzer/NormativeAnalyzer.js
core/normative-analyzer/index.js
data/norma-chile/analyzer/analyzer-config.json
docs/sprints/SPRINT_0.9.0.005_ANALIZADOR_NORMATIVO.md
```

## Qué hace
- Carga un catálogo normativo.
- Normaliza documentos DS8, RIC e IEC.
- Busca documentos por código.
- Lista documentos por tipo o texto.
- Calcula cobertura básica DS8 + RIC.
- Prepara la base para que Inspector Técnico consulte normas sin inventar información.

## Qué NO hace todavía
- No interpreta PDFs.
- No extrae reglas automáticamente.
- No genera certificados oficiales.
- No reemplaza la revisión oficial de la autoridad competente.

## Commit sugerido

```text
Sprint 0.9.0.005 - Analizador Normativo Base
```

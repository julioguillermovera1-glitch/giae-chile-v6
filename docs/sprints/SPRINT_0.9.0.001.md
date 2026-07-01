# GIAE Sprint 0.9.0.001 — Rule Engine Base

## Objetivo
Crear el primer núcleo real del motor de reglas de GIAE, separado de las pantallas y conectado a datos normativos en `data/norma-chile`.

## Archivos nuevos
- `core/rule-engine/RuleEngine.js`
- `core/rule-engine/RuleLoader.js`
- `core/rule-engine/RuleValidator.js`
- `core/rule-engine/RuleExecutor.js`
- `core/rule-engine/RuleLogger.js`
- `core/rule-engine/RuleRegistry.js`
- `core/rule-engine/index.js`
- `data/norma-chile/schemas/rule.schema.json`
- `data/norma-chile/rules/ds8.base.json`
- `data/norma-chile/rules/ric18.base.json`
- `data/norma-chile/definitions/base.definitions.json`
- `data/norma-chile/relations/engine-relations.json`
- `data/norma-chile/versions/norma-chile.version.json`

## Importante
Este sprint no reemplaza `index.html` ni `indice.html`.
Debe copiarse sobre la rama `v0.9.0-reestructura`.

## Commit sugerido
`Sprint 0.9.0.001 - Rule Engine base y estructura NORMA-CHILE`

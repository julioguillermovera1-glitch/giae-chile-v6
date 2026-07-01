# GIAE Chile v1.0 · NORMA-CHILE v1.1

Sprint creado: **Motor de Reglas NORMA-CHILE**.

## Incluye

- DS N°8 + RIC 1 al 19 catalogados.
- Motor `NormaChileRuleEngine`.
- Biblioteca de reglas iniciales v1.1.
- Biblioteca de definiciones normativas.
- Biblioteca de cobertura normativa.
- Biblioteca de relaciones entre reglas y motores GIAE.
- Editor Normativo actualizado en `index.html` / `indice.html`.

## Regla de arquitectura

Ningún motor de GIAE debe contener decisiones técnicas escondidas en el código. Toda validación debe consultar NORMA-CHILE y registrar ID de regla, origen, versión y referencia.

## Archivos clave

- `core/norma-chile/reglaEngine.js`
- `data/norma-chile/reglas/ric/reglas-norma-chile-v11.json`
- `data/norma-chile/definiciones/diccionario-normativo-v11.json`
- `data/norma-chile/tablas/cobertura-normativa-v11.json`
- `data/norma-chile/relaciones/motores-reglas.json`

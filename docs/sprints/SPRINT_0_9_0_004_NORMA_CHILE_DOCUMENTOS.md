# Sprint 0.9.0.004 — Integración documental NORMA-CHILE

Este sprint integra físicamente al repositorio GIAE los documentos base:

- Decreto Supremo N°8
- RIC 1 al RIC 19

## Qué se agrega

```text
data/norma-chile/documentos/
data/norma-chile/catalogos/catalogo-normativo.json
data/norma-chile/rules/
```

## Importante

Este sprint **no convierte aún los RIC en reglas ejecutables**. Solo deja los documentos reales y el catálogo base dentro del repositorio.

La extracción de reglas se hará en los siguientes sprints, empezando por RIC 18 y RIC 19.

## No reemplazar

No reemplazar:

- `index.html`
- `indice.html`
- `wrangler.jsonc`

## Commit sugerido

```text
Sprint 0.9.0.004 - Integración documental DS8 y RIC 1-19
```

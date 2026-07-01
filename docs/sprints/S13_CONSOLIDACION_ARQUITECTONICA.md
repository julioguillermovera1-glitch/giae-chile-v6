# Sprint 0.9.0.013 — Consolidación Arquitectónica

## Objetivo
Fortalecer la arquitectura de GIAE sin agregar funciones visibles.

## Criterio de duplicados reales
GIAE solo marcará como duplicado real cuando dos archivos tengan el mismo contenido normalizado y el mismo hash SHA-256.

No se marcará duplicado por:
- nombres parecidos;
- carpetas similares;
- estructuras parecidas;
- funciones con propósito parecido.

Los casos de similitud alta se marcarán como `requires_human_review`, no como error.

## Política NCh4
NCh4 queda excluida como norma activa de validación, por estar reemplazada por el marco vigente DS N°8 + RIC.

## Archivos agregados
- core/architecture/DuplicateDetector.js
- core/architecture/ObsoleteReferenceDetector.js
- core/architecture/ArchitectureReport.js
- core/architecture/index.js
- data/architecture/architecture-policy.json

## Commit sugerido
Sprint 0.9.0.013 - Consolidación Arquitectónica

# GIAE · NORMA-CHILE v1.0-base

Este paquete crea la base normativa digital inicial de GIAE.

## Incluye

- Catálogo DS N°8 + RIC 1 al 19.
- Esquema estándar de reglas `regla-norma-chile.schema.json`.
- Reglas DS8 iniciales.
- Índice RIC 1–19 para extracción progresiva de reglas.
- Diccionario base de definiciones.
- Core `NormaChile` para consulta, búsqueda, evaluación base y trazabilidad.

## Regla de arquitectura

Ningún motor de GIAE debe tomar decisiones técnicas con reglas escondidas en el código.  
Toda validación debe consultar NORMA-CHILE.

## Estado

Esta entrega NO contiene todos los miles de requisitos técnicos de los RIC completos.
Es el esqueleto robusto para empezar la extracción ordenada por documento y apartado.

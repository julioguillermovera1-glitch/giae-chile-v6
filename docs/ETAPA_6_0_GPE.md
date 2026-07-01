# Etapa 6.0 — GIAE Project Engine (GPE-01)

## Objetivo
Crear el núcleo de coordinación del proyecto inteligente de GIAE Chile v1.0.

## Funciones incorporadas
- Estado único del proyecto.
- Lectura de módulos existentes: cargas, ingeniería, cuadro de carga, tableros, tierra, empalme, documentación, presupuesto y auditoría.
- Métrica de preparación general del proyecto.
- Dependencias entre motores.
- Auditoría continua básica.
- Eventos internos GPE.
- Revisiones manuales del proyecto.
- Exportación de diagnóstico GPE en JSON.

## Regla arquitectónica
Ningún motor debe convertirse en una fuente aislada de datos. El GPE consolida el estado y expone una lectura común del proyecto.

## Estado
Sprint GPE-01 terminado. Quedan pendientes para siguientes sprints:
- Comparador visual entre revisiones.
- Sincronización nube D1/R2.
- Eventos en tiempo real entre ventanas abiertas.
- Recalculo incremental por área afectada.

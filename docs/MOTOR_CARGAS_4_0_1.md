# GIAE Chile v1.0 · Etapa 4.0.1
## Motor de Cálculo de Cargas v1.0 inicial

Esta etapa incorpora el primer motor de ingeniería real de GIAE.

## Funciones implementadas

- Gestor de cargas conectado al Proyecto Activo.
- Cálculo de potencia instalada por circuito.
- Cálculo de potencia demandada por factor de demanda y simultaneidad.
- Cálculo preliminar de corriente de diseño Ib.
- Balance automático de fases para proyectos trifásicos.
- Recomendación preliminar de protección, diferencial, conductor y canalización.
- Trazabilidad normativa resumida usando reglas iniciales RIC 3, RIC 4, RIC 5 y RIC 6.
- Almacenamiento de resultados en:
  - `currentProject.loadEngine`
  - `currentProject.loadBoard`
  - `currentProject.protections`
  - `currentProject.conductors`

## Principio técnico

Cada cálculo se realiza una sola vez y queda guardado en el Proyecto Activo. Los futuros módulos de cuadro de carga, unilineal, empalme, tierra, presupuesto y documentación deberán leer estos resultados, no recalcularlos por separado.

## Advertencia

Las recomendaciones son preliminares y se validan con las reglas implementadas disponibles. Si una regla normativa aún no está cargada, GIAE debe indicar que requiere revisión normativa.

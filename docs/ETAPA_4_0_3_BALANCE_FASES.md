# GIAE Chile v1.0 · Etapa 4.0.3

## Balance de Fases y Demanda

Esta etapa agrega el motor preliminar de balance de fases para proyectos trifásicos.

### Funciones

- Calcula demanda por fase R, S y T.
- Calcula corriente estimada por fase.
- Determina porcentaje de desbalance.
- Genera recomendaciones preliminares de redistribución.
- Permite asignación manual de fase por carga.
- Permite volver a balance automático.
- Guarda resultados en el Proyecto Activo.

### Criterio de uso

El balance se calcula sobre la demanda ya generada por el Motor de Cargas y el Motor de Ingeniería Eléctrica. La recomendación es preliminar y debe revisarse junto al cuadro de carga, protecciones, tablero y condiciones reales de instalación.

### Archivos agregados

- `core/engineering/phaseBalanceEngine.js`
- `modules/balance/balance.js`

### Archivos actualizados

- `core/engineering/electricalEngine.js`
- `core/store.js`
- `core/moduleRegistry.js`
- `css/platform.css`

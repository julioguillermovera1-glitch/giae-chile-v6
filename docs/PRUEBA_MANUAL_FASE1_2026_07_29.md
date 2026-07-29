# Prueba manual Fase 1 - GIAE Chile

Fecha: 2026-07-29
Entorno: Node v24.18.0, servidor local `tools/local-static-server.mjs` en puerto 8787
Navegador: Chromium, viewport escritorio 1280x720 y movil 375x812
Proyecto de prueba: "Prueba manual Fase 1" (Cliente de prueba, Temuco, La Araucania, CGE, monofasico)

Esta prueba cubre el criterio de salida de `docs/FASE_1_PUBLICABLE_GIAE.md` que el
diagnostico automatico no reemplaza.

## Resultado global

**Aprobada.** Cero errores de consola durante toda la sesion.

## Detalle por criterio

| Criterio de salida Fase 1 | Resultado | Evidencia |
|---|---|---|
| La app abre desde index.html sin errores criticos | OK | Carga limpia, sin errores de consola |
| Los perfiles principales entran al dashboard | OK | Ingreso como "Instalador independiente" correcto |
| Los modulos registrados cargan desde archivos existentes | OK | 28 modulos con contrato de render (diagnostico) |
| Crear proyecto | OK | Proyecto creado, avance automatico a "2. Cargas" |
| Agregar cargas | OK | 6 cargas agregadas, 4.26 kW instalados calculados |
| Revisar tierra | OK | Diseno guardado con resistividad 120 ohm·m y medicion real 8.5 ohm |
| Exportar e importar .giae | OK | Ciclo completo, 217 KB, datos identicos antes y despues |
| Interfaz movil no bloquea flujos | OK | 375x812 sin desborde horizontal, 37 botones accesibles |
| Validaciones de datos obligatorios | OK | El formulario rechaza correctamente el guardado si falta empresa, cliente, direccion, comuna, region o distribuidora |

## Verificacion del arreglo de puesta a tierra

Se valido en la app real el cambio de `modules/tierra/tierra.js` (llamada a
`recalculateProject()` al guardar). Medicion antes y despues de guardar el diseno de
tierra, **sin salir del modulo**:

| Indicador | Antes de guardar | Despues de guardar |
|---|---|---|
| `project.grounding` | ausente | presente, medicion 8.5 ohm |
| Flujo guiado, etapa tierra | bloqueo: "No hay diseno de puesta a tierra guardado" | sin bloqueos ni advertencias |
| Presupuesto, materiales de tierra | 0 | "Electrodo copperweld 5/8 x 2.4 m", "Camara de registro de tierra" |
| Presupuesto, mano de obra | ausente | "Puesta a tierra y medicion" qty=1 |
| Checklist, item tierra | pendiente | completado |
| Auditoria integral GND-001/002/003 | pendientes | los tres en OK |

Antes del arreglo, todos esos indicadores quedaban desactualizados hasta que el usuario
abria otro modulo que disparara el recalculo.

## Observaciones no bloqueantes

- Los pendientes de auditoria que quedan son de Tablero y Empalme, esperables porque esos
  modulos no se completaron en esta prueba.
- `project.groundingEngine` se escribe en `modules/tierra/tierra.js` y en
  `core/projectEngine.js` pero ningun consumidor lo lee. `normalizeInput` de
  `groundingEngine.js` no desenvuelve `.inputs` al recalcular desde el proyecto guardado,
  por lo que ese campo se recalcula con valores por defecto. Hoy no tiene efecto porque
  nadie lo consume; conviene resolverlo antes de que alguien empiece a leerlo.

## Limite honesto

Esta prueba se ejecuto en navegador de escritorio con emulacion de viewport movil. No
reemplaza la instalacion real de la PWA en un celular fisico, que corresponde al criterio
de salida de la Fase 2.

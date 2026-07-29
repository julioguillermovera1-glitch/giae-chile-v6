# Fase 1 publicable GIAE Chile

Fecha de inicio: 2026-07-06
Responsable del producto: Julio Guillermo Vera
Estado: iniciada

## Objetivo

Dejar GIAE en una base publicable honesta: estable, navegable, verificable y sin prometer funciones que todavia estan en desarrollo.

Esta fase no busca agregar grandes funciones nuevas. Busca ordenar, probar y corregir lo necesario para que la primera version pueda mostrarse con responsabilidad.

## Alcance de esta fase

- Mantener como entrada oficial index.html, core/main.js y css/platform.css.
- Tratar js/app.js y css/styles.css como legado hasta decidir su retiro seguro.
- Verificar que cada modulo registrado tenga archivo real y funcion render.
- Validar sintaxis JavaScript sin instalar paquetes externos.
- Validar JSON y JSONC del repositorio.
- Confirmar que el dashboard use el mismo campo de potencia que el motor de cargas.
- Completar el listado de modulos del panel administrador.
- Mantener DS8, RIC e IEC como fuentes trazables.
- Mantener NCh4 solo como referencia historica excluida.
- Registrar bloqueos antes de publicar.

## Criterio de salida

GIAE puede avanzar a la preparacion instalable cuando cumpla todo esto:

- La app abre desde index.html sin errores criticos.
- Los perfiles principales entran al dashboard.
- Los modulos registrados cargan desde archivos existentes.
- El usuario puede crear proyecto, agregar cargas, revisar cuadro, tablero, tierra, empalme, presupuesto, documentacion y auditoria.
- Exportar e importar .giae funciona en una prueba manual.
- JavaScript y JSON validan correctamente.
- La interfaz movil no bloquea flujos principales.
- Ninguna pantalla promete certificacion final sin medicion, evidencia o revision profesional.

## Diagnostico local

Ejecutar desde la raiz del repositorio:

    node tools/phase1-publicable-check.mjs

Para guardar un reporte JSON:

    node tools/phase1-publicable-check.mjs --write docs/data/producto/fase-1-publicable-last-report.json

## Bloqueos conocidos

- La version instalable PWA pertenece a la Fase 2.
- La lectura documental inteligente pertenece a la Fase 3.
- CAD electrico pertenece a la Fase 5.
- El razonador tecnico verificable pertenece a la Fase 6.

## Limpieza de legado (2026-07-29)

Se confirmo que `js/app.js`, `js/giae-fix-botones.js` y `css/styles.css` no eran referenciados por `index.html`, por ningun modulo activo ni por el `GIAE_APP_SHELL` de `sw.js`. Se retiraron a `docs/_duplicados_retirados/`. Tambien se retiro `indice.html` de la raiz: estaba desincronizado de `index.html` (le faltaban el perfil "Pueblos tecnicos", el boton Chat IA y los meta tags PWA) y no aparecia en el cache de la PWA. Con esto, la entrada oficial (`index.html`, `core/main.js`, `css/platform.css`) queda como unica ruta activa, tal como pide el criterio de salida "Sin rutas activas duplicadas".

Se actualizo `tools/phase1-publicable-check.mjs`: el check `legado-identificado` exigia que `js/app.js` y `css/styles.css` **existieran** para pasar, porque fue escrito cuando el legado seguia activo y solo habia que reconocerlo. Al retirarlo de verdad, ese check marcaba REVISAR por un motivo obsoleto. Ahora el check se llama `legado-retirado` y valida el estado correcto: que el legado no este en rutas activas, que este archivado en `docs/_duplicados_retirados/` y que el README lo documente.

Diagnostico ejecutado el 2026-07-29 con Node v24.18.0: **100%**, estado `apto_para_prueba_manual`, 12 de 12 verificaciones en verde (111 archivos JS/MJS con sintaxis valida, 125 JSON/JSONC validos, 28 modulos con contrato de render).

Prueba manual ejecutada el 2026-07-29 y **aprobada**: ver `docs/PRUEBA_MANUAL_FASE1_2026_07_29.md`. Cubre crear proyecto, cargas, tierra, exportar/importar `.giae` y vista movil, con cero errores de consola.

**Fase 1 cumple su criterio de salida.** Queda pendiente la instalacion real de la PWA en un celular fisico, que pertenece al criterio de salida de la Fase 2, no de esta.

## Regla de publicacion

Si el diagnostico o la prueba manual indican una falla critica, la version no debe anunciarse como publicable final. Debe anunciarse como alpha tecnica o base de depuracion.

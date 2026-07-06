# Fase 2 instalable local GIAE Chile

Fecha de inicio: 2026-07-06
Responsable del producto: Julio Guillermo Vera
Estado: iniciada

## Objetivo

Convertir GIAE en una aplicacion local instalable desde navegador en PC y celular, manteniendo la honestidad tecnica de la Fase 1.

Esta fase no declara aun el instalador final para tiendas ni ejecutables nativos. La meta inicial es PWA propia, offline controlado y respaldo portable .giae.

## Entregables incorporados

- manifest.webmanifest para instalacion local.
- sw.js como service worker propio de GIAE.
- core/pwa.js para registro de instalacion y estado PWA.
- assets/icons/giae-icon.svg, giae-icon-192.png y giae-icon-512.png como iconos propios.
- offline.html redisenado para uso sin conexion.
- tools/phase2-installable-check.mjs para diagnostico de instalabilidad.
- tools/local-static-server.mjs para prueba local por HTTP.

## Criterio de salida

GIAE puede avanzar dentro de Fase 2 cuando cumpla:

- La app se instala desde navegador compatible.
- El service worker registra sin errores en localhost o servidor seguro.
- La pantalla offline aparece cuando no hay conexion.
- El usuario puede guardar, exportar e importar .giae en prueba manual.
- La interfaz principal responde en PC y celular.
- Nada promete certificacion final sin medicion, evidencia o revision profesional.

## Prueba tecnica

Ejecutar desde la raiz del repositorio:

    node tools/phase2-installable-check.mjs

Para guardar reporte:

    node tools/phase2-installable-check.mjs --write docs/data/producto/fase-2-installable-last-report.json

Para probar en navegador local:

    node tools/local-static-server.mjs 8787

## Limites actuales

- Esto es PWA local, no instalador EXE/MSI ni APK nativo.
- El instalador de escritorio y empaquetado movil pertenecen a una subetapa posterior.
- La prueba visual en PC y celular sigue siendo obligatoria.

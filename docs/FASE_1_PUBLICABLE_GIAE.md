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

## Regla de publicacion

Si el diagnostico o la prueba manual indican una falla critica, la version no debe anunciarse como publicable final. Debe anunciarse como alpha tecnica o base de depuracion.

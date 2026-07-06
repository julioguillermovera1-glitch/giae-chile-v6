# Fase 5 - CAD electrico GIAE 2.0

## Objetivo

Iniciar el CAD electrico propio de GIAE 2.0 como editor 2D limitado al dominio electrico. El plano debe comenzar a funcionar como fuente de datos tecnica, no solo como dibujo.

## Alcance implementado

- Motor CAD propio en `core/cad/cadEngine.js`.
- Formato interno `.giaecad` basado en JSON propio de GIAE.
- Modulo visual `modules/cad-electrico/cad-electrico.js`.
- Biblioteca de capas y simbolos en `data/cad/electrical-symbols.json`.
- Lienzo SVG con grilla, insercion por clic y seleccion de entidades.
- Modo cablear con dos clics.
- Capas electricas: referencia, alumbrado, enchufes, fuerza, canalizacion, tablero, tierra, notas y revision.
- Generacion inicial desde Proyecto Activo.
- Validacion preliminar: tablero, tierra, cargas, circuitos, canalizacion y leyenda.
- Exportacion `.giaecad` y SVG.
- Diagnostico automatico en `tools/phase5-cad-check.mjs`.

## Decision tecnica

El CAD no copia AutoCAD, sus bloques, interfaz, nombres internos ni logica propietaria. La primera base usa SVG propio porque es liviano, editable en navegador, instalable offline y suficiente para construir el modelo electrico inicial.

## Formato interno

El documento CAD contiene:

- `schema`: version del formato GIAE.
- `canvas`: tamano, unidad y grilla.
- `layers`: capas electricas.
- `symbols`: biblioteca propia de simbolos.
- `entities`: simbolos, cables, notas y elementos del plano.
- `circuits`: vinculo entre plano y cargas/circuitos.
- `validation`: observaciones tecnicas preliminares.

## Limites honestos

- No importa ni exporta DWG/DXF todavia.
- No reemplaza un CAD profesional completo todavia.
- No certifica cumplimiento final del plano.
- No copia AutoCAD ni librerias de bloques externas.
- El plano generado requiere revision profesional antes de declararse.

## Criterio de salida de esta base

La fase queda lista para prueba manual cuando:

- El modulo CAD electrico aparece en GIAE.
- Se puede generar plano desde Proyecto Activo.
- Se pueden agregar simbolos y canalizaciones por clic.
- Se puede validar el plano.
- Se puede exportar `.giaecad` y SVG.
- El diagnostico Fase 5 entrega 100%.
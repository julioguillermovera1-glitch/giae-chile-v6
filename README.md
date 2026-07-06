# GIAE Chile

GIAE Chile es una plataforma tecnica para apoyar el diseno, calculo, revision, documentacion y auditoria de instalaciones electricas en Chile.

Autor intelectual y director del proyecto: Julio Guillermo Vera.

## Estado actual

El repositorio esta en fase de depuracion para llegar a una primera version publicable. La entrada oficial de la aplicacion nueva es:

- index.html
- core/main.js
- css/platform.css

La version historica contenida en js/app.js y css/styles.css debe tratarse como legado hasta confirmar su retiro seguro.

## Roadmap oficial

La ruta del producto esta incorporada en:

- docs/ROADMAP_6_FASES_GIAE_CHILE.md
- docs/data/producto/roadmap-6-fases.json
- docs/GIAE_2_0_CAD_DOCUMENTOS_RAZONAMIENTO.md
- docs/data/producto/vision-giae-2.json

Las seis fases son:

1. Depuracion y base publicable.
2. Version 1.0 instalable local.
3. Inteligencia normativa y lectura documental.
4. Nube, usuarios, licencias y colaboracion.
5. CAD electrico GIAE 2.0.
6. GIAE razonador tecnico 2.0.

## Principios obligatorios

- No copiar codigo de internet, repositorios, ejemplos ni otras IA.
- No copiar textos normativos completos.
- No duplicar motores, reglas ni datos.
- Usar DS8, RIC e IEC aplicable como fuentes trazables.
- Mantener NCh4 solo como referencia historica excluida.
- Separar siempre calculo preliminar, medicion real y validacion final.
- Si falta evidencia, GIAE debe indicar requiere revision.

## Decreto Supremo N8

El PDF local indicado por el usuario quedo registrado como fuente de ingesta en:

- data/norma-chile/fuentes/decreto8-local-intake.json

Ese registro no copia texto completo. Sirve para que una fase futura convierta el documento en reglas propias con referencias.

## Validaciones recomendadas

Antes de publicar una version:

- Verificar sintaxis JavaScript.
- Verificar JSON/JSONC.
- Crear proyecto de prueba.
- Agregar cargas.
- Revisar cuadro, tablero, tierra, empalme, presupuesto, documentacion y auditoria.
- Probar exportar/importar .giae.
- Probar vista movil y escritorio.
